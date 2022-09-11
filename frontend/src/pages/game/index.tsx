import React, { useCallback, useState, useRef, useEffect } from 'react'
import io from 'socket.io-client'
import { useRouter } from 'next/router'
import Layout from '@components/layout'
import GameMatchList from '@components/game-matchlist'
import { useUser } from '../../lib/use-user'
import { GameRoom, GamePlayer } from '../../types/game'

const API_URL = 'http://localhost:3000'

export default function GameMatching() {
  const [server, setServer] = useState()
  const [matchDisplay, setMatchDisplay] = useState('inline')
  const [cancelDisplay, setCancelDisplay] = useState('inline')
  const didLogRef = useRef(false)
  const router = useRouter()
  const [userId, setUserId] = useState()
  const user = useUser()
  const gameRoomsRef = useRef<GameRoom[]>([])
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const [gameRoomsLog, setGameRoomsLog] = useState(false)

  useEffect(() => {
    if (user) setUserId(user['userId'])
  }, [user])

  const matching = useCallback(() => {
    if (!server || !userId) return

    const matchButton = document.getElementById('matchButton')
    const cancelButton = document.getElementById('cancelButton')
    if (!matchButton || !cancelButton) return

    matchButton.style.display = 'none'
    cancelButton.style.display = cancelDisplay

    server.emit('registerMatch', { userId: userId })
  }, [server, cancelDisplay, userId])

  const cancel = useCallback(() => {
    if (!server) return

    const matchButton = document.getElementById('matchButton')
    const cancelButton = document.getElementById('cancelButton')
    if (!matchButton || !cancelButton) return

    matchButton.style.display = matchDisplay
    cancelButton.style.display = 'none'

    server.emit('cancelMatch')
  }, [server, matchDisplay])

  useEffect(() => {
    if (!didLogRef.current) {
      didLogRef.current = true

      // const cookie = document.cookie
      // console.log(cookie)

      // var cookiesArray = cookie.split(';');

      // for(var c of cookiesArray){
      //     var cArray = c.split('=');
      //     console.log(cArray);
      // }

      setServer(io(API_URL))
      // setServer(io(API_URL, {
      //   extraHeaders: {
      //     jwt: cookie
      //   }
      // }))

      const matchButton = document.getElementById('matchButton')
      const cancelButton = document.getElementById('cancelButton')
      if (matchButton) {
        const buttonStyle = window.getComputedStyle(matchButton)
        setMatchDisplay(buttonStyle.getPropertyValue('display'))
      }
      if (cancelButton) {
        const buttonStyle = window.getComputedStyle(cancelButton)
        setCancelDisplay(buttonStyle.getPropertyValue('display'))
        cancelButton.style.display = 'none'
      }
    }
  }, [])

  useEffect(() => {
    if (!server || !router.isReady || gameRoomsLog || !userId) return
    server.on('goGameRoom', (data: string) => {
      router.push('/game/' + data)
    })

    server.on('setFirstGameRooms', (data) => {
      for (let gameRoom of data['gameRooms']) {
        gameRoomsRef.current.push(gameRoom)
      }
      setGameRooms(gameRoomsRef.current)
      setGameRoomsLog(true)
      const status = data['status']
      if (status == 1) {
        matching()
      }
    })

    server.emit('readyGameIndex', {userId: userId})
  }, [gameRoomsLog, server, router, userId])

  useEffect(() => {
    if (!gameRoomsLog) return

    server.on('addGameRoom', (data) => {
      let addFlag = true
      const addRoom: GameRoom = data['gameRoom']
      for (let gameRoom of gameRoomsRef.current) {
        if (addRoom.id == gameRoom.id) {
          addFlag = false
          break
        }
      }
      if (addFlag) {
        gameRoomsRef.current.push(addRoom)
        const newGameRooms = gameRoomsRef.current.slice(0)
        setGameRooms(newGameRooms)
      }
    })

    server.on('deleteGameRoom', (data) => {
      console.log('delete')
      const deleteRoomId: string = data['gameRoomId']
      for (let i = 0; i < gameRoomsRef.current.length; i++) {
        if (deleteRoomId == gameRoomsRef.current[i].id) {
          gameRoomsRef.current.splice(i, 1)
          const newGameRooms = gameRoomsRef.current.slice(0)
          setGameRooms(newGameRooms)
          break
        }
      }
    })
  }, [gameRoomsLog, server, router])

  return (
    <Layout>
      <div>
        <button id='matchButton' onClick={matching}>
          Matching
        </button>
        <button id='cancelButton' onClick={cancel}>
          Cancel
        </button>
      </div>
      <GameMatchList gameRooms={gameRooms} />
    </Layout>
  )
}

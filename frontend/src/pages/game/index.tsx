import React, { useCallback, useState, useRef, useEffect } from 'react'
import io from 'socket.io-client'
import { useRouter } from 'next/router'
import { Center, Flex } from '@chakra-ui/react'
import Layout from '@components/layout'
import GameMatchList from '@components/game-matchlist'
import { useUser } from '../../lib/use-user'
import { GameRoom } from '../../types/game'

const API_URL = 'http://localhost:3000'

export default function GameMatching() {
  const [server, setServer] = useState()
  const didLogRef = useRef(false)
  const router = useRouter()
  const [userId, setUserId] = useState()
  const { user } = useUser()
  const gameRoomsRef = useRef<GameRoom[]>([])
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const [gameRoomsLog, setGameRoomsLog] = useState(false)
  const [myGameRoomId, setMyGameRoomId] = useState()
  const [deleteRoomId, setDeleteRoomId] = useState()

  useEffect(() => {
    if (user) setUserId(user['userId'])
  }, [user])

  const changeButton = (onButton: number) => {
    const matchButton = document.getElementById('matchButton')
    const cancelButton = document.getElementById('cancelButton')
    const backGameButton = document.getElementById('backGameButton')
    if (!matchButton || !cancelButton || !backGameButton) return

    matchButton.style.display = onButton == 0 ? 'inline' : 'none'
    cancelButton.style.display = onButton == 1 ? 'inline' : 'none'
    backGameButton.style.display = onButton == 2 ? 'inline' : 'none'
  }

  const matching = useCallback(() => {
    if (!server || !userId) return
    changeButton(1)
    server.emit('registerMatch')
  }, [server, userId])

  const cancel = useCallback(() => {
    if (!server) return
    changeButton(0)
    server.emit('cancelMatch')
  }, [server])

  const backGame = useCallback(() => {
    if (!router || !myGameRoomId) return
    router.push('/game/' + myGameRoomId)
  }, [router, myGameRoomId])

  useEffect(() => {
    if (!didLogRef.current) {
      didLogRef.current = true
      changeButton(0)
    }
  }, [])

  useEffect(() => {
    const tempServer = io(API_URL, { transports: ['websocket'] })
    setServer(tempServer)

    return () => {
      tempServer.disconnect()
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
        changeButton(1)
        server.emit('registerMatch')
      } else if (status == 2) {
        setMyGameRoomId(data['gameRoomId'])
        changeButton(2)
      }
    })

    server.emit('readyGameIndex')
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
      const deleteRoomIdTemp: string = data['gameRoomId']
      setDeleteRoomId(deleteRoomIdTemp)
      for (let i = 0; i < gameRoomsRef.current.length; i++) {
        if (deleteRoomIdTemp == gameRoomsRef.current[i].id) {
          gameRoomsRef.current.splice(i, 1)
          const newGameRooms = gameRoomsRef.current.slice(0)
          setGameRooms(newGameRooms)
          break
        }
      }
    })
  }, [gameRoomsLog, server, router])

  useEffect(() => {
    if (!myGameRoomId || !deleteRoomId) return
    if (deleteRoomId == myGameRoomId) {
      changeButton(0)
      setDeleteRoomId(null)
      setMyGameRoomId(null)
    }
  }, [deleteRoomId, myGameRoomId])

  return (
    <Layout>
      <Center h='10vh'>
        <p>Matching list</p>
      </Center>
      <GameMatchList gameRooms={gameRooms} />
      <Center h='10vh'>
        <Flex w='80%' justify='flex-end'>
          <button id='matchButton' onClick={matching}>
            Matching
          </button>
          <button id='cancelButton' onClick={cancel}>
            Cancel
          </button>
          <button id='backGameButton' onClick={backGame}>
            Back to the game
          </button>
        </Flex>
      </Center>
    </Layout>
  )
}

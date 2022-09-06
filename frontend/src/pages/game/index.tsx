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
  // debug
  const gameRooms: GameRoom[] = [
    {id: '1', player1: {id: 'a', name: 'user1'}, player2: {id: 'b', name: 'user2'}},
    {id: '2', player1: {id: 'c', name: 'user3'}, player2: {id: 'd', name: 'user4'}},
  ]

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
    if (!server || !router.isReady) return
    server.on('goGameRoom', (data: string) => {
      router.push('/game/' + data)
    })
  }, [server, router])

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
      <GameMatchList
        gameRooms={gameRooms}
      />
    </Layout>
  )
}

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import style from '../../styles/game.module.css'
import { GameObject } from 'src/types/game'
import Layout from '@components/layout'
import Pong from '@components/game-pong'
import GameSettingForm from '@components/game-setting'
import GameResult from '@components/game-result'
import DisplayNoRoom from '@components/game-noRoom'
import { useUser } from '../../lib/use-user'

const API_URL = 'http://localhost:3000'

export interface KeyStatus {
  upPressed: boolean
  downPressed: boolean
}

function Game() {
  const [gameObject, setGameObject] = useState<GameObject>({
    bar1: { top: 0, left: 0 },
    bar2: { top: 0, left: 0 },
    ball: { top: 0, left: 0 },
    player1: { point: 0, name: '' },
    player2: { point: 0, name: '' },
    gameStatus: -1,
    remainSeconds: 0,
    gameSetting: { point: 2, speed: 1 },
  })
  // reference: https://www.sunapro.com/react18-strict-mode/
  const keyStatus = useRef({ upPressed: false, downPressed: false })
  const router = useRouter()
  const [gameStatus, setGameStatus] = useState<number>(-1)
  const [server, setServer] = useState()
  const [playerRole, setPlayerRole] = useState(-1)
  const [userId, setUserId] = useState()
  const { user } = useUser()
  const toast = useToast()

  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'ArrowUp') {
      keyStatus.current.upPressed = true
    } else if (event.code === 'ArrowDown') {
      keyStatus.current.downPressed = true
    }
  }

  const keyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'ArrowUp') {
      keyStatus.current.upPressed = false
    } else if (event.code === 'ArrowDown') {
      keyStatus.current.downPressed = false
    }
  }

  useEffect(() => {
    if (user) setUserId(user['userId'])
  }, [user])

  useEffect(() => {
    if (playerRole != 0 && playerRole != 1) return
    const downHandler = keyDownHandler
    const upHandler = keyUpHandler
    document.addEventListener('keydown', downHandler)
    document.addEventListener('keyup', upHandler)
    return () => {
      document.removeEventListener('keydown', downHandler)
      document.removeEventListener('keyup', upHandler)
    }
  }, [playerRole])

  useEffect(() => {
    const tempServer = io(API_URL, { transports: ['websocket'] })
    setServer(tempServer)
    return () => {
      tempServer.disconnect()
    }
  }, [router])

  useEffect(() => {
    if (!server || !router.isReady || !userId || !toast) return
    const roomId = router.query.id
    server.emit('connectGame', { roomId: roomId })

    server.on('noRoom', () => {
      setGameStatus(-2)
    })

    server.on('connectClient', (data) => {
      const playerStatus = data['role']
      setGameObject(data['gameObject'])
      setPlayerRole(playerStatus)
      setGameStatus(data['gameObject'].gameStatus)

      server.on('clientMove', (data: GameObject) => {
        setGameObject(data)
        setGameStatus(data.gameStatus)
        if (playerStatus <= 1) {
          if (keyStatus.current.downPressed || keyStatus.current.upPressed)
            server.emit('move', { key: keyStatus.current, id: roomId })
        }
      })

      server.on('updateGameObject', (data) => {
        setGameObject(data)
        setGameStatus(data.gameStatus)
      })

      server.on('clientQuit', () => {
        router.push('/game')
      })

      server.on('goNewGame', (data: string) => {
        router.push('/game/' + data)
      })
    })

    server.on('exception', ({ status, message }) => {
      toast({
        description: message,
        status: status,
        duration: 5000,
        isClosable: true,
      })
    })
  }, [server, router, userId, toast])

  return (
    <Layout>
      <div className={style.screen} tabIndex={0} id='screen'>
        <GameSettingForm
          gameStatus={gameStatus}
          playerRole={playerRole}
          roomId={router.query.id}
          server={server}
          gameSetting={gameObject.gameSetting}
          player1Name={gameObject.player1.name}
          player2Name={gameObject.player2.name}
          remainSeconds={gameObject.remainSeconds}
        />
        <Pong gameObject={gameObject} />
        <GameResult
          gameStatus={gameStatus}
          playerRole={playerRole}
          roomId={router.query.id}
          server={server}
          player1Name={gameObject.player1.name}
          player2Name={gameObject.player2.name}
          gameObject={gameObject}
          userId={userId}
        />
        <DisplayNoRoom status={gameStatus} />
      </div>
    </Layout>
  )
}

export default function GameRoom() {
  const router = useRouter()
  return <Game key={router.asPath} />
}

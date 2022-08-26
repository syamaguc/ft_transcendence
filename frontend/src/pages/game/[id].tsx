import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import style from '../../styles/game.module.css'
import { GameObject } from 'src/types/game'
import Pong from '../../components/game-pong'
import GameSetting from '../../components/game-setting'
import GameResult from '../../components/game-result'

// export interface GameSetting{
//   point: number;
//   speed: number;
// }

export interface KeyStatus {
  upPressed: boolean
  downPressed: boolean
}

export interface PlayerStatus {
  role: number
}

export default function Game() {
  const [gameObject, setGameObject] = useState<GameObject>({
    bar1: { top: 0, left: 0 },
    bar2: { top: 0, left: 0 },
    ball: { top: 0, left: 0 },
    player1: { num: 0, point: 0 },
    player2: { num: 0, point: 0 },
    gameStatus: 0,
    // gameSetting: {point: 0, speed: 0},
  })
  // reference: https://www.sunapro.com/react18-strict-mode/
  const didLogRef = useRef(false)
  const keyStatus: KeyStatus = { upPressed: false, downPressed: false }
  let playerStatus: PlayerStatus = { role: 2 }
  const router = useRouter()
  const [gameStatus, setGameStatus] = useState<number>(0)
  const [server, setServer] = useState()
  const [playerRole, setPlayerRole] = useState()

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      setServer(io('http://localhost:3000'))
    }
  }, [])

  useEffect(() => {
    if (!server || !router.isReady) return
    const roomId = router.query.id
    server.emit('connectServer', roomId)
    server.on('connectClient', (data) => {
      playerStatus.role = data
      setPlayerRole(data)

      server.on('clientMove', (data: GameObject) => {
        setGameObject(data)
        setGameStatus(data.gameStatus)
        if (playerStatus.role <= 1) {
          if (keyStatus.downPressed || keyStatus.upPressed)
            server.emit('move', { key: keyStatus, id: roomId })
        }
      })

      server.on('gameEnd', (data) => {
        setGameObject(data.data)
        setGameStatus(data.data.gameStatus)
      })

      server.on('gameRetry', (data: GameObject) => {
        setGameObject(data)
        setGameStatus(data.gameStatus)
      })

      if (playerStatus.role <= 1) {
        const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
          console.log(event.code)
          if (event.code === 'ArrowUp') {
            keyStatus.upPressed = true
          } else if (event.code === 'ArrowDown') {
            keyStatus.downPressed = true
          }
        }
        const keyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
          console.log(event.code)
          if (event.code === 'ArrowUp') {
            keyStatus.upPressed = false
          } else if (event.code === 'ArrowDown') {
            keyStatus.downPressed = false
          }
        }
        const screen = document.getElementById('screen')
        if (screen) {
          screen.addEventListener('keydown', keyDownHandler)
          screen.addEventListener('keyup', keyUpHandler)
        }
      }
    })
  }, [server, router])

  return (
    <div className={style.screen} tabIndex={0} id='screen'>
      <GameSetting
        gameStatus={gameStatus}
        playerRole={playerRole}
        roomId={router.query.id}
        server={server}
      />
      <Pong gameObject={gameObject} />
      <GameResult
        gameStatus={gameStatus}
        playerRole={playerRole}
        roomId={router.query.id}
        server={server}
        router={router}
      />
    </div>
  )
}

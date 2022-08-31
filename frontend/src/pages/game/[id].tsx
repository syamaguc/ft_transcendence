import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import style from '../../styles/game.module.css'
import { GameObject } from 'src/types/game'
import Layout from '@components/layout'
import Pong from '@components/game-pong'
import GameSettingForm from '@components/game-setting'
import GameResult from '@components/game-result'

export interface KeyStatus {
  upPressed: boolean
  downPressed: boolean
}

export default function Game() {
  const [gameObject, setGameObject] = useState<GameObject>({
    bar1: { top: 0, left: 0 },
    bar2: { top: 0, left: 0 },
    ball: { top: 0, left: 0 },
    player1: { num: 0, point: 0 },
    player2: { num: 0, point: 0 },
    gameStatus: 0,
    gameSetting: { point: 2, speed: 1 },
  })
  // reference: https://www.sunapro.com/react18-strict-mode/
  const didLogRef = useRef(false)
  const keyStatus = useRef({ upPressed: false, downPressed: false })
  const router = useRouter()
  const [gameStatus, setGameStatus] = useState<number>(0)
  const [server, setServer] = useState()
  const [playerRole, setPlayerRole] = useState(-1)

  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(event.code)
    if (event.code === 'ArrowUp') {
      keyStatus.current.upPressed = true
    } else if (event.code === 'ArrowDown') {
      keyStatus.current.downPressed = true
    }
  }

  const keyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(event.code)
    if (event.code === 'ArrowUp') {
      keyStatus.current.upPressed = false
    } else if (event.code === 'ArrowDown') {
      keyStatus.current.downPressed = false
    }
  }

  useEffect(() => {
    if (0 <= playerRole && playerRole <= 1) {
      const screen = document.getElementById('screen')
      if (screen) {
        screen.addEventListener('keydown', keyDownHandler)
        screen.addEventListener('keyup', keyUpHandler)
      }
    }
  }, [playerRole])

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
      const playerStatus = data
      setPlayerRole(data)

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
    })
  }, [server, router])

  return (
    <Layout>
      <div className={style.screen} tabIndex={0} id='screen'>
        <GameSettingForm
          gameStatus={gameStatus}
          playerRole={playerRole}
          roomId={router.query.id}
          server={server}
          gameSetting={gameObject.gameSetting}
          gameObject={gameObject}
        />
        <Pong gameObject={gameObject} />
        <GameResult
          gameStatus={gameStatus}
          playerRole={playerRole}
          roomId={router.query.id}
          server={server}
          router={router}
          gameObject={gameObject}
        />
      </div>
    </Layout>
  )
}

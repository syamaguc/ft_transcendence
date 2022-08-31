import React, { useCallback } from 'react'
import { GameObject } from 'src/types/game'
import style from '../styles/game.module.css'

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
  router
  gameObject: GameObject
}

const GameResult = ({
  gameStatus,
  playerRole,
  roomId,
  server,
  router,
  gameObject,
}: Props) => {
  const start = useCallback(() => {
    if (!server || !roomId) return
    server.emit('retry', { id: roomId })
  }, [roomId, server])

  const nop = () => {
    return
  }

  const back = useCallback(() => {
    if (!router.isReady) return
    router.back()
  }, [router])

  return (
    <div
      className={gameStatus == 2 ? style.startBox : style.boxNonActive}
      id='endBox'
    >
      <div>
        <p>
          {gameObject.player1.point > gameObject.player2.point
            ? 'player1'
            : 'player2'}{' '}
          WIN
        </p>
      </div>
      <div>
        <p>player1: {gameObject.player1.point}</p>
        <p>player2: {gameObject.player2.point}</p>
      </div>
      <div className={style.underButtonBox}>
        <button className={style.startButton} id='quitButton' onClick={back}>
          quit
        </button>
        <button
          className={style.startButton}
          id='endButton'
          onClick={playerRole == 0 ? start : nop}
          disabled={playerRole != 0}
        >
          retry
        </button>
      </div>
    </div>
  )
}

export default GameResult

import React, { useCallback } from 'react'
import style from '../styles/game.module.css'

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
  router
}

const GameResult = ({
  gameStatus,
  playerRole,
  roomId,
  server,
  router,
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
      <div></div>
      <div className={style.underButtonBox}>
        <button className={style.startButton} id='quitButton' onClick={back}>
          quit
        </button>
        <button
          className={style.startButton}
          id='endButton'
          onClick={playerRole == 0 ? start : nop}
        >
          retry
        </button>
      </div>
    </div>
  )
}

export default GameResult

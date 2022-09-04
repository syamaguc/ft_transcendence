import React, { useCallback } from 'react'
import { GameObject } from 'src/types/game'
import style from '../styles/game.module.css'

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
  player1Name: string
  player2Name: string
  gameObject: GameObject
}

const GameResult = ({
  gameStatus,
  playerRole,
  roomId,
  server,
  player1Name,
  player2Name,
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
    if (!server || !roomId) return
    server.emit('quit', { id: roomId })
  }, [roomId, server])

  return (
    <div
      className={gameStatus == 2 ? style.startBox : style.boxNonActive}
      id='endBox'
    >
      <div>
          {gameObject.player1.point > gameObject.player2.point
            ? <p>{player1Name} WIN</p>
            : <p>{player2Name} WIN</p>
          }
      </div>
      <div>
        <p>{player1Name}: {gameObject.player1.point}</p>
        <p>{player2Name}: {gameObject.player2.point}</p>
      </div>
      <div className={style.underButtonBox}>
        <button
          className={style.startButton}
          id='quitButton'
          onClick={playerRole == 0 || playerRole == 1 ? back : nop}
          disabled={playerRole != 0 && playerRole != 1}
        >
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

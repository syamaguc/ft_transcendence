import React, { useCallback } from "react";
import style from "../styles/game.module.css"

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
}

const GameSetting = ({
  gameStatus,
  playerRole,
  roomId,
  server,
}: Props) => {
  const start = useCallback(() => {
    if (!server || !roomId) return
    server.emit('start', {id: roomId});
  }, [roomId, server])

  const nop = () => {return}

  return (
    <div className={gameStatus == 0? style.startBox: style.boxNonActive} id="startBox">
      <div>

      </div>
      <div className={style.underButtonBox}>
        <button
          className={style.startButton}
          id="startButton"
          onClick={playerRole == 0 ? start: nop}
        >start</button>
      </div>
    </div>
  )
}

export default GameSetting
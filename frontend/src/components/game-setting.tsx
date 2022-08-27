import React, { useCallback } from 'react'
import style from '../styles/game.module.css'

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
}

const GameSetting = ({ gameStatus, playerRole, roomId, server }: Props) => {
  const getRadioValue = (name: string) => {
    let elements = document.getElementsByName(
      name
    ) as NodeListOf<HTMLInputElement>
    if (!elements) return ''
    let checkValue = ''
    for (let i = 0; i < elements.length; i++) {
      if (elements.item(i).checked) {
        checkValue = elements.item(i).value
      }
    }
    return checkValue
  }

  const start = useCallback(() => {
    if (!server || !roomId) return
    let pointValue = Number(getRadioValue('point'))
    let speedValue = Number(getRadioValue('speed'))
    server.emit('start', { id: roomId, point: pointValue, speed: speedValue })
  }, [roomId, server])

  const nop = () => {
    return
  }

  return (
    <div
      className={gameStatus == 0 ? style.startBox : style.boxNonActive}
      id='startBox'
    >
      <div>
        <p>point</p>
        <input type='radio' name='point' value='2' checked /> 2
        <input type='radio' name='point' value='5' /> 5
        <input type='radio' name='point' value='7' /> 7
      </div>
      <div>
        <p>speed</p>
        <input type='radio' name='speed' value='1' checked /> 1
        <input type='radio' name='speed' value='2' /> 2
      </div>
      <div className={style.underButtonBox}>
        <button
          className={style.startButton}
          id='startButton'
          onClick={playerRole == 0 ? start : nop}
        >
          start
        </button>
      </div>
    </div>
  )
}

export default GameSetting

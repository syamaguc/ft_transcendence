import React, { useCallback, useRef, useEffect } from 'react'
import style from '../styles/game.module.css'
import { GameSetting } from '../types/game'

type Props = {
  gameStatus: number
  playerRole: number
  roomId: string
  server
  gameSetting: GameSetting
}

const GameSettingForm = ({ gameStatus, playerRole, roomId, server, gameSetting }: Props) => {
  const didLogRef = useRef(false)

  const getRadioValue = (name: string) => {
    let elements = document.getElementsByName(
      name
    ) as NodeListOf<HTMLInputElement>
    if (!elements) return ''
    let checkValue = ''
    for (let i = 0; i < elements.length; i++) {
      if (elements.item(i).checked) {
        checkValue = elements.item(i).value
        break
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

  const radioSetting = (point: number, speed: number) => {
    let elements = document.getElementsByName(
      'point'
    ) as NodeListOf<HTMLInputElement>
    for (let i = 0; i < elements.length; i++) {
      if (Number(elements.item(i).value) == point) {
        elements.item(i).checked = true
      }
    }
    elements = document.getElementsByName(
      'speed'
    ) as NodeListOf<HTMLInputElement>
    for (let i = 0; i < elements.length; i++) {
      if (Number(elements.item(i).value) == speed) {
        elements.item(i).checked = true
      }
    }
  }

  useEffect(() => {
    if (!didLogRef.current && server && roomId && playerRole != -1) {
      didLogRef.current = true
      const addChangeEvent = (name: string) => {
        let elements = document.getElementsByName(
          name
        ) as NodeListOf<HTMLInputElement>
        for (let i = 0; i < elements.length; i++) {
          elements.item(i).addEventListener('change', () => {
            server.emit('settingChange', {id: roomId, name: name, checked: elements.item(i).checked, value: Number(elements.item(i).value)})
          })
        }
      }
      if (playerRole == 0) {
        addChangeEvent('point')
        addChangeEvent('speed')
      }
      radioSetting(gameSetting.point, gameSetting.speed)
    }
  }, [server, roomId, playerRole])

  useEffect(() => {
    radioSetting(gameSetting.point, gameSetting.speed)
  }, [gameSetting])

  return (
    <div
      className={gameStatus == 0 ? style.startBox : style.boxNonActive}
      id='startBox'
    >
      <div>
        <p>point</p>
        <input type='radio' name='point' value='2' /> 2
        <input type='radio' name='point' value='5' /> 5
        <input type='radio' name='point' value='7' /> 7
      </div>
      <div>
        <p>speed</p>
        <input type='radio' name='speed' value='1' /> 1
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

export default GameSettingForm

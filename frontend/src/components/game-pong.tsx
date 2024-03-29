import { useEffect } from 'react'
import { useWindowSize } from 'react-use'
import { Position, GameObject } from 'src/types/game'
import style from '../styles/game.module.css'

type Props = {
  gameObject: GameObject
}

const heightBaseSize = 1000
const widthBaseSize = 2000
const canvasRatio = 0.9
const stageWidthRatio = 0.8
const stageHeightRatio = 0.6
const barBaseHeight = 200
const barBaseWidth = 50
const ballBaseSize = 50

const Pong = ({ gameObject }: Props) => {
  const { width: screenWidth, height: screenHeight } = useWindowSize()

  const canvasRender = (
    gameObject: GameObject,
    screenWidth: number,
    screenHeight: number
  ) => {
    const canvasElem = document.getElementById(
      'gameCanvas'
    ) as HTMLCanvasElement
    if (!canvasElem) return
    canvasElem.width = Math.ceil(screenWidth * canvasRatio)
    canvasElem.height = Math.ceil(screenHeight * canvasRatio)
    const context = canvasElem.getContext('2d')
    if (!context) return

    context.fillStyle = '#000000'

    let stageWidth = Math.ceil(screenWidth * stageWidthRatio)
    let stageHeight = Math.ceil(stageWidth * 0.5)
    if (stageHeight > Math.ceil(screenHeight * stageHeightRatio)) {
      stageHeight = Math.ceil(screenHeight * stageHeightRatio)
      stageWidth = stageHeight * 2
    }

    let stagePosition: Position = { top: 0, left: 0 }
    const heightSpace = canvasElem.height - stageHeight
    const widthSpace = canvasElem.width - stageWidth
    stagePosition.top = Math.ceil(heightSpace * 0.5)
    stagePosition.left = Math.ceil(widthSpace * 0.5)
    context.beginPath()
    context.rect(stagePosition.left, stagePosition.top, stageWidth, stageHeight)
    context.stroke()

    const barHeight = Math.ceil((stageHeight * barBaseHeight) / heightBaseSize)
    const barWidth = Math.ceil((stageWidth * barBaseWidth) / widthBaseSize)

    const bar1Position: Position = {
      top:
        Math.ceil((gameObject.bar1.top * stageHeight) / heightBaseSize) +
        stagePosition.top,
      left:
        Math.ceil((gameObject.bar1.left * stageWidth) / widthBaseSize) +
        stagePosition.left,
    }
    context.beginPath()
    context.rect(bar1Position.left, bar1Position.top, barWidth, barHeight)
    context.fill()

    const bar2Position: Position = {
      top:
        Math.ceil((gameObject.bar2.top * stageHeight) / heightBaseSize) +
        stagePosition.top,
      left:
        Math.ceil((gameObject.bar2.left * stageWidth) / widthBaseSize) +
        stagePosition.left,
    }
    context.beginPath()
    context.rect(bar2Position.left, bar2Position.top, barWidth, barHeight)
    context.fill()

    const ballHeight = Math.ceil((stageHeight * ballBaseSize) / heightBaseSize)
    const ballWidth = Math.ceil((stageWidth * ballBaseSize) / widthBaseSize)

    const ballPosition: Position = {
      top:
        Math.ceil((gameObject.ball.top * stageHeight) / heightBaseSize) +
        stagePosition.top,
      left:
        Math.ceil((gameObject.ball.left * stageWidth) / widthBaseSize) +
        stagePosition.left,
    }
    context.beginPath()
    context.rect(ballPosition.left, ballPosition.top, ballWidth, ballHeight)
    context.fill()

    const upPartStageHeight = stagePosition.top
    const pointBoxSize = Math.min(upPartStageHeight / 4, barHeight)
    const pointBoxTop =
      barHeight * 2 < stagePosition.top / 2
        ? stagePosition.top - barHeight * 2
        : stagePosition.top / 2
    const fontSize = Math.ceil((pointBoxSize / screenHeight) * 100)

    const player1PointBox: Position = {
      top: pointBoxTop + pointBoxSize / 2,
      left:
        Math.ceil(canvasElem.width / 2 - pointBoxSize * 2) + pointBoxSize / 2,
    }
    const player2PointBox: Position = {
      top: pointBoxTop + pointBoxSize / 2,
      left: Math.ceil(canvasElem.width / 2 + pointBoxSize) + pointBoxSize / 2,
    }

    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = fontSize + 'vh sans-serif'
    context.fillText(
      gameObject.player1.point.toString(),
      player1PointBox.left,
      player1PointBox.top
    )
    context.fillText(
      gameObject.player2.point.toString(),
      player2PointBox.left,
      player2PointBox.top
    )

    const stageLeftBottom: Position = {
      top: stagePosition.top + stageHeight,
      left: stagePosition.left,
    }
    const stageRightBottom: Position = {
      top: stagePosition.top + stageHeight,
      left: stagePosition.left + stageWidth,
    }

    const nameFontSize = Math.ceil(fontSize / 2)
    context.font = nameFontSize + 'vh sans-serif'
    context.textBaseline = 'top'

    context.textAlign = 'left'
    context.fillText(
      gameObject.player1.name,
      stageLeftBottom.left,
      stageLeftBottom.top
    )

    context.textAlign = 'right'
    context.fillText(
      gameObject.player2.name,
      stageRightBottom.left,
      stageRightBottom.top
    )
  }

  const clearCanvas = (screenWidth: number, screenHeight: number) => {
    const canvasElem = document.getElementById(
      'gameCanvas'
    ) as HTMLCanvasElement
    if (!canvasElem) return
    canvasElem.width = Math.ceil(screenWidth * canvasRatio)
    canvasElem.height = Math.ceil(screenHeight * canvasRatio)
    const context = canvasElem.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvasElem.width, canvasElem.height)
  }

  useEffect(() => {
    if (gameObject.gameStatus == 1)
      canvasRender(gameObject, screenWidth, screenHeight)
    else {
      clearCanvas(screenWidth, screenHeight)
    }
  }, [screenWidth, screenHeight, gameObject])

  return (
    <canvas
      id='gameCanvas'
      className={
        gameObject.gameStatus == 1 ? style.canvasBox : style.boxNonActive
      }
    ></canvas>
  )
}

export default Pong

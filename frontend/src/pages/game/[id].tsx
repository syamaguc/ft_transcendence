import Layout from '@components/layout'
import { Box } from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router"
import {useWindowSize} from 'react-use';
import io from 'socket.io-client';
import style from "../../styles/game.module.css"

export interface Position {
  top: number;
  left: number;
}

interface Player {
  num: number;
  point: number;
}

// export interface GameSetting{
//   point: number;
//   speed: number;
// }

export interface GameObject {
  bar1: Position;
  bar2: Position;
  ball: Position;
  player1: Player;
  player2: Player;
  gameStatus: number;
  // gameSetting: GameSetting;
}

export interface KeyStatus {
  upPressed: boolean;
  downPressed: boolean;
}

export interface PlayerStatus {
  role: number;
}

const heightBaseSize = 1000;
const widthBaseSize = 2000;
const canvasRatio = 0.9;
const stageWidthRatio = 0.8;
const stageHeightRatio = 0.6;
const barBaseHeight = 200;
const barBaseWidth = 50;
const ballBaseSize = 50;

export default function Game() {
  const [gameObject, setGameObject] = useState<GameObject>({
    bar1: {top: 0, left: 0},
    bar2: {top: 0, left: 0},
    ball: {top: 0, left: 0},
    player1: {num: 0, point: 0},
    player2: {num: 0, point: 0},
    gameStatus: 0,
    // gameSetting: {point: 0, speed: 0},
  });
  const { width: screenWidth, height: screenHeight } = useWindowSize();
  // reference: https://www.sunapro.com/react18-strict-mode/
  const didLogRef = useRef(false);
  const keyStatus: KeyStatus = {upPressed: false, downPressed: false};
  let playerStatus: PlayerStatus = {role: 2};
  const router = useRouter();
  let roomId: string;
  let socket;
  const [gameStatus, setGameStatus] = useState<number>(0);

  const canvasRender = () => {
    const canvasElem = document.getElementById('gameCanvas')
    if (!canvasElem) return
    canvasElem.width = Math.ceil(screenWidth * canvasRatio);
    canvasElem.height = Math.ceil(screenHeight * canvasRatio);
    const context = canvasElem.getContext('2d')
    if (!context) return

    context.fillStyle = "#000000";

    let stageWidth = Math.ceil(screenWidth * stageWidthRatio);
    let stageHeight = Math.ceil(stageWidth * 0.5);
    if (stageHeight > Math.ceil(screenHeight * stageHeightRatio)) {
      stageHeight = Math.ceil(screenHeight * stageHeightRatio);
      stageWidth = stageHeight * 2;
    }

    let stagePosition: Position = {top: 0, left: 0};
    const heightSpace = canvasElem.height - stageHeight;
    const widthSpace = canvasElem.width - stageWidth;
    stagePosition.top = Math.ceil(heightSpace * 0.5);
    stagePosition.left = Math.ceil(widthSpace * 0.5);
    context.beginPath();
    context.rect(stagePosition.left, stagePosition.top, stageWidth ,stageHeight);
    context.stroke();

    const barHeight = Math.ceil(stageHeight * barBaseHeight / heightBaseSize);
    const barWidth = Math.ceil(stageWidth * barBaseWidth / widthBaseSize);

    const bar1Position: Position = {
      top: Math.ceil(gameObject.bar1.top * stageHeight / heightBaseSize) + stagePosition.top,
      left: Math.ceil(gameObject.bar1.left * stageWidth / widthBaseSize) + stagePosition.left
    }
    context.beginPath();
    context.rect(bar1Position.left, bar1Position.top, barWidth ,barHeight);
    context.fill();

    const bar2Position: Position = {
      top: Math.ceil(gameObject.bar2.top * stageHeight / heightBaseSize) + stagePosition.top,
      left: Math.ceil(gameObject.bar2.left * stageWidth / widthBaseSize) + stagePosition.left
    }
    context.beginPath();
    context.rect(bar2Position.left, bar2Position.top, barWidth ,barHeight);
    context.fill();

    const ballHeight = Math.ceil(stageHeight * ballBaseSize / heightBaseSize);
    const ballWidth = Math.ceil(stageWidth * ballBaseSize / widthBaseSize);

    const ballPosition: Position = {
      top: Math.ceil(gameObject.ball.top * stageHeight / heightBaseSize) + stagePosition.top,
      left: Math.ceil(gameObject.ball.left * stageWidth / widthBaseSize) + stagePosition.left
    }
    context.beginPath();
    context.rect(ballPosition.left, ballPosition.top, ballWidth ,ballHeight);
    context.fill();

    const upPartStageHeight = stagePosition.top;
    const pointBoxSize = Math.min(upPartStageHeight / 4, barHeight);
    const pointBoxTop = 
      (barHeight * 2 < stagePosition.top / 2) ? stagePosition.top - barHeight * 2 : stagePosition.top / 2;
    const fontSize = Math.ceil((pointBoxSize / screenHeight) * 100);

    const player1PointBox: Position = {
      top: pointBoxTop + pointBoxSize / 2,
      left: Math.ceil(canvasElem.width / 2 - pointBoxSize * 2) + pointBoxSize / 2
    };
    const player2PointBox: Position = {
      top: pointBoxTop + pointBoxSize / 2,
      left: Math.ceil(canvasElem.width / 2 + pointBoxSize) + pointBoxSize / 2
    };

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = fontSize + "vh sans-serif";
    context.fillText(gameObject.player1.point, player1PointBox.left, player1PointBox.top);
    context.fillText(gameObject.player2.point, player2PointBox.left, player2PointBox.top);
  };

  const clearCanvas = () => {
    const canvasElem = document.getElementById('gameCanvas')
    if (!canvasElem) return
    canvasElem.width = Math.ceil(screenWidth * canvasRatio);
    canvasElem.height = Math.ceil(screenHeight * canvasRatio);
    const context = canvasElem.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvasElem.width, canvasElem.height);
  };

  useEffect(() => {
    if (didLogRef.current === false && router.isReady) {
      roomId = router.query.id;
      console.log(roomId);
      didLogRef.current = true;
      socket = io('http://localhost:3000');
      socket.emit("connectServer", roomId);
      socket.on("connectClient", (data) => {
        playerStatus.role = data;

        const registerButton = () => {
          if (playerStatus.role == 0) {
            const startButton = document.getElementById('startButton');
            const endButton = document.getElementById('endButton');
            if (startButton) {
              startButton.addEventListener('click', () => {
              socket.emit('start', {id: roomId});
              });
            }
            if (endButton) {
              endButton.addEventListener('click', () => {
                socket.emit('retry', {id: roomId});
              });
            }
          }
        };

        socket.on('clientMove', (data: GameObject) => {
          setGameObject(data)
          setGameStatus(data.gameStatus);
          if (playerStatus.role <= 1) {
            if (keyStatus.downPressed || keyStatus.upPressed)
              socket.emit('move', {key: keyStatus, id: roomId});
          }
        });

        socket.on('gameEnd', (data) => {
          setGameObject(data.data);
          setGameStatus(data.data.gameStatus);
        });

        socket.on('gameRetry', (data: GameObject) => {
          setGameObject(data)
          setGameStatus(data.gameStatus);
        });

        if (playerStatus.role <= 1) {
          const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
            console.log(event.code);
            if (event.code === "ArrowUp") {
              keyStatus.upPressed = true;
            } else if (event.code === "ArrowDown") {
              keyStatus.downPressed = true;
            }
          };
          const keyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
            console.log(event.code);
            if (event.code === "ArrowUp") {
              keyStatus.upPressed = false;
            } else if (event.code === "ArrowDown") {
              keyStatus.downPressed = false;
            }
          };
          document.addEventListener("keydown", keyDownHandler);
          document.addEventListener("keyup", keyUpHandler);
        }

        registerButton();
      });
    }
  }, [router])

  useEffect(() => {
    if (gameStatus == 1)
      canvasRender();
    else {
      clearCanvas();
    }
  }, [screenWidth, screenHeight, gameObject])

  return (
    <div className={style.screen} tabIndex={0}>
      <div className={gameStatus == 0? style.startBox: style.boxNonActive} id="startBox">
        <div>

        </div>
        <div className={style.underButtonBox}>
          <button className={style.startButton} id="startButton">start</button>
        </div>
      </div>
      <canvas id="gameCanvas"></canvas>
      <div className={gameStatus == 2? style.endBox: style.boxNonActive} id="endBox">
        <div>

        </div>
        <div className={style.underButtonBox}>
          <button className={style.startButton} id="quitButton" onClick={() => router.back()}>quit</button>
          <button className={style.startButton} id="endButton">retry</button>
        </div>
      </div>
    </div>
  )
}

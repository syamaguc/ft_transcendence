import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router"
import io from 'socket.io-client';
import style from "../../styles/game.module.css"
import { GameObject } from "../../interfaces/game"
import Pong from "../../components/game-pong"


// export interface GameSetting{
//   point: number;
//   speed: number;
// }


export interface KeyStatus {
  upPressed: boolean;
  downPressed: boolean;
}

export interface PlayerStatus {
  role: number;
}

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
  // reference: https://www.sunapro.com/react18-strict-mode/
  const didLogRef = useRef(false);
  const keyStatus: KeyStatus = {upPressed: false, downPressed: false};
  let playerStatus: PlayerStatus = {role: 2};
  const router = useRouter();
  let roomId: string;
//   let socket;
  const [gameStatus, setGameStatus] = useState<number>(0);
  const [server, setServer] = useState();


  useEffect(() => {
    if (didLogRef.current === false && router.isReady) {
      roomId = router.query.id;
      console.log(roomId);
      didLogRef.current = true;
      const localSocket = io('http://localhost:3000');
      setServer(localSocket);
      
      localSocket.emit("connectServer", roomId);
      localSocket.on("connectClient", (data) => {
        playerStatus.role = data;

        const registerButton = () => {
          if (playerStatus.role == 0) {
            const startButton = document.getElementById('startButton');
            const endButton = document.getElementById('endButton');
            if (startButton) {
              startButton.addEventListener('click', () => {
                localSocket.emit('start', {id: roomId});
              });
            }
            if (endButton) {
              endButton.addEventListener('click', () => {
                localSocket.emit('retry', {id: roomId});
              });
            }
          }
        };

        localSocket.on('clientMove', (data: GameObject) => {
          setGameObject(data)
          setGameStatus(data.gameStatus);
          if (playerStatus.role <= 1) {
            if (keyStatus.downPressed || keyStatus.upPressed)
              localSocket.emit('move', {key: keyStatus, id: roomId});
          }
        });

        localSocket.on('gameEnd', (data) => {
          setGameObject(data.data);
          setGameStatus(data.data.gameStatus);
        });

        localSocket.on('gameRetry', (data: GameObject) => {
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


  return (
    <div className={style.screen} tabIndex={0}>
      <div className={gameStatus == 0? style.startBox: style.boxNonActive} id="startBox">
        <div>

        </div>
        <div className={style.underButtonBox}>
          <button className={style.startButton} id="startButton">start</button>
        </div>
      </div>
      <Pong
        gameObject={gameObject}
      />
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

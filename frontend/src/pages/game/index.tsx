import Layout from '@components/layout'
import { Box } from '@chakra-ui/react'

import React, { useCallback, useState, useRef, useEffect } from "react";
import io from 'socket.io-client';
import { useRouter } from "next/router"
// import style from "../../styles/game.module.css"

export default function GameMatching() {
  const [server, setServer] = useState();
  const [matchDisplay, setMatchDisplay] = useState('inline');
  const [cancelDisplay, setCancelDisplay] = useState('inline');
  const didLogRef = useRef(false);
  const router = useRouter();

  const matching = useCallback(() => {
    if (!server) return

    const matchButton = document.getElementById('matchButton');
    const cancelButton = document.getElementById('cancelButton');
    if (!matchButton || !cancelButton) return

    matchButton.style.display = 'none';
    cancelButton.style.display = cancelDisplay;

    server.emit('registerMatch');
  }, [server, cancelDisplay])

  const cancel = useCallback(() => {
    if (!server) return

    const matchButton = document.getElementById('matchButton');
    const cancelButton = document.getElementById('cancelButton');
    if (!matchButton || !cancelButton) return

    matchButton.style.display = matchDisplay;
    cancelButton.style.display = 'none';

    server.emit('cancelMatch');
  }, [server, matchDisplay])

  useEffect(() => {
    if (!didLogRef.current) {
      didLogRef.current = true;
      setServer(io('http://localhost:3000'));

      const matchButton = document.getElementById('matchButton');
      const cancelButton = document.getElementById('cancelButton');
      if (matchButton) {
        const buttonStyle = window.getComputedStyle(matchButton);
        setMatchDisplay(buttonStyle.getPropertyValue('display'));
      }
      if (cancelButton) {
        const buttonStyle = window.getComputedStyle(cancelButton);
        setMatchDisplay(buttonStyle.getPropertyValue('display'));
        cancelButton.style.display = 'none';
      }
    }
  }, [])

  useEffect(() => {
    if (!server || !router.isReady) return
    server.on("goGameRoom", (data: string) => {
      router.push('/game/' + data);
    })
  }, [server, router])

  return (
    <div>
      <button id="matchButton" onClick={matching}>Matching</button>
      <button id="cancelButton" onClick={cancel}>Cancel</button>
    </div>
  )
}
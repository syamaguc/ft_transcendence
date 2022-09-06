import React, { useCallback } from 'react'
import { GameRoom, GamePlayer } from '../types/game'

type Props = {
  gameRooms: GameRoom[]
}

const GameMatchList = ({
  gameRooms,
}: Props) => {
  return (
    <div>
      <ul>
        {gameRooms.map((value, index) => (
          <li key={index}>
            {value.player1.name}
            {' vs '}
            {value.player2.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GameMatchList

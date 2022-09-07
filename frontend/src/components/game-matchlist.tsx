import { Box } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { GameRoom, GamePlayer } from '../types/game'

type Props = {
  gameRooms
}

const GameMatchList = ({ gameRooms }: Props) => {
  return (
    <div>
      <ul>
        {gameRooms.map((value, index) => (
          <li key={index}>
            <NextLink href={'/game/' + value.id}>
              <Box as='button'>
                {value.player1.name}
                {' vs '}
                {value.player2.name}
              </Box>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GameMatchList

import { Box, VStack } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { GameRoom, GamePlayer } from '../types/game'

type Props = {
  gameRooms
}

const GameMatchList = ({ gameRooms }: Props) => {
  return (
    <VStack h='70vh' overflowY='scroll'>
      {gameRooms.map((value, index) => (
        <Box key={index}>
          <NextLink href={'/game/' + value.id}>
            <Box as='button'>
              {value.player1.name}
              {' vs '}
              {value.player2.name}
            </Box>
          </NextLink>
        </Box>
      ))}
    </VStack>
  )
}

export default GameMatchList

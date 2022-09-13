import {
  Box,
  Stack,
  Flex,
  Text,
  Button,
  Input,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react'
import { NextRouter } from 'next/router'
import { useState, useCallback, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { DMObject, MessageObject } from 'src/types/chat'
import DMCreationForm from './dm-creation-form'

type Props = {
  socket: Socket
  currentRoom: DMObject
  router: NextRouter
}

const DMSideBar = ({ socket, currentRoom, router }: Props) => {
  const [DMRooms, setDMRooms] = useState<DMObject[]>([currentRoom])
  const [newDMRoom, setnewDMRoom] = useState<DMObject>()
  const didLogRef = useRef(false)

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('getRooms', (rooms: DMObject[]) => {
        setDMRooms(rooms)
      })
      socket.on('updateRoom', (newDMRoom: DMObject) => {
        console.log('updateRoom called', newDMRoom)
        setnewDMRoom(newDMRoom)
      })
      socket.emit('getRooms')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (newDMRoom) {
      setDMRooms([...DMRooms, newDMRoom])
      console.log(DMRooms)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDMRoom])

  return (
    <Flex width='100%' direction='column' bg='gray.100' overflowX='scroll'>
      <Flex
        width='100%'
        p={(5, 5, 2, 2)}
        borderBottom='1px solid'
        borderBottomColor='gray.200'
      >
        <DMCreationForm socket={socket} />
      </Flex>
      <Flex direction='column'>
        {DMRooms.map((DMRoom: DMObject) => (
          <Flex
            as='button'
            p={4}
            _hover={{ bgColor: '#00BABC' }}
            onClick={() => {
              router.push('/chat/' + DMRoom.id)
            }}
            key={DMRoom.id}
          >
            {DMRoom.toUserName}
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export default DMSideBar

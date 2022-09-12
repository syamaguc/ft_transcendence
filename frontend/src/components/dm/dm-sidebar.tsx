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
import { useState, useCallback, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { DMObject, MessageObject } from 'src/types/chat'

type Props = {
  socket: Socket
  currentRoom: DMObject
  setCurrentRoom: (room: DMObject) => void
  setChatLog: (chatLog: MessageObject[]) => void
  setInputMessage: (input: string) => void
}

const DMSideBar = ({
  socket,
  currentRoom,
  setCurrentRoom,
  setChatLog,
  setInputMessage,
}: Props) => {
  const [DMRooms, setDMRooms] = useState<DMObject[]>([currentRoom])
  const didLogRef = useRef(false)

  const onClickChannel = (DMRoom: DMObject) => {
    if (currentRoom != DMRoom) {
      setCurrentRoom(DMRoom)
      socket.emit('watchRoom', DMRoom.id)
      socket.emit('getMessageLog', DMRoom.id)
      setInputMessage('')
    }
  }

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('getMessageLog', (messageLog: MessageObject[]) => {
        console.log('messageLog loaded', messageLog)
        setChatLog(messageLog)
      })
      socket.on('getRooms', (rooms: DMObject[]) => {
        setDMRooms(rooms)
      })
      socket.emit('getRooms')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Flex width='100%' direction='column' bg='gray.100' overflowX='scroll'>
      <Flex
        width='100%'
        p={(5, 5, 2, 2)}
        borderBottom='1px solid'
        borderBottomColor='gray.200'
      >
        <Text as='b' p={2}>
          Direct Messages
        </Text>
      </Flex>
      <Flex direction='column'>
        {DMRooms.map((DMRoom: DMObject) => (
          <Flex
            as='button'
            p={4}
            _hover={{ bgColor: '#00BABC' }}
            onClick={() => {
              onClickChannel(DMRoom)
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

import {
  Box,
  Stack,
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
import { ChannelObject, MessageObject } from 'src/types/chat'
import ChatCreationForm from './chat-creation-form'

type Props = {
  socket: Socket
  currentRoom: ChannelObject
  setCurrentRoom: (room: ChannelObject) => void
  setChatLog: (chatLog: MessageObject[]) => void
  setInputMessage: (input: string) => void
}

const SideBar = ({
  socket,
  currentRoom,
  setCurrentRoom,
  setChatLog,
  setInputMessage,
}: Props) => {
  const [chatRooms, setChatRooms] = useState<ChannelObject[]>([currentRoom])
  const [room, setRoom] = useState<ChannelObject>()
  const didLogRef = useRef(false)

  const onClickChannel = (chatRoom: ChannelObject) => {
    if (currentRoom != chatRoom) {
      setCurrentRoom(chatRoom)
      socket.emit('watchRoom', chatRoom.id)
      socket.emit('getMessageLog', chatRoom.id)
      setInputMessage('')
    }
  }

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('updateNewRoom', (newChatRoom: ChannelObject) => {
        console.log('created : ', newChatRoom)
        setRoom(newChatRoom)
      })
      socket.on('getMessageLog', (messageLog: MessageObject[]) => {
        console.log('messageLog loaded', messageLog)
        setChatLog(messageLog)
      })
      socket.on('getRooms', (rooms: ChannelObject[]) => {
        setChatRooms(rooms)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    socket.emit('getRooms')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (room) {
      setChatRooms([...chatRooms, room])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  return (
    <Box>
      <Box>
        <Stack spacing='12px'>
          <ChatCreationForm socket={socket} />
        </Stack>
      </Box>

      <Stack width='sm'>
        {chatRooms.map((chatRoom: ChannelObject) => (
          <Box
            as='button'
            borderRadius='4px'
            p={4}
            shadow='sm'
            borderWidth='1px'
            _hover={{ borderColor: '#00BABC' }}
            onClick={() => {
              onClickChannel(chatRoom)
            }}
            key={chatRoom.id}
          >
            {chatRoom.name}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default SideBar

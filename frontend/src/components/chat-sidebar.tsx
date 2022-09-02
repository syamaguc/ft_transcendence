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
import ChatCreationForm from './chat-creation-form'

type Props = {
  socket: Socket
  setCurrentRoom: (room: string) => void
  setChatLog: (chatLog: string[]) => void
  setInputMessage: (input: string) => void
}

type ChatRoom = {
  id: string
  name: string
}

const SideBar = ({
  socket,
  setCurrentRoom,
  setChatLog,
  setInputMessage,
}: Props) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [room, setRoom] = useState<ChatRoom>({ id: '1', name: 'random' })
  const didLogRef = useRef(false)

  const onClickChannel = (chatRoom: ChatRoom) => {
    setCurrentRoom(chatRoom.name)
    socket.emit('watchRoom', chatRoom.id)
    socket.emit('getMessageLog', chatRoom.id)
    setInputMessage('')
  }

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('updateNewRoom', ({ id, name }) => {
        console.log('created : ', id)
        setRoom({ id: id, name: name })
      })
      socket.on('getMessageLog', (messageLog: string[]) => {
        console.log('messageLog loaded', messageLog)
        setChatLog(messageLog)
      })
      socket.on('getRooms', (rooms: ChatRoom[]) => {
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
    setChatRooms([...chatRooms, room])
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
        {chatRooms.map((chatRoom) => (
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

import { Box, Stack, Button, Input } from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

type Props = {
  setCurrentRoom: (room: string) => void
  socket: Socket
}

type ChatRoom = {
  id: string
  name: string
}

const SideBar = ({ setCurrentRoom, socket }: Props) => {
  const [inputText, setInputText] = useState('')
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [room, setRoom] = useState<ChatRoom>({ id: '1', name: 'random' })

  const onClickCreate = useCallback(() => {
    console.log('onClickCreate called')
    socket.emit('createRoom', inputText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText])

  const onClickChannel = (chatRoom: ChatRoom) => {
    setCurrentRoom(chatRoom.name)
    socket.emit('joinRoom', chatRoom.id)
  }

  useEffect(() => {
    socket.on('updateNewRoom', ({ id, name }) => {
      console.log('created : ', id)
      setRoom({ id: id, name: name })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setChatRooms([...chatRooms, room])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  return (
    <Box>
      <Box>
        <Input
          type='text'
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value)
          }}
        />
        <Button onClick={onClickCreate} type='submit'>
          Create New Channel
        </Button>
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

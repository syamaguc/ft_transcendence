import Layout from '@components/layout'
import { Box, Button, HStack, Input, Spacer, Stack } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback } from 'react'

const socket = io('http://localhost:3000')

const Chat = () => {
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<string[]>([])
  const [chatRooms, setChatRooms] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [room, setRoom] = useState('random')
  const [currentRoom, setCurrentRoom] = useState('')

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connection ID : ', socket.id)
    })
  }, [])

  const onClickSubmit = useCallback(() => {
    socket.emit('addMessage', inputText)
  }, [inputText])

  const onClickCreate = useCallback(() => {
    console.log('onClickCreate called')
    socket.emit('createRoom', inputText)
  }, [inputText])

  useEffect(() => {
    socket.on('updateNewMessage', (message: string) => {
      console.log('recieved : ', message)
      setMsg(message)
    })
    socket.on('updateNewRoom', (room: string) => {
      console.log('created : ', room)
      setRoom(room)
    })
  }, [])

  useEffect(() => {
    setChatLog([...chatLog, msg])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  useEffect(() => {
    setChatRooms([...chatRooms, room])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  const onClickChannel = (chatRoom: string) => {
    setCurrentRoom(chatRoom)
    socket.emit('joinRoom', chatRoom)
  }
  return (
    <Layout>
      <Box>
        <HStack>
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
                  key={chatRoom}
                >
                  {chatRoom}
                </Box>
              ))}
            </Stack>
          </Box>
          <Stack>
            <Box>Current Channel:{currentRoom}</Box>
            <Spacer />
            {chatLog.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
            <Input
              type='text'
              value={inputText}
              onChange={(event) => {
                setInputText(event.target.value)
              }}
            />
            <Button onClick={onClickSubmit} type='submit'>
              Send Message
            </Button>
          </Stack>
        </HStack>
      </Box>
    </Layout>
  )
}

export default Chat

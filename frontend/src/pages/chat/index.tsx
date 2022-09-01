import Layout from '@components/layout'
import { Box, Button, HStack, Input, Spacer, Stack } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatSideBar from '@components/chat-sidebar'

const socket = io('http://localhost:3000')

type AddMessageDto = {
  user: string
  message: string
  timestamp: Date
}

type MessageI = {
  id: string
  user: string
  message: string
  timestamp: Date
}

type ChatRoomI = {
  id: string
  name: string
  members: string[]
  owner: string
  admins: string[]
  is_private: boolean
  logs: MessageI[]
  password: string
}

const Chat = () => {
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  const didLogRef = useRef(false)

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('connect', () => {
        console.log('connection ID : ', socket.id)
      })
      socket.on('updateNewMessage', (message: string) => {
        console.log('recieved : ', message)
        setMsg(message)
      })
    }
  }, [])

  const onClickSubmit = useCallback(() => {
    const message: AddMessageDto = {
      user: 'tmp_user',
      message: inputText,
      timestamp: new Date(),
    }
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText])

  useEffect(() => {
    setChatLog([...chatLog, msg])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  return (
    <Layout>
      <Box>
        <HStack>
          <ChatSideBar
            socket={socket}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
          />
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

import Layout from '@components/layout'
import { Box, Button, HStack, Input, Spacer, Stack } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback } from 'react'
import ChatSideBar from '@components/chat-sidebar'

const socket = io('http://localhost:3000')

type chatRoomI = {
  id: string
  name: string
}

const Chat = () => {
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connection ID : ', socket.id)
    })
  }, [])

  const onClickSubmit = useCallback(() => {
    socket.emit('addMessage', inputText)
    setInputText('')
  }, [inputText])

  useEffect(() => {
    socket.on('updateNewMessage', (message: string) => {
      console.log('recieved : ', message)
      setMsg(message)
    })
  }, [])

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

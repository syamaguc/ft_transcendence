import Layout from '@components/layout'
// import { Flex } from "@chakra-ui/layout"
import { Box, Button, HStack, Input, Spacer, Stack, Flex, Text } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatSideBar from '@components/chat-sidebar'
<<<<<<< Updated upstream
import { ChannelObject, MessageObject } from 'src/types/chat'
=======
import TopBar from '@components/chat/topbar'
import MiddleBar from '@components/chat/middlebar'
import BottomBar from '@components/chat/bottombar'
>>>>>>> Stashed changes

const socket = io('http://localhost:3000')

const Chat = () => {
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<ChannelObject>({
    id: 'default-channel',
    name: 'random',
    members: [],
    owner: 'none',
    admins: [],
    is_private: false,
    logs: [],
    password: '',
  })

  const didLogRef = useRef(false)

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('connect', () => {
        console.log('connection ID : ', socket.id)
      })
      socket.on('updateNewMessage', (message: MessageObject) => {
        console.log('recieved : ', message)
        setMsg(message)
      })
    }
  }, [])

  const onClickSubmit = useCallback(() => {
    const message = {
      user: 'tmp_user',
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText])

  useEffect(() => {
    if (msg) {
      setChatLog([...chatLog, msg])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  return (
    <Layout>
      <Box>
        <HStack>
          <ChatSideBar
            socket={socket}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
          />
          <Stack>
            <Box>Current Channel:{currentRoom.name}</Box>
            <Spacer />
            {chatLog.length
              ? chatLog.map((message: MessageObject) => (
                  <p key={message.id}>{message.message}</p>
                ))
              : null}


            {/* <Flex direction="column">
              {chatLog.map((message) => (
                <Text bg="blue.100">{message}</Text>
              ))}
            </Flex> */}

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

import Layout from '@components/layout'
// import { Flex } from "@chakra-ui/layout"
import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Stack,
  Flex,
  Text,
  useControllableState,
  useToast,
} from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatSideBar from '@components/chat-sidebar'
import { ChannelObject, MessageObject } from 'src/types/chat'
import TopBar from '@components/chat/topbar'
import MiddleBar from '@components/chat/middlebar'
import BottomBar from '@components/chat/bottombar'
import { FetchError } from 'src/lib/fetchers'
import SimpleSidebar from '@components/chat/simple-sidebar'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'

const API_URL = 'http://localhost:3000/chat'

const Chat = () => {
  const { user } = useUser()
  const [isJoined, setIsJoined] = useState(false)
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
  const [socket, setSocket] = useState()
  const [toastMessage, setToastMessage] = useState()
  const toast = useToast()

  useEffect(() => {
    const tempSocket = io(API_URL, { transports: ['websocket'] })
    setSocket(tempSocket)

    return () => {
      tempSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('connect', () => {
      console.log('connection ID : ', socket.id)
    })
    socket.on('updateNewMessage', (message: MessageObject) => {
      console.log('recieved : ', message)
      setMsg(message)
    })
    socket.on('toastMessage', (message: string) => {
      setToastMessage(message)
    })
  }, [socket])

  useEffect(() => {
    if (!user) return
    console.log('check if joined')
    if (user) {
      console.log('effect user', user)
      console.log('effect room', currentRoom)
      const members = currentRoom.members
      console.log('index', members.indexOf(user.userId))
      if (members.indexOf(user.userId) != -1) {
        setIsJoined(true)
      } else {
        setIsJoined(false)
      }
    }
  }, [user, currentRoom])

  useEffect(() => {
    if (msg) {
      setChatLog([...chatLog, msg])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  useEffect(() => {
    if (!toastMessage) return
    toast({
      description: toastMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
    setToastMessage('')
  }, [toastMessage])

  return (
    <Layout>
      <Flex>
        <Flex w='20%' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <ChatSideBar
            socket={socket}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
          />
        </Flex>
        <Flex h='90vh' w='80%' direction='column'>
          <TopBar socket={socket} currentRoom={currentRoom} />
          <MiddleBar chatLog={chatLog} />
          <Flex p={4}>
            <BottomBar
              inputText={inputText}
              setInputText={setInputText}
              socket={socket}
              currentRoom={currentRoom}
              isJoined={isJoined}
            />
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat

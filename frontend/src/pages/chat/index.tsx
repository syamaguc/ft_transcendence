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
  useToast,
  useControllableState,
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
import { API_URL as API_PREFIX, DEFAULT_ROOM } from 'src/constants'

const API_URL = API_PREFIX + '/chat'

const Chat = () => {
  const { user } = useUser()
  const [isJoined, setIsJoined] = useState(false)
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<ChannelObject>(DEFAULT_ROOM)
  const [socket, setSocket] = useState()
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
    })
    socket.on('updateNewMessage', (message: MessageObject) => {
      setMsg(message)
    })
    socket.on('exception', ({ status, message }) => {
      toast({
        description: message,
        status: status,
        duration: 5000,
        isClosable: true,
      })
    })
  }, [socket])

  useEffect(() => {
    if (!user) return
    if (user) {
      const members = currentRoom.members
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

  return (
    <Layout>
      <Flex>
        <Flex
          maxW='300px'
          w='20%'
          h='90vh'
          borderEnd='1px solid'
          borderColor='gray'
        >
          <ChatSideBar
            socket={socket}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
            user={user}
          />
        </Flex>
        <Flex h='90vh' minW='80%' w='calc(100vw - 300px)' direction='column'>
          <TopBar
            socket={socket}
            currentRoom={currentRoom}
            isJoined={isJoined}
          />
          <MiddleBar currentRoom={currentRoom} chatLog={chatLog} />
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

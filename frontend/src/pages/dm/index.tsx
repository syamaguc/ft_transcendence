import Layout from '@components/layout'
import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Stack,
  Flex,
  Text,
} from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { DMObject, MessageObject } from 'src/types/chat'
import DMTopBar from '@components/dm/dm-topbar'
import MiddleBar from '@components/chat/middlebar'
import DMBottomBar from '@components/dm/dm-bottombar'
import { FetchError } from 'src/lib/fetch-json'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'
import DMSideBar from '@components/dm/dm-sidebar'

const socket = io('http://localhost:3000/dm', { transports: ['websocket'] })
const API_URL = 'http://localhost:3000'

const Chat = () => {
  const { user } = useUser()
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<DMObject>({
    id: 'default',
    toUserName: user.username,
    logs: [],
  })

  const didLogRef = useRef(false)

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('connect', () => {
        console.log('connection ID : ', socket.id)
      })
      //   socket.on('initCurrentRoom', (room: DMObject) => {
      //     setCurrentRoom(room)
      //   })
      socket.on('updateNewMessage', (message: MessageObject) => {
        console.log('recieved : ', message)
        setMsg(message)
      })
    }
  }, [])

  useEffect(() => {
    if (msg) {
      setChatLog([...chatLog, msg])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  return (
    <Layout>
      <Flex>
        <Flex w='300px' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <DMSideBar
            socket={socket}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
          />
        </Flex>
        <Flex h='90vh' w='100%' direction='column'>
          <DMTopBar currentRoom={currentRoom} />
          <MiddleBar chatLog={chatLog} />
          <Flex p={4}>
            <DMBottomBar
              inputText={inputText}
              setInputText={setInputText}
              socket={socket}
            />
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat

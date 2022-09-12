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
} from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatSideBar from '@components/chat-sidebar'
import { ChannelObject, MessageObject } from 'src/types/chat'
import TopBar from '@components/chat/topbar'
import MiddleBar from '@components/chat/middlebar'
import BottomBar from '@components/chat/bottombar'
import { FetchError } from 'src/lib/fetch-json'
import SimpleSidebar from '@components/chat/simple-sidebar'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'

const socket = io('http://localhost:3000/chat', { transports: ['websocket'] })
const API_URL = 'http://localhost:3000'

const InputBody = ({ inputText, setInputText, onClickSubmit }) => {
  return (
    <>
      <Input
        type='text'
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value)
        }}
      />
      <Button ml={3} px={6} onClick={onClickSubmit} type='submit'>
        Send
      </Button>
    </>
  )
}

const onClickJoin = (roomId: String, setIsJoined) => {
  socket.emit('joinRoom', roomId)
  console.log('joinroom', roomId)
}

const JoinBody = ({ currentRoom, setIsJoined }) => {
  return (
    <>
      <Button
        onClick={() => {
          onClickJoin(currentRoom.id, setIsJoined)
        }}
      >
        join
      </Button>
    </>
  )
}

const ShowContents = ({
  isJoined,
  setIsJoined,
  inputText,
  setInputText,
  onClickSubmit,
  currentRoom,
}) => {
  if (isJoined) {
    return (
      <>
        <InputBody
          inputText={inputText}
          setInputText={setInputText}
          onClickSubmit={onClickSubmit}
        />
      </>
    )
  } else {
    return (
      <>
        <JoinBody currentRoom={currentRoom} setIsJoined={setIsJoined} />
      </>
    )
  }
}

const Chat = () => {
  const user = useUser()
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

  useEffect(() => {
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
  }, [currentRoom])

  const onClickSubmit = useCallback(() => {
    const message = {
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
      <Flex>
        <Flex w='300px' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <ChatSideBar
            socket={socket}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
            setChatLog={setChatLog}
            setInputMessage={setInputText}
          />
        </Flex>
        <Flex h='90vh' w='100%' direction='column'>
          <TopBar currentRoom={currentRoom} />
          <MiddleBar chatLog={chatLog} />
          {/* <BottomBar inputText={inputText} setInputText={setInputText} socket={socket}/> */}
          <Flex p={4}>
            <ShowContents
              isJoined={isJoined}
              setIsJoined={setIsJoined}
              inputText={inputText}
              setInputText={setInputText}
              onClickSubmit={onClickSubmit}
              currentRoom={currentRoom}
            />
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat

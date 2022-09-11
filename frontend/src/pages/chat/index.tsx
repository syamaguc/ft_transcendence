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

// const CheckAccessibility = ({ currentRoom, user }) => {
//   console.log("user is ", user)
//   console.log("room is ", currentRoom)
//   if (!user || !currentRoom) return <></>
//   const members: string[] = currentRoom.members
//   if (!members) return <></>
//   console.log("member is", members)
//   if (members.indexOf(user.userId) == -1) return false
//   return <Text>The check success</Text>
// }

const InputBody = ({ inputText, setInputText, onClickSubmit }) => {
  return (
    // <Flex p={4}>
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
    // </Flex>
  )
}

const onClickJoin = (roomId: string) => {
  socket.emit('joinRoom', roomId)
  console.log('joinroom', roomId)
}

const JoinBody = ({ currentRoom }) => {
  return (
    <>
      <Button
        onClick={() => {
          onClickJoin(currentRoom.id)
        }}
      >
        join
      </Button>
    </>
  )
}

const CheckAccessibility = ({
  inputText,
  setInputText,
  onClickSubmit,
  currentRoom,
  user,
}) => {
  console.log('current room', currentRoom)
  console.log('user', user)
  if (!user || !currentRoom)
    return (
      <>
        <JoinBody currentRoom={currentRoom} />
      </>
    )
  const members: string[] = currentRoom.members
  if (!members)
    return (
      <>
        <JoinBody currentRoom={currentRoom} />
      </>
    )
  // console.log("member is", members)
  if (members.indexOf(user.userId) == -1)
    return (
      <>
        <JoinBody currentRoom={currentRoom} />
      </>
    )
  return (
    <InputBody
      inputText={inputText}
      setInputText={setInputText}
      onClickSubmit={onClickSubmit}
    />
  )
}

const Chat = () => {
  const user = useUser()
  // console.log(user)
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
      socket.on('updateCurrentRoom', (channel: ChannelObject) => {
        console.log('recupdateCurrentRoom recieved : ', channel)
        setCurrentRoom(channel)
      })
    }
  }, [])

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
            <CheckAccessibility
              inputText={inputText}
              setInputText={setInputText}
              onClickSubmit={onClickSubmit}
              currentRoom={currentRoom}
              user={user}
            />
            {/* {checkAccessibility(currentRoom, user) ? (
              <InputBody
                inputText={inputText}
                setInputText={setInputText}
                onClickSubmit={onClickSubmit}
              />
            ) : (
              <JoinBody currentRoom={currentRoom} />
            )} */}
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat

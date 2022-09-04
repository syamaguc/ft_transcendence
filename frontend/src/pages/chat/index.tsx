import Layout from '@components/layout'
// import { Flex } from "@chakra-ui/layout"
import { Box, Button, HStack, Input, Spacer, Stack, Flex, Text } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatSideBar from '@components/chat-sidebar'
import { ChannelObject, MessageObject } from 'src/types/chat'
import TopBar from '@components/chat/topbar'
import MiddleBar from '@components/chat/middlebar'
import BottomBar from '@components/chat/bottombar'
import { FetchError } from 'src/lib/fetch-json'
import SimpleSidebar from '@components/chat/simple-sidebar'

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

  const timestampToTime = (timestamp) => {
    const date = new Date(timestamp);
    const yyyy = `${date.getFullYear()}`;
    // .slice(-2)で文字列中の末尾の2文字を取得する
    // `0${date.getHoge()}`.slice(-2) と書くことで０埋めをする
    const MM = `0${date.getMonth() + 1}`.slice(-2); // getMonth()の返り値は0が基点
    const dd = `0${date.getDate()}`.slice(-2);
    const HH = `0${date.getHours()}`.slice(-2);
    const mm = `0${date.getMinutes()}`.slice(-2);
    const ss = `0${date.getSeconds()}`.slice(-2);

    return `${yyyy}/${MM}/${dd}`;
    // return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
  }

  return (
    <Layout>
      <Box>
        <Flex>
          <Flex w="300px" h="90vh" borderEnd="1px solid" borderColor="gray">
            {/* <SimpleSidebar/> */}
            <ChatSideBar
              socket={socket}
              currentRoom={currentRoom}
              setCurrentRoom={setCurrentRoom}
              setChatLog={setChatLog}
              setInputMessage={setInputText}
            />
          </Flex>
          <Flex h='90vh' w='100%' direction="column">
            <Box borderBottom="1px solid" borderColor="gray.100" p={4}>Current Channel : {currentRoom.name}</Box>
            <Flex direction="column" pt={4} mx={5} flex={1}  overflowX="scroll" sx={{scrollbarWidth: "none"}}>
              {chatLog.length
                  ? chatLog.map((message: MessageObject) => (
                    <Flex>
                      <Flex bg="blue.100" w="fit-content" minWidth="100px" borderRadius="10px" p={3} m={1}>
                        <Text>{message.message}</Text>
                      </Flex>
                      <Flex>
                        <Text>{timestampToTime(message.timestamp)}</Text>
                      </Flex>
                    </Flex>

                  ))
                : null}
            </Flex>
            <Flex p={4}>
              <Input
                type='text'
                value={inputText}
                onChange={(event) => {
                  setInputText(event.target.value)
                }}
              />
              <Button ml={3} onClick={onClickSubmit} type='submit'>
                Send Message
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Layout>
  )
}

export default Chat

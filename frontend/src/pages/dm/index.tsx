import Layout from '@components/layout'
import { Flex } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { DMObject, MessageObject } from 'src/types/chat'
import { FetchError } from 'src/lib/fetch-json'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'
import DMSideBar from '@components/dm/dm-sidebar'
import { useRouter } from 'next/router'
import DMContent from '@components/dm/dm-content'

const API_URL = 'http://localhost:3000'
const PREFIX_URL = '/dm/'

const Chat = () => {
  const [socket, setSocket] = useState(
    io(API_URL + '/dm', {
      transports: ['websocket'],
    })
  )
  const router = useRouter()
  const { user } = useUser()
  const [inputText, setInputText] = useState('')
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<DMObject>({
    id: '3a970758-fc0d-4127-ac23-8327720bbb7b',
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

  useEffect(() => {
    if (currentRoom.id != '3a970758-fc0d-4127-ac23-8327720bbb7b')
      router.push(PREFIX_URL + currentRoom.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom])

  const onClickChannel = (DMRoom: DMObject) => {
    if (currentRoom != DMRoom) {
      setCurrentRoom(DMRoom)
      socket.emit('watchRoom', DMRoom.id)
      socket.emit('getMessageLog', DMRoom.id)
      setInputText('')
    }
  }

  return (
    <Layout>
      <Flex>
        <Flex w='300px' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <DMSideBar
            router={router}
            socket={socket}
            currentRoom={currentRoom}
          />
        </Flex>
        <Flex h='90vh' w='100%' direction='column'>
          <DMContent socket={socket} currentRoom={currentRoom} />
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat

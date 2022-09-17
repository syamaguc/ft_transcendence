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
const PREFIX_URL = '/dm'

const Chat = () => {
  const [socket, setSocket] = useState(
    io(API_URL + PREFIX_URL, {
      transports: ['websocket'],
    })
  )
  const router = useRouter()
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()

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
    if (msg) {
      setChatLog([...chatLog, msg])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  return (
    <Layout>
      <Flex>
        <Flex w='300px' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <DMSideBar router={router} socket={socket} />
        </Flex>
        <Flex h='90vh' w='100%' direction='column'>
          {/* <Frends List /> display freinds list like discord does */}
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Chat
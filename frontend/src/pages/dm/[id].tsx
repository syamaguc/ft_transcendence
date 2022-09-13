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

const socket = io('http://localhost:3000/dm', { transports: ['websocket'] })
const API_URL = 'http://localhost:3000'

const ChatRoom = () => {
  const [socket, setSocket] = useState(
    io(API_URL + '/dm', {
      transports: ['websocket'],
    })
  )
  const didLogRef = useRef(false)
  const router = useRouter()
  const [currentRoom, setCurrentRoom] = useState<DMObject>()

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      const roomId = router.query.id
      socket.emit('watchRoom', roomId)
    }
    socket.on('watchRoom', (room: DMObject) => {
      setCurrentRoom(room)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout>
      <Flex>
        <Flex w='300px' h='90vh' borderEnd='1px solid' borderColor='gray'>
          <DMSideBar
            socket={socket}
            router={router}
            currentRoom={currentRoom}
          />
        </Flex>
        <Flex h='90vh' w='100%' direction='column'>
          <DMContent
            // router={router}
            socket={socket}
            currentRoom={currentRoom}
          />
        </Flex>
      </Flex>
    </Layout>
  )
}

export default ChatRoom

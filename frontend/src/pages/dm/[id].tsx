import Layout from '@components/layout'
import { Flex } from '@chakra-ui/react'
import { io } from 'socket.io-client'
import { useState, useEffect, useRef } from 'react'
import DMSideBar from '@components/dm/dm-sidebar'
import { useRouter } from 'next/router'
import DMContent from '@components/dm/dm-content'

const API_URL = 'http://localhost:3000'

const Chat = () => {
  const [socket, setSocket] = useState(
    io(API_URL + '/dm', {
      transports: ['websocket'],
    })
  )
  const didLogRef = useRef(false)
  const router = useRouter()
  const [roomId, setRoomId] = useState<string>()

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      const tmpRoomId = router.query.id
      if (typeof tmpRoomId === 'string') {
        setRoomId(tmpRoomId)
      } else {
        setRoomId(tmpRoomId[0])
      }
      socket.emit('watchRoom', tmpRoomId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <DMSideBar socket={socket} router={router} />
        </Flex>
        <Flex h='90vh' minW='80%' w='calc(100vw - 300px)' direction='column'>
          <DMContent socket={socket} roomId={roomId} />
        </Flex>
      </Flex>
    </Layout>
  )
}

export default function ChatRoom() {
  const router = useRouter()
  return <Chat key={router.asPath} />
}

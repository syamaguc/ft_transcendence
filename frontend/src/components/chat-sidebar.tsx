import {
  Tooltip,
  Text,
  Box,
  Stack,
  Flex,
  Button,
  Input,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react'
import { AtSignIcon, LockIcon } from '@chakra-ui/icons'
import { useState, useCallback, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { ChannelObject, MessageObject } from 'src/types/chat'
import ChatCreationForm from './chat-creation-form'

const ChannelOne = ({ roomInfo }) => {
  if (roomInfo.is_private) {
    return (
      <Flex align='center'>
        <Tooltip label='private channel'>
          <AtSignIcon mr={2} color='gray.600'/>
        </Tooltip>
        <Text>{roomInfo.name} </Text>
      </Flex>
    )
  }

  if (roomInfo.password != '') {
    return (
      <Flex align='center'>
        <Tooltip label='protected channel'>
          <LockIcon mr={2} color='gray.600'/>
        </Tooltip>
        <Text>{roomInfo.name} </Text>
      </Flex>
    )
  }

  return (
    <>
      <Text>{roomInfo.name} </Text>
    </>
  )

}


type Props = {
  socket: Socket
  currentRoom: ChannelObject
  setCurrentRoom: (room: ChannelObject) => void
  setChatLog: (chatLog: MessageObject[]) => void
  setInputMessage: (input: string) => void
}

const SideBar = ({
  socket,
  currentRoom,
  setCurrentRoom,
  setChatLog,
  setInputMessage,
}: Props) => {
  const [chatRooms, setChatRooms] = useState<ChannelObject[]>([currentRoom])
  const [room, setRoom] = useState<ChannelObject>()
  const didLogRef = useRef(false)
  const [moveChannelId, setMoveChannelId] = useState()

  const onClickChannel = (chatRoom: ChannelObject) => {
    if (currentRoom != chatRoom) {
      setCurrentRoom(chatRoom)
      socket.emit('watchRoom', chatRoom.id)
      socket.emit('getMessageLog', chatRoom.id)
      setInputMessage('')
    }
  }

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('getMessageLog', (messageLog: MessageObject[]) => {
        console.log('messageLog loaded', messageLog)
        setChatLog(messageLog)
      })
      socket.on('getRooms', (rooms: ChannelObject[]) => {
        setChatRooms(rooms)
      })
      socket.on('updateRoom', (channel: ChannelObject) => {
        console.log('updateRoom received : ', channel)
        setRoom(channel)
      })
      socket.on('updateCurrentRoom', (channelId: string) => {
        console.log('updateCurrentRoom received : ', channelId)
        setMoveChannelId(channelId)
      })
      socket.emit('getRooms')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (room) {
      let existFlag = false
      for (let i = 0; i < chatRooms.length; i++) {
        if (chatRooms[i].id == room.id) {
          existFlag = true
          chatRooms[i] = room
          const newChatRooms = chatRooms.slice(0)
          setChatRooms(newChatRooms)
          break
        }
      }
      if (!existFlag) {
        setChatRooms([...chatRooms, room])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  useEffect(() => {
    if (!moveChannelId) return
    for (let i = 0; i < chatRooms.length; i++) {
      if (chatRooms[i].id == moveChannelId) {
        setCurrentRoom(chatRooms[i])
        setMoveChannelId(null)
        break
      }
    }
  }, [chatRooms, moveChannelId])

  useEffect(() => {
    for (let i = 0; i < chatRooms.length; i++) {
      if (chatRooms[i].id == currentRoom.id) {
        if (chatRooms[i] !== currentRoom) {
          setCurrentRoom(chatRooms[i])
        }
        break
      }
    }
  }, [currentRoom, chatRooms])

  return (
    <Flex width='100%' direction='column' bg='gray.100' overflowX='scroll'>
      <Flex
        width='100%'
        p={(5, 5, 2, 2)}
        borderBottom='1px solid'
        borderBottomColor='gray.200'
      >
        <ChatCreationForm socket={socket} />
      </Flex>

      <Flex direction='column'>
        {chatRooms.map((chatRoom: ChannelObject) => (
          <Flex
            as='button'
            p={4}
            _hover={{ bgColor: '#00BABC' }}
            onClick={() => {
              onClickChannel(chatRoom)
            }}
            key={chatRoom.id}
          >
            {/* <Text>{chatRoom.name}</Text> */}
            <ChannelOne roomInfo={chatRoom}/>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export default SideBar

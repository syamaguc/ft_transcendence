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
import { DEFAULT_ROOM } from 'src/constants'

const ChannelOne = ({ roomInfo }) => {
  if (roomInfo.is_private) {
    return (
      <Flex align='center' overflow='hidden'>
        <Tooltip label='private channel'>
          <AtSignIcon mr={2} color='gray.600' />
        </Tooltip>
        <Text
          maxW='80%'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
        >
          {roomInfo.name}
        </Text>
      </Flex>
    )
  }

  if (roomInfo.password != '') {
    return (
      <Flex align='center' overflow='hidden'>
        <Tooltip label='protected channel'>
          <LockIcon mr={2} color='gray.600' />
        </Tooltip>
        <Text
          maxW='80%'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
        >
          {roomInfo.name}
        </Text>
      </Flex>
    )
  }

  return (
    <>
      <Box
        maxW='90%'
        overflow='hidden'
        whiteSpace='nowrap'
        textOverflow='ellipsis'
      >
        {roomInfo.name}
      </Box>
    </>
  )
}

type Props = {
  socket: Socket
  currentRoom: ChannelObject
  setCurrentRoom: (room: ChannelObject) => void
  setChatLog: (chatLog: MessageObject[]) => void
  setInputMessage: (input: string) => void
  user
}

const SideBar = ({
  socket,
  currentRoom,
  setCurrentRoom,
  setChatLog,
  setInputMessage,
  user,
}: Props) => {
  const [chatRooms, setChatRooms] = useState<ChannelObject[]>([currentRoom])
  const [room, setRoom] = useState<ChannelObject>()
  const [moveChannelId, setMoveChannelId] = useState()
  const [deleteFlag, setDeleteFlag] = useState(false)

  const onClickChannel = (chatRoom: ChannelObject, user) => {
    if (currentRoom != chatRoom) {
      setCurrentRoom(chatRoom)
      const members = chatRoom.members
      let joined = false
      if (members.indexOf(user.userId) != -1) {
        joined = true
      }
      if (!chatRoom.password || joined) {
        socket.emit('watchRoom', chatRoom.id)
        socket.emit('getMessageLog', chatRoom.id)
        setInputMessage('')
      } else {
        socket.emit('unwatchRoom', chatRoom.id)
        setChatLog([])
      }
    }
  }

  useEffect(() => {
    if (!socket) return
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
    socket.on('updateRoomDelete', (channel: ChannelObject) => {
      console.log('updateRoomDelete received : ', channel)
      setRoom(channel)
      setDeleteFlag(true)
    })
    socket.on('deleteRoom', () => {
      console.log('deleteRoom received ')
      setCurrentRoom(DEFAULT_ROOM)
      setChatLog([])
    })
    socket.on('leavePrivateRoom', () => {
      console.log('leavePrivateRoom received')
      socket.emit('getRooms')
      setCurrentRoom(DEFAULT_ROOM)
      setChatLog([])
    })
    socket.on('refreshRooms', () => {
      console.log('refreshRooms received')
      socket.emit('getRooms')
    })
    socket.on('updateCurrentRoom', (channelId: string) => {
      console.log('updateCurrentRoom received : ', channelId)
      setMoveChannelId(channelId)
    })
    socket.emit('getRooms')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  useEffect(() => {
    if (room) {
      let existFlag = false
      for (let i = 0; i < chatRooms.length; i++) {
        if (chatRooms[i].id == room.id) {
          if (deleteFlag) {
            chatRooms.splice(i, 1)
            setChatRooms(chatRooms)
            setDeleteFlag(false)
            return
          }
          existFlag = true
          chatRooms[i] = room
          const newChatRooms = chatRooms.slice(0)
          setChatRooms(newChatRooms)
          break
        }
      }
      if (!existFlag && !deleteFlag) {
        setChatRooms([...chatRooms, room])
      }
      if (deleteFlag) {
        setDeleteFlag(false)
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
        {chatRooms.length != 0 &&
          chatRooms.map((chatRoom: ChannelObject) => (
            <Flex
              as='button'
              p={4}
              _hover={{ bgColor: '#00BABC' }}
              onClick={() => {
                onClickChannel(chatRoom, user)
              }}
              key={chatRoom.id}
            >
              <ChannelOne roomInfo={chatRoom} />
            </Flex>
          ))}
      </Flex>
    </Flex>
  )
}

export default SideBar

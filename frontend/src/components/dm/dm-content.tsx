import { Flex } from '@chakra-ui/layout'
import { Button, Text, Input } from '@chakra-ui/react'
import { DMObject, MessageObject } from 'src/types/chat'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import MiddleBar from '@components/chat/middlebar'
import { NextRouter } from 'next/router'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'

type DMTopBarProps = {
  currentRoom: DMObject
  user: User
}

const DMTopBar = ({ currentRoom, user }: DMTopBarProps) => {
  console.log('currentRoom+++++++++', currentRoom)
  const [roomName, setRoomName] = useState<string>('')

  useEffect(() => {
    if (currentRoom) {
      setRoomName(
        currentRoom.user1 == user.username
          ? currentRoom.user2
          : currentRoom.user1
      )
      console.log('roomName=======', currentRoom.user1, currentRoom.user2)
    }
  }, [currentRoom, user])

  return (
    <Flex
      h='55px'
      borderBottom='1px solid'
      borderColor='gray.100'
      p={4}
      align='center'
    >
      <Text>@{roomName}</Text>
    </Flex>
  )
}

const DMSendBox = ({ socket }) => {
  const [inputText, setInputText] = useState('')

  const onClickSubmit = useCallback(() => {
    const message = {
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText])

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

type DMContentProps = {
  socket: Socket
  roomId: string
}

const DMContent = ({ socket, roomId }: DMContentProps) => {
  const didLogRef = useRef(false)
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<DMObject>()
  const { user } = useUser()

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true

      socket.emit('getMessageLog', roomId)
      socket.on('getMessageLog', (messageLog: MessageObject[]) => {
        console.log('messageLog loaded', messageLog)
        setChatLog(messageLog)
      })

      socket.on('updateNewMessage', (message: MessageObject) => {
        console.log('recieved : ', message)
        setMsg(message)
      })
      socket.on('watchRoom', (room: DMObject) => {
        setCurrentRoom(room)
        console.log('watchRoom:', room)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (msg) {
      setChatLog([...chatLog, msg])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg])

  return (
    <>
      <DMTopBar currentRoom={currentRoom} user={user} />
      <MiddleBar chatLog={chatLog} />
      <Flex p={4}>
        <DMSendBox socket={socket} />
      </Flex>
    </>
  )
}

export default DMContent

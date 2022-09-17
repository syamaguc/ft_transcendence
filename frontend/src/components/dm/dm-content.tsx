import { Flex } from '@chakra-ui/layout'
import { Button, Text, Input } from '@chakra-ui/react'
import { DMObject, MessageObject } from 'src/types/chat'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import MiddleBar from '@components/chat/middlebar'
import { NextRouter } from 'next/router'

const DMTopBar = ({ roomDisplayName }) => {
  return (
    <Flex
      h='55px'
      borderBottom='1px solid'
      borderColor='gray.100'
      p={4}
      align='center'
    >
      <Text>@ {roomDisplayName}</Text>
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

type Props = {
  socket: Socket
  roomId: string
}

const DMContent = ({ socket, roomId }: Props) => {
  const didLogRef = useRef(false)
  const [chatLog, setChatLog] = useState<MessageObject[]>([])
  const [msg, setMsg] = useState<MessageObject>()
  const [currentRoom, setCurrentRoom] = useState<DMObject>()

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
      <DMTopBar roomDisplayName={currentRoom ? currentRoom.toUserName : ''} />
      <MiddleBar chatLog={chatLog} />
      <Flex p={4}>
        <DMSendBox socket={socket} />
      </Flex>
    </>
  )
}

export default DMContent

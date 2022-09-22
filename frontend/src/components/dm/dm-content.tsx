import { Flex } from '@chakra-ui/layout'
import { Button, Text, Textarea } from '@chakra-ui/react'
import { DMObject, MessageObject } from 'src/types/chat'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import ResizeTextarea from 'react-textarea-autosize'
import DmMiddleBar from '@components/dm/dm-middlebar'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'

type DMTopBarProps = {
  currentRoom: DMObject
}

const DMTopBar = ({ currentRoom }: DMTopBarProps) => {
  return (
    <Flex
      h='55px'
      borderBottom='1px solid'
      borderColor='gray.100'
      p={4}
      align='center'
    >
      <Text>@ {currentRoom && currentRoom.name}</Text>
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
      <Textarea
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value)
        }}
        minH='unset'
        overflow='hidden'
        w='100%'
        minRows={1}
        maxRows={10}
        as={ResizeTextarea}
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

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true

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

  useEffect(() => {
    if (roomId) {
      socket.emit('getMessageLog', roomId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  return (
    <>
      <DMTopBar currentRoom={currentRoom} />
      <DmMiddleBar chatLog={chatLog} />
      <Flex p={4}>
        <DMSendBox socket={socket} />
      </Flex>
    </>
  )
}

export default DMContent

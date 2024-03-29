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

const FakeDMSendBox = ({ currentRoom }) => {
  let placeholder = ''
  if (currentRoom) {
    placeholder = 'You cannot send messages to a user you have blocked.'
  }

  return (
    <>
      <Textarea
        isDisabled
        placeholder={placeholder}
        minH='unset'
        overflow='hidden'
        w='100%'
        minRows={1}
        maxRows={10}
        as={ResizeTextarea}
      />
      <Button isDisabled ml={3} px={6} type='submit'>
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
  const { user: currentUser } = useUser()

  const isNotBlocked = (element: DMObject) => {
    return currentUser.blockedUsers.indexOf(element.userId) === -1
  }
  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true

      socket.on('getMessageLog', (messageLog: MessageObject[]) => {
        setChatLog(messageLog)
      })
      socket.on('updateNewMessage', (message: MessageObject) => {
        setMsg(message)
      })
      socket.on('watchRoom', (room: DMObject) => {
        setCurrentRoom(room)
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
        {currentRoom && isNotBlocked(currentRoom) ? (
          <DMSendBox socket={socket} />
        ) : (
          <FakeDMSendBox currentRoom={currentRoom} />
        )}
      </Flex>
    </>
  )
}

export default DMContent

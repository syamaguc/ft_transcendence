import { Button, Textarea } from '@chakra-ui/react'
import { useCallback } from 'react'
import { Socket } from 'socket.io-client'
import ResizeTextarea from "react-textarea-autosize";
import { ChannelObject } from 'src/types/chat'

type Props = {
  inputText: string
  setInputText: (input: string) => void
  socket: Socket
  currentRoom: ChannelObject
  isJoined: boolean
}

const BottomBar = ({
  inputText,
  setInputText,
  socket,
  currentRoom,
  isJoined,
}: Props) => {
  const onClickSubmit = useCallback(() => {
    if (!socket) return
    const message = {
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText, setInputText, socket])

  const onClickJoin = useCallback(() => {
    if (!currentRoom || !socket) return
    socket.emit('joinRoom', currentRoom.id)
    console.log('joinroom', currentRoom.id)
  }, [currentRoom, socket])

  if (currentRoom.id == 'default-channel') {
    return <></>
  } else if (isJoined) {
    return (
      <>
        <Textarea
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value)
          }}
          minH="unset"
          overflow="hidden"
          w="100%"
          minRows={1}
          maxRows={10}
          as={ResizeTextarea}
        />
        <Button ml={3} px={6} onClick={onClickSubmit} type='submit'>
          Send
        </Button>
      </>
    )
  } else {
    return (
      <>
        <Button onClick={onClickJoin}>join</Button>
      </>
    )
  }
}

export default BottomBar

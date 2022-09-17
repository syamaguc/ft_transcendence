import { Input, Button } from '@chakra-ui/react'
import { useCallback } from 'react'
import { Socket } from 'socket.io-client'
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

  if (isJoined) {
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
  } else {
    return (
      <>
        <Button onClick={onClickJoin}>join</Button>
      </>
    )
  }
}

export default BottomBar

import { Button } from '@chakra-ui/react'
import { useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { ChannelObject } from 'src/types/chat'

type Props = {
  socket: Socket
  currentRoom: ChannelObject
  isJoined: boolean
}

const ButtonLeave = ({ socket, currentRoom, isJoined }: Props) => {
  const onClickLeave = useCallback(() => {
    if (!currentRoom || !socket) return
    socket.emit('leaveRoom', currentRoom.id)
    console.log('leaveRoom', currentRoom.id)
  }, [currentRoom, socket])

  return (
    <>
      {isJoined ? (
        <Button size='sm' m={2} onClick={onClickLeave}>
          leave
        </Button>
      ) : null}
    </>
  )
}

export default ButtonLeave

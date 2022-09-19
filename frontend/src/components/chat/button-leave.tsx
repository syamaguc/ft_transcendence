import { Button } from '@chakra-ui/react'
import { Socket } from 'socket.io-client'
import { ChannelObject } from 'src/types/chat'

type Props = {
  socket: Socket
  currentRoom: ChannelObject
  isJoined: boolean
}

const ButtonLeave = ({ socket, currentRoom, isJoined }: Props) => {
  return (
    <>
      {isJoined ? (
        <Button size='sm' m={2}>
          leave
        </Button>
      ) : null}
    </>
  )
}

export default ButtonLeave

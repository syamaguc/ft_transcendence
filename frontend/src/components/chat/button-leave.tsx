import { Button } from '@chakra-ui/react'
import { Socket } from 'socket.io-client'
import { ChannelObject } from 'src/types/chat'

type Props = {
  socket: Socket
  currentRoom: ChannelObject
}

const ButtonLeave = ({ socket, currentRoom }: Props) => {
  return (
    <>
      <Button size='sm' m={2}>
        leave
      </Button>
    </>
  )
}

export default ButtonLeave

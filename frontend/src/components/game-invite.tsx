import React, { useState, useEffect } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import io from 'socket.io-client'
import { API_URL } from 'src/constants'

type Props = {
  user
  router
}

const GameInvite = ({ user, router }: Props) => {
  const toast = useToast()
  const [server, setServer] = useState()
  const [inviteStatus, setInviteStatus] = useState(0)
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    const tempServer = io(API_URL, { transports: ['websocket'] })
    setServer(tempServer)
    console.log('connect', tempServer.id)
    return () => {
      console.log('disconnect', tempServer.id)
      tempServer.disconnect()
    }
  }, [router])

  useEffect(() => {
    if (!server || !user || !toast || !router) return
    server.on('goGameRoom', (data: string) => {
      router.push('/game/' + data)
    })

    server.on('setGameInviteButton', (data) => {
      setInviteStatus(data['status'])
      setRoomId(data['roomId'])
    })

    server.on('exception', ({ status, message }) => {
      console.log(status, message)
      toast({
        description: message,
        status: status,
        duration: 5000,
        isClosable: true,
      })
    })
    server.emit('gameInviteReady', { userId: user.userId })
  }, [server, user, toast, router])

  return (
    <>
      {inviteStatus == 0 && (
        <Button
          onClick={() =>
            server && server.emit('gameInvite', { userId: user.userId })
          }
        >
          Invite
        </Button>
      )}
      {inviteStatus == 1 && (
        <Button
          onClick={() =>
            server && server.emit('gameInviteReady', { userId: user.userId })
          }
        >
          Cancel
        </Button>
      )}
      {inviteStatus == 2 && (
        <Button
          onClick={() =>
            server && server.emit('gameReceiveInvite', { userId: user.userId })
          }
        >
          Receive Invitation
        </Button>
      )}
      {inviteStatus == 3 && (
        <Button onClick={() => router.push('/game/' + roomId)}>
          Join Room
        </Button>
      )}
      {inviteStatus == 4 && (
        <Button onClick={() => router.push('/game/' + roomId)}>
          Back My Game
        </Button>
      )}
    </>
  )
}

export default GameInvite

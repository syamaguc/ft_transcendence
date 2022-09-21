import React, { useState, useEffect } from 'react'
import { Button } from '@chakra-ui/react'
import io from 'socket.io-client'
import { API_URL } from 'src/constants'

type Props = {
  user
  router
}

const GameInvite = ({
  user,
  router
}: Props) => {
  const [server, setServer] = useState()
  const [inviteStatus, setInviteStatus] = useState(0)

  useEffect(() => {
    const tempServer = io(API_URL, { transports: ['websocket'] })
    setServer(tempServer)
    console.log('connect', tempServer.id)
    return () => {
      console.log('disconnect', tempServer.id)
      tempServer.disconnect()
    }
  }, [router])

  return (
    <>
      {inviteStatus == 0 && (<Button>Invite</Button>)}
      {inviteStatus == 1 && (<Button>Cancel</Button>)}
      {inviteStatus == 2 && (<Button>Receive Invitation</Button>)}
      {inviteStatus == 3 && (<Button>Join Room</Button>)}
    </>
  )
}

export default GameInvite

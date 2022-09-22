import { Button, Stack, useToast } from '@chakra-ui/react'
import { useState } from 'react'

import { User, PartialUserInfo } from 'src/types/user'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'

type UserActionsProps = {
  user: User
}

export default function UserActions({ user }: UserActionsProps) {
  const { user: currentUser } = useUser()

  return (
    <Stack direction='row'>
      {user.userId !== currentUser.userId && (
        <>
          {currentUser.friends.indexOf(user.userId) > -1 ? (
            <RemoveFriendButton friend={user} />
          ) : (
            <AddFriendButton user={user} />
          )}
        </>
      )}
      <>
        {currentUser.blockedUsers.indexOf(user.userId) > -1 ? (
          <UnblockButton user={user} />
        ) : (
          <BlockButton user={user} />
        )}
      </>
    </Stack>
  )
}

type RemoveFriendButtonProps = {
  friend: PartialUserInfo
}

function RemoveFriendButton({ friend }: RemoveFriendButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()
  const { mutateFriends } = useFriends()

  const removeFriend = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/deleteFriend`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: friend.userId }),
      })
      if (!res.ok) {
        message = 'Could not remove friend'
      } else if (res.ok) {
        message = 'Removed from friends'
        status = 'info'
        await mutateFriends()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <Button onClick={removeFriend} isLoading={isLoading}>
      Remove friend
    </Button>
  )
}

type AddFriendButtonProps = {
  user: User
}

function AddFriendButton({ user }: AddFriendButtonProps) {
  const { user: currentUser, mutateUser: mutateCurrentUser } = useUser()
  const { mutateFriends } = useFriends()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const addFriend = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log(user)

    if (currentUser.friends.indexOf(user.userId) > -1) {
      message = 'Already friends with that user'
    } else {
      const res = await fetch(`${API_URL}/api/user/addFriend`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }),
      })
      if (!res.ok) {
        message = 'Could not add friend'
      } else if (res.ok) {
        message = 'Friend added'
        status = 'info'
        await mutateCurrentUser()
        await mutateFriends()
      }
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }
  return (
    <Button onClick={addFriend} isLoading={isLoading}>
      Add Friend
    </Button>
  )
}

type BlockButtonProps = {
  user: PartialUserInfo
}

function BlockButton({ user }: BlockButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const { mutateFriends } = useFriends()
  const { mutateBlocked } = useBlocked()
  const toast = useToast()

  const blockUser = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/blockFriend`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }),
      })
      if (!res.ok) {
        message = 'Could not block user'
      } else if (res.ok) {
        message = 'Blocked user'
        status = 'info'
        await mutateFriends()
        await mutateBlocked()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <Button onClick={blockUser} isLoading={isLoading}>
      Block
    </Button>
  )
}

type UnblockButtonProps = {
  user: User
}

function UnblockButton({ user }: UnblockButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const { mutateBlocked } = useBlocked()
  const toast = useToast()

  const unblockUser = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/unblockFriend`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }),
      })
      if (!res.ok) {
        message = 'Could not unblock user'
      } else if (res.ok) {
        message = 'Unblocked user'
        status = 'info'
        await mutateBlocked()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <Button onClick={unblockUser} isLoading={isLoading}>
      Unblock
    </Button>
  )
}

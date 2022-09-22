import { MenuItem, useToast } from '@chakra-ui/react'
import { useState } from 'react'

import { PartialUserInfo } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'
import { API_URL } from 'src/constants'

type RemoveFriendMenuItemProps = {
  friend: PartialUserInfo
}

export function RemoveFriendMenuItem({ friend }: RemoveFriendMenuItemProps) {
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
    <MenuItem
      fontSize='sm'
      onClick={async (e) => {
        e.stopPropagation()
        await removeFriend()
      }}
      disabled={isLoading}
    >
      Remove friend
    </MenuItem>
  )
}

type BlockMenuItemProps = {
  friend: PartialUserInfo
}

export function BlockMenuItem({ friend }: BlockMenuItemProps) {
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
        body: JSON.stringify({ userId: friend.userId }),
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
    <MenuItem
      fontSize='sm'
      onClick={async (e) => {
        e.stopPropagation()
        await blockUser()
      }}
      disabled={isLoading}
    >
      Block
    </MenuItem>
  )
}

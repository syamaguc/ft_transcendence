import {
  Avatar,
  Box,
  Circle,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Stack,
  Spacer,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Socket } from 'socket.io-client'

import { FiMoreVertical } from 'react-icons/fi'
import { BiMessage, BiUserX } from 'react-icons/bi'

import UserStatusBadge from '@components/user-status-badge'
import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'
import { API_URL } from 'src/constants'

type RemoveFriendMenuItemProps = {
  friend: PartialUserInfo
}

function RemoveFriendMenuItem({ friend }: RemoveFriendMenuItemProps) {
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

function BlockMenuItem({ friend }: BlockMenuItemProps) {
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

type FriendItemProps = {
  friend: PartialUserInfo
  socket: Socket
}

function DMFriendItem({ friend, socket }: FriendItemProps) {
  const router = useRouter()

  const onClickDM = (userId: string) => {
    socket.emit('getRoomIdByUserIds', userId)
    console.log('getRoomIdByUserIds')
  }

  return (
    <Stack
      direction='row'
      align='center'
      py='4'
      px='4'
      borderRadius='md'
      transition='color 0.2s'
      _hover={{ bg: 'gray.50', cursor: 'pointer' }}
      onClick={() => onClickDM(friend.userId)}
    >
      <Avatar
        key={friend.userId}
        size='sm'
        src={`${API_URL}/api/user/avatar/${friend.profile_picture}`}
        mr='12px'
      >
        <UserStatusBadge boxSize='1.25em' status={friend.status} />
      </Avatar>
      <Flex direction='row' align='center' w='full'>
        <Stack direction='column' spacing='0'>
          <Text fontWeight='800' fontSize='md'>
            {friend.username}
          </Text>
          <Text fontWeight='600' color='gray.400' fontSize='sm'>
            {friend.status}
          </Text>
        </Stack>
        <Spacer />
        <Tooltip
          label='Message'
          placement='top'
          hasArrow
          arrowSize={6}
          borderRadius='base'
        >
          <Circle
            _hover={{ bg: 'gray.200', color: 'gray.600' }}
            bg='gray.100'
            size='38px'
            mr='16px'
            onClick={(e) => {
              e.stopPropagation()
              onClickDM(friend.userId)
            }}
          >
            <Icon as={BiMessage} display='block' transition='color 0.2s' />
          </Circle>
        </Tooltip>
        <Tooltip
          label='More'
          placement='top'
          hasArrow
          arrowSize={6}
          borderRadius='base'
        >
          <Box bg='none'>
            <Menu>
              <MenuButton
                as={Circle}
                rounded='full'
                variant='link'
                cursor='pointer'
                _hover={{ bg: 'gray.200', color: 'gray.600' }}
                bg='gray.100'
                size='38px'
                onClick={(e) => e.stopPropagation()}
                align='center'
              >
                <Icon
                  as={FiMoreVertical}
                  display='block'
                  transition='color 0.2s'
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  fontSize='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/users/${friend.username}`)
                  }}
                >
                  View profile
                </MenuItem>
                <RemoveFriendMenuItem friend={friend} />
                <BlockMenuItem friend={friend} />
              </MenuList>
            </Menu>
          </Box>
        </Tooltip>
      </Flex>
    </Stack>
  )
}

export default DMFriendItem

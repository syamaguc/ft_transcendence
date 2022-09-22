import {
  Avatar,
  Circle,
  Flex,
  Icon,
  Stack,
  Spacer,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { BiMessage, BiUserX } from 'react-icons/bi'

import UserStatusBadge from '@components/user-status-badge'
import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'
import { API_URL } from 'src/constants'
type BlockedUserItemProp = {
  user: PartialUserInfo
}

function DMBlockedUserItem({ user }: BlockedUserItemProp) {
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
    <NextLink href={`/users/${user.username}`}>
      <Stack
        direction='row'
        align='center'
        py='4'
        px='4'
        borderRadius='md'
        transition='color 0.2s'
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
      >
        <Avatar
          size='sm'
          src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
          mr='12px'
        >
          <UserStatusBadge boxSize='1.25em' status={user.status} />
        </Avatar>
        <Flex direction='row' align='center' w='full'>
          <Stack direction='column' spacing='0'>
            <Text fontWeight='800' fontSize='md'>
              {user.username}
            </Text>
            <Text fontWeight='600' color='gray.400' fontSize='sm'>
              Blocked
            </Text>
          </Stack>
          <Spacer />
          <Tooltip
            label='Unblock'
            placement='top'
            hasArrow
            arrowSize={6}
            borderRadius='base'
          >
            <Circle
              _hover={{ bg: 'gray.200', color: 'red.500' }}
              bg='gray.100'
              size='38px'
              mr='16px'
              onClick={async (e) => {
                e.stopPropagation()
                if (isLoading) return
                await unblockUser()
              }}
            >
              <Icon
                as={BiUserX}
                display='block'
                transition='color 0.2s'
                w={6}
                h={6}
              />
            </Circle>
          </Tooltip>
        </Flex>
      </Stack>
    </NextLink>
  )
}

export default DMBlockedUserItem

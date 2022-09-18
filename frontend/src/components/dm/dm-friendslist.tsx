import {
  Avatar,
  AvatarBadge,
  Box,
  Circle,
  Flex,
  Stack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import useSWR from 'swr'
import { fetchUsers } from 'src/lib/fetchers'

import { FiMessageSquare, FiMoreVertical } from 'react-icons/fi'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'
import { Socket } from 'socket.io-client'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

type Props = {
  socket: Socket
}

const PREFIX_URL = '/dm'

function DMFriendsList({ socket }: Props) {
  const { user: currentUser } = useUser()
  const { data: users, error } = useSWR(
    `${API_URL}/api/user/search`,
    fetchUsers
  )
  const router = useRouter()

  const isLoading = !users && !error
  console.log(users)
  console.log('isLoading: ', isLoading)

  const onClickDM = (userId: string) => {
    socket.emit('getRoomIdByUserIds', userId)
    console.log('getRoomIdByUserIds')
  }

  useEffect(() => {
    socket.on('getRoomIdByUserIds', (id: string) => {
      console.log('getRoomIdByUserIds get = ', id)
      router.push(PREFIX_URL + '/' + id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Flex
        h='55px'
        borderBottom='1px solid'
        borderColor='gray.100'
        p={4}
        align='center'
      >
        <Text>Friends</Text>
      </Flex>
      <Flex w='100%'>
        <Box w='100%' p='2'>
          <Stack w='100%'>
            {users &&
              users
                .filter((user) => user.userId !== currentUser.userId)
                .map((user: User) => (
                  <Stack
                    key={user.userId}
                    w='100%'
                    direction='row'
                    align='center'
                    py='2'
                    px='8'
                    borderRadius='md'
                    transition='color 0.2s'
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  >
                    <Avatar
                      key={user.userId}
                      size='sm'
                      src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                      mr='12px'
                    >
                      <AvatarBadge boxSize='1.25em' bg='green.500' />
                    </Avatar>
                    <Flex direction='row' align='center' w='full'>
                      <Stack direction='column' spacing='0'>
                        <Text fontWeight='800' fontSize='md'>
                          {user.username}
                        </Text>
                        <Text fontWeight='600' color='gray.400' fontSize='sm'>
                          {user.status}
                        </Text>
                      </Stack>
                      <Spacer />
                      <Circle bg='gray.100' size='38px' mr='16px'>
                        <FiMessageSquare
                          onClick={() => onClickDM(user.userId)}
                        />
                      </Circle>
                      <Circle bg='gray.100' size='38px' mr='16px'>
                        <FiMoreVertical />
                      </Circle>
                    </Flex>
                  </Stack>
                ))}
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default DMFriendsList

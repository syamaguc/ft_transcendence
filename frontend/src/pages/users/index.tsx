import Layout from '@components/layout'
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import useSWR from 'swr'

import ApiTester from '@components/api-tester'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

type ProfileProps = {
  user: User
}

function Profile({ user }: ProfileProps) {
  const { mutateUser } = useUser()

  const handleLogout = async () => {
    let res = await fetch(`${API_URL}/api/user/logout`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(res)

    mutateUser()
  }

  return (
    <>
      <Container maxW='lg' px={{ base: '0', sm: '8' }}>
        <Stack spacing='8'>
          <Box boxShadow='base' p='8'>
            <Stack direction={'row'} spacing='8' align='center'>
              <Avatar
                size='2xl'
                src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
              />
              <Stack direction='column' spacing='0' fontSize='md'>
                <Text fontWeight='600'>username: {user.username}</Text>
                <Text>email: {user.email}</Text>
                <Text>userId: {user.userId}</Text>
                <Button onClick={handleLogout}>Logout</Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  )
}

async function fetchUsers(url: string): Promise<User[]> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return data
  }

  // TODO: throw
  return []
}

function UserList() {
  const { user: currentUser } = useUser()
  const { data: users, error } = useSWR(
    `${API_URL}/api/user/search`,
    fetchUsers
  )

  const isLoading = !users && !error
  console.log(users)
  console.log('isLoading: ', isLoading)

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            <Heading as='h1' fontSize='5xl'>
              Users
            </Heading>
            {error && (
              <Stack spacing='8'>
                <Text>Error occurred</Text>
              </Stack>
            )}
            {isLoading && (
              <Stack spacing='8'>
                <Skeleton height='60px' isLoaded={!isLoading} />
                <Skeleton height='60px' isLoaded={!isLoading} />
                <Skeleton height='60px' isLoaded={!isLoading} />
              </Stack>
            )}
            <Stack spacing='2'>
              {users &&
                users
                  .filter((user) => user.userId !== currentUser.userId)
                  .map((user: User) => (
                    <NextLink
                      key={user.username}
                      href={`/users/${user.username}`}
                    >
                      <Stack
                        key={user.userId}
                        direction='row'
                        align='center'
                        py='4'
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
                        <Stack direction='column' spacing='0'>
                          <Text fontWeight='800' fontSize='md'>
                            {user.username}
                          </Text>
                          <Text fontWeight='600' color='gray.400' fontSize='sm'>
                            {user.status}
                          </Text>
                        </Stack>
                      </Stack>
                    </NextLink>
                  ))}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserList

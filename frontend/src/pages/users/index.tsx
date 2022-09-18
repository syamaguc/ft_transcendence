import Layout from '@components/layout'
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Heading,
  Stack,
  Spacer,
  Skeleton,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import useSWR from 'swr'
import { fetchUsers } from 'src/lib/fetchers'

import { FiMessageSquare, FiMoreVertical } from 'react-icons/fi'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

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
                        <Flex direction='row' align='center' w='full'>
                          <Stack direction='column' spacing='0'>
                            <Text fontWeight='800' fontSize='md'>
                              {user.username}
                            </Text>
                            <Text
                              fontWeight='600'
                              color='gray.400'
                              fontSize='sm'
                            >
                              {user.status}
                            </Text>
                          </Stack>
                          <Spacer />
                          <Circle bg='gray.100' size='38px' mr='16px'>
                            <FiMessageSquare />
                          </Circle>
                          <Circle bg='gray.100' size='38px' mr='16px'>
                            <FiMoreVertical />
                          </Circle>
                        </Flex>
                      </Stack>
                    </NextLink>
                  ))}
            </Stack>
            <Heading as='h2' fontSize='2xl'>
              Friends
            </Heading>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserList

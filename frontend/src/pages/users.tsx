import Layout from '@components/layout'
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'

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

function Users() {
  const { user } = useUser()

  return (
    <Layout>
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        px='4'
        gap='4'
        w='full'
      >
        <Stack spacing='6'>
          <Box>
            {user ? <Profile user={user} /> : <Text>User not found</Text>}
          </Box>
        </Stack>
        <Box>
          <ApiTester />
        </Box>
      </Flex>
    </Layout>
  )
}

export default Users

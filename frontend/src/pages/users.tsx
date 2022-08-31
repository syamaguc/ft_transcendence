import Layout from '@components/layout'
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Stack,
  HStack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'

import { useEffect, useState } from 'react'
import Router from 'next/router'
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import ApiTester from '@components/api-tester'
import PasswordField from '@components/password-field'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

function Signup() {
  const { mutate } = useSWRConfig()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    console.log('Sign up...')
    console.log('username: ', username)
    console.log('email: ', email)
    console.log('password: ', password)

    let res = await fetch(`${API_URL}/api/user/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        passwordConfirm: password,
      }),
    })

    const { accessToken } = await res.json()

    console.log(accessToken)

    res = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(await res.json())

    mutate(`${API_URL}/api/user/currentUser`)
    setUsername('')
    setEmail('')
    setPassword('')
  }

  return (
    <>
      <Container
        maxW='lg'
        py={{ base: '12', md: '24' }}
        px={{ base: '0', sm: '8' }}
      >
        <Stack spacing='8'>
          <Stack spacing='6'>
            <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
              <Heading size={useBreakpointValue({ base: 'xs', md: 'xl' })}>
                Sign up
              </Heading>
            </Stack>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
            boxShadow={{
              base: 'none',
              sm: useColorModeValue('base', 'md-dark'),
            }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <Stack spacing='6'>
              <Stack spacing='5'>
                <FormControl>
                  <FormLabel htmlFor='username'>Username</FormLabel>
                  <Input
                    id='username'
                    type='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='email'>Email</FormLabel>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <PasswordField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Stack>
              <Stack spacing='6'>
                <Button colorScheme='blue' onClick={handleSubmit}>
                  Sign up
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  )
}

function Login() {
  const { mutate } = useSWRConfig()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    console.log('Login...')
    console.log('username: ', username)
    console.log('password: ', password)

    // Signin
    let res = await fetch(`${API_URL}/api/user/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })

    const { accessToken } = await res.json()

    console.log(accessToken)

    res = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Cookie: `jwt=${accessToken}`,
      },
    })

    console.log(await res.json())

    // res = await fetch(`${API_URL}/api/user/userInfo?username=fkymy`, {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Cookie: `jwt=${accessToken}`,
    //   },
    // })
    //
    // console.log(await res.json())

    mutate(`${API_URL}/api/user/currentUser`)
    setUsername('')
    setPassword('')
  }

  return (
    <>
      <Container
        maxW='lg'
        py={{ base: '12', md: '24' }}
        px={{ base: '0', sm: '8' }}
      >
        <Stack spacing='8'>
          <Stack spacing='6'>
            <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
              <Heading size={useBreakpointValue({ base: 'xs', md: 'xl' })}>
                Login
              </Heading>
            </Stack>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
            boxShadow={{
              base: 'none',
              sm: useColorModeValue('base', 'md-dark'),
            }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <Stack spacing='6'>
              <Stack spacing='5'>
                <FormControl>
                  <FormLabel htmlFor='username'>Username</FormLabel>
                  <Input
                    id='username'
                    type='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                <PasswordField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Stack>
              <Stack spacing='6'>
                <Button colorScheme='blue' onClick={handleSubmit}>
                  Login
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  )
}

type ProfileProps = {
  user: User
}

function Profile({ user }: ProfileProps) {
  const { mutate } = useSWRConfig()

  const handleLogout = async () => {
    let res = await fetch(`${API_URL}/api/user/logout`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(res)

    // tell all SWRs with this key to revalidate
    mutate(`${API_URL}/api/user/currentUser`)
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
  const user = useUser()
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const testUpdate = async () => {
    // Signin
    console.log('Testing Update...')

    let res = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Cookie: `jwt=${accessToken}`,
      },
    })

    let data = await res.json()

    console.log(data)
    console.log(data.username)

    res = await fetch(`${API_URL}/api/user/settings`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `${data.username}`,
        email: data.email,
        password: 'Test123!',
      }),
    })

    console.log(res)

    res = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Cookie: `jwt=${accessToken}`,
      },
    })

    console.log(await res.json())

    // res = await fetch(`${API_URL}/api/user/userInfo?username=fkymy`, {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Cookie: `jwt=${accessToken}`,
    //   },
    // })
    //
    // console.log(await res.json())
  }

  return (
    <Layout>
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        my='8'
        px='4'
        gap='4'
        w='full'
      >
        <Stack spacing='6'>
          <Box>
            {user ? (
              <Profile user={user} />
            ) : (
              <>
                <Text>User not found</Text>
              </>
            )}
          </Box>
          <Stack direction={['column', 'row']} spacing='8px'>
            <Signup />
            <Login />
          </Stack>
        </Stack>
        <Box>
          <ApiTester />
        </Box>
      </Flex>
    </Layout>
  )
}

export default Users

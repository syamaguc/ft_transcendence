import Head from 'next/head'
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Stack,
  Text,
  VisuallyHidden,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

import { useUser } from 'src/lib/use-user'
import PasswordField from '@components/password-field'

const API_URL = 'http://localhost:3000'

const providers = [
  { name: '42', icon: null },
  { name: 'admin', icon: null },
]

type Login42Props = {
  onSubmit?: () => void
  onOpen?: () => void
}

function Login42(props: Login42Props) {
  const { onOpen } = props

  const onSubmit = async () => {
    alert('wip')
  }

  return (
    <Container
      maxW='lg'
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing='8'>
        <Stack spacing='6'>
          <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={useBreakpointValue({ base: 'xs', md: 'xl' })}>
              ft_transcendence
            </Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useBreakpointValue({
            base: 'transparent',
            sm: 'white',
          })}
          boxShadow={{
            base: 'none',
            sm: useColorModeValue('base', 'md-dark'),
          }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing='6'>
            <Stack spacing={4} direction='column' align='center'>
              <Button variant='outline' width='full' onClick={onSubmit}>
                <VisuallyHidden>Sign in with 42</VisuallyHidden>
                Sign in with 42
              </Button>
              <Button variant='outline' width='full' onClick={onOpen}>
                <VisuallyHidden>Sign in with admin</VisuallyHidden>
                Sign in as admin
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}

type LoginAdminProps = {
  onSubmit?: () => void
  onClose?: () => void
}

function LoginAdmin(props: LoginAdminProps) {
  const { onClose } = props

  return (
    <>
      <Stack direction={['column', 'row']} spacing='8px'>
        <Signup />
        <Login />
      </Stack>
      <Button onClick={onClose}>Back</Button>
    </>
  )
}

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

function LoginPage() {
  // here we just check if user is already logged in and redirect to home
  useUser({ redirectTo: '/', redirectIfFound: true })

  const admin = useDisclosure()

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box as='main' w='full' h='100vh' bg='gray.50'>
        <Box maxW='8xl' mx='auto' minH='76vh'>
          <Flex
            direction='column'
            alignItems='center'
            justifyContent='center'
            px='4'
            gap='4'
            w='full'
          >
            {admin.isOpen ? (
              <LoginAdmin onClose={admin.onClose} />
            ) : (
              <Login42 onOpen={admin.onOpen} />
            )}
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default LoginPage

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

import { useEffect, useState, ReactNode } from 'react'
import { useSWRConfig } from 'swr'

import { useUser } from 'src/lib/use-user'
import PasswordField from '@components/password-field'
import { SignupForm } from '@components/signup'

const API_URL = 'http://localhost:3000'

type AuthFormProps = {
  children?: ReactNode
  title: string
}

function AuthForm({ children, title = '' }: AuthFormProps) {
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
              {title}
            </Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useBreakpointValue({
            base: 'transparent',
            sm: 'inherit',
          })}
          boxShadow={{
            base: 'none',
            sm: useColorModeValue('base', 'md-dark'),
          }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing='6'>{children}</Stack>
        </Box>
      </Stack>
    </Container>
  )
}

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
    <AuthForm title='ft_transcendence'>
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
    </AuthForm>
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
        <SignupForm />
        <LoginForm />
      </Stack>
      <Button onClick={onClose}>Back</Button>
    </>
  )
}

function LoginForm() {
  const { mutateUser } = useUser()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const checkIsLoggedIn = async () => {
    const res = await fetch(`${API_URL}/api/user/isLogin`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      console.log(data)
      if (data) {
        return true
      }
    }
    return false
  }

  const handleSubmit = async () => {
    console.log('Login...')
    console.log('username: ', username)
    console.log('password: ', password)

    const isLoggedIn = await checkIsLoggedIn()

    if (isLoggedIn) {
      console.log('You are already logged in!')
      return
    }

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

    mutateUser()
    setUsername('')
    setPassword('')
  }

  return (
    <>
      <AuthForm title='Login'>
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
      </AuthForm>
    </>
  )
}

function LoginPage() {
  // here we just check if user is already logged in and redirect to home
  useUser({ redirectTo: '/', redirectIfFound: true })

  const admin = useDisclosure()
  const bgColor = useColorModeValue('gray.50', 'inherit')

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box as='main' w='full' h='100vh' bg={bgColor}>
        <Box maxW='8xl' mx='auto' minH='76vh'>
          <Flex
            direction='column'
            alignItems='center'
            justifyContent='center'
            px='4'
            gap='4'
            w='full'
            h='full'
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

LoginPage.displayName = 'Login'

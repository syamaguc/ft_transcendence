import Head from 'next/head'
import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  Stack,
  VisuallyHidden,
  Spinner,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'

import { useUser } from 'src/lib/use-user'
import { AuthCard } from '@components/auth'
import { SignupForm } from '@components/signup'
import { LoginForm } from '@components/login'
import { API_URL } from 'src/constants'

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
    <AuthCard title='ft_transcendence'>
      <Stack spacing={4} direction='column' align='center'>
        <ChakraLink
          width='full'
          isExternal
          aria-label='Go to 42 OAuth'
          href={`${API_URL}/api/auth/redirect`}
        >
          <Button variant='outline' width='full'>
            <VisuallyHidden>Sign in with 42</VisuallyHidden>
            Sign in with 42
          </Button>
        </ChakraLink>
        <Button variant='outline' width='full' onClick={onOpen}>
          <VisuallyHidden>Sign in with admin</VisuallyHidden>
          Sign in as admin
        </Button>
      </Stack>
    </AuthCard>
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

function LoginPage() {
  const { status } = useUser({ redirectTo: '/', redirectIfFound: true })
  const admin = useDisclosure()
  const bgColor = useColorModeValue('gray.50', 'inherit')

  if (status === 'loading') {
    return (
      <Box w='100%' h='100vh'>
        <Box
          w='full'
          h='full'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Spinner />
        </Box>
      </Box>
    )
  }

  if (status === 'authenticated') {
    return <div>Authenticated</div>
  }

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

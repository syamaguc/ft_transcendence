import Layout from '@components/layout'
import {
  Box,
  Button,
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

enum UserStatus {
  ONLINE = 'Online',
  INGAME = 'In Game',
  OFFLINE = 'Offline',
}

interface User {
  userId: string
  username: string
  email: string
  // password: string;
  profile_picture: string
  elo: number
  game_won: number
  lost_game: number
  numberOfParty: number
  ratio: number
  status: UserStatus
  sign_up_date: Date
  friends: string[]
  login42: string
  twoFactorAuth: boolean
  isBan: boolean
  isAdmin: boolean
  blockedUsers: string[]
}

const API_URL = 'http://localhost:3000'

function Users() {
  const testApi = async () => {
    let res = await fetch(`${API_URL}/api/admin/test`, {
      method: 'GET',
      headers: {},
    })

    console.log(await res.json())

    res = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    console.log(await res.json())

    res = await fetch(`${API_URL}/api/user/isLogin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    console.log(await res.json())
  }

  const testSignup = async () => {
    // Signup
    console.log('Testing signup...')
    let res = await fetch(`${API_URL}/api/user/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test4',
        email: 'test4@example.com',
        password: 'Test123!',
        passwordConfirm: 'Test123!',
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
  }

  const testLogout = async () => {
    let res = await fetch(`${API_URL}/api/user/logout`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(res)
  }

  const testSignin = async () => {
    // Signin
    console.log('Testing signin...')
    let res = await fetch(`${API_URL}/api/user/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test4',
        password: 'Test123!',
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
  }

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
        <Box>
          <Heading>/api/user/signup</Heading>
          <Stack spacing='6'>
            <Button w='100%' onClick={testApi}>
              Test API
            </Button>
            <Button w='100%' onClick={testSignup}>
              Test Signup
            </Button>
            <Button w='100%' onClick={testSignin}>
              Test Signin
            </Button>
            <Button w='100%' onClick={testLogout}>
              Test Logout
            </Button>
            <Button w='100%' onClick={testUpdate}>
              Test Update
            </Button>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
            boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <Stack spacing='6'>
              <Stack spacing='5'>
                <FormControl>
                  <FormLabel htmlFor='email'>Email</FormLabel>
                  <Input id='email' type='email' />
                </FormControl>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Flex>
    </Layout>
  )
}

export default Users

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

import { useUser } from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

function Signup() {
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
        username: 'test',
        email: 'test@example.com',
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

  return (
    <>
      <Button w='100%' onClick={testSignup}>
        Signup
      </Button>
    </>
  )
}

function Users() {
  const user = useUser()
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const testLogout = async () => {
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

    // tell all SWRs with this key to revalidate
    mutate(`${API_URL}/api/user/currentUser`)

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
        <Stack spacing='6'>
          <Box>
            {user ? (
              <>
                <Text>User found</Text>
                <Text>{user.username}</Text>
                <Avatar
                  size='sm'
                  src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                />
              </>
            ) : (
              <>
                <Text>User not found</Text>
              </>
            )}
          </Box>
          <Signup />
          <Button w='100%' onClick={testSignin}>
            Login
          </Button>
          <Button w='100%' onClick={testLogout}>
            Logout
          </Button>
          <Button w='100%' onClick={testUpdate}>
            Update
          </Button>
        </Stack>
        <Box>
          <ApiTester />
        </Box>
      </Flex>
    </Layout>
  )
}

export default Users

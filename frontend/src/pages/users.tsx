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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import ApiTester from '@components/api-tester'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'

import { API_ENDPOINT } from 'src/constants'

type ProfileProps = {
  user: User
}

function Profile({ user }: ProfileProps) {
  const { mutate } = useSWRConfig()

  const handleLogout = async () => {
    let res = await fetch(`${API_ENDPOINT}/api/user/logout`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(res)

    mutate(`${API_ENDPOINT}/api/user/currentUser`)
  }

  return (
    <>
      <Container maxW='lg' px={{ base: '0', sm: '8' }}>
        <Stack spacing='8'>
          <Box boxShadow='base' p='8'>
            <Stack direction={'row'} spacing='8' align='center'>
              <Avatar
                size='2xl'
                src={`${API_ENDPOINT}/api/user/avatar/${user.profile_picture}`}
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
    console.log('Testing Update...')

    let res = await fetch(`${API_ENDPOINT}/api/user/currentUser`, {
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

    res = await fetch(`${API_ENDPOINT}/api/user/settings`, {
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

    res = await fetch(`${API_ENDPOINT}/api/user/currentUser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Cookie: `jwt=${accessToken}`,
      },
    })

    console.log(await res.json())

    res = await fetch(`${API_ENDPOINT}/api/user/userInfo?username=test`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Cookie: `jwt=${accessToken}`,
      },
    })

    console.log(await res.json())
  }

  const testAPI = async () => {
    console.log('testing api...')

    let res = await fetch(`/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(res)
    console.log(await res.json())

    res = await fetch('/api/users/current', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })

    console.log(await res.json())
  }

  return (
    <Layout>
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        // my='8'
        px='4'
        gap='4'
        w='full'
      >
        <Stack spacing='6'>
          <Button onClick={testAPI}>test API</Button>
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

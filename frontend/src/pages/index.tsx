import {
  Box,
  Button,
  CloseButton,
  Heading,
  Flex,
  Stack,
  Text,
  Link as ChakraLink,
  useDisclosure,
} from '@chakra-ui/react'

import { useState } from 'react'
import { useUser } from 'src/lib/use-user'

import NextLink from 'next/link'

import Layout from '@components/layout'
import { API_URL } from 'src/constants'

function Prompt() {
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = async () => {
    // set cookie to visited
    setIsOpen(false)
  }

  return (
    <>
      {isOpen ? (
        <Stack w='full' direction='row' align='center' justify='center'>
          <Box borderRadius='lg' boxShadow='md'>
            <Stack direction='row' p='4' align='center' spacing='4'>
              <Text fontWeight='semibold'>
                Welcome! Setup your profile here 👉
              </Text>
              <NextLink href='/profile'>
                <Button size='sm' variant='outline'>
                  Go to profile
                </Button>
              </NextLink>
              <CloseButton onClick={handleClose} />
            </Stack>
          </Box>
        </Stack>
      ) : (
        <></>
      )}
    </>
  )
}

function Index() {
  const { mutateUser, isFirstTime } = useUser()

  const setFalse = async () => {
    const res = await fetch(`/api/session/is-first-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isFirstTime: false }),
    })

    console.log('res: ', res)
    await mutateUser()
  }

  const setTrue = async () => {
    const res = await fetch(`/api/session/is-first-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isFirstTime: true }),
    })

    console.log('res: ', res)
    await mutateUser()
  }

  const getCookie = async () => {
    const res = await fetch(`/api/session/is-first-time`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('res: ', res)
    if (res.ok) {
      const data = await res.json()
      console.log('data: ', data)
    }
  }

  return (
    <Layout>
      <Button onClick={setFalse}>Set false</Button>
      <Button onClick={setTrue}>Set True</Button>
      <Button onClick={getCookie}>Get</Button>
      {isFirstTime && <Prompt />}
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        minHeight='70vh'
        gap={4}
        mb={8}
        w='full'
      >
        <Flex w='full' alignItems='center' justifyContent='space-around'>
          <NextLink href='/users'>
            <Box
              as='button'
              borderRadius='4px'
              p={16}
              shadow='sm'
              borderWidth='1px'
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize='xl'>Users</Heading>
            </Box>
          </NextLink>
          <NextLink href='/chat'>
            <Box
              as='button'
              borderRadius='4px'
              p={16}
              shadow='sm'
              borderWidth='1px'
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize='xl'>Chat</Heading>
            </Box>
          </NextLink>
          <NextLink href='/game'>
            <Box
              as='button'
              borderRadius='4px'
              p={16}
              shadow='sm'
              borderWidth='1px'
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize='xl'>Game</Heading>
            </Box>
          </NextLink>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Index

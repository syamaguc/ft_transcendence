import {
  Box,
  Button,
  CloseButton,
  Heading,
  Flex,
  Stack,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react'

import { useState } from 'react'
import { useUser } from 'src/lib/use-user'

import NextLink from 'next/link'
import { useRouter } from 'next/router'

import Layout from '@components/layout'

import { setIsFirstTime } from 'src/lib/session'

function Prompt() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const handleClose = async () => {
    setIsOpen(false)
    await setIsFirstTime(false)
  }

  const handleClick = async () => {
    router.push('/profile')
    await setIsFirstTime(false)
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
              <Button size='sm' variant='outline' onClick={handleClick}>
                Go to profile
              </Button>
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
  const { isFirstTime } = useUser()

  return (
    <Layout>
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

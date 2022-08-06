import {
  Box,
  Heading,
  Flex,
  Spacer,
  Link as ChakraLink,
} from '@chakra-ui/react'

import NextLink from 'next/link'

import Layout from '@components/layout'
import Deadline from '@components/deadline'

function Index() {
  return (
    <Layout>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        gap={4}
        mb={8}
        w="full"
      >
        <Box my={8}>
          <Deadline />
        </Box>
        <Flex
          w="full"
          direction="row"
          alignItems="center"
          justifyContent="space-around"
        >
          <NextLink href="/profile">
            <Box
              as="button"
              borderRadius="4px"
              p={16}
              shadow="sm"
              borderWidth="1px"
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize="xl">User</Heading>
            </Box>
          </NextLink>
          <NextLink href="/chat">
            <Box
              as="button"
              borderRadius="4px"
              p={16}
              shadow="sm"
              borderWidth="1px"
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize="xl">Chat</Heading>
            </Box>
          </NextLink>
          <NextLink href="/game">
            <Box
              as="button"
              borderRadius="4px"
              p={16}
              shadow="sm"
              borderWidth="1px"
              _hover={{ borderColor: '#00BABC' }}
            >
              <Heading fontSize="xl">Game</Heading>
            </Box>
          </NextLink>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Index

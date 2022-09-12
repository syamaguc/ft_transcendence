import { Box, Heading, Flex, Link as ChakraLink } from '@chakra-ui/react'

import NextLink from 'next/link'

import Layout from '@components/layout'

function Index() {
  return (
    <Layout>
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

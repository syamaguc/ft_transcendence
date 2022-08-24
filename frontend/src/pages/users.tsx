import Layout from '@components/layout'
import {
  Box,
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

function Users() {
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

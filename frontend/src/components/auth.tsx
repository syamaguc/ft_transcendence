import { ReactNode } from 'react'
import {
  Box,
  Container,
  Heading,
  Stack,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'

type AuthCardProps = {
  children?: ReactNode
  title: string
}

export function AuthCard({ children, title = '' }: AuthCardProps) {
  return (
    <Container
      maxW='lg'
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing='8'>
        <Stack spacing='6'>
          <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={useBreakpointValue({ base: 'md', md: 'xl' })}>
              {title}
            </Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useBreakpointValue({
            base: 'transparent',
            sm: useColorModeValue('whiteAlpha.900', 'inherit'),
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

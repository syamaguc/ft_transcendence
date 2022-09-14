import Layout from '@components/layout'
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Stack,
  Skeleton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

async function fetchUserInfo(url: string): Promise<{ user: User }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return { user: data || null }
  }

  // TODO: throw
  return { user: null }
}

function UserDetail() {
  const router = useRouter()
  const { username } = router.query

  const { user: currentUser } = useUser()
  const { data, error } = useSWR(
    `${API_URL}/api/user/userInfo?username=${username}`,
    fetchUserInfo
  )

  const isLoading = !data && !error
  const user = data?.user

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            {error && (
              <Stack spacing='8'>
                <Text>Error occurred</Text>
              </Stack>
            )}
            {isLoading && (
              <Stack spacing='8'>
                <Skeleton height='60px' isLoaded={!isLoading} />
                <Skeleton height='60px' isLoaded={!isLoading} />
                <Skeleton height='60px' isLoaded={!isLoading} />
              </Stack>
            )}
            {!user && (
              <Stack spacing='8'>
                <Text>User not found</Text>
              </Stack>
            )}
            {user && (
              <Stack>
                <Heading fontSize='2xl'>Basic information</Heading>
                <Stack
                  borderRadius='xl'
                  direction='row'
                  spacing='8'
                  align='start'
                  py='4'
                  px='8'
                  mx='8'
                >
                  <Avatar
                    size='xl'
                    src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                  >
                    <AvatarBadge boxSize='0.9em' bg='green.500' />
                  </Avatar>
                  <Stack direction='column' spacing='2'>
                    <Text fontWeight='600' fontSize='2xl' mt='2'>
                      {user.username}
                    </Text>
                    <Text fontWeight='600' fontSize='2xl' mt='2'>
                      {user.status}
                    </Text>
                  </Stack>
                </Stack>
                <Divider orientation='horizontal' />
                <form>
                  <Stack spacing='6'>
                    <FormControl>
                      <FormLabel fontSize='xs' color='gray.400'>
                        USERNAME
                      </FormLabel>
                      <Stack direction='row' spacing='4' align='center'>
                        <Input
                          name='readonly-username'
                          type='text'
                          isReadOnly={true}
                          value={user.username}
                        />
                      </Stack>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize='xs' color='gray.400'>
                        EMAIL
                      </FormLabel>
                      <Stack direction='row' spacing='4' align='center'>
                        <Input
                          name='readonly-email'
                          type='email'
                          isReadOnly={true}
                          value={user.email}
                        />
                      </Stack>
                    </FormControl>
                  </Stack>
                </form>
              </Stack>
            )}
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
  return <p>{username}</p>
}

export default UserDetail

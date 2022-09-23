import Layout from '@components/layout'
import { Box, Container, Text, Stack } from '@chakra-ui/react'
import useSWR from 'swr'
import { fetchUserInfo } from 'src/lib/fetchers'
import { useRouter } from 'next/router'
import { useUser } from 'src/lib/use-user'

import { API_URL } from 'src/constants'

import UserBasicInfo from '@components/user-basic-info'
import UserStatusInfo from '@components/user-status-info'
import UserStatistics from '@components/user-statistics'
import MatchHistory from '@components/match-history'

function UserDetail() {
  const router = useRouter()
  const { username } = router.query

  const { data, error } = useSWR(
    `${API_URL}/api/user/userInfo?username=${username}`,
    fetchUserInfo
  )

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
            {!user && (
              <Stack spacing='8'>
                <Text>User not found</Text>
              </Stack>
            )}
            {user && (
              <Stack spacing='8'>
                <UserBasicInfo user={user} router={router} />
                <UserStatusInfo user={user} />
                <UserStatistics user={user} />
                <MatchHistory user={user} />
              </Stack>
            )}
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserDetail

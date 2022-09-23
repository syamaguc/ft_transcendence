import Layout from '@components/layout'
import { Box, Button, Container, Text, Stack, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import useSWR from 'swr'
import { fetchUserInfo } from 'src/lib/fetchers'
import { useRouter } from 'next/router'

import { User, PartialUserInfo } from 'src/types/user'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'

import UserBasicInfo from '@components/user-basic-info'
import UserStatusInfo from '@components/user-status-info'
import UserStatistics from '@components/user-statistics'
import MatchHistory from '@components/match-history'
import UserActions from '@components/user-actions'
import GameInvite from '@components/game-invite'

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
                <UserBasicInfo user={user} />
                <UserStatusInfo user={user} />
                <UserStatistics user={user} />
                <MatchHistory user={user} />
                <Stack direction='row'>
                  <UserActions user={user} />
                  <GameInvite user={user} router={router} />
                </Stack>
              </Stack>
            )}
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserDetail

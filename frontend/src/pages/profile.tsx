import { Box, Container, Heading, Stack } from '@chakra-ui/react'

import UserStatusInfo from '@components/user-status-info'
import UserBasicInfo from '@components/user-basic-info'
import TwoFactorAuth from '@components/two-factor-auth'
import UserStatistics from '@components/user-statistics'
import MatchHistory from '@components/match-history'

import Layout from '@components/scrollable-layout'
import { useUser } from 'src/lib/use-user'

function Profile() {
  const { user } = useUser()

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            <Heading as='h1' fontSize='5xl'>
              Profile
            </Heading>
            <Stack spacing='8'>
              <UserBasicInfo user={user} />
              <UserStatusInfo user={user} />
              <TwoFactorAuth />
              <UserStatistics user={user} />
              <MatchHistory user={user} />
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

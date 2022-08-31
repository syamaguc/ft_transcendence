import Layout from '@components/layout'
import { Box, Heading, Text } from '@chakra-ui/react'

import { useUser } from 'src/lib/use-user'

function Profile() {
  const user = useUser()

  return (
    <Layout>
      <Heading>Profile</Heading>
      {user && (
        <>
          <Text>Current user: {user.username}</Text>
        </>
      )}
      {!user && (
        <>
          <Text>No Current User</Text>
        </>
      )}
    </Layout>
  )
}

export default Profile

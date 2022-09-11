import Layout from '@components/layout'
import { Avatar, Heading, Text } from '@chakra-ui/react'

import { useUser } from 'src/lib/use-user'

function Profile() {
  const { user } = useUser()

  return (
    <Layout>
      <Heading>Profile</Heading>
      {user && (
        <>
          <Avatar
            src={`http://localhost:3000/api/user/avatar/${user.profile_picture}`}
          />
          <Text>{user.username}</Text>
          <Text>{user.email}</Text>
          <Text>{user.userId}</Text>
          <Text>{user.profile_picture}</Text>
          <Text>{user.status}</Text>
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

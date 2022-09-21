import { Stack, Heading, Text } from '@chakra-ui/react'
import { User } from 'src/types/user'

type UserStatusProps = {
  user: User
}

export default function UserStatusInfo({ user }: UserStatusProps) {
  return (
    <Stack>
      <Heading fontSize='2xl'>Status</Heading>
      <Text>{user.status}</Text>
    </Stack>
  )
}

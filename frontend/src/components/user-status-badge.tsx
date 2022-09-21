import { AvatarBadgeProps, AvatarBadge } from '@chakra-ui/react'
import { UserStatus } from 'src/types/user'

export default function UserStatusBadge(
  props: { status: UserStatus } & AvatarBadgeProps
) {
  const bgColor =
    props.status === 'Online'
      ? 'green.500'
      : props.status === 'In Game'
      ? 'red.500'
      : 'gray.400'

  return <AvatarBadge {...props} bg={bgColor} />
}

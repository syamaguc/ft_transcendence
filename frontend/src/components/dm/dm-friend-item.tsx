import {
  Avatar,
  Box,
  Circle,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Stack,
  Spacer,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Socket } from 'socket.io-client'

import { FiMoreVertical } from 'react-icons/fi'
import { BiMessage } from 'react-icons/bi'

import UserStatusBadge from '@components/user-status-badge'
import {
  RemoveFriendMenuItem,
  BlockMenuItem,
} from '@components/more-menu-items'
import { PartialUserInfo } from 'src/types/user'
import { API_URL } from 'src/constants'

type FriendItemProps = {
  friend: PartialUserInfo
  socket: Socket
}

function DMFriendItem({ friend, socket }: FriendItemProps) {
  const router = useRouter()

  const onClickDM = (userId: string) => {
    socket.emit('getRoomIdByUserIds', userId)
    console.log('getRoomIdByUserIds')
  }

  return (
    <Stack
      direction='row'
      align='center'
      py='4'
      px='4'
      borderRadius='md'
      transition='color 0.2s'
      _hover={{ bg: 'gray.50', cursor: 'pointer' }}
      onClick={() => onClickDM(friend.userId)}
    >
      <Avatar
        key={friend.userId}
        size='sm'
        src={`${API_URL}/api/user/avatar/${friend.profile_picture}`}
        mr='12px'
      >
        <UserStatusBadge boxSize='1.25em' status={friend.status} />
      </Avatar>
      <Flex direction='row' align='center' w='full'>
        <Stack direction='column' spacing='0'>
          <Text fontWeight='800' fontSize='md'>
            {friend.username}
          </Text>
          <Text fontWeight='600' color='gray.400' fontSize='sm'>
            {friend.status}
          </Text>
        </Stack>
        <Spacer />
        <Tooltip
          label='Message'
          placement='top'
          hasArrow
          arrowSize={6}
          borderRadius='base'
        >
          <Circle
            _hover={{ bg: 'gray.200', color: 'gray.600' }}
            bg='gray.100'
            size='38px'
            mr='16px'
            onClick={(e) => {
              e.stopPropagation()
              onClickDM(friend.userId)
            }}
          >
            <Icon as={BiMessage} display='block' transition='color 0.2s' />
          </Circle>
        </Tooltip>
        <Tooltip
          label='More'
          placement='top'
          hasArrow
          arrowSize={6}
          borderRadius='base'
        >
          <Box bg='none'>
            <Menu>
              <MenuButton
                as={Circle}
                rounded='full'
                variant='link'
                cursor='pointer'
                _hover={{ bg: 'gray.200', color: 'gray.600' }}
                bg='gray.100'
                size='38px'
                onClick={(e) => e.stopPropagation()}
                align='center'
              >
                <Icon
                  as={FiMoreVertical}
                  display='block'
                  transition='color 0.2s'
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  fontSize='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/users/${friend.username}`)
                  }}
                >
                  View profile
                </MenuItem>
                <RemoveFriendMenuItem friend={friend} />
                <BlockMenuItem friend={friend} />
              </MenuList>
            </Menu>
          </Box>
        </Tooltip>
      </Flex>
    </Stack>
  )
}

export default DMFriendItem

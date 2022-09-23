import {
  Text,
  Flex,
  Stack,
  Box,
  BoxProps,
  Button,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useDisclosure,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Avatar } from '@chakra-ui/avatar'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'
import { MessageObject } from 'src/types/chat'

import useSWR from 'swr'
import { fetchUserInfo } from 'src/lib/fetchers'
import UserStatusBadge from '@components/user-status-badge'
import UserStatistics from '@components/user-statistics'
import MatchHistory from '@components/match-history'
import UserActions from '@components/user-actions'
import GameInvite from '@components/game-invite'

import { API_URL } from 'src/constants'

type MessageIconProps = {
  message: MessageObject
}
const MessageIcon = ({ message }: MessageIconProps) => {
  const popover = useDisclosure()
  const modal = useDisclosure()
  const [overlay, setOverlay] = useState(false)
  const router = useRouter()
  const { user: currentUser } = useUser()

  const { data, error } = useSWR(
    `${API_URL}/api/user/userInfo?username=${message.username}`,
    fetchUserInfo
  )

  const user = data?.user

  const goToProfile = () => {
    if (user.username === currentUser.username) {
      router.push('/profile')
    } else {
      router.push(`/users/${user.username}`)
    }
  }

  return (
    <>
      <Popover placement='right-start'>
        <PopoverTrigger>
          <Avatar
            size='sm'
            src={`${API_URL}/api/user/avatar/${message.profile_picture}`}
            m={2}
            _hover={{ cursor: 'pointer' }}
            // onClick={() => onClickProfile(message)}
          />
        </PopoverTrigger>
        <PopoverContent>
          {user && (
            <PopoverBody>
              <Stack direction='row' align='start' py='2' px='2'>
                <Tooltip
                  label='View profile'
                  placement='bottom'
                  hasArrow
                  arrowSize={6}
                  borderRadius='base'
                >
                  <Avatar
                    size='lg'
                    src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                    mr='12px'
                    _hover={{ cursor: 'pointer', opacity: '0.8' }}
                    onClick={modal.onOpen}
                  >
                    <UserStatusBadge boxSize='1em' status={user.status} />
                  </Avatar>
                </Tooltip>
                <Flex direction='row' align='center' w='full'>
                  <Stack spacing='2'>
                    <Stack direction='column' spacing='0'>
                      <Text fontWeight='800' fontSize='md'>
                        {user.username}
                      </Text>
                      <Text fontWeight='600' color='gray.400' fontSize='sm'>
                        {user.status}
                      </Text>
                    </Stack>
                    <Stack>
                      <Button size='sm' onClick={goToProfile}>
                        Go to profile
                      </Button>
                    </Stack>
                  </Stack>
                </Flex>
              </Stack>
            </PopoverBody>
          )}
        </PopoverContent>
      </Popover>
      <Modal size='xl' onClose={modal.onClose} isOpen={modal.isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            {user && (
              <Stack>
                <Stack
                  borderRadius='xl'
                  direction='row'
                  spacing='8'
                  align='start'
                  py='4'
                  px='0'
                  mx='8'
                >
                  <Avatar
                    size='xl'
                    src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                  >
                    <UserStatusBadge boxSize='0.9em' status={user.status} />
                  </Avatar>
                  <Stack direction='column' spacing='2'>
                    <Text fontWeight='600' fontSize='2xl' mt='2'>
                      {user.username}
                    </Text>
                    {message.username !== currentUser.username && (
                      <Stack direction='row'>
                        <UserActions user={user} />
                        <GameInvite user={user} router={router} />
                      </Stack>
                    )}
                  </Stack>
                </Stack>
                <UserStatistics user={user} />
                <ScrollView maxH='40vh'>
                  <MatchHistory user={user} />
                </ScrollView>
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const ScrollView = (props: BoxProps) => {
  const ref = useRef<any>()

  return (
    <Box
      ref={ref}
      flex='1'
      id='routes'
      overflow='auto'
      // px='6'
      // pb='6'
      {...props}
    />
  )
}

export default MessageIcon

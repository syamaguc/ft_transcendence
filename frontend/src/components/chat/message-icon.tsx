import {
  Text,
  Flex,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  useDisclosure,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Avatar } from '@chakra-ui/avatar'
import { useUser } from 'src/lib/use-user'
import { User } from 'src/types/user'
import { MessageObject } from 'src/types/chat'

import { profile } from 'console'
import { Socket } from 'net'

import useSWR from 'swr'
import { fetchUserInfo } from 'src/lib/fetchers'
import UserStatusBadge from '@components/user-status-badge'

import { API_URL } from 'src/constants'

type MessageIconProps = {
  message: MessageObject
}
const MessageIcon = ({ message }: MessageIconProps) => {
  const [user, setUser] = useState<User>()
  const [overlay, setOverlay] = useState(false)
  const router = useRouter()

  const onClickProfile = (message: MessageObject) => {
    fetch(`${API_URL}/api/user/userInfo?username=${message.username}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        console.log(data)
        setUser(data)
      })
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
            onClick={() => onClickProfile(message)}
          />
        </PopoverTrigger>
        <PopoverContent>
          {user && (
            <PopoverBody>
              <Stack
                direction='row'
                align='start'
                // py='2'
                // px='2'
              >
                <Avatar
                  size='lg'
                  src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                  mr='12px'
                >
                  <UserStatusBadge boxSize='1em' status={user.status} />
                </Avatar>
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
                    <Stack direction='column'>
                      <Button
                        size='sm'
                        onClick={() => router.push(`/users/${user.username}`)}
                      >
                        View profile
                      </Button>
                    </Stack>
                  </Stack>
                </Flex>
              </Stack>
            </PopoverBody>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

export default MessageIcon

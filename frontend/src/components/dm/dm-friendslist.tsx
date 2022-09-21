import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Circle,
  Container,
  Divider,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  Stack,
  Spacer,
  Text,
  Tab,
  TabProps,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tooltip,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'

import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

import { useFormik, FormikErrors } from 'formik'
import { FiMessageSquare, FiMoreVertical } from 'react-icons/fi'
import { BiMessage, BiUserX } from 'react-icons/bi'

import UserStatusBadge from '@components/user-status-badge'
import { PartialUserInfo, User } from 'src/types/user'
import { fetchUsers } from 'src/lib/fetchers'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'
import { API_URL } from 'src/constants'

import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const PREFIX_URL = '/dm'

function DMFriendsList({ socket }: Props) {
  const { user: currentUser } = useUser()
  const { data: users, error } = useSWR(
    `${API_URL}/api/user/search`,
    fetchUsers
  )
  const router = useRouter()

  const isLoading = !users && !error
  console.log(users)
  console.log('isLoading: ', isLoading)

  const onClickDM = (userId: string) => {
    socket.emit('getRoomIdByUserIds', userId)
    console.log('getRoomIdByUserIds')
  }

  useEffect(() => {
    socket.on('getRoomIdByUserIds', (id: string) => {
      console.log('getRoomIdByUserIds get = ', id)
      router.push(PREFIX_URL + '/' + id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { friends, countAll, countOnline } = useFriends()
  const { blocked } = useBlocked()

  const PrimaryTab = (props: TabProps) => {
    const textColor = useColorModeValue('whiteAlpha.900', 'inherit')
    const bgColor = useColorModeValue('blackAlpha.900', 'whiteAlpha.400')
    const selectedColor = useColorModeValue('blackAlpha.900', 'whiteAlpha.900')

    return (
      <Tab
        {...props}
        color={textColor}
        bg={bgColor}
        borderRadius='md'
        px='2'
        py='1'
        _selected={{ color: selectedColor, bg: 'inherit' }}
      />
    )
  }

  const SecondaryTab = (props: TabProps) => {
    const selectedBgColor = useColorModeValue('gray.200', 'gray.500')
    const hoverBgColor = useColorModeValue('gray.50', 'inherit')

    return (
      <Tab
        {...props}
        borderRadius='md'
        px='2'
        py='1'
        _hover={{ bg: hoverBgColor }}
        _selected={{ bg: selectedBgColor }}
      />
    )
  }

  return (
    <Container maxW='2xl' py='12'>
      <Tabs variant='soft-rounded' colorScheme='gray'>
        <Stack>
          <Flex align='center'>
            <Stack direction='row' align='center' spacing='4'>
              <Heading as='h1' fontSize='xl'>
                Friends
              </Heading>
              <Box h='24px'>
                <Divider orientation='vertical' />
              </Box>
              <TabList>
                <SecondaryTab mr='2'>Online</SecondaryTab>
                <SecondaryTab mr='2'>All</SecondaryTab>
                <SecondaryTab mr='2'>Blocked</SecondaryTab>
              </TabList>
            </Stack>
            <Spacer />
            <PrimaryTab>Add Friend</PrimaryTab>
          </Flex>
          <TabPanels>
            <TabPanel>
              {friends && countOnline > 0 && (
                <Stack spacing='0'>
                  <Text
                    mb='3'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.400'
                  >
                    ONLINE - {countOnline}
                  </Text>
                  <Divider />
                  <Stack>
                    {friends.filter(isOnline).map((friend: PartialUserInfo) => (
                      <FriendItem key={friend.username} friend={friend} />
                    ))}
                  </Stack>
                </Stack>
              )}
            </TabPanel>
            <TabPanel>
              {friends && countAll > 0 && (
                <Stack spacing='0'>
                  <Text
                    mb='3'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.400'
                  >
                    ALL FRIENDS - {countAll}
                  </Text>
                  <Divider />
                  <Stack>
                    {friends
                      .filter(isNotBlocked)
                      .map((friend: PartialUserInfo) => (
                        <FriendItem key={friend.username} friend={friend} />
                      ))}
                  </Stack>
                </Stack>
              )}
            </TabPanel>
            <TabPanel>
              {blocked && blocked.length > 0 && (
                <Stack spacing='0'>
                  <Text
                    mb='3'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.400'
                  >
                    BLOCKED - {blocked.length}
                  </Text>
                  <Divider />
                  <Stack>
                    {blocked.map((blockedUser: PartialUserInfo) => (
                      <BlockedUserItem
                        key={blockedUser.username}
                        user={blockedUser}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </TabPanel>
            <TabPanel>
              <AddFriend user={currentUser} />
            </TabPanel>
          </TabPanels>
        </Stack>
      </Tabs>
    </Container>
  )

  return (
    <>
      <Flex
        h='55px'
        borderBottom='1px solid'
        borderColor='gray.100'
        p={4}
        align='center'
      >
        <Text>Friends</Text>
      </Flex>
      <Flex w='100%'>
        <Box w='100%' p='2'>
          <Stack w='100%'>
            {users &&
              users
                .filter((user) => user.userId !== currentUser.userId)
                .map((user: User) => (
                  <Stack
                    key={user.userId}
                    w='100%'
                    direction='row'
                    align='center'
                    py='2'
                    px='8'
                    borderRadius='md'
                    transition='color 0.2s'
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  >
                    <Avatar
                      key={user.userId}
                      size='sm'
                      src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
                      mr='12px'
                    >
                      <AvatarBadge boxSize='1.25em' bg='green.500' />
                    </Avatar>
                    <Flex direction='row' align='center' w='full'>
                      <Stack direction='column' spacing='0'>
                        <Text fontWeight='800' fontSize='md'>
                          {user.username}
                        </Text>
                        <Text fontWeight='600' color='gray.400' fontSize='sm'>
                          {user.status}
                        </Text>
                      </Stack>
                      <Spacer />
                      <Circle bg='gray.100' size='38px' mr='16px'>
                        <FiMessageSquare
                          onClick={() => onClickDM(user.userId)}
                        />
                      </Circle>
                      <Circle bg='gray.100' size='38px' mr='16px'>
                        <FiMoreVertical />
                      </Circle>
                    </Flex>
                  </Stack>
                ))}
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default DMFriendsList

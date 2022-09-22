import {
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Stack,
  Spacer,
  Text,
  Tab,
  TabProps,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import AddFriend from '@components/add-friend'
import DMBlockedUserItem from '@components/dm/dm-blocked-user-item'
import DMFriendItem from '@components/dm/dm-friend-item'

import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'

import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const PREFIX_URL = '/dm'

function DMFriendsList({ socket }: Props) {
  const { user: currentUser } = useUser()
  const { friends, countAll, countOnline } = useFriends()
  const { blocked } = useBlocked()
  const router = useRouter()

  const isNotBlocked = (element: PartialUserInfo) => {
    return currentUser.blockedUsers.indexOf(element.userId) === -1
  }

  const isOnline = (element: PartialUserInfo) => {
    return element.status === 'Online' && isNotBlocked(element)
  }

  useEffect(() => {
    socket.on('getRoomIdByUserIds', (id: string) => {
      console.log('getRoomIdByUserIds get = ', id)
      router.push(PREFIX_URL + '/' + id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                      <DMFriendItem
                        key={friend.username}
                        friend={friend}
                        socket={socket}
                      />
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
                        <DMFriendItem
                          key={friend.username}
                          friend={friend}
                          socket={socket}
                        />
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
                      <DMBlockedUserItem
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

export default DMFriendsList

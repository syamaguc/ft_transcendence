import Layout from '@components/layout'
import {
  Avatar,
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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { FiMoreVertical } from 'react-icons/fi'
import { BiMessage, BiUserX } from 'react-icons/bi'

import AddFriend from '@components/add-friend'
import UserStatusBadge from '@components/user-status-badge'
import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { useFriends } from 'src/lib/use-friends'
import { useBlocked } from 'src/lib/use-blocked'
import { API_URL } from 'src/constants'

type RemoveFriendMenuItemProps = {
  friend: PartialUserInfo
}

function RemoveFriendMenuItem({ friend }: RemoveFriendMenuItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()
  const { mutateFriends } = useFriends()

  const removeFriend = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/deleteFriend`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: friend.userId }),
      })
      if (!res.ok) {
        message = 'Could not remove friend'
      } else if (res.ok) {
        message = 'Removed from friends'
        status = 'info'
        await mutateFriends()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <MenuItem
      fontSize='sm'
      onClick={async (e) => {
        e.stopPropagation()
        await removeFriend()
      }}
      disabled={isLoading}
    >
      Remove friend
    </MenuItem>
  )
}

type BlockMenuItemProps = {
  friend: PartialUserInfo
}

function BlockMenuItem({ friend }: BlockMenuItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const { mutateFriends } = useFriends()
  const { mutateBlocked } = useBlocked()
  const toast = useToast()

  const blockUser = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/blockFriend`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: friend.userId }),
      })
      if (!res.ok) {
        message = 'Could not block user'
      } else if (res.ok) {
        message = 'Blocked user'
        status = 'info'
        await mutateFriends()
        await mutateBlocked()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <MenuItem
      fontSize='sm'
      onClick={async (e) => {
        e.stopPropagation()
        await blockUser()
      }}
      disabled={isLoading}
    >
      Block
    </MenuItem>
  )
}

type FriendItemProps = {
  friend: PartialUserInfo
}

function FriendItem({ friend }: FriendItemProps) {
  return (
    <NextLink href={`/users/${friend.username}`}>
      <Stack
        direction='row'
        align='center'
        py='4'
        px='4'
        borderRadius='md'
        transition='color 0.2s'
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
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
          {/* <Tooltip
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
              onClick={(e) => e.stopPropagation()}
            >
              <Icon as={BiMessage} display='block' transition='color 0.2s' />
            </Circle>
          </Tooltip> */}
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
                  <RemoveFriendMenuItem friend={friend} />
                  <BlockMenuItem friend={friend} />
                </MenuList>
              </Menu>
            </Box>
          </Tooltip>
        </Flex>
      </Stack>
    </NextLink>
  )
}

type BlockedUserItemProp = {
  user: PartialUserInfo
}

function BlockedUserItem({ user }: BlockedUserItemProp) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const { mutateBlocked } = useBlocked()
  const toast = useToast()

  const unblockUser = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/unblockFriend`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }),
      })
      if (!res.ok) {
        message = 'Could not unblock user'
      } else if (res.ok) {
        message = 'Unblocked user'
        status = 'info'
        await mutateBlocked()
        await mutateUser()
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      variant: 'subtle',
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <NextLink href={`/users/${user.username}`}>
      <Stack
        direction='row'
        align='center'
        py='4'
        px='4'
        borderRadius='md'
        transition='color 0.2s'
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
      >
        <Avatar
          size='sm'
          src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
          mr='12px'
        >
          <UserStatusBadge boxSize='1.25em' status={user.status} />
        </Avatar>
        <Flex direction='row' align='center' w='full'>
          <Stack direction='column' spacing='0'>
            <Text fontWeight='800' fontSize='md'>
              {user.username}
            </Text>
            <Text fontWeight='600' color='gray.400' fontSize='sm'>
              Blocked
            </Text>
          </Stack>
          <Spacer />
          <Tooltip
            label='Unblock'
            placement='top'
            hasArrow
            arrowSize={6}
            borderRadius='base'
          >
            <Circle
              _hover={{ bg: 'gray.200', color: 'red.500' }}
              bg='gray.100'
              size='38px'
              mr='16px'
              onClick={async (e) => {
                e.stopPropagation()
                if (isLoading) return
                await unblockUser()
              }}
            >
              <Icon
                as={BiUserX}
                display='block'
                transition='color 0.2s'
                w={6}
                h={6}
              />
            </Circle>
          </Tooltip>
        </Flex>
      </Stack>
    </NextLink>
  )
}

function UserList() {
  const { user: currentUser } = useUser()

  const { friends, countAll, countOnline } = useFriends()
  const { blocked } = useBlocked()

  const isNotBlocked = (element: PartialUserInfo) => {
    return currentUser.blockedUsers.indexOf(element.userId) === -1
  }

  const isOnline = (element: PartialUserInfo) => {
    return element.status === 'Online' && isNotBlocked(element)
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

  return (
    <Layout>
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
                      {friends
                        .filter(isOnline)
                        .map((friend: PartialUserInfo) => (
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
    </Layout>
  )
}

export default UserList

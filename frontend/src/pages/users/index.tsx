import Layout from '@components/layout'
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
  Skeleton,
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
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import UserStatusBadge from '@components/user-status-badge'
import { useState, useRef, forwardRef } from 'react'

import { useFormik, FormikErrors } from 'formik'
import useSWR, { KeyedMutator } from 'swr'
import { fetchUsers, fetchPartialUserInfos } from 'src/lib/fetchers'

import { FiMoreVertical } from 'react-icons/fi'
import { BiMessage, BiUserX } from 'react-icons/bi'

import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

type FriendItemProps = {
  friend: PartialUserInfo
  mutateFriends: KeyedMutator<PartialUserInfo[]>
  mutateBlocked: KeyedMutator<PartialUserInfo[]>
}

function FriendItem({ friend, mutateFriends, mutateBlocked }: FriendItemProps) {
  const [removeFriendIsLoading, setRemoveFriendIsLoading] = useState(false)
  const [blockIsLoading, setBlockIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const toast = useToast()

  const removeFriend = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setRemoveFriendIsLoading(true)

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
    setRemoveFriendIsLoading(false)
  }

  const blockUser = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setBlockIsLoading(true)

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
    setBlockIsLoading(false)
  }

  return (
    <NextLink key={friend.userId} href={`/users/${friend.username}`}>
      <Stack
        key={friend.userId}
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
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
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
                    onClick={async (e) => {
                      e.stopPropagation()
                      await removeFriend()
                    }}
                    disabled={removeFriendIsLoading}
                  >
                    Remove friend
                  </MenuItem>
                  <MenuItem
                    fontSize='sm'
                    onClick={async (e) => {
                      e.stopPropagation()
                      await blockUser()
                    }}
                    disabled={blockIsLoading}
                  >
                    Block
                  </MenuItem>
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
  blockedUser: PartialUserInfo
  mutateBlocked: KeyedMutator<PartialUserInfo[]>
}

function BlockedUserItem({ blockedUser, mutateBlocked }: BlockedUserItemProp) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
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
        body: JSON.stringify({ userId: blockedUser.userId }),
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
    <NextLink key={blockedUser.userId} href={`/users/${blockedUser.username}`}>
      <Stack
        key={blockedUser.userId}
        direction='row'
        align='center'
        py='4'
        px='4'
        borderRadius='md'
        transition='color 0.2s'
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
      >
        <Avatar
          key={blockedUser.userId}
          size='sm'
          src={`${API_URL}/api/user/avatar/${blockedUser.profile_picture}`}
          mr='12px'
        >
          <UserStatusBadge boxSize='1.25em' status={blockedUser.status} />
        </Avatar>
        <Flex direction='row' align='center' w='full'>
          <Stack direction='column' spacing='0'>
            <Text fontWeight='800' fontSize='md'>
              {blockedUser.username}
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

type AddFriendProps = {
  user: User
  mutateFriends: KeyedMutator<PartialUserInfo[]>
}

function AddFriend({ user, mutateFriends }: AddFriendProps) {
  const toast = useToast()

  const validate = (values: { username: string }) => {
    const errors: FormikErrors<{ username: string }> = {}
    return errors
  }

  const formik = useFormik<{ username: string }>({
    initialValues: {
      username: '',
    },
    validate,
    onSubmit: async (values, actions) => {
      let message: string
      let status: 'success' | 'info' | 'error' = 'error'

      await new Promise((resolve) => setTimeout(resolve, 500))

      const res = await fetch(
        `${API_URL}/api/user/userInfo?username=${values.username}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        message = 'Username not found'
        formik.errors.username = message
      } else if (res.ok) {
        const username = data.username
        const userId = data.userId
        if (username === user.username) {
          message = 'You cannot add yourself as friends'
          formik.errors.username = message
        } else if (user.friends.indexOf(userId) > -1) {
          message = 'Already friends with that user'
          formik.errors.username = message
        } else {
          const res = await fetch(`${API_URL}/api/user/addFriend`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
          })
          if (!res.ok) {
            message = 'Could not add friend'
          } else if (res.ok) {
            message = 'Friend added'
            status = 'info'
            await mutateFriends()
            formik.setFieldValue('username', '')
          }
        }
      }

      toast({
        description: message,
        variant: 'subtle',
        status: status,
        duration: 5000,
        isClosable: true,
      })
      actions.setSubmitting(false)
    },
  })

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Stack>
          <FormControl
            isInvalid={formik.errors.username && formik.touched.username}
          >
            <Stack spacing='2'>
              <Heading as='h2' fontSize='lg'>
                ADD FRIEND
              </Heading>
              <Text fontSize='sm' colorScheme='gray'>
                {`You can add a friend with their username. It's cAsE sEnSitIvE`}
              </Text>
              <FormHelperText fontSize='sm'></FormHelperText>
              <InputGroup size='lg'>
                <Input
                  name='username'
                  type='text'
                  pr='4.5rem'
                  placeholder='Enter a username'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                <InputRightElement width='4.5rem'>
                  <Button
                    h='2rem'
                    px='4'
                    size='md'
                    colorScheme='blackAlpha'
                    bg='blackAlpha.900'
                    _dark={{
                      bg: 'whiteAlpha.900',
                      _hover: { bg: 'whiteAlpha.600' },
                    }}
                    type='submit'
                    isDisabled={!formik.values.username ? true : false}
                    isLoading={formik.isSubmitting}
                  >
                    Add
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Stack>
            <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
          </FormControl>
        </Stack>
      </form>
    </>
  )
}

function UserList() {
  const { user: currentUser } = useUser()
  const { data: usersData, error: usersError } = useSWR(
    `${API_URL}/api/user/search`,
    fetchUsers
  )

  const usersIsLoading = !usersData && !usersError
  console.log('/users usersData: ', usersData)

  // From here
  console.log('/users currentUser: ', currentUser)

  const {
    data: friendsData,
    mutate: mutateFriends,
    error: friendsError,
  } = useSWR(`${API_URL}/api/user/friendList`, fetchPartialUserInfos)

  const friendsIsLoading = !usersData && !usersError

  const {
    data: blockedData,
    mutate: mutateBlocked,
    error: blockedError,
  } = useSWR(`${API_URL}/api/user/blockedList`, fetchPartialUserInfos)

  const blockedIsLoading = !blockedData && !blockedError

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
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
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
                    {friendsError && (
                      <Stack spacing='8'>
                        <Text>Error occurred</Text>
                      </Stack>
                    )}
                    {friendsIsLoading && (
                      <Stack spacing='4'>
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                      </Stack>
                    )}
                    {friendsData &&
                      friendsData.filter(
                        (friend) =>
                          friend.status === 'Online' &&
                          currentUser.blockedUsers.indexOf(friend.userId) === -1
                      ).length > 0 && (
                        <Stack spacing='0'>
                          <Text
                            mb='3'
                            fontSize='sm'
                            fontWeight='semibold'
                            color='gray.400'
                          >
                            ONLINE -{' '}
                            {
                              friendsData.filter(
                                (friend) =>
                                  friend.status === 'Online' &&
                                  currentUser.blockedUsers.indexOf(
                                    friend.userId
                                  ) === -1
                              ).length
                            }
                          </Text>
                          <Divider />
                          {friendsData
                            .filter(
                              (friend) =>
                                friend.status === 'Online' &&
                                currentUser.blockedUsers.indexOf(
                                  friend.userId
                                ) === -1
                            )
                            .map((friend: PartialUserInfo) => (
                              <FriendItem
                                key={friend.userId}
                                friend={friend}
                                mutateFriends={mutateFriends}
                                mutateBlocked={mutateBlocked}
                              />
                            ))}
                        </Stack>
                      )}
                  </TabPanel>
                  <TabPanel>
                    {friendsError && (
                      <Stack spacing='8'>
                        <Text>Error occurred</Text>
                      </Stack>
                    )}
                    {friendsIsLoading && (
                      <Stack spacing='4'>
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                      </Stack>
                    )}
                    {friendsData &&
                      friendsData.filter(
                        (friend) =>
                          currentUser.blockedUsers.indexOf(friend.userId) == -1
                      ).length > 0 && (
                        <Stack spacing='0'>
                          <Text
                            mb='3'
                            fontSize='sm'
                            fontWeight='semibold'
                            color='gray.400'
                          >
                            ALL FRIENDS -{' '}
                            {
                              friendsData.filter(
                                (friend) =>
                                  currentUser.blockedUsers.indexOf(
                                    friend.userId
                                  ) === -1
                              ).length
                            }
                          </Text>
                          <Divider />
                          {friendsData
                            .filter(
                              (friend) =>
                                currentUser.blockedUsers.indexOf(
                                  friend.userId
                                ) === -1
                            )
                            .map((friend: PartialUserInfo) => (
                              <FriendItem
                                key={friend.userId}
                                friend={friend}
                                mutateFriends={mutateFriends}
                                mutateBlocked={mutateBlocked}
                              />
                            ))}
                        </Stack>
                      )}
                  </TabPanel>
                  <TabPanel>
                    {blockedError && (
                      <Stack spacing='8'>
                        <Text>Error occurred</Text>
                      </Stack>
                    )}
                    {blockedIsLoading && (
                      <Stack spacing='4'>
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                        <Skeleton height='60px' isLoaded={!usersIsLoading} />
                      </Stack>
                    )}
                    {blockedData && blockedData.length > 0 && (
                      <Stack spacing='0'>
                        <Text
                          mb='3'
                          fontSize='sm'
                          fontWeight='semibold'
                          color='gray.400'
                        >
                          BLOCKED - {blockedData.length}
                        </Text>
                        <Divider />
                        {blockedData.map((blockedUser: PartialUserInfo) => (
                          <BlockedUserItem
                            key={blockedUser.userId}
                            blockedUser={blockedUser}
                            mutateBlocked={mutateBlocked}
                          />
                        ))}
                      </Stack>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <AddFriend
                      user={currentUser}
                      mutateFriends={mutateFriends}
                    />
                  </TabPanel>
                </TabPanels>
              </Stack>
            </Tabs>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserList

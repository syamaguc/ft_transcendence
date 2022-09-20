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
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
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
  FormLabel,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  useBreakpointValue,
  useColorModeValue,
  useTab,
  useToast,
  UseToastOptions,
  useStyleConfig,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import UserStatusBadge from '@components/user-status-badge'
import { useState, useRef, forwardRef } from 'react'

import { useFormik, FormikErrors } from 'formik'
import useSWR, { KeyedMutator } from 'swr'
import { fetchUsers, fetchPartialUserInfos } from 'src/lib/fetchers'

import { FiMessageSquare, FiMoreVertical } from 'react-icons/fi'
import { BiMessage } from 'react-icons/bi'

import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'
import { Key } from 'readline'

type FriendItemProps = {
  friend: PartialUserInfo
  mutateFriends: KeyedMutator<PartialUserInfo[]>
}

function FriendItem({ friend, mutateFriends }: FriendItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateUser } = useUser()
  const toast = useToast()

  const removeFriend = async () => {
    let message: string
    let status: 'success' | 'info' | 'error' = 'error'

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

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
              _hover={{ bg: 'gray.200' }}
              bg='gray.100'
              size='38px'
              mr='16px'
              onClick={(e) => {
                alert('child')
                e.stopPropagation()
              }}
            >
              <Icon
                as={BiMessage}
                display='block'
                transition='color 0.2s'
                size='38px'
                _hover={{ color: 'gray.600' }}
              />
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
                  _hover={{ bg: 'gray.200' }}
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
                    _hover={{ color: 'gray.600' }}
                  />
                </MenuButton>
                <MenuList>
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
                  <MenuItem fontSize='sm'>Block user</MenuItem>
                </MenuList>
              </Menu>
            </Box>
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

type BlockedItemProps = {
  blocked: PartialUserInfo
}

function BlockedItem({ blocked }: BlockedItemProps) {
  return <>Blocked</>
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
  console.log('/users friendsData: ', friendsData)
  console.log('/users friendsData.length: ', friendsData?.length)
  console.log('/users isLoading: ', !friendsData && !friendsError)

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
                      friendsData.filter((friend) => friend.status === 'Online')
                        .length > 0 && (
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
                                (friend) => friend.status === 'Online'
                              ).length
                            }
                          </Text>
                          <Divider />
                          {friendsData
                            .filter((friend) => friend.status === 'Online')
                            .map((friend: PartialUserInfo) => (
                              <FriendItem
                                key={friend.userId}
                                friend={friend}
                                mutateFriends={mutateFriends}
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
                    {friendsData && friendsData.length > 0 && (
                      <Stack spacing='0'>
                        <Text
                          mb='3'
                          fontSize='sm'
                          fontWeight='semibold'
                          color='gray.400'
                        >
                          ALL FRIENDS - {friendsData.length}
                        </Text>
                        <Divider />
                        {friendsData.map((friend: PartialUserInfo) => (
                          <FriendItem
                            key={friend.userId}
                            friend={friend}
                            mutateFriends={mutateFriends}
                          />
                        ))}
                      </Stack>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <Text>Blocked Users</Text>
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

            <Heading as='h2' fontSize='2xl'>
              Users
            </Heading>
            {usersError && (
              <Stack spacing='8'>
                <Text>Error occurred</Text>
              </Stack>
            )}
            {usersIsLoading && (
              <Stack spacing='8'>
                <Skeleton height='60px' isLoaded={!usersIsLoading} />
                <Skeleton height='60px' isLoaded={!usersIsLoading} />
                <Skeleton height='60px' isLoaded={!usersIsLoading} />
              </Stack>
            )}
            <Stack spacing='2'>
              {usersData &&
                usersData
                  .filter((user) => user.userId !== currentUser.userId)
                  .map((user: User, index: number) => (
                    <NextLink key={index} href={`/users/${user.username}`}>
                      <Stack
                        key={user.userId}
                        direction='row'
                        align='center'
                        py='4'
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
                            <Text
                              fontWeight='600'
                              color='gray.400'
                              fontSize='sm'
                            >
                              {user.status}
                            </Text>
                          </Stack>
                          <Spacer />
                          <Circle bg='gray.100' size='38px' mr='16px'>
                            <FiMessageSquare />
                          </Circle>
                          <Circle bg='gray.100' size='38px' mr='16px'>
                            <FiMoreVertical />
                          </Circle>
                        </Flex>
                      </Stack>
                    </NextLink>
                  ))}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default UserList

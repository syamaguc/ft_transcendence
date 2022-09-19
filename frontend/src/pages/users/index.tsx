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
  Stack,
  Spacer,
  Skeleton,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import UserStatusBadge from '@components/user-status-badge'

import useSWR from 'swr'
import { fetchUsers, fetchPartialUserInfos } from 'src/lib/fetchers'

import { FiMessageSquare, FiMoreVertical } from 'react-icons/fi'

import { PartialUserInfo, User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

type FriendItemProps = {
  friend: PartialUserInfo
}

function FriendItem({ friend }: FriendItemProps) {
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
          <Circle bg='gray.100' size='38px' mr='16px'>
            <FiMessageSquare />
          </Circle>
          <Circle bg='gray.100' size='38px' mr='16px'>
            <FiMoreVertical />
          </Circle>
        </Flex>
      </Stack>
    </NextLink>
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

  const { data: friendsData, error: friendsError } = useSWR(
    `${API_URL}/api/user/friendList`,
    fetchPartialUserInfos
  )

  const friendsIsLoading = !usersData && !usersError
  console.log('/users friendsData: ', friendsData)
  console.log('/users isLoading: ', !friendsData && !friendsError)

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            <Tabs variant='soft-rounded' colorScheme='gray'>
              <Stack>
                <Flex>
                  <Stack direction='row' align='center' spacing='4'>
                    <Heading as='h1' fontSize='xl'>
                      Friends
                    </Heading>
                    <Box h='100%'>
                      <Divider orientation='vertical' />
                    </Box>
                    <TabList>
                      <Tab>Online</Tab>
                      <Tab>All</Tab>
                      <Tab>Blocked</Tab>
                    </TabList>
                  </Stack>
                  <Spacer />
                  <Button>Add Friend</Button>
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
                    {friendsData && (
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
                            <FriendItem key={friend.userId} friend={friend} />
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
                    {friendsData && (
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
                          <FriendItem key={friend.userId} friend={friend} />
                        ))}
                      </Stack>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <Text>Blocked Users</Text>
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

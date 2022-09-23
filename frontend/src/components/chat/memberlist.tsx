import {
  Menu,
  Stack,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Flex,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Badge,
  Spacer,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Avatar } from '@chakra-ui/avatar'
import { UsersIcon } from '@components/icons/users'
import { useState, useEffect, useRef } from 'react'
import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

function MemberStatus({ user, currentRoom, member }) {
  return (
    <Stack spacing='1' direction='row'>
      {user.user.userId == member.userId && (
        <Badge colorScheme='green'>me</Badge>
      )}
      {currentRoom.admins.includes(member.userId) && (
        <Badge colorScheme='orange'>admin</Badge>
      )}
      {currentRoom.owner == member.userId && (
        <Badge colorScheme='purple'>owner</Badge>
      )}
    </Stack>
  )
}

function MemberMenu({ socket, user, currentRoom, member }) {
  const onClickMute = (userId: string) => {
    socket.emit('muteMember', userId)
    console.log(userId, ' has been muted from the channel')
  }

  const onClickBan = (userId: string) => {
    socket.emit('banMember', userId)
    console.log(userId, ' has been banned from the channel')
  }

  const onClickAdmin = (userId: string) => {
    socket.emit('addAdmin', userId)
    console.log(userId, ' has been added to admin in channel')
  }

  //if the member was the current user
  if (user.user.userId == member.userId) {
    return <></>
  }

  //if the user was not admin
  if (currentRoom.admins.indexOf(user.user.userId) == -1) {
    return <></>
  }

  return (
    <>
      <Menu>
        <MenuButton
          mr={0}
          ml='auto'
          as={IconButton}
          icon={<ChevronDownIcon />}
        />
        <MenuList>
          {currentRoom.admins.indexOf(member.userId) == -1 ? (
            <MenuItem onClick={() => onClickAdmin(member.userId)}>
              add admin
            </MenuItem>
          ) : null}
          {currentRoom.muted.indexOf(member.userId) == -1 ? (
            <MenuItem onClick={() => onClickMute(member.userId)}>
              mute user
            </MenuItem>
          ) : (
            <MenuItem onClick={() => onClickMute(member.userId)}>
              unmute
            </MenuItem>
          )}
          <MenuItem color='red.500' onClick={() => onClickBan(member.userId)}>
            ban user
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}

function MemberList({ socket, currentRoom, members }) {
  const user = useUser()

  if (!members || !members.length) return <Text>This room is empty</Text>
  return (
    <>
      {members.map((member) => (
        <Flex key={member.userId} p={2} align='center'>
          <Avatar
            src={`${API_URL}/api/user/avatar/${member.profile_picture}`}
            marginEnd={3}
          />
          <Box>
            <MemberStatus
              user={user}
              currentRoom={currentRoom}
              member={member}
            />
            <Text>{member.username}</Text>
          </Box>
          <MemberMenu
            socket={socket}
            user={user}
            currentRoom={currentRoom}
            member={member}
          />
        </Flex>
      ))}
    </>
  )
}

function FriendList({ socket, friends, members }) {
  const onClickInvite = (userId: string) => {
    socket.emit('inviteMember', userId)
    console.log('invite :', userId)
  }
  if (!friends || !friends.length) return

  return (
    <>
      <Text fontSize='xs' color='gray.400'>
        Invite your friends to the channel
      </Text>
      {friends.map((friend) => (
        <Stack direction='row' align='center' key={friend.userId}>
          <Text>{friend.username}</Text>
          <Spacer />
          <Button
            onClick={() => {
              onClickInvite(friend.userId)
            }}
          >
            invite
          </Button>
        </Stack>
      ))}
    </>
  )
}

function MemberListModal({ socket, currentRoom }) {
  const currentUser = useUser().user
  const [members, setMembers] = useState<User[]>([])
  const [friends, setFriends] = useState()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const didLogRef = useRef(false)

  const onClickGet = (roomId: string) => {
    socket.emit('getMembers', roomId)
  }

  useEffect(() => {
    if (!socket) return
    //load members in the channel
    socket.on('getMembers', (users: User[]) => {
      setMembers(users)
    })
  }, [socket])

  useEffect(() => {
    //load friends
    fetch(`${API_URL}/api/user/friendList`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        //exclude members, and banned users from invitation list
        for (let i = 0; i < data.length; i++) {
          if (
            currentRoom.members.includes(data[i].userId) ||
            currentRoom.banned.includes(data[i].userId)
          ) {
            data.splice(i, 1)
            i--
          }
        }
        console.log('data :', data)
        setFriends(data)
        socket.emit('getMembers', currentRoom.id)
      })
  }, [currentRoom])

  return (
    <>
      <IconButton
        size='sm'
        mr={0}
        ml='auto'
        icon={<UsersIcon />}
        onClick={() => {
          onOpen()
          onClickGet(currentRoom.id)
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MemberList
              socket={socket}
              currentRoom={currentRoom}
              members={members}
            />
            {currentRoom.members.includes(currentUser.userId) && (
              <FriendList socket={socket} friends={friends} members={members} />
            )}
          </ModalBody>
          <ModalFooter>
            {/* <Button onClick={onClose}>Close</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MemberListModal

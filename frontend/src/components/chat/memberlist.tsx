import {
  Menu,
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
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Avatar } from '@chakra-ui/avatar'
import { UsersIcon } from '@components/icons/users'
import { useState, useEffect, useRef } from 'react'
import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

function MemberStatus({ user, currentRoom, member }) {
  if (user.user.userId == member.userId) {
    return (
      <>
        <Text ml={1}>me</Text>
      </>
    )
  }
  if (currentRoom.admins.indexOf(member.userId) != -1) {
    return (
      <>
        <Text ml={1}>admin</Text>
      </>
    )
  }
  return null
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
          <MenuItem onClick={() => onClickMute(member.userId)}>
            mute user
          </MenuItem>
          <MenuItem onClick={() => onClickBan(member.userId)}>
            ban user
          </MenuItem>
          {currentRoom.admins.indexOf(member.userId) == -1 ? (
            <MenuItem onClick={() => onClickAdmin(member.userId)}>
              add admin
            </MenuItem>
          ) : null}
          {/* <MenuItem>see profile</MenuItem> */}
        </MenuList>
      </Menu>
    </>
  )
}

function MemberList({ socket, currentRoom, members }) {
  const user = useUser()

  // const onClickMute = (userId: string) => {
  //   socket.emit('muteMember', userId)
  //   console.log(userId, ' has been muted from the channel')
  // }

  // const onClickBan = (userId: string) => {
  //   socket.emit('banMember', userId)
  //   console.log(userId, ' has been banned from the channel')
  // }

  // const onClickAdmin = (userId: string) => {
  //   socket.emit('addAdmin', userId)
  //   console.log(userId, ' has been added to admin in channel')
  // }

  if (!members || !members.length) return <Text>This room is empty</Text>
  return (
    <>
      {members.map((member) => (
        <Flex key={member.userId} p={2} align='center'>
          <Avatar
            src={`${API_URL}/api/user/avatar/${member.profile_picture}`}
            marginEnd={3}
          />
          <Text>{member.username}</Text>
          <MemberStatus user={user} currentRoom={currentRoom} member={member} />
          {/* {currentRoom.admins.indexOf(member.userId) != -1 ? (
            <Text ml={1}>admin</Text>
          ) : null} */}
          {/* <Box opacity='0' _hover={{ transition: '0.3s', opacity: '1' }} p={2}>
            <Button onClick={() => onClickMute(member.userId)}>MUTE</Button>
            <Button onClick={() => onClickBan(member.userId)}>BAN</Button>
            <Button onClick={() => onClickAdmin(member.userId)}>ADMIN</Button>
          </Box> */}
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

function FriendList({ friends }) {
  if (!friends || !friends.length) return <Text>You have no friends</Text>
  return (
    <>
      {friends.map((friend) => (
        <Text>{friend.username}</Text>
      ))}
    </>
  )
}

function MemberListModal({ socket, currentRoom }) {
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
        setFriends(data)
        console.log('get Friends')
        console.log(data)
      })
  }, [])

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
            <Text>Members</Text>
            <MemberList
              socket={socket}
              currentRoom={currentRoom}
              members={members}
            />
            <Text>Friends</Text>
            <FriendList friends={friends} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue' variant='ghost'>
              Invite User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MemberListModal

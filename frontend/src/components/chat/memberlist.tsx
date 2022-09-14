import {
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
import { Avatar } from '@chakra-ui/avatar'
import { UsersIcon } from '@components/icons/users'
import { useState, useEffect, useRef } from 'react'
import { User } from 'src/types/user'
import { generateKey } from 'crypto'

const API_URL = 'http://localhost:3000'



function MemberList({ socket, currentRoom, members }) {
  const onClickMute = (userId: string) => {
    socket.emit('muteMember', currentRoom.id, userId)
    console.log(userId, ' has been muted from channel ' , currentRoom.id)
  }

  const onClickBan = (userId: string) => {
    socket.emit('banMember', currentRoom.id, userId)
    console.log(userId, ' has been banned from channel ' , currentRoom.id)
  }

  const onClickAdmin = (userId: string) => {
    socket.emit('addAdmin', currentRoom.id, userId)
    console.log(userId, ' has been added to admin in channel ' , currentRoom.id)
  }

  if (!members || !members.length) return <Text>This room is empty</Text>
  return (
    <>
      {members.map((member) => (
        <Flex
          key={member.userId}
          p={2}
          align='center'
        >
          <Avatar
            src={`${API_URL}/api/user/avatar/${member.profile_picture}`}
            marginEnd={3}
            />
          <Text>{member.username}</Text>
          <Box opacity='0' _hover={{ transition: '0.3s' , opacity: '1' }} p={2}>
            <Button onClick={() => onClickMute(member.userId)}>MUTE</Button>
            <Button onClick={() => onClickBan(member.userId)}>BAN</Button>
            <Button onClick={() => onClickAdmin(member.userId)}>ADMIN</Button>
          </Box>
        </Flex>
      ))}
    </>
  )
}

function FriendList({friends}) {
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
    //load members in the channel
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('getMembers', (users: User[]) => {
        setMembers(users)
        })
    }

    //load friends
    fetch(`${API_URL}/api/user/friendList`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        setFriends(data)
        console.log("get Friends")
        console.log(data);
      })
  }, [])

  return (
    <>
      <IconButton
        size='sm'
        icon={<UsersIcon />}
        onClick={() => {
          onOpen()
          onClickGet(currentRoom.id)
          }} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Members</Text>
            <MemberList socket={socket} currentRoom={currentRoom} members={members} />
            <Text>Friends</Text>
            <FriendList friends={friends}/>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue' variant='ghost'>Invite User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MemberListModal

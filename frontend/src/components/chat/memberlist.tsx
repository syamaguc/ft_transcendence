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

// function MemberList({ currentRoom }) {
//   if (!currentRoom) return null
//   const members: string[] = currentRoom.members
//   if (!members) return null
//   if (!members.length) return <Text>This room is empty</Text>

//   return (
//     <>
//       {members.map((member) => (
//         <Text>member.id</Text>
//       ))}
//     </>
//   )
// }

function MemberList({ members }) {
  if (!members || !members.length) return <Text>This room is empty</Text>
  return (
    <>
      {members.map((member) => (
        <Flex
          key={member.userId}
          p={2}
          align='center'
          // _hover={{ bgColor: '#00BABC' }}
        >
          <Avatar
            src={`${API_URL}/api/user/avatar/${member.profile_picture}`}
            marginEnd={3}
            />
          <Text>{member.username}</Text>
          <Box opacity='0' _hover={{ transition: '0.3s' , opacity: '1' }} p={2}>
            <Button>MUTE</Button>
            <Button>BAN</Button>
            <Button>ADMIN</Button>
          </Box>

        </Flex>
      ))}
    </>
  )
}


function MemberListModal({ socket, currentRoom }) {
  const [members, setMembers] = useState<User[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const didLogRef = useRef(false)

  // useEffect(() => {
  //   socket.emit('getMembers', currentRoom.id)
  // }, [])

  const onClickGet = (roomId: string) => {
    socket.emit('getMembers', roomId)
    console.log('getmembers')
  }

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true
      socket.on('getMembers', (users: User[]) => {
        console.log('recieved members')
        setMembers(users)
        })
    }



  }, [])


  return (
    <>
      {/* <Button onClick={onOpen}>Open Modal</Button> */}
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
            <MemberList members={members} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Invite User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MemberListModal

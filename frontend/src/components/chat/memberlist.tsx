import {
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
import { UsersIcon } from '@components/icons/users'

function MemberList({ currentRoom }) {
  // console.log(currentRoom);
  if (!currentRoom) return null
  const members: string[] = currentRoom.members
  if (!members) return null
  if (!members.length) return <Text>This room is empty</Text>

  return (
    <>
      {members.map((member) => (
        <Text>member.id</Text>
      ))}
    </>
  )
}

function MemberListModal({ currentRoom }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      {/* <Button onClick={onOpen}>Open Modal</Button> */}
      <IconButton size='sm' icon={<UsersIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MemberList currentRoom={currentRoom} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MemberListModal

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
  } from '@chakra-ui/react'
import { Avatar } from "@chakra-ui/avatar"
import { useUser} from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

const ProfileModal = ({message}) => {
	const { isOpen, onOpen, onClose } = useDisclosure()
  	const user = useUser()

	return (
	  <>
		<Avatar m={2} size='sm' onClick={onOpen} src={`${API_URL}/api/user/avatar/${user.profile_picture}`}/>


		<Modal isOpen={isOpen} onClose={onClose}>
		  <ModalOverlay />
		  <ModalContent>
			<ModalHeader>{message.user}'s Profile</ModalHeader>
			<ModalCloseButton />
			<ModalBody>
			  {/* <Lorem count={2} /> */}
			  <Text></Text>
			</ModalBody>

			<ModalFooter>
			  <Button colorScheme='blue' mr={3} onClick={onClose}>
				Close
			  </Button>
			  {/* <Button variant='ghost'>Secondary Action</Button> */}
			</ModalFooter>
		  </ModalContent>
		</Modal>
	  </>
	)
}

export default ProfileModal

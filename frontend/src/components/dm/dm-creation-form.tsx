import {
  Text,
  Flex,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const DMCreationForm = ({ socket }: Props) => {
  const userNameInputRef = useRef<HTMLInputElement>()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const enteredUserName = userNameInputRef.current.value
    socket.emit('createRoom', enteredUserName)
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Flex w='100%'>
        <Flex
          as='button'
          p={1}
          rounded={'md'}
          w='100%'
          onClick={onOpen}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          <Text ml={0} mr='auto' fontSize='xs' as='b'>
            DIRECT MESSAGES
          </Text>
          <Text mr={0} ml='auto' fontSize='xs' as='b'>
            +
          </Text>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={onClickCreate}>
            <ModalHeader>Select User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input type='text' ref={userNameInputRef} />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} type='submit' onClick={onClose}>
                Create DM
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DMCreationForm

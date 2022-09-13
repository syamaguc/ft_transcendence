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
} from '@chakra-ui/react'
import { MutableRefObject, useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const DMCreationForm = ({ socket }: Props) => {
  const userNameInputRef = useRef<HTMLInputElement>()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const enteredUserName = userNameInputRef.current.value
    console.log('onClickCreate called', enteredUserName)
    socket.emit('createRoom', { memberB: enteredUserName })
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Flex w='100%'>
        <Text p={2} as='b'>
          Direct Messages
        </Text>
        <Button mr={0} ml='auto' onClick={onOpen}>
          +
        </Button>
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

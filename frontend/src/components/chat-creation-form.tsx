import {
  Input,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  useBoolean,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const ChatCreationForm = ({ socket }: Props) => {
  const [hideFlag, setHideFlag] = useBoolean()

  const channelNameInputRef = useRef<HTMLInputElement>()
  const isPrivateInputRef = useRef<HTMLInputElement>()
  const passwordInputRef = useRef<HTMLInputElement>()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const enteredChannelName = channelNameInputRef.current.value
    const enteredIsPrivate = isPrivateInputRef.current.checked
    let enteredPassword = ''
    if (enteredIsPrivate == true) {
      enteredPassword = passwordInputRef.current.value
    }
    console.log('onClickCreate called', enteredIsPrivate, enteredPassword)

    socket.emit('createRoom', enteredChannelName)
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button onClick={onOpen}>Create New Channel</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={onClickCreate}>
            <ModalHeader>Create New Channel</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input type='text' ref={channelNameInputRef} />
              <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='is_private' mb='0'>
                  Private Channel
                </FormLabel>
                <Switch
                  id='is_private'
                  ref={isPrivateInputRef}
                  onChange={setHideFlag.toggle}
                />
              </FormControl>
              {hideFlag ? (
                <FormControl>
                  <FormLabel htmlFor='password'>Password</FormLabel>
                  <Input type='password' id='password' ref={passwordInputRef} />
                  <FormHelperText>Please enter your password</FormHelperText>
                </FormControl>
              ) : null}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant='ghost' type='submit' onClick={onClose}>
                Create New Channel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ChatCreationForm

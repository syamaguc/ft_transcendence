import {
  Text,
  Box,
  Flex,
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
  useToast,
} from '@chakra-ui/react'
import { MutableRefObject, useRef, useCallback } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

type Refs = {
  channelNameInputRef: MutableRefObject<HTMLInputElement>
  isPrivateInputRef: MutableRefObject<HTMLInputElement>
  isProtectedInputRef: MutableRefObject<HTMLInputElement>
  passwordInputRef: MutableRefObject<HTMLInputElement>
}

type CreateChatRoomDto = {
  name: string
  owner: string
  is_private: boolean
  password: string
  time_created: Date
}

const ChatCreationFormContent = ({
  channelNameInputRef,
  isPrivateInputRef,
  isProtectedInputRef,
  passwordInputRef,
}: Refs) => {
  const [hideFlag, setHideFlag] = useBoolean()

  return (
    <>
      <Input type='text' ref={channelNameInputRef} />
      <FormControl display='flex' alignItems='center'>
        <FormLabel htmlFor='is_private' mb='0'>
          Private Channel
        </FormLabel>
        <Switch id='is_private' ref={isPrivateInputRef} />
        <FormLabel htmlFor='is_private' mb='0'>
          Protect Channel
        </FormLabel>
        <Switch
          id='is_protected'
          ref={isProtectedInputRef}
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
    </>
  )
}

const ChatCreationForm = ({ socket }: Props) => {
  const channelNameInputRef = useRef<HTMLInputElement>()
  const isPrivateInputRef = useRef<HTMLInputElement>()
  const isProtectedInputRef = useRef<HTMLInputElement>()
  const passwordInputRef = useRef<HTMLInputElement>()
  const toast = useToast()

  const onClickCreate = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!socket) return
      event.preventDefault()
      const enteredChannelName = channelNameInputRef.current.value
      const enteredIsPrivate = isPrivateInputRef.current.checked
      const enteredIsProtected = isProtectedInputRef.current.checked
      let enteredPassword = ''
      if (!enteredChannelName) return
      if (enteredIsProtected == true && enteredIsPrivate == false) {
        enteredPassword = passwordInputRef.current.value
      }
      console.log(
        'onClickCreate called',
        enteredIsPrivate,
        enteredIsProtected,
        enteredPassword
      )
      if (!enteredPassword || /\s/g.test(enteredPassword)) {
        toast({
          description: 'Password cannot be empty or contain whitespace',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      const enterdData: CreateChatRoomDto = {
        name: enteredChannelName,
        // owner: 'user',
        is_private: enteredIsPrivate,
        password: enteredPassword,
        time_created: new Date(),
      }
      socket.emit('createRoom', enterdData)
    },
    [socket]
  )

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Flex w='100%'>
        <Text p={2}>Channels</Text>
        <Button mr={0} ml='auto' onClick={onOpen}>
          +
        </Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={onClickCreate}>
            <ModalHeader>Create Channel</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ChatCreationFormContent
                channelNameInputRef={channelNameInputRef}
                isPrivateInputRef={isPrivateInputRef}
                isProtectedInputRef={isProtectedInputRef}
                passwordInputRef={passwordInputRef}
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button variant='ghost' type='submit' onClick={onClose}>
                Create Channel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ChatCreationForm

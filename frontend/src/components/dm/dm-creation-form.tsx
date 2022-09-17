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
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const DMCreationForm = ({ socket }: Props) => {
  const userNameInputRef = useRef<HTMLInputElement>()
  const router = useRouter()
  const toast = useToast()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const enteredUserName = userNameInputRef.current.value
    console.log('onClickCreate called', enteredUserName)
    socket.emit('createRoom', { username: enteredUserName })
  }

  useEffect(() => {
    socket.on('exception', ({ status, message }) => {
      console.log(status, message)
      toast({
        description: message,
        status: status,
        duration: 5000,
        isClosable: true,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              <Button
                colorScheme='blackAlpha'
                bg='blackAlpha.900'
                _dark={{
                  bg: 'whiteAlpha.900',
                  _hover: { bg: 'whiteAlpha.600' },
                }}
                mr={3}
                type='submit'
                onClick={onClose}
              >
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

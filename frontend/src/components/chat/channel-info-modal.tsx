import {
  Button,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  MemberList,
  ModalFooter,
  Input,
  MutableRefObject,
  FormControl,
} from '@chakra-ui/react'
import React, { useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import ResizeTextarea from 'react-textarea-autosize'
import { ChannelObject } from 'src/types/chat'
import { useUser } from 'src/lib/use-user'
import { captureRejectionSymbol } from 'events'


function PasswordEdit({socket, currentRoom}) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const channelPasswordRef = useRef<HTMLInputElement>()

  const onClickPassword = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      onClose()
      if (!socket || !currentRoom) return
      event.preventDefault()
      const password = channelPasswordRef.current.value
      socket.emit('changePassword', {
        password: password,
      })
    },
    [socket, onClose]
  )

  return (
    <>
      <Button onClick={onOpen}>edit</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
        <form onSubmit={onClickPassword}>
            <ModalHeader>Change password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Enter new password</Text>
              <Input type='text' ref={channelPasswordRef} />
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' mr={3} type='submit'>
                Enter
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

function ChannelInfo({socket, currentRoom}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const currentUser = useUser().user
  return (
    <>
      <Button onClick={onOpen}>Info</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About this channel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentUser.userId == currentRoom.owner && (
              <>
                
              </>
            )}
            <PasswordEdit socket={socket} currentRoom={currentRoom}/>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={onClose}>
              Close
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ChannelInfo

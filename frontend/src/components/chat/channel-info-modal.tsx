import {
  Box,
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



const ShowInfo = ({socket, currentRoom}) => {
  const currentUser = useUser().user

  const onClickDelete = () => {
    socket.emit('deleteChannel')
    console.log('room has been deleted')
  }

  console.log('current user', currentUser)

  if (currentRoom.owner == currentUser.userId) {
    return (
      <>
        <Button>delete channel</Button>
      </>
    )
  }
  return (
    <>
      <Text>created by: {currentRoom.owner}</Text>
      <Button>leave channel</Button>
    </>
  )
}

const ChannelInfo = ({socket, currentRoom}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button onClick={onOpen}>view info</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About channel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Text>created by: {currentRoom.owner}</Text> */}
            <ShowInfo socket={socket} currentRoom={currentRoom} />
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

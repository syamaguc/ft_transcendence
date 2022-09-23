import {
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
import { useCallback, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { useUser } from 'src/lib/use-user'
import { ChannelObject } from 'src/types/chat'

type Props = {
  socket: Socket
  currentRoom: ChannelObject
  isJoined: boolean
}

const ButtonDelete = ({ socket, currentRoom }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onClickDelete = useCallback(() => {
    if (!currentRoom || !socket) return
    socket.emit('deleteRoom', currentRoom.id)
    console.log('deleteRoom', currentRoom.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom])

  return (
    <>
      <Button size='sm' m={2} onClick={onOpen}>
        Delete
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Channel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete #{currentRoom.name}? This action
            cannot be undone.
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={() => {
                onClickDelete()
                onClose()
              }}
            >
              Delete Channel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const ButtonLeave = ({ socket, currentRoom, isJoined }: Props) => {
  const [isOwner, setIsOwers] = useState<boolean>()
  const { user } = useUser()

  const onClickLeave = useCallback(() => {
    if (!currentRoom || !socket) return
    socket.emit('leaveRoom', currentRoom.id)
    console.log('leaveRoom', currentRoom.id)
  }, [currentRoom, socket])

  useEffect(() => {
    // if (!currentRoom) return
    console.log(currentRoom.owner)
    console.log('userId = ', user.userId)
    if (currentRoom.owner == user.userId) {
      setIsOwers(true)
    } else {
      setIsOwers(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom])

  return (
    <>
      {isJoined ? (
        isOwner ? (
          <ButtonDelete socket={socket} currentRoom={currentRoom} />
        ) : (
          <Button size='sm' onClick={onClickLeave}>
            Leave
          </Button>
        )
      ) : null}
    </>
  )
}

export default ButtonLeave

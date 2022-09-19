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

type Props = {
  inputText: string
  setInputText: (input: string) => void
  socket: Socket
  currentRoom: ChannelObject
  isJoined: boolean
}

const BottomBar = ({
  inputText,
  setInputText,
  socket,
  currentRoom,
  isJoined,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const AskPassword = ({ isOpen, onClose, socket }) => {
    const channelPasswordRef = useRef<HTMLInputElement>()

    const onClickPassword = useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        onClose()
        if (!socket || !currentRoom) return
        event.preventDefault()
        const password = channelPasswordRef.current.value
        socket.emit('joinProtectedRoom', {
          roomId: currentRoom.id,
          password: password,
        })
      },
      [socket, currentRoom]
    )

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={onClickPassword}>
            <ModalHeader>Please enter a password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
    )
  }

  const onClickSubmit = useCallback(() => {
    if (!socket) return
    const message = {
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText, setInputText, socket])

  const onClickJoin = useCallback(() => {
    if (!currentRoom || !socket) return
    socket.emit('joinRoom', currentRoom.id)
    console.log('joinroom', currentRoom.id)
  }, [currentRoom, socket])

  if (currentRoom.id == 'default-channel') {
    return <></>
  } else if (isJoined) {
    return (
      <>
        <Textarea
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value)
          }}
          minH='unset'
          overflow='hidden'
          w='100%'
          minRows={1}
          maxRows={10}
          as={ResizeTextarea}
        />
        <Button ml={3} px={6} onClick={onClickSubmit} type='submit'>
          Send
        </Button>
      </>
    )
  } else {
    return (
      <>
        <Button onClick={currentRoom.password ? onOpen : onClickJoin}>
          join
        </Button>
        <AskPassword isOpen={isOpen} onClose={onClose} socket={socket} />
      </>
    )
  }
}

export default BottomBar

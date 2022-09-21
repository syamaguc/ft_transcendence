import {
  Stack,
  Button,
  Textarea,
  Heading,
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
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { User } from 'src/types/user'
import ResizeTextarea from 'react-textarea-autosize'
import { ChannelObject } from 'src/types/chat'
import { useUser } from 'src/lib/use-user'
import { captureRejectionSymbol } from 'events'
import { API_URL } from 'src/constants'

const timestampToTime = (timestamp) => {
  const date = new Date(timestamp)
  const yyyy = `${date.getFullYear()}`
  // .slice(-2)で文字列中の末尾の2文字を取得する
  // `0${date.getHoge()}`.slice(-2) と書くことで０埋めをする
  const MM = `0${date.getMonth() + 1}`.slice(-2) // getMonth()の返り値は0が基点
  const dd = `0${date.getDate()}`.slice(-2)
  const HH = `0${date.getHours()}`.slice(-2)
  const mm = `0${date.getMinutes()}`.slice(-2)
  const ss = `0${date.getSeconds()}`.slice(-2)

  //   return `${yyyy}/${MM}/${dd}`
  return `${yyyy}/${MM}/${dd} ${HH}:${mm}`
}

function PasswordEdit({ socket, currentRoom }) {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const channelPasswordRef = useRef<HTMLInputElement>()

  const onClickPassword = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!socket || !currentRoom) return
      event.preventDefault()
      const password = channelPasswordRef.current.value
      if (password != '') {
        onClose()
        socket.emit('changePassword', password)
      } else {
        toast({
          description: 'enter new password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [socket, onClose]
  )

  return (
    <>
      <Button onClick={onOpen}>Edit password</Button>

      <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={false}>
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
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

function ChannelInfo({ socket, currentRoom }) {
  const [owner, setOwner] = useState<User>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const currentUser = useUser().user

  useEffect(() => {
    //load friends
    fetch(`${API_URL}/api/user/partialInfo?userId=${currentRoom.owner}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        setOwner(data)
        console.log(data)
      })
  }, [])

  return (
    <>
      {/* <Button onClick={onOpen}>Info</Button> */}
      <IconButton size='sm' onClick={onOpen} icon={<EditIcon />} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About this channel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
              <Stack spacing='4'>
                <Text>Channel name: {currentRoom.name}</Text>
                <Text>Owner: {owner ? (owner.username): null}</Text>
                <Text>Created time: {timestampToTime(currentRoom.time_created)}</Text>
                {(currentUser.userId == currentRoom.owner && currentRoom.password != '') && (
                  <>
                    <Text fontSize='xs' color='gray.400'>
                      Enter new password for your channel. Only the channel owner can see this option
                    </Text>
                    <PasswordEdit socket={socket} currentRoom={currentRoom}/>
                  </>
                )}
              </Stack>
          </ModalBody>

          <ModalFooter>
            {/* <Button colorScheme='blue' onClick={onClose}>
              Close
            </Button> */}
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ChannelInfo

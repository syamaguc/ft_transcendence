import {
  Text,
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
import { useState, useEffect} from 'react'
import { Avatar } from "@chakra-ui/avatar"
import { useUser, findUser } from 'src/lib/use-user'
import { User } from 'src/types/user'
import { MessageObject } from 'src/types/chat'
import { profile } from 'console'
// import axios from '@nestjs/axios'

const API_URL = 'http://localhost:3000'

const ProfileModal = ({message}) => {
  const [url, setUrl] = useState('')
  const [user, setUser] = useState<User>()
  // const [picture, setPicture] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    fetch(`${API_URL}/api/user/userInfo?username=${message.user}`, {
      credentials: 'include',
      })
      .then((r) => r.json())
      .then((data) => {
        console.log(data.username)
        setUrl(`${API_URL}/api/user/avatar/${data.profile_picture}`)
      })
  }, [])

  const onClickProfile = (message: MessageObject) => {
    fetch(`${API_URL}/api/user/userInfo?username=${message.user}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data)
    })
  }

  const profileBody = () => {
    return (
    <>
      <Avatar src={`${API_URL}/api/user/avatar/${user.profile_picture}`}/>
      <Text>{user.username}</Text>
      <Text>{user.userId}</Text>
      <Text>{user.email}</Text>
    </>)
  }

  return (
    <>
    <Avatar m={2} size='sm' onClick={() => {onOpen(); onClickProfile(message)}} src={url}/>
    {/* <Avatar m={2} size='sm' onClick={onOpen} src={`${API_URL}/api/user/avatar/${user.profile_picture}`}/> */}


    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
      <ModalHeader>{message.user}'s Profile</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {user ? profileBody() : null}
      </ModalBody>
      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={onClose}>
        Close
        </Button>
        {/* <Button variant='ghost'>Secondary Action</Button> */}
      </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  )
}

export default ProfileModal

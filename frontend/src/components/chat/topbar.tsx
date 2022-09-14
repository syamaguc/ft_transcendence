import { Box, Flex } from '@chakra-ui/layout'
import { Image, Button, Text, IconButton } from '@chakra-ui/react'
import { ChannelObject, MessageObject } from 'src/types/chat'
import { UsersIcon } from '@components/icons/users'
import MemberListModal from './memberlist'

const TopBar = ({ socket, currentRoom }) => {
  return (
    <Flex
      h='55px'
      borderBottom='1px solid'
      borderColor='gray.100'
      p={4}
      align='center'
    >
      <Text>Current Channel : {currentRoom.name}</Text>
      {/* <IconButton size='sm' icon={<UsersIcon/>}/> */}
      <MemberListModal socket={socket} currentRoom={currentRoom} />
    </Flex>
  )
}

export default TopBar

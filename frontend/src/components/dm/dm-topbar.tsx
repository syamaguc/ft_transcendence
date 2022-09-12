import { Box, Flex } from '@chakra-ui/layout'
import { Image, Button, Text, IconButton } from '@chakra-ui/react'
import { ChannelObject, MessageObject } from 'src/types/chat'

const DMTopBar = ({ currentRoom }) => {
  return (
    <Flex
      h='55px'
      borderBottom='1px solid'
      borderColor='gray.100'
      p={4}
      align='center'
    >
      <Text>@ {currentRoom.toUserName}</Text>
    </Flex>
  )
}

export default DMTopBar

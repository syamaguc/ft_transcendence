import { Text, Box, Flex } from '@chakra-ui/layout'
import { Avatar } from '@chakra-ui/avatar'
import { MessageObject } from 'src/types/chat'
import { useUser } from 'src/lib/use-user'
import ProfileModal from './profile-modal'
import AlwaysScrollToBottom from './always-scroll-bottom'

const API_URL = 'http://localhost:3000'

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

const MessageFilter = ({ currentRoom, message }) => {
  const currentUser = useUser().user
  const mute = currentRoom.muted.indexOf(message.userId)
  const block = currentUser.blockedUsers.indexOf(message.userId)
  //muted && not own message
  if (mute != -1 && currentUser.userId != message.userId) return null
  // <Box bg='gray.100'>
  //   <Text>Muted message</Text>
  // </Box>
  //blocked
  if (block != -1) return null
  //else
  return (
    <Flex key={message.id} m={4} direction='horizontal' align='flex-start'>
      <ProfileModal message={message} />
      <Flex direction='column' maxW='90%'>
        <Flex direction='horizontal' align='flex-end'>
          <Text as='b' marginEnd={2}>
            {message.username}
          </Text>
          <Text fontSize='xs' pb='1px'>
            {timestampToTime(message.timestamp)}
          </Text>
        </Flex>
        <Text whiteSpace='pre-wrap'>{message.message}</Text>
      </Flex>
    </Flex>
  )
}

const MiddleBar = ({ currentRoom, chatLog }) => {
  return (
    <Flex
      direction='column'
      p={4}
      flex={1}
      overflowY='scroll'
      sx={{ scrollbarWidth: 'none' }}
    >
      {chatLog.length
        ? chatLog.map((message: MessageObject) => (
            <MessageFilter currentRoom={currentRoom} message={message} />
          ))
        : null}
      <AlwaysScrollToBottom />
    </Flex>
  )
}

export default MiddleBar

import { Text, Box, Flex } from '@chakra-ui/layout'
import { Avatar } from '@chakra-ui/avatar'
import { DMObject, MessageObject } from 'src/types/chat'
import { useUser } from 'src/lib/use-user'
import ProfileModal from '../chat/profile-modal'
import AlwaysScrollToBottom from '../chat/always-scroll-bottom'
import MessageIcon from 'src/components/chat/message-icon'

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

type Props = {
  message: MessageObject
}

const MessageBlock = ({ message }: Props) => {
  const { user: currentUser } = useUser()

  const isNotBlocked = (userId: string) => {
    return currentUser.blockedUsers.indexOf(userId) === -1
  }

  return (
    <>
      {isNotBlocked(message.userId) ? (
        <Flex m={4} align='flex-start'>
          <MessageIcon message={message} />
          <Flex direction='column' maxW='90%'>
            <Flex align='flex-end'>
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
      ) : null}
    </>
  )
}

const DmMiddleBar = ({ chatLog }) => {
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
            <MessageBlock key={message.id} message={message} />
          ))
        : null}
      <AlwaysScrollToBottom />
    </Flex>
  )
}

export default DmMiddleBar

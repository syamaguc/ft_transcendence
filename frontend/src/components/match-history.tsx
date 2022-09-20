import {
  Avatar,
  Badge,
  Heading,
  Flex,
  Text,
  Stack,
  Spacer,
  Skeleton,
} from '@chakra-ui/react'

import NextLink from 'next/link'
import useSWR from 'swr'
import { fetchPartialUserInfo } from 'src/lib/fetchers'
import { User, PartialUserInfo, GameHistory } from 'src/types/user'
import { API_URL } from 'src/constants'

type PlayerInfoProps = {
  player: PartialUserInfo
}

function PlayerInfo({ player }: PlayerInfoProps) {
  return (
    <>
      <NextLink href={`/users/${player.username}`}>
        <Stack
          direction='row'
          align='center'
          borderRadius='md'
          transition='color 0.2s'
          _hover={{ cursor: 'pointer' }}
        >
          <Avatar
            size='sm'
            mr='4px'
            src={`${API_URL}/api/user/avatar/${player.profile_picture}`}
          />
          <Text fontWeight='800' fontSize='md'>
            {player.username}
          </Text>
        </Stack>
      </NextLink>
    </>
  )
}

type MatchInfoProps = {
  user: User
  game: GameHistory
}

function MatchInfo({ user, game }: MatchInfoProps) {
  let opponentId: string
  if (user.userId === game.playerOne) {
    opponentId = game.playerTwo
  } else {
    opponentId = game.playerOne
  }

  const { data: data, error } = useSWR(
    `${API_URL}/api/user/partialInfo?userId=${opponentId}`,
    fetchPartialUserInfo
  )

  const isLoading = !data && !error
  const opponent = data?.user

  return (
    <>
      {error && <Text>Error occurred</Text>}
      {isLoading && <Skeleton height='60px' isLoaded={!isLoading} />}
      {!opponent && <Text>User not found</Text>}
      {opponent && (
        <Flex
          direction='row'
          w='full'
          px='6'
          py='4'
          // bg={game.playerWin === user.userId ? 'blue.100' : 'red.100'}
          borderRadius='md'
          borderWidth='1px'
        >
          <Flex
            flex='1'
            w='full'
            direction='row'
            align='center'
            justify='end'
            pr='4'
          >
            <Stack>
              <Text fontWeight='600' color='gray.600' fontSize='sm'>
                Player one
              </Text>
              <PlayerInfo
                player={game.playerOne === user.userId ? user : opponent}
              />
            </Stack>
            <Spacer />
            <Badge
              mr='1'
              // variant='solid'
              fontSize='0.8em'
              colorScheme={
                game.playerOneScore > game.playerTwoScore ? 'blue' : 'red'
              }
            >
              {game.playerOneScore > game.playerTwoScore ? 'WIN' : 'LOSE'}
            </Badge>
          </Flex>
          <Stack direction='row' align='center'>
            <Text fontWeight='extrabold' fontSize='2xl'>
              {game.playerOneScore}
            </Text>
            <Text fontWeight='semibold' fontSize='xl'>
              -
            </Text>
            <Text fontWeight='extrabold' fontSize='2xl'>
              {game.playerTwoScore}
            </Text>
          </Stack>
          <Flex
            flex='1'
            w='full'
            direction='row'
            align='center'
            justify='end'
            pl='4'
          >
            <Badge
              ml='1'
              // variant='solid'
              fontSize='0.8em'
              colorScheme={
                game.playerTwoScore > game.playerOneScore ? 'blue' : 'red'
              }
            >
              {game.playerTwoScore > game.playerOneScore ? 'WIN' : 'LOSE'}
            </Badge>
            <Spacer />
            <Stack align='end'>
              <Text fontWeight='600' color='gray.600' fontSize='sm'>
                Player Two
              </Text>
              <PlayerInfo
                player={game.playerTwo === user.userId ? user : opponent}
              />
            </Stack>
          </Flex>
        </Flex>
      )}
    </>
  )
}

type MatchHistoryProps = {
  user: User
}

export default function MatchHistory({ user }: MatchHistoryProps) {
  return (
    <Stack w='full'>
      <Heading fontSize='2xl'>Match History</Heading>
      <Stack align='center' w='full'>
        {user.game_history.map((game) => (
          <MatchInfo key={game.gameId} user={user} game={game} />
        ))}
      </Stack>
    </Stack>
  )
}

import {
  Heading,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
} from '@chakra-ui/react'

import { User } from 'src/types/user'

type UserStatistiscProps = {
  user: User
}

export default function UserStatistics({ user }: UserStatistiscProps) {
  return (
    <Stack>
      <Heading fontSize='2xl'>Statistics</Heading>
      <StatGroup py='4'>
        <Stat>
          <StatLabel>Games Won</StatLabel>
          <StatNumber>{user.game_won}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Games Lost</StatLabel>
          <StatNumber>{user.lost_game}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Elo</StatLabel>
          <StatNumber>{user.elo}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
      </StatGroup>
    </Stack>
  )
}

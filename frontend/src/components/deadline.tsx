import { Flex, Heading } from '@chakra-ui/react'

import { weeksBetween } from 'src/lib/date-helpers'

const Deadline = () => {
  const weeks = weeksBetween(new Date(), new Date('2022-09-20'))

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
      bgClip="text"
    >
      <Heading fontSize="4xl">9/20まであと{weeks}週間</Heading>
    </Flex>
  )
}

export default Deadline

import { Flex, Heading } from '@chakra-ui/react'

const Deadline = () => (
  <Flex
    justifyContent="center"
    alignItems="center"
    bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
    bgClip="text"
  >
    <Heading fontSize="6vw">9/20まであと12週間</Heading>
  </Flex>
)

export default Deadline

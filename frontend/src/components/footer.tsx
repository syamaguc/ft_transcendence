import { Flex, Text } from '@chakra-ui/react'

const Footer = () => (
  <Flex bg='blue' as='footer' width='full' justifyContent='center'>
    <Text fontSize='sm' color='gray.500'>
      {new Date().getFullYear()} - made with ❤️ by mfunyu, ksuzuki, syamaguc,
      yufukuya
    </Text>
  </Flex>
)

export default Footer

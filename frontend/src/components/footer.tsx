import { VStack, StackProps, Text } from '@chakra-ui/react'

const Footer = (props: StackProps) => (
  <VStack as='footer' spacing={4} mt={12} textAlign='center' {...props}>
    <Text fontSize='sm'>
      <span>Made with ❤️ by mfunyu, ksuzuki, syamaguc, yufukuya</span>
    </Text>
  </VStack>
)

export default Footer

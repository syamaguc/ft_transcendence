import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react'
import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons'

import Hero from '@components/hero'
import Container from '@components/container'
import Main from '@components/main'
import Footer from '@components/footer'
import DarkModeSwitch from '@components/dark-mode-switch'

function Index() {
  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <Text color="text">
          Example repo of <Code>Next.js</Code> + <Code>chakra-ui</Code> +{' '}
          <Code>Typescript</Code>
        </Text>
        <List spacing={3} my={0} color="text">
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            <ChakraLink
              isExternal
              href="https://chakra-ui.com"
              flexGrow={1}
              mr={2}
            >
              Chakra UI <LinkIcon />
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            <ChakraLink
              isExternal
              href="https://nextjs.org"
              flexGrow={1}
              mr={2}
            >
              Next.js <LinkIcon />
            </ChakraLink>
          </ListItem>
        </List>
      </Main>
      <DarkModeSwitch />
      <Footer>
        <Text>This is footer...</Text>
      </Footer>
    </Container>
  )
}

export default Index

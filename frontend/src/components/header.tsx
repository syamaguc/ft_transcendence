import {
  Box,
  Heading,
  HTMLChakraProps,
  Flex,
  Spacer,
  HStack,
  Icon,
  Link as ChakraLink,
  chakra,
} from '@chakra-ui/react'

import NextLink from 'next/link'

import ThemeToggle from './theme-toggle'
import { GithubIcon } from '@components/icons'

const HeaderContent = () => (
  <>
    <Flex w="100%" h="100%" px="6" align="center" justify="space-between">
      <Flex align="center">
        <NextLink href="/" passHref>
          <chakra.a display="block" aria-label="Back to homepage">
            <Heading size="md" display="block">
              ft_transcendence
            </Heading>
            <Box minW="3rem" display={{ base: 'block', md: 'none' }}></Box>
          </chakra.a>
        </NextLink>
      </Flex>
      <Spacer />
      <HStack spacing="4" display={{ base: 'none', md: 'flex' }}>
        <ChakraLink
          isExternal
          aria-label="Go to Github"
          href={'https://github.com/syamaguc/ft_transcendence/'}
        >
          <Icon
            as={GithubIcon}
            display="block"
            transition="color 0.2s"
            w="5"
            h="5"
            _hover={{ color: 'gray.600' }}
          />
        </ChakraLink>
        <ThemeToggle />
      </HStack>
    </Flex>
  </>
)

const Header = (props: HTMLChakraProps<'header'>) => {
  const { maxW = '8xl', maxWidth = '8xl' } = props

  return (
    <chakra.header>
      <chakra.div height="4.5rem" mx="auto" maxW={maxW} maxWidth={maxWidth}>
        <HeaderContent />
      </chakra.div>
    </chakra.header>
  )
}

export default Header

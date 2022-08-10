import { ReactNode } from 'react'
import {
  Box,
  Heading,
  HTMLChakraProps,
  Flex,
  Avatar,
  Spacer,
  Stack,
  HStack,
  Icon,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Link as ChakraLink,
  useColorModeValue,
  useDisclosure,
  chakra,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'

import NextLink from 'next/link'

import ThemeToggle from './theme-toggle'
import { GithubIcon } from '@components/icons'

const Links = ['Users', 'Chat', 'Game']

const NavLink = ({ children }: { children: ReactNode }) => (
  <ChakraLink
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}
  >
    {children}
  </ChakraLink>
)

const HeaderContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Flex w="100%" h="100%" px="6" align="center" justify="space-between">
        <IconButton
          size="md"
          fontSize="lg"
          aria-label="Open menu"
          variant="ghost"
          color="current"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        />
        <NextLink href="/" passHref>
          <chakra.a display="block" aria-label="Back to homepage">
            <Heading size="md" display="block">
              ft_transcendence
            </Heading>
          </chakra.a>
        </NextLink>
        <Spacer display={{ base: 'none', md: 'flex' }} />
        <HStack spacing={4} alignItems="center">
          <HStack
            as={'nav'}
            spacing={4}
            mr={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
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
          <Flex alignItems="center">
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Link 1</MenuItem>
                <MenuItem>Link 1</MenuItem>
                <MenuDivider />
                <MenuItem>Link 1</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </>
  )
}

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

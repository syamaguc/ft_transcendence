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
  useColorMode,
  useColorModeValue,
  useDisclosure,
  chakra,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons'

import NextLink from 'next/link'

import { GithubIcon } from '@components/icons'

const Links = ['Users', 'Chat', 'Game']

const NavLink = ({ children }: { children: ReactNode }) => (
  <ChakraLink
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.100', 'gray.700'),
    }}
    href={'#'}
  >
    {children}
  </ChakraLink>
)

const HeaderContent = () => {
  const { toggleColorMode: toggleMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bgColor = useColorModeValue('white', 'gray.800')

  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon)

  return (
    <>
      <Flex w='100%' h='100%' px='6' align='center' justify='space-between'>
        <NextLink href='/' passHref>
          <chakra.a display='block' aria-label='Back to homepage'>
            <Heading size='md' display='block'>
              ft_transcendence
            </Heading>
          </chakra.a>
        </NextLink>

        <Flex
          justify='flex-end'
          w='100%'
          align='center'
          color='gray.400'
          maxW='1100px'
        >
          <HStack spacing='4'>
            <HStack
              as='nav'
              spacing='4'
              color='gray.600'
              _dark={{ color: 'whiteAlpha.600' }}
              fontWeight='semibold'
              display={{ base: 'none', md: 'flex' }}
            >
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
            <HStack spacing='4' display={{ base: 'none', md: 'flex' }}>
              <ChakraLink
                isExternal
                aria-label='Go to Github'
                href={'https://github.com/syamaguc/ft_transcendence/'}
              >
                <Icon
                  as={GithubIcon}
                  display='block'
                  transition='color 0.2s'
                  w='5'
                  h='5'
                  _hover={{ color: 'gray.600' }}
                />
              </ChakraLink>
            </HStack>
          </HStack>
          <HStack spacing='5'>
            <IconButton
              size='md'
              fontSize='lg'
              aria-label={`Switch to ${text} mode`}
              variant='ghost'
              color='current'
              ml={{ base: '0', md: '3' }}
              onClick={toggleMode}
              icon={<SwitchIcon />}
            />
            <IconButton
              size='md'
              fontSize='lg'
              aria-label='Open menu'
              variant='ghost'
              color='current'
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            />
            <Flex alignItems='center' display={{ base: 'none', md: 'flex' }}>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded='full'
                  variant='link'
                  cursor='pointer'
                  minW={0}
                >
                  <Avatar
                    size='sm'
                    src='https://cdn.intra.42.fr/users/default.png'
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
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack
            as='nav'
            spacing='4'
            color='gray.600'
            _dark={{ color: 'whiteAlpha.600' }}
            fontWeight='semibold'
          >
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
      <chakra.div height='4.5rem' mx='auto' maxW={maxW} maxWidth={maxWidth}>
        <HeaderContent />
      </chakra.div>
    </chakra.header>
  )
}

export default Header

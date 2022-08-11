import { ReactNode } from 'react'
import {
  Box,
  Heading,
  HTMLChakraProps,
  Flex,
  Avatar,
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
import { useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { SunIcon, MoonIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'

import { GithubIcon } from '@components/icons'

const links = [
  {
    icon: null,
    label: 'Users',
    href: '',
  },
  {
    icon: null,
    label: 'Chat',
    href: '',
  },
  {
    icon: null,
    label: 'Game',
    href: '',
  },
]

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
  const mobileNav = useDisclosure()

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
              {links.map((link) => (
                <NavLink key={link.label}>{link.label}</NavLink>
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
              onClick={mobileNav.isOpen ? mobileNav.onClose : mobileNav.onOpen}
              icon={mobileNav.isOpen ? <CloseIcon /> : <HamburgerIcon />}
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

      {mobileNav.isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack
            as='nav'
            spacing='4'
            color='gray.600'
            _dark={{ color: 'whiteAlpha.600' }}
            fontWeight='semibold'
          >
            {links.map((link) => (
              <NavLink key={link.label}>{link.label}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </>
  )
}

const Header = (props: HTMLChakraProps<'header'>) => {
  const { maxW = '8xl', maxWidth = '8xl' } = props
  const ref = useRef<HTMLHeadingElement>()
  const [y, setY] = useState(0)
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {}

  const { scrollY } = useScroll()
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setY(latest)
    })
  }, [scrollY])

  return (
    <chakra.header
      ref={ref}
      shadow={y > height ? 'sm' : undefined}
      transition='box-shadow 0.2s, background-color 0.2s'
      pos='sticky'
      top='0'
      zIndex='3'
      bg='white'
      _dark={{ bg: 'gray.800' }}
      left='0'
      right='0'
      width='full'
      {...props}
    >
      <chakra.div height='4.5rem' mx='auto' maxW={maxW} maxWidth={maxWidth}>
        <HeaderContent />
      </chakra.div>
    </chakra.header>
  )
}

export default Header

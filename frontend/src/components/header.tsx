import { ReactNode, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
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
  useUpdateEffect,
} from '@chakra-ui/react'
import { useScroll } from 'framer-motion'

import { MobileNavButton, MobileNavContent } from '@components/mobile-nav'
import { Logo } from '@components/logo'

import { SunIcon, MoonIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { GithubIcon } from '@components/icons'

export const mainNavLinks = [
  {
    icon: null,
    label: 'Users',
    href: '/users',
  },
  {
    icon: null,
    label: 'Chat',
    href: '/chat',
  },
  {
    icon: null,
    label: 'Game',
    href: '/game',
  },
]

type NavLinkProps = {
  href: string
  children: ReactNode
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <NextLink href={href} passHref>
    <ChakraLink
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.100', 'gray.700'),
      }}
    >
      {children}
    </ChakraLink>
  </NextLink>
)

const HeaderContent = () => {
  const { toggleColorMode: toggleMode } = useColorMode()
  const mobileNav = useDisclosure()

  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon)

  const mobileNavBtnRef = useRef<HTMLButtonElement>()
  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus()
  }, [mobileNav.isOpen])

  return (
    <>
      <Flex w='100%' h='100%' px='6' align='center' justify='space-between'>
        <NextLink href='/' passHref>
          <chakra.a display='block' aria-label='Back to homepage'>
            <Logo />
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
              {mainNavLinks.map((link) => (
                <NavLink href={link.href} key={link.label}>
                  {link.label}
                </NavLink>
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
            <MobileNavButton
              ref={mobileNavBtnRef}
              aria-label='Open menu'
              onClick={mobileNav.onOpen}
            />
            {/* <IconButton */}
            {/* size='md' */}
            {/* fontSize='lg' */}
            {/* aria-label='Open menu' */}
            {/* variant='ghost' */}
            {/* color='current' */}
            {/* display={{ md: 'none' }} */}
            {/* onClick={mobileNav.isOpen ? mobileNav.onClose : mobileNav.onOpen} */}
            {/* icon={mobileNav.isOpen ? <CloseIcon /> : <HamburgerIcon />} */}
            {/* /> */}
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
                  <NextLink href='/profile' passHref>
                    <MenuItem as='a'>Profile</MenuItem>
                  </NextLink>
                  <MenuItem>Link 1</MenuItem>
                  <MenuDivider />
                  <MenuItem>Link 1</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </HStack>
        </Flex>
      </Flex>
      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
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

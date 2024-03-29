import { forwardRef, ReactNode, Ref, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Box,
  BoxProps,
  Center,
  CloseButton,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  IconButtonProps,
  useColorModeValue,
  useBreakpointValue,
  useUpdateEffect,
  useColorMode,
} from '@chakra-ui/react'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { AiOutlineMenu } from 'react-icons/ai'

import { RemoveScroll } from 'react-remove-scroll'

import { Logo } from '@components/logo'
import { mainNavLinks } from '@components/header'
import { LogoutButton } from '@components/logout'

import useRouteChanged from 'src/lib/use-route-changed'

type NavLinkProps = {
  href: string
  children: ReactNode
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter()
  const bgActiveColor = useColorModeValue('blackAlpha.800', 'whiteAlpha.300')
  const bgActiveHoverColor = useColorModeValue(
    'blackAlpha.900',
    'whiteAlpha.100'
  )
  const bgHoverColor = useColorModeValue('gray.100', 'whiteAlpha.100')

  const isActive = router.asPath.startsWith(href)

  return (
    <GridItem as={NextLink} href={href}>
      <Center
        flex='1'
        minH='40px'
        as='button'
        rounded='md'
        transition='0.2s all'
        fontWeight={isActive ? 'semibold' : 'medium'}
        bg={isActive ? bgActiveColor : undefined}
        borderWidth={isActive ? undefined : '1px'}
        color={isActive ? 'white' : undefined}
        _hover={{
          bg: isActive ? bgActiveHoverColor : bgHoverColor,
        }}
      >
        {children}
      </Center>
    </GridItem>
  )
}

type MobileNavContentProps = {
  isOpen?: boolean
  onClose?: () => void
}

export const MobileNavContent = (props: MobileNavContentProps) => {
  const { isOpen, onClose } = props
  const closeBtnRef = useRef<HTMLButtonElement>()
  const bgColor = useColorModeValue('white', 'gray.800')

  useRouteChanged(onClose)

  const showOnBreakpoint = useBreakpointValue({ base: true, md: false }) // or lg to false

  useEffect(() => {
    if (showOnBreakpoint == false) {
      onClose()
    }
  }, [showOnBreakpoint, onClose])

  useUpdateEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus()
      })
    }
  }, [isOpen])

  const [shadow, setShadow] = useState<string>()

  return (
    <AnimatePresence>
      {isOpen && (
        <RemoveScroll>
          <motion.div
            transition={{ duration: 0.08 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Flex
              direction='column'
              w='100%'
              bg={bgColor}
              h='100vh'
              overflow='auto'
              pos='absolute'
              top='0'
              left='0'
              zIndex={20}
              pb='8'
            >
              <Box>
                <Flex
                  align='center'
                  justify='space-between'
                  px='6'
                  pt='5'
                  pb='4'
                >
                  <Logo />
                  <HStack spacing='5'>
                    <CloseButton ref={closeBtnRef} onClick={onClose} />
                  </HStack>
                </Flex>
                <Grid
                  px='6'
                  pb='6'
                  pt='2'
                  shadow={shadow}
                  templateColumns='repeat(2, 1fr)'
                  gap='2'
                >
                  <NavLink href='/profile' key='Profile'>
                    Profile
                  </NavLink>
                  {mainNavLinks.map((item) => (
                    <NavLink href={item.href} key={item.label}>
                      {item.label}
                    </NavLink>
                  ))}
                </Grid>
              </Box>
              <ScrollView
                onScroll={(scrolled) => {
                  setShadow(scrolled ? 'md' : undefined)
                }}
              >
                <Flex
                  direction='column'
                  alignItems='center'
                  justifyContent='center'
                  gap='4'
                  pt='4'
                >
                  <LogoutButton colorScheme='gray' w='50%' />
                </Flex>
              </ScrollView>
            </Flex>
          </motion.div>
        </RemoveScroll>
      )}
    </AnimatePresence>
  )
}

const ScrollView = (props: BoxProps & { onScroll?: any }) => {
  const { onScroll, ...rest } = props
  const [y, setY] = useState(0)
  const ref = useRef<any>()
  const { scrollY } = useScroll({ container: ref })

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setY(latest)
    })
  }, [scrollY])

  useUpdateEffect(() => {
    onScroll?.(y > 5 ? true : false)
  }, [y])

  return (
    <Box
      ref={ref}
      flex='1'
      id='routes'
      overflow='auto'
      px='6'
      pb='6'
      {...rest}
    />
  )
}

export const MobileNavButton = forwardRef(
  (props: IconButtonProps, ref: Ref<HTMLButtonElement>) => {
    return (
      <IconButton
        ref={ref}
        display={{ base: 'flex', md: 'none' }}
        aria-label='Open menu'
        fontSize='20px'
        color={useColorModeValue('gray.800', 'inherit')}
        variant='ghost'
        icon={<AiOutlineMenu />}
        {...props}
      />
    )
  }
)

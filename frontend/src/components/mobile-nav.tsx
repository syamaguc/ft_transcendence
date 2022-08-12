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
} from '@chakra-ui/react'
import { AnimatePresence, motion, useElementScroll } from 'framer-motion'
import { AiOutlineMenu } from 'react-icons/ai'

import { RemoveScroll } from 'react-remove-scroll'

import useRouteChanged from '@hooks/use-route-changed'

type NavLinkProps = {
  href: string
  children: ReactNode
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter()
  const bgActiveHoverColor = useColorModeValue('gray.100', 'whiteAlpha.100')

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
        bg={isActive ? 'gray.400' : undefined}
        borderWidth={isActive ? undefined : '1px'}
        color={isActive ? 'white' : undefined}
        _hover={{
          bg: isActive ? 'gray.500' : bgActiveHoverColor,
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
  const { pathname, asPath } = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')

  useRouteChanged(onClose)

  const showOnBreakpoint = useBreakpointValue({ base: true, md: false }) // or lg to false

  useEffect(() => {
    if (showOnBreakpoint == false) {
      onClose()
    }
  }, [showOnBreakpoint, onClose])

  const [shadow, setShadow] = useState<string>()

  return (
    <AnimatePresence>
      {isOpen && (
        <RemoveScroll forwardProps>
          <motion.div
            transition={{ duration: 0.08 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Flex></Flex>
          </motion.div>
        </RemoveScroll>
      )}
    </AnimatePresence>
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

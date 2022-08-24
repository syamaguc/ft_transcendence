import {
  ChakraProvider,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react'

import { GetServerSidePropsContext } from 'next'
import { ReactNode } from 'react'
import theme from './theme'

interface ChakraProps {
  cookies?: string
  children: ReactNode
}

const Chakra = ({ children, cookies }: ChakraProps) => {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManagerSSR(cookies)
      : localStorageManager

  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
      {children}
    </ChakraProvider>
  )
}

export default Chakra

export type ServerSideProps<T> = { props: T } | Promise<{ props: T }>

export function getServerSideProps({
  req,
}: GetServerSidePropsContext): ServerSideProps<{ cookies?: string }> {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}

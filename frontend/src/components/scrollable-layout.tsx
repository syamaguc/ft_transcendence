import type { ReactNode } from 'react'
import Head from 'next/head'
import { Box, Flex, Container } from '@chakra-ui/react'

import Header from './header'
import Footer from './footer'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'ft_trans' }: Props) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <Header />
    <Box as='main' w='full' maxW='8xl' mx='auto'>
      <Box maxW='8xl' mx='auto' minH='76vh'>
        {children}
      </Box>
    </Box>
  </>
)

export default Layout

Layout.defaultProps = {
  title: 'ft_trans',
}

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
    <Box bg='red.100' as='main' w='full' maxW='8xl' mx='auto'>
      <Box bg='blue.100' maxW='8xl' mx='auto' minH='76vh'>
        {children}
        <Box pb='20'>
          <Footer />
        </Box>
      </Box>
    </Box>
  </>
)

export default Layout

Layout.defaultProps = {
  title: 'ft_trans',
}

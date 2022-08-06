import type { ReactNode } from 'react'
import Head from 'next/head'
import { Box, Container } from '@chakra-ui/react'

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
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Container maxWidth="800px">
      <Header />
      <Box as="main">{children}</Box>
      <Footer />
    </Container>
  </>
)

export default Layout

Layout.defaultProps = {
  title: 'ft_trans',
}

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import Header from './header'
import Footer from './footer'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'ft_trans' }: Props) => (
  <Box margin="0 auto" maxWidth="800">
    <Box margin="8">
      <Header />
      <Box as="main" my="22">
        {children}
      </Box>
      <Footer />
    </Box>
  </Box>
)

export default Layout

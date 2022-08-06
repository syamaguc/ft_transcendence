import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Chakra from '../chakra'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Chakra cookies={pageProps.cookies}>
      <Component {...pageProps} />
    </Chakra>
  )
}

export default MyApp

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Chakra from '../chakra'
import { SWRConfig } from 'swr'
import fetchJson from 'src/lib/fetch-json'

import { Box, Spinner } from '@chakra-ui/react'

import { useUser } from 'src/lib/use-user'

function MyApp({ Component, pageProps }) {
  // TODO
  // https://stackoverflow.com/questions/70297964/next-js-how-to-prevent-flash-of-the-unauthorized-route-page-prior-to-redirect-w
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta content='IE=edge' httpEquiv='X-UA-Compatible' />
        <meta content='width=device-width, initial-scale=1' name='viewport' />
      </Head>
      <Chakra cookies={pageProps.cookies}>
        <SWRConfig
          value={{
            fetcher: fetchJson,
            onError: (err) => {
              console.log('Error caught on global swr fetcher')
              console.error(err)
            },
          }}
        >
          {Component.displayName === 'Login' ? (
            <Component {...pageProps} />
          ) : (
            <Auth>
              <Component {...pageProps} />
            </Auth>
          )}
        </SWRConfig>
      </Chakra>
    </>
  )
}

function Auth({ children }) {
  const { status } = useUser({ redirectTo: '/login' })

  if (status === 'loading') {
    return (
      <Box w='100%' h='100vh'>
        <Box
          w='full'
          h='full'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Spinner />
        </Box>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return <div>Unauthenticated</div>
  }

  return children
}

export default MyApp

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Chakra from '../chakra'
import { SWRConfig } from 'swr'
import fetchJson from 'src/lib/fetch-json'

function MyApp({ Component, pageProps }: AppProps) {
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
              if (err.response?.status === 401) {
                return
              }

              console.error(err)
            },
          }}
        >
          <Component {...pageProps} />
        </SWRConfig>
      </Chakra>
    </>
  )
}

export default MyApp

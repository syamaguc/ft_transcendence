import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head />
        <body>
          {/* Make Color mode to persist when you refresh page*/}
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'
import theme from '../theme'

class MyDocument extends Document {
  static getInitialProps(ctx: DocumentContext) {
    return Document.getInitialProps(ctx)
  }

  render() {
    return (
      <Html lang="ja">
        <Head />
        <body>
          {/* Make Color mode to persist when you refresh page*/}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

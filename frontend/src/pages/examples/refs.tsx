import React, { useRef, forwardRef, Ref } from 'react'
import Layout from '@components/layout'
import { Box, Circle, Button, Input } from '@chakra-ui/react'

interface AppState {}
interface AppProps {}

class Test1 extends React.Component<AppProps, AppState> {
  private myRef: React.RefObject<HTMLInputElement>

  constructor(props: AppProps) {
    super(props)
    this.myRef = React.createRef()
  }

  render() {
    return (
      <Box>
        <Button
          onClick={() => {
            console.log(this.myRef.current)
            this.myRef.current.focus()
          }}
        >
          button
        </Button>
        <Button
          onClick={() => {
            this.myRef.current.blur()
          }}
        >
          button
        </Button>
        <Button
          onClick={() => {
            this.myRef.current.value = 'filled'
          }}
        >
          button
        </Button>
        <Input ref={this.myRef} />
      </Box>
    )
  }
}

const Test2 = () => {
  const ref = useRef<HTMLInputElement>()

  return (
    <Box>
      <Button
        onClick={() => {
          ref.current?.focus()
        }}
      >
        button
      </Button>
      <Input ref={ref} />
    </Box>
  )
}

const Test3 = () => {
  const ref = useRef<HTMLInputElement>()

  return (
    <Box>
      <Button
        onClick={() => {
          console.log(ref.current.value)
        }}
      >
        fill
      </Button>
      <ChildComponent ref={ref} />
    </Box>
  )
}

const ChildComponent = forwardRef((_props, ref: Ref<HTMLInputElement>) => {
  return (
    <Box>
      <Input ref={ref} />
    </Box>
  )
})

function Example() {
  return (
    <Layout>
      <Box mx='16'>
        <Test1 />
        <Test2 />
        <Test3 />
      </Box>
    </Layout>
  )
}

export default Example

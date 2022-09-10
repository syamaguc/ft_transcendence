import { Flex, Input, Button } from '@chakra-ui/layout'
import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'
// import { State } from '@hookstate/core'

type Props = {
  inputText: string
  setInputText: (input: string) => void
  socket: Socket
}

const BottomBar = ({ inputText, setInputText, socket }) => {
  // const [inputText, setInputText] = useState('')

  const onClickSubmit = useCallback(() => {
    const message = {
      user: 'tmp_user',
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText])

  // const onClickJoin = () => {
  //   console.log('')
  //   socket.emit()
  // }

  const inputBody = () => {
    return (
      <>
        <Input
          type='text'
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value)
          }}
        />
        <Button ml={3} px={6} onClick={onClickSubmit} type='submit'>
          Send
        </Button>
      </>
    )
  }

  const joinBody = () => {
    return (
      <>
        <Button>
          join
        </Button>
      </>
    )
  }

  return (
    <Flex p={4}>
      {/* <inputBody/> */}
      <joinBody/>
    </Flex>
  )
}

export default BottomBar

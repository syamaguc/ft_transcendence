import { Flex } from '@chakra-ui/layout'
import { Button, Input } from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'
// import { State } from '@hookstate/core'

type Props = {
  inputText: string
  setInputText: (input: string) => void
  socket: Socket
}

const DMBottomBar = ({ inputText, setInputText, socket }) => {
  const onClickSubmit = useCallback(() => {
    const message = {
      message: inputText,
      timestamp: new Date(),
    }
    console.log('send : ', message)
    socket.emit('addMessage', message)
    setInputText('')
  }, [inputText])

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

export default DMBottomBar

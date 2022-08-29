import {
  Input,
  Stack,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const ChatCreationForm = ({ socket }: Props) => {
  const channelNameInputRef = useRef<HTMLInputElement>()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('onClickCreate called')
    socket.emit('createRoom', channelNameInputRef.current.value)
  }

  return (
    <form onSubmit={onClickCreate}>
      <Input type='text' ref={channelNameInputRef} />
      <RadioGroup defaultValue='2'>
        <Stack spacing={5} direction='row'>
          <Radio colorScheme='blue' value='1'>
            public
          </Radio>
          <Radio colorScheme='blue' value='2'>
            private
          </Radio>
        </Stack>
      </RadioGroup>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type='password' />
        <FormHelperText>Please enter your password</FormHelperText>
      </FormControl>
      <Button type='submit'>Create New Channel</Button>
    </form>
  )
}

export default ChatCreationForm

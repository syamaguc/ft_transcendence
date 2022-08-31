import {
  Input,
  Stack,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  useBoolean,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
  socket: Socket
}

const ChatCreationForm = ({ socket }: Props) => {
  const [hideFlag, setHideFlag] = useBoolean()

  const channelNameInputRef = useRef<HTMLInputElement>()
  const isPrivateInputRef = useRef<HTMLInputElement>()
  const passwordInputRef = useRef<HTMLInputElement>()

  const onClickCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const enteredChannelName = channelNameInputRef.current.value
    const enteredIsPrivate = isPrivateInputRef.current.checked
    let enteredPassword = ''
    if (enteredIsPrivate == true) {
      enteredPassword = passwordInputRef.current.value
    }
    console.log('onClickCreate called', enteredIsPrivate, enteredPassword)

    socket.emit('createRoom', enteredChannelName)
  }

  return (
    <form onSubmit={onClickCreate}>
      <Input type='text' ref={channelNameInputRef} />
      <FormControl display='flex' alignItems='center'>
        <FormLabel htmlFor='is_private' mb='0'>
          Private Channel
        </FormLabel>
        <Switch
          id='is_private'
          ref={isPrivateInputRef}
          onChange={setHideFlag.toggle}
        />
      </FormControl>
      {hideFlag ? (
        <FormControl>
          <FormLabel htmlFor='password'>Password</FormLabel>
          <Input type='password' id='password' ref={passwordInputRef} />
          <FormHelperText>Please enter your password</FormHelperText>
        </FormControl>
      ) : null}
      <Button type='submit'>Create New Channel</Button>
    </form>
  )
}

export default ChatCreationForm

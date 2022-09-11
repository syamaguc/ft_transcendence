import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
} from '@chakra-ui/react'
import * as React from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'

type PasswordFieldProps = {
  isInvalid: boolean
  errorMessage: string
}

const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps & InputProps
>((props, ref) => {
  const { isOpen, onToggle } = useDisclosure()
  const inputRef = React.useRef<HTMLInputElement>()

  const mergeRef = useMergeRefs(inputRef, ref)
  const onClickReveal = () => {
    onToggle()
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }

  return (
    <FormControl isInvalid={props.isInvalid}>
      <FormLabel htmlFor='password'>Password</FormLabel>
      <InputGroup>
        <Input
          ref={mergeRef}
          id='password'
          name='password'
          type={isOpen ? 'text' : 'password'}
          autoComplete='current-password'
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
        />
        <InputRightElement>
          <IconButton
            variant='link'
            aria-label={isOpen ? 'Mask password' : 'Reveal password'}
            icon={isOpen ? <HiEyeOff /> : <HiEye />}
            onClick={onClickReveal}
          />
        </InputRightElement>
      </InputGroup>
      <FormHelperText>{`おすすめ："Test123!"`}</FormHelperText>
      <FormErrorMessage>{props.errorMessage}</FormErrorMessage>
    </FormControl>
  )
})

export default PasswordField

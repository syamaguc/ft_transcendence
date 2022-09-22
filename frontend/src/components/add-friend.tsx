import {
  Button,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'

import { useFormik, FormikErrors } from 'formik'
import { User } from 'src/types/user'
import { useFriends } from 'src/lib/use-friends'
import { API_URL } from 'src/constants'
type AddFriendProps = {
  user: User
}

function AddFriend({ user }: AddFriendProps) {
  const { mutateFriends } = useFriends()
  const toast = useToast()

  const initialValues = {
    username: '',
  }

  const validate = (values: { username: string }) => {
    const errors: FormikErrors<{ username: string }> = {}
    return errors
  }

  const formik = useFormik<{ username: string }>({
    initialValues,
    validate,
    onSubmit: async (values, actions) => {
      let message: string
      let status: 'success' | 'info' | 'error' = 'error'

      await new Promise((resolve) => setTimeout(resolve, 500))

      const res = await fetch(
        `${API_URL}/api/user/userInfo?username=${values.username}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        message = 'Username not found'
        formik.errors.username = message
      } else if (res.ok) {
        const username = data.username
        const userId = data.userId
        if (username === user.username) {
          message = 'You cannot add yourself as friends'
          formik.errors.username = message
        } else if (user.friends.indexOf(userId) > -1) {
          message = 'Already friends with that user'
          formik.errors.username = message
        } else {
          const res = await fetch(`${API_URL}/api/user/addFriend`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
          })
          if (!res.ok) {
            if (res.status === 403) {
              message = "You've reached maximum number of friends"
            } else {
              message = 'Could not add friend'
            }
          } else if (res.ok) {
            message = 'Friend added'
            status = 'info'
            await mutateFriends()
            formik.setFieldValue('username', '')
          }
        }
      }

      toast({
        description: message,
        variant: 'subtle',
        status: status,
        duration: 5000,
        isClosable: true,
      })
      actions.setSubmitting(false)
    },
  })

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Stack>
          <FormControl
            isInvalid={formik.errors.username && formik.touched.username}
          >
            <Stack spacing='2'>
              <Heading as='h2' fontSize='lg'>
                ADD FRIEND
              </Heading>
              <Text fontSize='sm' colorScheme='gray'>
                {`You can add a friend with their username. It's cAsE sEnSitIvE`}
              </Text>
              <FormHelperText fontSize='sm'></FormHelperText>
              <InputGroup size='lg'>
                <Input
                  name='username'
                  type='text'
                  pr='4.5rem'
                  placeholder='Enter a username'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                <InputRightElement width='4.5rem'>
                  <Button
                    h='2rem'
                    px='4'
                    size='md'
                    colorScheme='blackAlpha'
                    bg='blackAlpha.900'
                    _dark={{
                      bg: 'whiteAlpha.900',
                      _hover: { bg: 'whiteAlpha.600' },
                    }}
                    type='submit'
                    isDisabled={!formik.values.username ? true : false}
                    isLoading={formik.isSubmitting}
                  >
                    Add
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Stack>
            <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
          </FormControl>
        </Stack>
      </form>
    </>
  )
}

export default AddFriend

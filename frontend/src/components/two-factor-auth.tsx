import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import ChakraNextImage from 'src/components/chakra-next-image'
import { AuthCard } from '@components/auth'

import { useFormik, FormikErrors } from 'formik'
import useSWR from 'swr'

import { fetchText } from 'src/lib/fetchers'
import { setDidTwoFactorAuth } from 'src/lib/session'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

export function TwoFactorAuthForm() {
  const { mutateUser } = useUser()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { data } = useSWR(`${API_URL}/api/auth/2fa`, fetchText)

  const htmlText = data?.text
  let qrCodeUrl: string = null
  if (htmlText) {
    const re = /https:\/\/chart\.googleapis\.com[^']*/
    const match = htmlText.match(re)
    if (match[0]) {
      qrCodeUrl = match[0]
    }
  }

  const validate = (values: { code: string }) => {
    const errors: FormikErrors<{ code: string }> = {}
    if (!values.code) {
      errors.code = 'Required'
    }
  }

  const formik = useFormik<{ code: string }>({
    initialValues: {
      code: '',
    },
    validate,
    onSubmit: async (values, actions) => {
      const res = await fetch(`${API_URL}/api/auth/2fa/${values.code}`, {
        method: 'POST',
        credentials: 'include',
      })

      const body = await res.text()
      if (body === 'True') {
        await setDidTwoFactorAuth(true)
        await mutateUser()
        toast({
          description: 'Successfully enabled 2FA',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        actions.setSubmitting(false)
        return
      }
      toast({
        description: 'Failed to provide identification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      actions.setSubmitting(false)
    },
  })

  const handleBack = async () => {
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (res.ok) {
        await mutateUser()
      } else {
        toast({
          description: 'Internal error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.log(err)
      toast({
        description: 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    setIsLoading(false)
  }

  return (
    <>
      <AuthCard title='Two-factor Auth'>
        <form id='form-2fa' onSubmit={formik.handleSubmit}>
          <Stack spacing='6'>
            <Text>
              Open the Google Authenticator app and scan this QR code.
            </Text>
            <Stack spacing='5' align='center'>
              {qrCodeUrl && (
                <ChakraNextImage src={qrCodeUrl} width='300px' height='300px' />
              )}
              {!qrCodeUrl && <Text>{htmlText}</Text>}
              <FormControl
                mt={4}
                isInvalid={
                  formik.errors.code && formik.touched.code ? true : false
                }
              >
                <FormLabel htmlFor='code' fontSize='xs' color='gray.400'>
                  CODE
                </FormLabel>
                <Input
                  name='code'
                  type='text'
                  placeholder='Enter code'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.code}
                />
                <FormErrorMessage>
                  {formik.errors.code ? `${formik.errors.code}` : null}
                </FormErrorMessage>
              </FormControl>
            </Stack>
            <Button
              colorScheme='blackAlpha'
              bg='blackAlpha.900'
              _dark={{ bg: 'whiteAlpha.900', _hover: { bg: 'whiteAlpha.600' } }}
              type='submit'
              form='form-2fa'
              isLoading={formik.isSubmitting}
            >
              Send
            </Button>
          </Stack>
        </form>
      </AuthCard>
      <Button onClick={handleBack} isLoading={isLoading}>
        Back
      </Button>
    </>
  )
}

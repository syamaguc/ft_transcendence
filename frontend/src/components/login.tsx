import { useState, ReactNode } from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { FormikErrors, useFormik } from 'formik'
import * as Yup from 'yup'

import { AuthCard } from '@components/auth'
import PasswordField from '@components/password-field'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'
import { setIsFirstTime } from 'src/lib/session'

interface FormValues {
  username: string
  password: string
}

export function LoginForm() {
  const { mutateUser } = useUser()
  const toast = useToast()

  const loginFormSchema = Yup.object({
    username: Yup.string()
      .required('Username is equired')
      .max(15, 'Must be 15 characters or less')
      .min(3, 'Must be 3 characters minimum'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Must be 8 characters minimum')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_\(\)\-\[\]\~\.\`\;\:])/,
        'Must contain uppercase, lowercase, number and symbol chracter'
      ),
  })

  const validate = (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {}
    if (!values.username) {
      errors.username = 'Required'
    } else if (values.username.length < 3) {
      errors.username = 'Must be 3 chracters minimum'
    } else if (values.username.length > 15) {
      errors.username = 'Must be 15 characters or less'
    }

    if (!values.password) {
      errors.password = 'Required'
    }

    return errors
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validate,
    onSubmit: async (values, actions) => {
      try {
        const res = await fetch(`${API_URL}/api/user/signin`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
          }),
        })

        await new Promise((resolve) => setTimeout(resolve, 500))

        const data = await res.json()

        if (res.ok) {
          await setIsFirstTime(false)
          await mutateUser()
          actions.setSubmitting(false)
        } else {
          if (res.status === 401 && typeof data.message === 'string') {
            toast({
              description: data.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          } else {
            toast({
              description: 'Internal error occurred',
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
        }
      } catch (err) {
        toast({
          description: 'Internal error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
  })

  return (
    <>
      <AuthCard title='Login'>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing='6'>
            <Stack spacing='5'>
              <FormControl
                isInvalid={formik.errors.username && formik.touched.username}
              >
                <FormLabel htmlFor='username'>Username</FormLabel>
                <Input
                  name='username'
                  type='username'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
              </FormControl>
              <PasswordField
                isInvalid={formik.errors.password && formik.touched.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                errorMessage={formik.errors.password}
              />
            </Stack>
            <Button
              colorScheme='blackAlpha'
              bg='blackAlpha.900'
              _dark={{ bg: 'whiteAlpha.900', _hover: { bg: 'whiteAlpha.600' } }}
              type='submit'
              isLoading={formik.isSubmitting}
            >
              Login
            </Button>
          </Stack>
        </form>
      </AuthCard>
    </>
  )
}

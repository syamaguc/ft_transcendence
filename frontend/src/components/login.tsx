import { useState, ReactNode } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Fade,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
  Stack,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { FormikErrors, useFormik } from 'formik'
import * as Yup from 'yup'

import { AuthCard } from '@components/auth'
import PasswordField from '@components/password-field'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

interface FormValues {
  username: string
  password: string
}

export function LoginForm() {
  const { mutateUser } = useUser()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const loginFormSchema = Yup.object({
    username: Yup.string()
      .required('Username is equired')
      .max(15, 'Must be 15 characters or less')
      .min(3, 'Must be 3 characters minimum'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Must be 8 characters minimum')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
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
    } else if (values.password.length < 8) {
      errors.password = 'Must be 8 characters minimum'
    } else if (values.password.length > 30) {
      errors.password = 'Must be 30 characters or less'
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/.test(
        values.password
      )
    ) {
      errors.password =
        'Must contain uppercase, lowercase, number and symbol chracter'
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
      setShowAlert(false)

      try {
        let res = await fetch(`${API_URL}/api/user/signin`, {
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

        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { accessToken } = await res.json()

        if (!res.ok) {
          if (res.status === 401) {
            setAlertMessage('Incorrect username or password')
            setShowAlert(true)
          } else {
            setAlertMessage('Unable to login')
            setShowAlert(true)
          }
        }

        console.log(accessToken)
      } catch (err) {
        setAlertMessage('Unable to login')
        setShowAlert(true)
      }

      mutateUser()
      actions.setSubmitting(false)
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
              colorScheme='blue'
              type='submit'
              isLoading={formik.isSubmitting}
            >
              Login
            </Button>
          </Stack>
        </form>
        {showAlert && (
          <Fade in={showAlert}>
            <Alert status='error'>
              <AlertIcon />
              {alertMessage}
            </Alert>
          </Fade>
        )}
      </AuthCard>
    </>
  )
}

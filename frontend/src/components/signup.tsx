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
  email: string
  password: string
}

export function SignupForm() {
  const { mutateUser } = useUser()
  const toast = useToast()

  const signupFormSchema = Yup.object({
    username: Yup.string()
      .required('Username is equired')
      .max(15, 'Must be 15 characters or less')
      .min(3, 'Must be 3 characters minimum'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
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

    if (!values.email) {
      errors.email = 'Required'
    } else if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i.test(values.email)
    ) {
      errors.email = 'Invalid email address'
    }

    if (!values.password) {
      errors.password = 'Required'
    } else if (values.password.length < 8) {
      errors.password = 'Must be 8 characters minimum'
    } else if (values.password.length > 30) {
      errors.password = 'Must be 30 characters or less'
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_\(\)\-\[\]\~\.\`\;\:])/.test(
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
      email: '',
      password: '',
    },
    validate,
    onSubmit: async (values, actions) => {
      try {
        const res = await fetch(`${API_URL}/api/user/signup`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
            passwordConfirm: values.password,
          }),
        })

        await new Promise((resolve) => setTimeout(resolve, 500))

        const data = await res.json()

        if (res.ok) {
          console.log('data: ', data)
          await setIsFirstTime(true)
          await mutateUser()
          actions.setSubmitting(false)
        } else {
          if (res.status === 409 && typeof data.message === 'string') {
            toast({
              description: data.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          } else if (res.status === 400 && typeof data.message === 'object') {
            data.message.forEach((m: string) => {
              toast({
                description: m,
                status: 'error',
                duration: 5000,
                isClosable: true,
              })
            })
          } else {
            toast({
              description: 'Invalid inputs',
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
        }
      } catch (err) {
        console.log(err)
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
    <AuthCard title='Signup'>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing='6'>
          <Stack spacing='5'>
            <FormControl
              isInvalid={formik.errors.username && formik.touched.username}
            >
              <FormLabel>username</FormLabel>
              <Input
                name='username'
                type='text'
                onChange={(e) => {
                  formik.handleChange(e)
                  formik.values.email =
                    e.target.value + (e.target.value ? '@example.com' : '')
                }}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
            </FormControl>
            <FormControl
              isInvalid={formik.errors.email && formik.touched.email}
            >
              <FormLabel>email</FormLabel>
              <Input
                name='email'
                type='email'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
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
            Sign up
          </Button>
        </Stack>
      </form>
    </AuthCard>
  )
}

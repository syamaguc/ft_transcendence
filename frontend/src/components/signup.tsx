import { ReactNode } from 'react'
import {
  Box,
  Button,
  Container,
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

import PasswordField from '@components/password-field'
import { useUser } from 'src/lib/use-user'

const API_URL = 'http://localhost:3000'

type AuthFormProps = {
  children?: ReactNode
  title: string
}

function AuthForm({ children, title = '' }: AuthFormProps) {
  return (
    <Container
      maxW='lg'
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing='8'>
        <Stack spacing='6'>
          <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={useBreakpointValue({ base: 'xs', md: 'xl' })}>
              {title}
            </Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useBreakpointValue({
            base: 'transparent',
            sm: 'inherit',
          })}
          boxShadow={{
            base: 'none',
            sm: useColorModeValue('base', 'md-dark'),
          }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing='6'>{children}</Stack>
        </Box>
      </Stack>
    </Container>
  )
}

interface FormValues {
  username: string
  email: string
  password: string
}

export function SignupForm() {
  const { mutateUser } = useUser()

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
      email: '',
      password: '',
    },
    validate,
    onSubmit: async (values, actions) => {
      let res = await fetch(`${API_URL}/api/user/signup`, {
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

      const { accessToken } = await res.json()

      console.log('accessToken: ', accessToken)

      mutateUser()

      await new Promise((resolve) => setTimeout(resolve, 1000))

      actions.setSubmitting(false)
    },
  })

  return (
    <AuthForm title='signup'>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing='6'>
          <Stack spacing='5'>
            <FormControl
              isInvalid={formik.errors.username && formik.touched.username}
            >
              <FormLabel>username</FormLabel>
              <Input
                id='username'
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
                id='email'
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
            colorScheme='blue'
            type='submit'
            isLoading={formik.isSubmitting}
          >
            Sign up
          </Button>
        </Stack>
      </form>
    </AuthForm>
  )
}

import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react'
import { sign } from 'crypto'

import {
  Formik,
  Field,
  Form,
  ErrorMessage,
  FormikErrors,
  FieldHookConfig,
  useFormik,
  useField,
} from 'formik'

import { object, string, boolean, number, date, InferType } from 'yup'

let signupFormSchema = object({
  firstName: string().max(15).required(),
  lastName: string().max(15).required(),
  email: string().email().required(),
})

interface FormValues {
  firstName: string
  lastName: string
  email: string
}

function SignupForm() {
  const validate = (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {}
    if (!values.firstName) {
      errors.firstName = 'Required'
    } else if (values.firstName.length > 15) {
      errors.firstName = 'Must be 15 characters or less'
    }
    if (!values.lastName) {
      errors.lastName = 'Required'
    } else if (values.firstName.length > 15) {
      errors.lastName = 'Must be 15 characters or less'
    }
    if (!values.email) {
      errors.email = 'required'
    } else if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i.test(values.email)
    ) {
      errors.email = 'invalid email address'
    }
    return errors
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    validationSchema: signupFormSchema,
    onSubmit: (values) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
      }, 1000)
    },
  })

  return (
    <Box
      bg='gray.100'
      display='flex'
      alignItems='center'
      justifyContent='center'
      p='4'
      m='4'
    >
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor='firstName'>First Name</label>
        <input
          id='firstName'
          name='firstName'
          type='text'
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.firstName}
        />
        {formik.touched.firstName && formik.errors.firstName ? (
          <div>{formik.errors.firstName}</div>
        ) : null}
        <label htmlFor='lastName'>Last Name</label>
        <input
          id='lastName'
          name='lastName'
          type='text'
          {...formik.getFieldProps('lastName')}
        />
        {formik.touched.lastName && formik.errors.lastName ? (
          <div>{formik.errors.lastName}</div>
        ) : null}
        <label htmlFor='email'>Email Address</label>
        <input
          id='email'
          name='email'
          type='email'
          {...formik.getFieldProps('email')}
        />
        {formik.touched.email && formik.errors.email ? (
          <div>{formik.errors.email}</div>
        ) : null}
        <button type='submit'>Submit</button>
      </form>
    </Box>
  )
}

function SignupForm2() {
  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    validationSchema: signupFormSchema,
    onSubmit: (values) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
      }, 1000)
    },
  })

  return (
    <Box
      bg='gray.100'
      display='flex'
      alignItems='center'
      justifyContent='center'
      p='4'
      m='4'
    >
      <Formik
        initialValues={{ firstName: '', lastName: '', email: '' }}
        validationSchema={signupFormSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
            actions.setSubmitting(false)
          }, 1000)
        }}
      >
        <Form>
          <label htmlFor='firstName'>First Name</label>
          <Field name='firstName' type='text' />
          <ErrorMessage name='firstName' />
          <label htmlFor='lastName'>Last Name</label>
          <Field name='lastName' type='text' />
          <ErrorMessage name='lastName' />
          <label htmlFor='email'>Email Address</label>
          <Field name='email' type='email' />
          <ErrorMessage name='email' />

          <button type='submit'>Submit</button>
        </Form>
      </Formik>
    </Box>
  )
}

// 3
const MyTextInput = (props: { label: string } & FieldHookConfig<string>) => {
  const [field, meta] = useField(props)
  return (
    <>
      <label htmlFor={props.id || props.name}>{props.label}</label>
      <input className='text-input' {...field} />
      {meta.touched && meta.error ? (
        <div className='error'>{meta.error}</div>
      ) : null}
    </>
  )
}

const MyCheckbox = ({ children, ...props }: FieldHookConfig<string>) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' })
  return (
    <>
      <label className='checkbox-input'>
        <input type='checkbox' {...field} />
        {children}
      </label>
      {meta.touched && meta.error ? (
        <div className='error'>{meta.error}</div>
      ) : null}
    </>
  )
}

const MySelect = (props: { label: string } & FieldHookConfig<string>) => {
  const [field, meta] = useField(props)
  return (
    <div>
      <label htmlFor={props.id || props.name}>{props.label}</label>
      <select {...field} />
      {meta.touched && meta.error ? (
        <div className='error'>{meta.error}</div>
      ) : null}
    </div>
  )
}

const SignupForm3 = () => {
  return (
    <>
      <h1>Subscribe!</h1>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          acceptedTerms: false, // added for our checkbox
          jobType: '', // added for our select
        }}
        validationSchema={object({
          firstName: string()
            .max(15, 'Must be 15 characters or less')
            .required('Required'),
          lastName: string()
            .max(20, 'Must be 20 characters or less')
            .required('Required'),
          email: string().email('Invalid email address').required('Required'),
          acceptedTerms: boolean()
            .required('Required')
            .oneOf([true], 'You must accept the terms and conditions.'),
          jobType: string()
            .oneOf(
              ['designer', 'development', 'product', 'other'],
              'Invalid Job Type'
            )
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
            setSubmitting(false)
          }, 400)
        }}
      >
        <Form>
          <MyTextInput
            label='First Name'
            name='firstName'
            type='text'
            placeholder='Jane'
          />

          <MyTextInput
            label='Last Name'
            name='lastName'
            type='text'
            placeholder='Doe'
          />

          <MyTextInput
            label='Email Address'
            name='email'
            type='email'
            placeholder='jane@formik.com'
          />

          <MySelect label='Job Type' name='jobType'>
            <option value=''>Select a job type</option>
            <option value='designer'>Designer</option>
            <option value='development'>Developer</option>
            <option value='product'>Product Manager</option>
            <option value='other'>Other</option>
          </MySelect>

          <MyCheckbox name='acceptedTerms'>
            I accept the terms and conditions
          </MyCheckbox>

          <button type='submit'>Submit</button>
        </Form>
      </Formik>
    </>
  )
}

interface MyFormValues {
  username: string
  email: string
  password: string
}

function FormikTest() {
  const initialValues: MyFormValues = { username: '', email: '', password: '' }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: any = {}
          if (!values.username) {
            errors.username = 'Required'
          }
          if (!values.email) {
            errors.email = 'Required'
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
          ) {
            errors.email = 'Invalid email address'
          }
          return errors
        }}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
            actions.setSubmitting(false)
          }, 1000)
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <input
              type='username'
              name='username'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {errors.username && touched.username && errors.username}
            <input
              type='email'
              name='email'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {errors.email && touched.email && errors.email}
            <input
              type='password'
              name='password'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            {errors.password && touched.password && errors.password}
            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting' : 'Submit'}
            </button>
          </form>
        )}
      </Formik>
    </>
  )
}

function Example() {
  return (
    <>
      <FormikTest />
      <SignupForm />
    </>
  )
}

export default Example

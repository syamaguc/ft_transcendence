import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { FiFile } from 'react-icons/fi'

import Layout from '@components/layout'

import { User } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

import { useFormik, FormikErrors } from 'formik'

import PasswordField from '@components/password-field'

interface AvatarFormValues {
  file: File
}

type ThumbnailProps = {
  user: User
  file: File
}

function Preview({ user, file }: ThumbnailProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<string>()

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setData(reader.result as string)
    }
    setLoading(false)
  }, [file])

  return (
    <>
      <Avatar
        w='20'
        h='20'
        src={
          file && !loading
            ? data
            : `${API_URL}/api/user/avatar/${user.profile_picture}`
        }
      />
    </>
  )
}

type AvatarFormProps = {
  isOpen?: boolean
  onClose?: () => void
}

const AvatarForm = forwardRef<HTMLElement, AvatarFormProps>((props, ref) => {
  const { user, mutateUser } = useUser()
  const { isOpen, onClose } = props

  const validate = (valies: AvatarFormValues) => {
    const errors: FormikErrors<AvatarFormValues> = {}
    // File too big
    // not png or jpeg
    return errors
  }

  const formik = useFormik<AvatarFormValues>({
    initialValues: {
      file: null,
    },
    validate: validate,
    onSubmit: async (values, actions) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(
        JSON.stringify(
          {
            fileName: values.file.name,
            type: values.file.type,
            size: `${values.file.size} bytes`,
          },
          null,
          2
        )
      )

      const body = new FormData()
      body.append('file', values.file)

      const res = await fetch(`${API_URL}/api/user/upload/avatar`, {
        method: 'POST',
        credentials: 'include',
        body,
      })

      console.log(res)
      console.log(res.body)

      await mutateUser()
      actions.setSubmitting(false)
    },
  })

  const onCloseComplete = () => {
    formik.values.file = null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} onCloseComplete={onCloseComplete}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>Upload Avatar</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='file' fontSize='xs' color='gray.400'>
                AVATAR
              </FormLabel>
              <Preview user={user} file={formik.values.file} />
              <Input
                name='file'
                type='file'
                accept='image/*'
                onChange={(e) => {
                  formik.setFieldValue(
                    'file',
                    e.currentTarget.files ? e.currentTarget.files[0] : null
                  )
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='blue'
              type='submit'
              isLoading={formik.isSubmitting}
              mr={3}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
})

interface BasicInfoFormValues {
  username: string
  email: string
  password: string
}

function BasicInfoForm() {
  const { user, mutateUser } = useUser()
  const toast = useToast()
  const modal = useDisclosure()
  const [modalField, setModalField] = useState('')

  const initialValues: BasicInfoFormValues = {
    username: user.username,
    email: user.email,
    password: '',
  }

  const validate = (values: BasicInfoFormValues) => {
    const errors: FormikErrors<BasicInfoFormValues> = {}
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

  const formik = useFormik<BasicInfoFormValues>({
    initialValues,
    validate,
    onSubmit: async (values, actions) => {
      console.log('submit called')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(JSON.stringify(values, null, 2))

      try {
        const res = await fetch(`${API_URL}/api/user/settings`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
          }),
        })

        if (res.ok) {
          toast({
            description: 'Successfully updated your info.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        } else {
          const data = await res.json()
          toast({
            description: data.message
              ? data.message[0]
              : 'Internal error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
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

      await mutateUser()
      actions.setSubmitting(false)
      modal.onClose()
    },
  })

  const modalOnOpen = (field: string) => {
    setModalField(field)
    modal.onOpen()
  }

  const modalOnCloseComplete = () => {
    formik.setFieldValue('username', initialValues.username)
    formik.setFieldValue('email', initialValues.email)
    formik.setFieldValue('password', initialValues.password)
    setModalField('')
  }

  return (
    <form id='form-basic-info' onSubmit={formik.handleSubmit}>
      <Stack spacing='6'>
        <FormControl>
          <FormLabel fontSize='xs' color='gray.400'>
            USERNAME
          </FormLabel>
          <Stack direction='row' spacing='4' align='center'>
            <Input
              name='readonly-username'
              type='text'
              isReadOnly={true}
              value={user.username}
            />
            <Button size='sm' onClick={() => modalOnOpen('username')}>
              Edit
            </Button>
          </Stack>
        </FormControl>
        <FormControl>
          <FormLabel fontSize='xs' color='gray.400'>
            EMAIL
          </FormLabel>
          <Stack direction='row' spacing='4' align='center'>
            <Input
              name='readonly-email'
              type='email'
              isReadOnly={true}
              value={user.email}
            />
            <Button size='sm' onClick={() => modalOnOpen('email')}>
              Edit
            </Button>
          </Stack>
        </FormControl>
        <Modal
          isOpen={modal.isOpen}
          onClose={modal.onClose}
          onCloseComplete={modalOnCloseComplete}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Change your username</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing='6'>
                {modalField === 'username' && (
                  <>
                    <Text>
                      Enter a new username and your existing password.
                    </Text>
                    <FormControl
                      isInvalid={
                        formik.errors.username && formik.touched.username
                      }
                    >
                      <FormLabel
                        htmlFor='username'
                        fontSize='xs'
                        color='gray.400'
                      >
                        USERNAME
                      </FormLabel>
                      <Input
                        name='username'
                        type='text'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                      />
                      <FormErrorMessage>
                        {formik.errors.username}
                      </FormErrorMessage>
                    </FormControl>
                  </>
                )}
                {modalField === 'email' && (
                  <>
                    <Text>Enter a new email and your existing password.</Text>
                    <FormControl
                      isInvalid={formik.errors.email && formik.touched.email}
                    >
                      <FormLabel htmlFor='email' fontSize='xs' color='gray.400'>
                        EMAIL
                      </FormLabel>
                      <Input
                        name='email'
                        type='email'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                      />
                      <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
                    </FormControl>
                  </>
                )}
                <FormControl
                  isInvalid={formik.errors.password && formik.touched.password}
                >
                  <FormLabel htmlFor='password' fontSize='xs' color='gray.400'>
                    PASSWORD
                  </FormLabel>
                  <InputGroup>
                    <Input
                      name='password'
                      type='password'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                  </InputGroup>
                  <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                type='submit'
                form='form-basic-info'
                colorScheme='blue'
                isLoading={formik.isSubmitting}
                mr={3}
              >
                Save
              </Button>
              <Button onClick={modal.onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </form>
  )
}

type BasicInfoFormProps = {
  user: User
}

function BasicInfo() {
  const avatarForm = useDisclosure()
  const { user, mutateUser } = useUser()

  return (
    <Stack>
      <Heading fontSize='2xl'>Basic information</Heading>
      <Stack
        borderRadius='xl'
        direction='row'
        spacing='8'
        align='start'
        py='4'
        px='8'
        mx='8'
      >
        <Avatar
          size='xl'
          src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
        >
          <AvatarBadge boxSize='0.9em' bg='green.500' />
        </Avatar>
        <Stack direction='column' spacing='2'>
          <Text fontWeight='600' fontSize='2xl' mt='2'>
            {user.username}
          </Text>
          <Button size='sm' onClick={avatarForm.onOpen}>
            Upload Avatar
          </Button>
          <AvatarForm isOpen={avatarForm.isOpen} onClose={avatarForm.onClose} />
        </Stack>
      </Stack>
      <Divider orientation='horizontal' />
      <BasicInfoForm />
    </Stack>
  )
}

function Profile() {
  const { user, mutateUser } = useUser()

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            <Heading as='h1' fontSize='5xl'>
              Profile
            </Heading>
            <Stack spacing='8'>
              <BasicInfo />
              <Stack>
                <Heading fontSize='2xl'>Status</Heading>
                <Text>{user.status}</Text>
              </Stack>
              <Stack>
                <Heading fontSize='2xl'>Statistics</Heading>
                <Text>WIP</Text>
              </Stack>
              <Stack>
                <Heading fontSize='2xl'>Match History</Heading>
                <Text>WIP</Text>
              </Stack>
            </Stack>
            <Text>{JSON.stringify(user)}</Text>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

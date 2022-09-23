import {
  Avatar,
  Button,
  Divider,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
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
import { useState, useEffect, forwardRef } from 'react'

import UserStatusBadge from '@components/user-status-badge'
import { NextRouter } from 'next/router'

import NextLink from 'next/link'
import { useFormik, FormikErrors } from 'formik'
import useSWR from 'swr'
import { fetchPartialUserInfo, fetchText } from 'src/lib/fetchers'

import { User, PartialUserInfo, GameHistory } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

import UserActions from '@components/user-actions'
import GameInvite from '@components/game-invite'

type PreviewProps = {
  user: User
  file: File
}

function Preview({ user, file }: PreviewProps) {
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

interface AvatarFormValues {
  file: File
}

const AvatarForm = forwardRef<HTMLElement, AvatarFormProps>((props, ref) => {
  const { user, mutateUser } = useUser()
  const toast = useToast()
  const { isOpen, onClose } = props

  const validate = (values: AvatarFormValues) => {
    const errors: FormikErrors<AvatarFormValues> = {}
    if (!values.file) {
      errors.file = 'Required'
    } else if (
      values.file.type !== 'image/png' &&
      values.file.type !== 'image/jpeg'
    ) {
      errors.file = 'File must be png or jpeg'
    } else if (values.file.size > 1000000) {
      errors.file = 'File must be less than 1MB'
    }
    return errors
  }

  const formik = useFormik<AvatarFormValues>({
    initialValues: {
      file: null,
    },
    validate: validate,
    onSubmit: async (values, actions) => {
      let message: string
      let status: 'success' | 'info' | 'error' = 'error'

      await new Promise((resolve) => setTimeout(resolve, 500))

      try {
        const body = new FormData()
        body.append('file', values.file)

        const res = await fetch(`${API_URL}/api/user/upload/avatar`, {
          method: 'POST',
          credentials: 'include',
          body,
        })

        if (res.ok) {
          await mutateUser()
          message = 'Successfully updated your avatar'
          status = 'success'
        } else if (res.status === 413) {
          message = 'File too large'
        } else {
          message = 'Failed to update your avatar'
        }
        toast({
          description: message,
          status: status,
          duration: 5000,
          isClosable: true,
        })
      } catch (err) {
        console.log(err)
      }

      actions.setSubmitting(false)
      onClose()
    },
  })

  const onCloseComplete = () => {
    formik.setFieldValue('file', null)
    formik.setFieldTouched('file', null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} onCloseComplete={onCloseComplete}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>Upload Avatar</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl
              isInvalid={
                formik.errors.file && formik.touched.file ? true : false
              }
            >
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
              <FormErrorMessage>
                {formik.errors.file ? `${formik.errors.file}` : null}
              </FormErrorMessage>
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
  currentPassword: string
}

type UserBasicInfoProps = {
  user: User
  router: NextRouter
}

export default function UserBasicInfo({ user, router }: UserBasicInfoProps) {
  const avatarForm = useDisclosure()
  const { user: currentUser, mutateUser } = useUser()
  const toast = useToast()
  const modal = useDisclosure()
  const [modalField, setModalField] = useState('')

  const isCurrentUser = currentUser.userId === user.userId

  const initialValues: BasicInfoFormValues = {
    username: user.username,
    email: user.email,
    password: user.login42 ? user.login42 : '',
    currentPassword: user.login42 ? user.login42 : '',
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
    }

    return errors
  }

  const formik = useFormik<BasicInfoFormValues>({
    initialValues,
    validate,
    onSubmit: async (values, actions) => {
      let message: string
      let status: 'success' | 'info' | 'error' = 'error'

      await new Promise((resolve) => setTimeout(resolve, 500))

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
            currentPassword: values.password,
          }),
        })

        if (res.ok) {
          await mutateUser()
          message = 'Successfully updated your info'
          status = 'success'
        } else if (res.status === 400) {
          const data = await res.json()
          if (typeof data.message === 'string') {
            message =
              modalField === 'username'
                ? 'username already exists'
                : 'email already exists'
          } else if (typeof data.message === 'object') {
            message = data.message[0]
          } else {
            message = 'Internal error occurred'
          }
        } else if (res.status === 403) {
          const data = await res.json()
          message =
            typeof data.message === 'string'
              ? data.message
              : 'Internal error occurred'
        } else if (res.status === 500) {
          message =
            modalField === 'username'
              ? 'username already exists'
              : 'email already exists'
        }
        toast({
          description: message,
          status: status,
          duration: 5000,
          isClosable: true,
        })
      } catch (err) {
        console.log(err)
      }

      modal.onClose()
      actions.setSubmitting(false)
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
    formik.setFieldTouched('username', false)
    formik.setFieldTouched('email', false)
    formik.setFieldTouched('password', false)
    setModalField('')
  }

  return (
    <Stack>
      <Heading fontSize='2xl'>Basic information</Heading>
      <Stack
        borderRadius='xl'
        direction='row'
        spacing='8'
        align='start'
        py='4'
        px='0'
        mx='8'
      >
        <Avatar
          size='xl'
          src={`${API_URL}/api/user/avatar/${user.profile_picture}`}
        >
          <UserStatusBadge boxSize='0.9em' status={user.status} />
        </Avatar>
        <Stack direction='column' spacing='2'>
          <Text fontWeight='600' fontSize='2xl' mt='2'>
            {user.username}
          </Text>
          {isCurrentUser && (
            <>
              <Button size='sm' onClick={avatarForm.onOpen}>
                Upload Avatar
              </Button>
              <AvatarForm
                isOpen={avatarForm.isOpen}
                onClose={avatarForm.onClose}
              />
            </>
          )}
          {!isCurrentUser && (
            <Stack direction='row'>
              <UserActions user={user} />
              <GameInvite user={user} router={router} />
            </Stack>
          )}
        </Stack>
      </Stack>
      <Divider orientation='horizontal' />
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
              {isCurrentUser && (
                <Button size='sm' onClick={() => modalOnOpen('username')}>
                  Edit
                </Button>
              )}
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
              {isCurrentUser && (
                <Button size='sm' onClick={() => modalOnOpen('email')}>
                  Edit
                </Button>
              )}
            </Stack>
          </FormControl>
          {isCurrentUser && (
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
                        <Text>
                          Enter a new email and your existing password.
                        </Text>
                        <FormControl
                          isInvalid={
                            formik.errors.email && formik.touched.email
                          }
                        >
                          <FormLabel
                            htmlFor='email'
                            fontSize='xs'
                            color='gray.400'
                          >
                            EMAIL
                          </FormLabel>
                          <Input
                            name='email'
                            type='email'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                          />
                          <FormErrorMessage>
                            {formik.errors.email}
                          </FormErrorMessage>
                        </FormControl>
                      </>
                    )}
                    {!user.login42 && (
                      <FormControl
                        isInvalid={
                          formik.errors.password && formik.touched.password
                        }
                      >
                        <FormLabel
                          htmlFor='password'
                          fontSize='xs'
                          color='gray.400'
                        >
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
                        <FormErrorMessage>
                          {formik.errors.password}
                        </FormErrorMessage>
                      </FormControl>
                    )}
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
          )}
        </Stack>
      </form>
    </Stack>
  )
}

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

// Avatar Upload
import { useFormik, FormikErrors } from 'formik'

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

function Profile() {
  const avatarForm = useDisclosure()
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
                  </Stack>
                </Stack>
                <Divider orientation='horizontal' />
                <form>
                  <Stack spacing='6'>
                    <FormControl>
                      <FormLabel fontSize='xs' color='gray.400'>
                        USERNAME
                      </FormLabel>
                      <Input
                        type='text'
                        isReadOnly={true}
                        value={user.username}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize='xs' color='gray.400'>
                        EMAIL
                      </FormLabel>
                      <Input
                        type='email'
                        isReadOnly={true}
                        value={user.email}
                      />
                    </FormControl>
                  </Stack>
                </form>
              </Stack>
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
          <AvatarForm isOpen={avatarForm.isOpen} onClose={avatarForm.onClose} />
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

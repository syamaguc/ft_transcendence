import {
  Avatar,
  Box,
  Button,
  Container,
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
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
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

function AvatarForm() {
  const { user, mutateUser } = useUser()

  const validate = (valies: AvatarFormValues) => {
    const errors: FormikErrors<AvatarFormValues> = {}
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
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
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
      <Button type='submit'>Edit</Button>
    </form>
  )
}

function Profile() {
  const { user, mutateUser } = useUser()

  return (
    <Layout>
      <Container maxW='2xl' bg='gray.50'>
        <Box py='12'>
          <Stack spacing='12'>
            <Heading as='h1' fontSize='5xl'>
              Profile
            </Heading>
            <Stack spacing='8'>
              <Stack>
                <Heading fontSize='2xl'>Basic information</Heading>
                <AvatarForm />
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
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

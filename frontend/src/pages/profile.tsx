import {
  Box,
  Button,
  Container,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
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

import { useFormik, FormikErrors } from 'formik'
import useSWR from 'swr'

import { fetchText } from 'src/lib/fetchers'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'
import { setDidTwoFactorAuth } from 'src/lib/session'

import Layout from '@components/scrollable-layout'
import ChakraNextImage from '@components/chakra-next-image'
import UserStatusInfo from '@components/user-status-info'
import UserBasicInfo from '@components/user-basic-info'
import UserStatistics from '@components/user-statistics'
import MatchHistory from '@components/match-history'

export default function Profile() {
  const { user } = useUser()

  return (
    <Layout>
      <Container maxW='2xl'>
        <Box py='12'>
          <Stack spacing='12'>
            <Heading as='h1' fontSize='5xl'>
              Profile
            </Heading>
            <Stack spacing='8'>
              <UserBasicInfo user={user} />
              <UserStatusInfo user={user} />
              <TwoFactorAuth />
              <UserStatistics user={user} />
              <MatchHistory user={user} />
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

function TwoFactorAuth() {
  const { user, mutateUser } = useUser()
  const modal = useDisclosure()
  const toast = useToast()

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
    return errors
  }

  const updateTwoFactorAuth = async (toggle: boolean) => {
    const res = await fetch(`${API_URL}/api/user/updateTwoFactorAuth`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ toggle: toggle }),
    })

    return res
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
        const updateRes = await updateTwoFactorAuth(true)
        if (updateRes.ok) {
          await setDidTwoFactorAuth(true)
          await mutateUser()
          toast({
            description: 'Successfully enabled 2FA',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          actions.setSubmitting(false)
          modal.onClose()
          return
        }
      }
      toast({
        description: 'Failed to provide identification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      actions.setSubmitting(false)
      modal.onClose()
    },
  })

  const turnOffTwoFactorAuth = async () => {
    const res = await updateTwoFactorAuth(false)
    if (res.ok) {
      toast({
        description: 'Turned off 2FA',
        status: 'info',
        duration: 5000,
        isClosable: true,
      })
    } else {
      toast({
        description: 'Failed to turn off 2FA',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    await mutateUser()
  }

  const onCloseComplete = () => {
    formik.setFieldValue('code', '')
  }

  return (
    <Stack>
      <Heading fontSize='2xl'>Two-factor authentication</Heading>
      <Text color='gray.600' fontSize={{ base: 'sm', md: 'md' }}>
        {`Two factor authentication is an enhanced security measure. Once enabled, you'll be required to give additional identification through Google Authenticator`}
      </Text>
      {!user.twoFactorAuth && (
        <Stack direction='row' align='center'>
          <Text>Off</Text>
          <Button size='sm' onClick={modal.onOpen}>
            Turn on
          </Button>
        </Stack>
      )}
      {user.twoFactorAuth && (
        <Stack direction='row' align='center'>
          <Text>On</Text>
          <Button size='sm' onClick={turnOffTwoFactorAuth}>
            Turn off
          </Button>
        </Stack>
      )}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        onCloseComplete={onCloseComplete}
      >
        <ModalOverlay />
        <ModalContent>
          <form id='form-2fa' onSubmit={formik.handleSubmit}>
            <ModalHeader>Setup Two factor authentication</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text>
                Open the Google Authenticator app and scan this QR code.
              </Text>
              <Stack align='center'>
                {qrCodeUrl && (
                  <ChakraNextImage
                    src={qrCodeUrl}
                    width='300px'
                    height='300px'
                  />
                )}
                {!qrCodeUrl && <Text>{htmlText}</Text>}
              </Stack>
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
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme='blue'
                type='submit'
                form='form-2fa'
                isLoading={formik.isSubmitting}
                mr={3}
              >
                Send
              </Button>
              <Button onClick={modal.onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

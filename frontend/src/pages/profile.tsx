import {
  Avatar,
  AvatarBadge,
  AvatarBadgeProps,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Flex,
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
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Skeleton,
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
import ChakraNextImage from '@components/chakra-next-image'
import UserStatusBadge from '@components/user-status-badge'
import NextLink from 'next/link'
import { useFormik, FormikErrors } from 'formik'
import useSWR from 'swr'
import { fetchPartialUserInfo, fetchText } from 'src/lib/fetchers'

import Layout from '@components/scrollable-layout'

import { User, PartialUserInfo, GameHistory } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

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

function BasicInfo() {
  const avatarForm = useDisclosure()
  const { user, mutateUser } = useUser()
  const toast = useToast()
  const modal = useDisclosure()
  const [modalField, setModalField] = useState('')

  const initialValues: BasicInfoFormValues = {
    username: user.username,
    email: user.email,
    password: '',
    currentPassword: '',
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
            password: values.password,
            currentPassword: values.password,
          }),
        })

        if (res.ok) {
          await mutateUser()
          message = 'Successfully updated your info'
          status = 'success'
        } else if (res.status === 400) {
          const data = await res.json()
          message =
            typeof data.message === 'object'
              ? data.message[0]
              : 'Internal error occurred'
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
          <Button size='sm' onClick={avatarForm.onOpen}>
            Upload Avatar
          </Button>
          <AvatarForm isOpen={avatarForm.isOpen} onClose={avatarForm.onClose} />
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
    </Stack>
  )
}

type StatistiscProps = {
  user: User
}

function Statistics({ user }: StatistiscProps) {
  return (
    <Stack>
      <Heading fontSize='2xl'>Statistics</Heading>
      <StatGroup py='4'>
        <Stat>
          <StatLabel>Games Won</StatLabel>
          <StatNumber>{user.game_won}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Games Lost</StatLabel>
          <StatNumber>{user.lost_game}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Elo</StatLabel>
          <StatNumber>{user.elo}</StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
      </StatGroup>
    </Stack>
  )
}

type PlayerInfoProps = {
  player: PartialUserInfo
}

function PlayerInfo({ player }: PlayerInfoProps) {
  return (
    <>
      <NextLink href={`/users/${player.username}`}>
        <Stack
          direction='row'
          align='center'
          borderRadius='md'
          transition='color 0.2s'
          _hover={{ cursor: 'pointer' }}
        >
          <Avatar
            size='sm'
            mr='4px'
            src={`${API_URL}/api/user/avatar/${player.profile_picture}`}
          />
          <Text fontWeight='800' fontSize='md'>
            {player.username}
          </Text>
        </Stack>
      </NextLink>
    </>
  )
}

type MatchInfoProps = {
  user: User
  game: GameHistory
}

function MatchInfo({ user, game }: MatchInfoProps) {
  let opponentId: string
  if (user.userId === game.playerOne) {
    opponentId = game.playerTwo
  } else {
    opponentId = game.playerOne
  }

  const { data: data, error } = useSWR(
    `${API_URL}/api/user/partialInfo?userId=${opponentId}`,
    fetchPartialUserInfo
  )

  const isLoading = !data && !error
  const opponent = data?.user

  return (
    <>
      {error && <Text>Error occurred</Text>}
      {isLoading && <Skeleton height='60px' isLoaded={!isLoading} />}
      {!opponent && <Text>User not found</Text>}
      {opponent && (
        <Flex
          direction='row'
          w='full'
          px='6'
          py='4'
          // bg={game.playerWin === user.userId ? 'blue.100' : 'red.100'}
          borderRadius='md'
          borderWidth='1px'
        >
          <Flex
            flex='1'
            w='full'
            direction='row'
            align='center'
            justify='end'
            pr='4'
          >
            <Stack>
              <Text fontWeight='600' color='gray.600' fontSize='sm'>
                Player one
              </Text>
              <PlayerInfo
                player={game.playerOne === user.userId ? user : opponent}
              />
            </Stack>
            <Spacer />
            <Badge
              mr='1'
              // variant='solid'
              fontSize='0.8em'
              colorScheme={
                game.playerOneScore > game.playerTwoScore ? 'blue' : 'red'
              }
            >
              {game.playerOneScore > game.playerTwoScore ? 'WIN' : 'LOSE'}
            </Badge>
          </Flex>
          <Stack direction='row' align='center'>
            <Text fontWeight='extrabold' fontSize='2xl'>
              {game.playerOneScore}
            </Text>
            <Text fontWeight='semibold' fontSize='xl'>
              -
            </Text>
            <Text fontWeight='extrabold' fontSize='2xl'>
              {game.playerTwoScore}
            </Text>
          </Stack>
          <Flex
            flex='1'
            w='full'
            direction='row'
            align='center'
            justify='end'
            pl='4'
          >
            <Badge
              ml='1'
              // variant='solid'
              fontSize='0.8em'
              colorScheme={
                game.playerTwoScore > game.playerOneScore ? 'blue' : 'red'
              }
            >
              {game.playerTwoScore > game.playerOneScore ? 'WIN' : 'LOSE'}
            </Badge>
            <Spacer />
            <Stack align='end'>
              <Text fontWeight='600' color='gray.600' fontSize='sm'>
                Player Two
              </Text>
              <PlayerInfo
                player={game.playerTwo === user.userId ? user : opponent}
              />
            </Stack>
          </Flex>
        </Flex>
      )}
    </>
  )
}

type MatchHistoryProps = {
  user: User
}

function MatchHistory({ user }: MatchHistoryProps) {
  return (
    <Stack w='full'>
      <Heading fontSize='2xl'>Match History</Heading>
      <Stack align='center' w='full'>
        {user.game_history.map((game) => (
          <MatchInfo key={game.gameId} user={user} game={game} />
        ))}
      </Stack>
    </Stack>
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
      let message: string
      let status: 'success' | 'info' | 'error' = 'error'

      const res = await fetch(`${API_URL}/api/auth/2fa/${values.code}`, {
        method: 'POST',
        credentials: 'include',
      })

      const body = await res.text()
      if (body === 'True') {
        const updateRes = await updateTwoFactorAuth(true)
        if (updateRes.ok) {
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
              {qrCodeUrl && (
                <ChakraNextImage src={qrCodeUrl} width='300px' height='300px' />
              )}
              {!qrCodeUrl && <Text>{htmlText}</Text>}
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

function Profile() {
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
              <BasicInfo />
              <Stack>
                <Heading fontSize='2xl'>Status</Heading>
                <Text>{user.status}</Text>
              </Stack>
              <TwoFactorAuth />
              <Statistics user={user} />
              <MatchHistory user={user} />
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

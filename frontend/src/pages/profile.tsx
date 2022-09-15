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

import { useFormik, FormikErrors } from 'formik'
import useSWR from 'swr'
import { fetchUserPartialInfo } from 'src/lib/fetchers'

import Layout from '@components/layout'

import { User, UserPartialInfo, GameHistory } from 'src/types/user'
import { useUser } from 'src/lib/use-user'
import { API_URL } from 'src/constants'

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
          toast({
            description: 'Successfully updated your avatar.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        } else if (res.status === 413) {
          toast({
            description: 'File too large.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        } else {
          toast({
            description: 'Failed to update your avatar',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      } catch (err) {
        console.log(err)
        toast({
          description: 'Failed to update your avatar',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
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
            currentPassword: values.password,
            username: values.username,
            email: values.email,
            password: values.newPassword,
          }),
        })

        if (res.ok) {
          await mutateUser()
          toast({
            description: 'Successfully updated your info.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        } else if (res.status === 400) {
          const data = await res.json()
          toast({
            description: data.message
              ? data.message[0]
              : 'Internal error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        } else if (res.status === 403) {
          const data = await res.json()
          toast({
            description: data.message
              ? data.message
              : 'Internal error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        } else if (res.status === 500) {
          toast({
            description:
              modalField === 'username'
                ? 'username already exists'
                : 'email already exists',
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
  player: UserPartialInfo
}

function PlayerInfo({ player }: PlayerInfoProps) {
  return (
    <>
      <Avatar src={`${API_URL}/api/user/avatar/${player.profile_picture}`} />
      <Text>{player.userId}</Text>
      <Text>{player.username}</Text>
      <Text>{player.elo}</Text>
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
    fetchUserPartialInfo
  )

  const isLoading = !data && !error
  const opponent = data?.user

  return (
    <>
      {error && <Text>Error occurred</Text>}
      {isLoading && <Skeleton height='60px' isLoaded={!isLoading} />}
      {!opponent && <Text>User not found</Text>}
      {opponent && (
        <Stack direction='row'>
          <Stack>
            <Text>Game Info</Text>
            <Text>{game.playerOne}</Text>
            <Text>{game.playerTwo}</Text>
            <Text>{game.playerOneScore}</Text>
            <Text>{game.playerTwoScore}</Text>
            <Text>{game.playerWin}</Text>
            <Text>{game.playerLoose}</Text>
          </Stack>
          <Stack>
            <Text>Player one</Text>
            <PlayerInfo
              player={game.playerOne === user.userId ? user : opponent}
            />
          </Stack>
          <Stack>
            <Text>Player two</Text>
            <PlayerInfo
              player={game.playerTwo === user.userId ? user : opponent}
            />
          </Stack>
        </Stack>
      )}
    </>
  )
}

type MatchHistoryProps = {
  user: User
}

function MatchHistory({ user }: MatchHistoryProps) {
  return (
    <Stack>
      <Heading fontSize='2xl'>Match History</Heading>
      {user.game_history.map((game) => (
        <MatchInfo key={game.gameId} user={user} game={game} />
      ))}
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
              <Stack>
                <Heading fontSize='2xl'>Two-factor authentication</Heading>
                <Text>{user.twoFactorAuth ? 'true' : 'false'}</Text>
              </Stack>
              <Statistics user={user} />
              <MatchHistory user={user} />
            </Stack>
            <Text>{JSON.stringify(user)}</Text>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile

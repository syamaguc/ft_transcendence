import { useState } from 'react'
import { MenuItem, Button, ButtonProps, useToast } from '@chakra-ui/react'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'
import { setIsFirstTime } from 'src/lib/session'

async function logout() {
  const res = await fetch(`${API_URL}/api/user/logout`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 500))
  return res
}

export function LogoutButton(props: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()

  const handleLogout = async () => {
    let message: string
    let status: 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await logout()
      if (res.ok) {
        await setIsFirstTime(false)
        await mutateUser()
        message = 'Successfully logged out'
        status = 'info'
      } else {
        message = 'Failed to log out'
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <Button {...props} onClick={handleLogout} isLoading={isLoading}>
      Logout
    </Button>
  )
}

export function LogoutMenuItem() {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()

  const handleLogout = async () => {
    let message: string
    let status: 'info' | 'error' = 'error'

    setIsLoading(true)

    try {
      const res = await logout()
      if (res.ok) {
        await setIsFirstTime(false)
        await mutateUser()
        message = 'Successfully logged out'
        status = 'info'
      } else {
        message = 'Failed to log out'
      }
    } catch (err) {
      console.log(err)
    }

    toast({
      description: message,
      status: status,
      duration: 5000,
      isClosable: true,
    })
    setIsLoading(false)
  }

  return (
    <MenuItem onClick={handleLogout} disabled={isLoading}>
      Logout
    </MenuItem>
  )
}

import { useState } from 'react'
import { MenuItem, Button, ButtonProps, useToast } from '@chakra-ui/react'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'

export function LogoutButton(props: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (res.ok) {
        await mutateUser()
        toast({
          description: 'Successfully logged out.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          description: 'Internal error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.log(err)
      toast({
        description: 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

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
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (res.ok) {
        await mutateUser()
        toast({
          description: 'Successfully logged out.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          description: 'Internal error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.log(err)
      toast({
        description: 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    setIsLoading(false)
  }

  return (
    <MenuItem onClick={handleLogout} disabled={isLoading}>
      Logout
    </MenuItem>
  )
}

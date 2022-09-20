import { useState } from 'react'
import { MenuItem, Button, ButtonProps, useToast } from '@chakra-ui/react'
import { API_URL } from 'src/constants'
import { useUser } from 'src/lib/use-user'

export function ClearCacheButton(props: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { mutateUser } = useUser()

  const handleClearCache = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/clear-cache', {
        method: 'DELETE',
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (res.ok) {
        await mutateUser()
        toast({
          description: 'Cleared cookies and cache',
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
        description: 'Failed to clear cache',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    setIsLoading(false)
  }

  return (
    <Button {...props} onClick={handleClearCache} isLoading={isLoading}>
      Clear Cache
    </Button>
  )
}

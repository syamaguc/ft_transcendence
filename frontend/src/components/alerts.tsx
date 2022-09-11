import { createContext, useState, useCallback } from 'react'
import { Box, Alert, AlertIcon, Fade, CloseButton } from '@chakra-ui/react'

import { useAlerts } from 'src/lib/use-alerts'

interface Alert {
  message: string
  status: 'error' | 'success' | 'warning' | 'info'
}

export const AlertsContext = createContext({
  alerts: null,
  addAlert: (message: any, status: any) => {},
  removeAlert: () => {},
})

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState(null)

  const removeAlert = () => {
    console.log('alerts')
    setAlerts(null)
  }

  const addAlert = (message, status) => setAlerts({ message, status })

  const value = {
    alerts,
    addAlert: useCallback((message, status) => addAlert(message, status), []),
    removeAlert: useCallback(() => removeAlert(), []),
  }

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  )
}

export function Alerts() {
  const { alerts, removeAlert } = useAlerts()

  console.log('Alerts alerts', alerts)

  const handleSubmit = () => {
    removeAlert()
  }

  return (
    <Box bg='gray.300' h='100' w='full'>
      <Fade in={!!alerts}>
        <Alert status='error'>
          <AlertIcon />
          <Box>{alerts && alerts.message && alerts.message}</Box>
          <CloseButton
            alignSelf='flex-start'
            position='relative'
            right={-1}
            top={-1}
            onClick={handleSubmit}
          />
        </Alert>
      </Fade>
    </Box>
  )
}

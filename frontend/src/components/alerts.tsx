import { createContext, useState, useEffect, useCallback } from 'react'
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Fade,
  SlideFade,
  Flex,
  CloseButton,
  Spacer,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'

import { useAlerts } from 'src/lib/use-alerts'

interface Alert {
  message: string
  status: 'error' | 'success' | 'warning' | 'info'
}

export const AlertsContext = createContext({
  alerts: null,
  addAlert: (
    message: string,
    status: 'error' | 'success' | 'warning' | 'info'
  ) => {},
  removeAlert: () => {},
})

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState(null)

  const removeAlert = () => {
    setAlerts(null)
  }

  const addAlert = (
    message: string,
    status: 'error' | 'success' | 'warning' | 'info'
  ) => {
    setAlerts({ message, status })
  }

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

  const handleClose = () => {
    removeAlert()
  }

  useEffect(() => {
    if (!alerts) return

    const timeId = setTimeout(() => {
      removeAlert()
    }, 3000)

    return () => {
      clearTimeout(timeId)
    }
  }, [alerts, removeAlert])

  return (
    <>
      <Flex
        position='fixed'
        w='full'
        zIndex={2}
        bottom={0}
        direction='column'
        alignItems='center'
        justifyContent='center'
        gap='2'
        px='4'
        mb='4'
      >
        <SlideFade in={alerts} offsetY='20px' unmountOnExit={true}>
          <Box>
            <Alert status={alerts && alerts.status} borderRadius='6px'>
              <AlertIcon />
              <Flex direction='row' alignItems='center' justifyContent='center'>
                <Box>
                  <AlertDescription fontSize='base'>
                    {alerts && alerts.message && alerts.message}
                  </AlertDescription>
                </Box>
                <Spacer />
                <CloseButton
                  alignSelf='flex-start'
                  position='relative'
                  right={-1}
                  top={-1}
                  onClick={handleClose}
                />
              </Flex>
            </Alert>
          </Box>
        </SlideFade>
      </Flex>
    </>
  )
}

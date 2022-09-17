import { useContext } from 'react'
import { AlertsContext } from '@components/alerts'

export function useAlerts() {
  const { alerts, addAlert, removeAlert } = useContext(AlertsContext)
  return { alerts, addAlert, removeAlert }
}

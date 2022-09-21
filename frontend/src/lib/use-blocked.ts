import useSWR from 'swr'
import { fetchPartialUserInfos } from 'src/lib/fetchers'

import { API_URL } from 'src/constants'

export function useBlocked() {
  const { data, mutate, error } = useSWR(
    `${API_URL}/api/user/blockedList`,
    fetchPartialUserInfos
  )

  return {
    blocked: error ? null : data,
    mutateBlocked: mutate,
  }
}

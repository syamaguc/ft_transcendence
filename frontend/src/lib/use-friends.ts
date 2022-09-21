import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { fetchPartialUserInfos } from 'src/lib/fetchers'
import { PartialUserInfo } from 'src/types/user'
import { useUser } from 'src/lib/use-user'

import { API_URL } from 'src/constants'

export function useFriends() {
  const { user } = useUser()

  const { data, mutate, error } = useSWR(
    `${API_URL}/api/user/friendList`,
    fetchPartialUserInfos
  )

  const [countAll, setCountAll] = useState(0)
  const [countOnline, setCountOnline] = useState(0)

  const hasData = Boolean(data)

  useEffect(() => {
    if (!hasData || !user) return

    const isNotBlocked = (element: PartialUserInfo) => {
      return user.blockedUsers.indexOf(element.userId) === -1
    }

    const isOnline = (element: PartialUserInfo) => {
      return element.status === 'Online' && isNotBlocked(element)
    }

    setCountAll(data.filter(isNotBlocked).length)
    setCountOnline(data.filter(isOnline).length)
  }, [hasData, data, user])

  return {
    friends: error ? null : data,
    mutateFriends: mutate,
    countAll,
    countOnline,
  }
}

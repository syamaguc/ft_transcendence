import { useEffect } from 'react'
import Router from 'next/router'
import useSWR from 'swr'

import { User } from 'src/types/user'

const API_URL = 'http://localhost:3000'

async function fetchUser(url: string): Promise<{ user: User | null }> {
  const res = await fetch(url, { credentials: 'include' })

  const data = await res.json()

  // console.log('fetchUser data:', data)

  if (res.ok) {
    return { user: data }
  } else {
    // Authorization error
    console.log('fetchUser error:', res.status, res.statusText)
    return { user: null }
  }
}

export function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const { data, error } = useSWR(`${API_URL}/api/user/currentUser`, fetchUser)
  const user = data?.user
  const finished = Boolean(data)
  const hasUser = Boolean(user)

  useEffect(() => {
    console.log('useEffect')
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !finished) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      console.log('redirecting...')
      Router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasUser])

  return error ? null : user
}

import { useEffect } from 'react'
import Router from 'next/router'
import useSWR from 'swr'

import { User } from 'src/types/user'

const API_URL = 'http://localhost:3000'

function fetcher(url: string) {
  fetch(url, {
    credentials: 'include',
  })
    .then((r) => r.json())
    .then((data) => {
      return data
    })
}

export function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const { data: user, error } = useSWR<User>(`${API_URL}/api/user/currentUser`)

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user)
    ) {
      Router.push(redirectTo)
    }
  }, [user, redirectIfFound, redirectTo])

  return error ? null : user
}

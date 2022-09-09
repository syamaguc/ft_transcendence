import { useEffect } from 'react'
import Router from 'next/router'
import useSWR, { KeyedMutator } from 'swr'

import { User } from 'src/types/user'

async function fetchUser(url: string): Promise<{ user: User }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  console.log('fetchUser data:', data)

  if (res.ok) {
    return { user: data?.user || null }
  }

  // TODO: throw
  return { user: null }
}

export function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const { data, mutate, error } = useSWR('/api/users/current', fetchUser)
  const user = data?.user

  const isLoading = !error && !data
  const finished = Boolean(data)
  const hasUser = Boolean(user)

  console.log('useUser data: ', data)
  console.log('useUser user: ', user)

  if (isLoading) {
    console.log('useUser isLoading...')
  } else {
    console.log('useUser !isLoading...')
  }

  useEffect(() => {
    if (!finished) {
      console.log('useUser useEffect !finished...')
    } else {
      console.log('useUser useEffect finished...')
    }
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

  return {
    user: error ? null : user,
    mutateUser: mutate,
    isLoading: !error && !data,
    // isError: error,
    // isAuthenticated: true,
    // isUnauthenticated: false,
    status:
      !error && !data ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  }
}

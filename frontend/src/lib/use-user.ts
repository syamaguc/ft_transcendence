import { useEffect } from 'react'
import Router from 'next/router'
import useSWR, { KeyedMutator } from 'swr'

import { User } from 'src/types/user'

async function fetchUser(url: string): Promise<{ user: User }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return { user: data?.user || null }
  }

  // TODO: throw
  return { user: null }
}

// TODO
export function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const { data, mutate, error } = useSWR('/api/users/current', fetchUser)
  const user = data?.user
  const finished = Boolean(data)
  const hasUser = Boolean(user)

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !finished) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasUser])

  const isLoading = !error && !data

  return {
    user: error ? null : user,
    mutateUser: mutate,
    isLoading: isLoading,
    isError: error,
    isAuthenticated: hasUser,
    isUnauthenticated: !hasUser,
    status: isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  }
}

import { useEffect } from 'react'
import Router from 'next/router'
import useSWR, { KeyedMutator } from 'swr'
import { fetchUser } from 'src/lib/fetchers'

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
  const session = data?.session
  const need2FA = data?.need2FA

  return {
    user: error ? null : user,
    mutateUser: mutate,
    isLoading: isLoading,
    status: isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
    isFirstTime: session?.isFirstTime && user?.login_count === 1,
    needTwoFactorAuth: need2FA,
    didTwoFactorAuth: session?.didTwoFactorAuth,
  }
}

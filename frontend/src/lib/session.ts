import { Session } from 'src/types/user'

export async function setSession(session: Session) {
  const res = await fetch(`/api/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  })

  if (!res.ok) {
    console.error('Failed to set isFirstTime')
  }

  return res
}

export async function getSession(): Promise<Session> {
  const res = await fetch(`/api/session`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (res.ok) {
    const data = await res.json()
    const session = data?.session

    let didTwoFactorAuth: boolean
    if (typeof session?.didTwoFactorAuth === 'boolean') {
      didTwoFactorAuth = session.didTwoFactorAuth
    } else {
      didTwoFactorAuth = false
    }

    let isFirstTime: boolean
    if (typeof session?.isFirstTime === 'boolean') {
      isFirstTime = session.isFirstTime
    } else {
      isFirstTime = false
    }

    return {
      isFirstTime,
      didTwoFactorAuth,
    }
  }

  console.error(
    'Failed to get session. This should not be called before session cookie is set'
  )

  return null
}

export async function setIsFirstTime(toggle: boolean) {
  const session = await getSession()

  const didTwoFactorAuth =
    typeof session?.didTwoFactorAuth === 'boolean'
      ? session.didTwoFactorAuth
      : false

  const res = await setSession({
    isFirstTime: toggle,
    didTwoFactorAuth: didTwoFactorAuth,
  })

  if (!res.ok) {
    console.error('Failed to set isFirstTime')
  }
}

export async function setDidTwoFactorAuth(toggle: boolean) {
  const session = await getSession()

  const isFirstTime =
    typeof session?.isFirstTime === 'boolean' ? session.isFirstTime : false

  const res = await setSession({
    isFirstTime: isFirstTime,
    didTwoFactorAuth: toggle,
  })

  if (!res.ok) {
    console.error('Failed to set isFirstTime')
  }
}

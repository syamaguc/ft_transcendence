import { User, PartialUserInfo, Session } from 'src/types/user'

export class FetchError extends Error {
  response: Response
  data: {
    message: string
  }
  constructor({
    message,
    response,
    data,
  }: {
    message: string
    response: Response
    data: {
      message: string
    }
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError)
    }

    this.name = 'FetchError'
    this.response = response
    this.data = data ?? { message: message }
  }
}

export async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const response = await fetch(input, init)

  // if the server replies, there's always some data in json
  // if there's a network error, it will throw at the previous line
  const data = await response.json()

  // response.ok is true when res.status is 2xx
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  if (response.ok) {
    return data
  }

  throw new FetchError({
    message: response.statusText,
    response,
    data,
  })
}

export async function fetchUser(
  url: string
): Promise<{ user: User; session: Session }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return { user: data?.user || null, session: data?.session }
  }

  // TODO: throw
  return { user: null, session: null }
}

export async function fetchUsers(url: string): Promise<User[]> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return data
  }

  // TODO: throw
  return []
}

export async function fetchUserInfo(url: string): Promise<{ user: User }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return { user: data || null }
  }

  // TODO: throw
  return { user: null }
}

export async function fetchPartialUserInfos(
  url: string
): Promise<PartialUserInfo[]> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return data
  }

  // TODO: throw
  return []
}

export async function fetchPartialUserInfo(
  url: string
): Promise<{ user: PartialUserInfo }> {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()

  if (res.ok) {
    return { user: data || null }
  }

  // TODO: throw
  return { user: null }
}

export async function fetchText(url: string): Promise<{ text: string }> {
  const res = await fetch(url, { credentials: 'include' })

  if (res.ok) {
    const text = await res.text()
    return { text: text }
  }

  // TODO: throw
  return { text: null }
}

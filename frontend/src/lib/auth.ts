import { Sign } from 'crypto'

const API_URL = 'http://localhost:3000'

export interface SignInOptions {
  /**
   * Defaults to the current URL.
   * @docs https://next-auth.js.org/getting-started/client#specifying-a-callbackurl
   */
  callbackUrl?: string
  /** @docs https://next-auth.js.org/getting-started/client#using-the-redirect-false-option */
  redirect?: boolean

  username: string
  email: string
  password: string
}

export async function signup(options: SignInOptions) {
  const { username, email, password } = options

  console.log('Sign up...')

  let res = await fetch(`${API_URL}/api/user/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
      passwordConfirm: password,
    }),
  })

  const data = await res.json()
  console.log('accessToken: ', data)

  // mutateUser()
  //
  // setUsername('')
  // setEmail('')
  // setPassword('')

  return {
    error: false,
    status: res.status,
    ok: res.ok,
    data: data,
  } as any
}

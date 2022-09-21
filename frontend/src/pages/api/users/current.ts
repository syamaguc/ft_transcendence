import type { NextApiRequest, NextApiResponse } from 'next'
import { User, Session } from 'src/types/user'
import { getSessionCookie, setSessionCookie } from 'src/lib/cookies'

const API_URL = 'http://api:3000'

function setHeaders(req: NextApiRequest, res: NextApiResponse): boolean {
  // set SPR/CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'pragma')

  if (req.method === 'OPTIONS') {
    res.status(200)
    res.end()
    return true
  }

  return false
}

async function handleData(res: NextApiResponse, data: any) {
  data = data || { status: 'error', message: 'unhandled request' }
  res.status(data.status !== 'error' ? 200 : 500)
  res.json(data)
}

async function handleError(res: NextApiResponse, error: string | Error) {
  console.error(error)
  res.status(500).json({
    status: 'error',
    message: 'an error occurred internally',
  })
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (setHeaders(req, res)) return

  try {
    const { jwt } = req.cookies
    if (!jwt) {
      // This is not optimal, but avoids 401 fetch error
      res.status(200).json({ user: null, session: null, need2FA: false })
      return
    }

    const apiResponse = await fetch(`${API_URL}/api/user/currentUser`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        cookie: `jwt=${req.cookies.jwt}`,
      },
    })

    const data = await apiResponse.json()

    if (apiResponse.ok) {
      let session: Session
      const stringValue = getSessionCookie(req)
      if (stringValue) {
        session = JSON.parse(stringValue)
      } else {
        session = { isFirstTime: true, didTwoFactorAuth: false }
        setSessionCookie(res, session)
      }

      res.status(200).json({ user: data, session: session, need2FA: false })
    } else if (apiResponse.status === 403 && data?.message === 'need 2FA') {
      res.status(200).json({
        user: null,
        session: null,
        need2FA: true,
      })
    } else if (apiResponse.status === 401) {
      res.status(200).json({
        user: null,
        session: null,
        need2FA: false,
      })
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Unexpeced internal error',
      })
    }
  } catch (error) {
    console.error('Unexpected internal error: ', error)
    res.status(500).json({
      status: 'error',
      message: 'Unexpeced internal error',
    })
  }
}

export default handler

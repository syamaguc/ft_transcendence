import type { NextApiRequest, NextApiResponse } from 'next'

import { Session } from 'src/types/user'
import { setSessionCookie, getSessionCookie } from 'src/lib/cookies'

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (req.method === 'POST') {
      let isFirstTime = req.body.isFirstTime
      let didTwoFactorAuth = req.body.didTwoFactorAuth

      if (
        typeof isFirstTime === 'undefined' &&
        typeof didTwoFactorAuth === 'undefined'
      ) {
        return res.status(400).end()
      }

      let session: Session
      const stringValue = getSessionCookie(req)
      if (stringValue) {
        session = JSON.parse(stringValue)
      }

      if (typeof isFirstTime === 'undefined') {
        isFirstTime =
          typeof session?.isFirstTime === 'boolean'
            ? session.isFirstTime
            : false
      }
      if (typeof didTwoFactorAuth === 'undefined') {
        didTwoFactorAuth =
          typeof session?.didTwoFactorAuth === 'boolean'
            ? session.didTwoFactorAuth
            : false
      }

      const newSession: Session = { isFirstTime, didTwoFactorAuth }
      setSessionCookie(res, newSession)

      return res.status(200).end(res.getHeader('Set-Cookie'))
    }
    if (req.method === 'GET') {
      let session: Session

      const stringValue = getSessionCookie(req)
      if (stringValue) {
        session = JSON.parse(stringValue)
      } else {
        session = null
      }

      return res.status(200).json({ session: session })
    }
    res.status(400).end()
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

export default handler

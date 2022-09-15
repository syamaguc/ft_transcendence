import type { NextApiRequest, NextApiResponse } from 'next'

import { Session } from 'src/types/user'
import { setSessionCookie, getSessionCookie } from 'src/lib/cookies'

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (req.method === 'POST') {
      const isFirstTime = req.body.isFirstTime
      if (isFirstTime === undefined) {
        return res.status(400).end()
      }

      const session: Session = { isFirstTime: isFirstTime }
      setSessionCookie(res, session)

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

      if (session) {
        return res.status(200).json(session)
      } else {
        return res.status(400).end()
      }
    }
    res.status(400).end()
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

export default handler

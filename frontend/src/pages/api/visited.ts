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
      res.status(200).end(res.getHeader('Set-Cookie'))
    } else if (req.method === 'GET') {
      // TODO: may throw
      const stringValue = getSessionCookie(req)
      const session = JSON.parse(stringValue)
      if (session) {
        res.status(200).json(session)
      } else {
        res.status(400).end()
      }
    } else {
      res.status(400).end()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

export default handler

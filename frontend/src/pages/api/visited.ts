import type { NextApiRequest, NextApiResponse } from 'next'

import { Session } from 'src/types/user'
import { setSessionCookie, getSessionCookie } from 'src/lib/cookies'
const API_URL = 'http://api:3000'

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (req.method === 'POST') {
      console.log('req.body: ', req.body)
      const isFirstTime = req.body.isFirstTime ? req.body.isFirstTime : false

      const session: Session = { isFirstTime: isFirstTime }
      setSessionCookie(res, session)
      // res.status(200).send({ done: true })
      res.status(200).end(res.getHeader('Set-Cookie'))
    } else if (req.method === 'GET') {
      const session = getSessionCookie(req)
      console.log(session)
      res.status(200).json(session)
    } else {
      res.status(400).end()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

export default handler

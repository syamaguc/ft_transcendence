import { ChannelObject } from './types/chat'

export const API_URL = 'http://localhost:3000'
export const SITE_URL = 'http://localhost:3001'

export const DEFAULT_ROOM: ChannelObject = {
  id: 'default-channel',
  name: '',
  members: [],
  owner: '',
  admins: [],
  banned: [],
  muted: [],
  is_private: false,
  logs: [],
  password: '',
}

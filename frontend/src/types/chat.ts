export interface MessageObject {
  id: string
  userId: string
  username: string
  profile_picture: string
  message: string
  timestamp: Date
}

export interface ChannelObject {
  id: string
  name: string
  members: string[]
  owner: string
  admins: string[]
  is_private: boolean
  logs: MessageObject[]
  password: string
}

export interface DMObject {
  id: string
  toUserName: string
  logs: MessageObject[]
}

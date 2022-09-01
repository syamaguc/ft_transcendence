export enum UserStatus {
  ONLINE = 'Online',
  INGAME = 'In Game',
  OFFLINE = 'Offline',
}

export interface User {
  userId: string
  username: string
  email: string
  // password: string;
  profile_picture: string
  elo: number
  game_won: number
  lost_game: number
  numberOfParty: number
  ratio: number
  status: UserStatus
  sign_up_date: Date
  friends: string[]
  login42: string
  twoFactorAuth: boolean
  isBan: boolean
  isAdmin: boolean
  blockedUsers: string[]
}

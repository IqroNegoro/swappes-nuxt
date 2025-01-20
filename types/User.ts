export interface IUser {
    id: string
    email: string
    username: string
    password: string
    name: string
    bio: string
    banner: string
    avatar: string
    followers: string[]
    following: string[]
    followersCount: number
    followingCount: number
    isFollowing: boolean
    login_type: 'google' | 'password'
    createdAt: Date
    updatedAt: Date
}

export interface IToken {
    user: Pick<IUser, 'id'>
    token: string,
    expiredAt: number
}
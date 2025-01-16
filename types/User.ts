export interface IUser {
    id: string
    email: string
    username: string
    password: string
    name: string
    bio: string
    banner: string
    avatar: string
    login_type: 'google' | 'password'
}

export interface IToken {
    user: Pick<IUser, 'id'>
    token: string
}
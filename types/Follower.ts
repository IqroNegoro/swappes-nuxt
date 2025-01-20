export interface IFollower {
    id: string
    follower: IUser
    following: IUser
    createdAt: Date
    updatedAt: Date
}

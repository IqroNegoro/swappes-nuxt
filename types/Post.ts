export enum Visibility {
    PUBLIC = "Public",
    FOLLOWERS = "Followers",
    PRIVATE = "Private"
}

export interface IPost {
    id: string
    user: IUser
    visibility: Visibility
    content: string | null
    image: string | null
    likesCount: number
    commentsCount: number
    sharesCount: number
    likes: IUser["id"][]
    isShare: boolean
    share: IPost | null
    createdAt: string
    updatedAt: string
}
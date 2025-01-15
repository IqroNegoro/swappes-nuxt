export enum Visibility {
    PUBLIC = "Public",
    PRIVATE = "Private",
    FRIENDS = "Friends"
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
    createdAt: string
    updatedAt: string
}
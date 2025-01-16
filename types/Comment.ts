export interface IComment {
    id: string
    post: IPost
    user: IUser
    content: string
    image: string
    likesCount: number
    likes: IUser[]
    replyId: string | null
    replies?: IComment[]
    createdAt: Date
    updatedAt: Date
}
export interface IComment {
    id: string
    post: IPost
    user: IUser
    content: string
    image: string
    likesCount: number
    replyId: IComment
    createdAt: Date
    updatedAt: Date
}
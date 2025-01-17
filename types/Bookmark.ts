export interface IBookmark {
    id: string
    user: IUser
    post: IPost
    createdAt: Date
    updatedAt: Date
}
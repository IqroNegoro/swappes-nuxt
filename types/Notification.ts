export type INotificationType = 'like' | 'comment' | 'follow' | 'mention';

export interface INotification {
  id: string
  type: INotificationType
  isRead: boolean
  from: IUser
  to: IUser
  content: string
  post?: IPost
  counts: number
  users: IUser['id'][]
  createdAt: Date
  updatedAt: Date
}
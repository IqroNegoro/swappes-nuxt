import { Schema, model } from 'mongoose'

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'mention']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId, 
    ref: 'users',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'posts',
    required: false
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'users',
    default: []
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

notificationSchema.methods.toJSON = function() {
    return {
        id: this._id,
        post: this.post,
        from: this.from,
        isRead: this.isRead,
        type: this.type,
        content: this.content,
        updatedAt: this.updatedAt
    }
}

notificationSchema.virtual("content").get(function() {
    switch (this?.type) {
        case 'like':
            return `${this.counts > 0 ? `and ${this.counts} others` : ''} liked your post`
        case 'comment':
            return `${this.counts > 0 ? `and ${this.counts} others` : ''} commented on your post`
        case 'follow':
            return `followed you`
        case 'mention':
            return `${this.counts > 0 ? `and ${this.counts} others` : ''} mentioned you in a post`
        default:
            return ''
    }
});

notificationSchema.virtual("counts").get(function() {
    return this.users.length - 1;
});

const Notification = model<INotification>('notifications', notificationSchema);

export default Notification;
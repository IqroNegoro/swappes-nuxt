import { Schema, model } from 'mongoose';
import User from 'models/User';
import Post from 'models/Post';

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true
  },
  post: {
    type: Schema.Types.ObjectId, 
    ref: Post,
    required: true
  },
  content: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  likesCount: {
    type: Number,
    default: 0
  },
  replyId: {
    type: Schema.Types.ObjectId,
    ref: 'comments',
    default: null,
    required: false
  }
}, {
  timestamps: true
});

commentSchema.methods.toJSON = function() {
  return {
    id: this._id,
    user: this.user,
    post: this.post,
    content: this.content,
    image: this.image && `/images/${this.image}`,
    likesCount: this.likesCount,
    replyId: this.replyId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Comment = model('comments', commentSchema);

export default Comment;
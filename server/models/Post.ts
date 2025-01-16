import { Schema, model } from 'mongoose';
import User from './User';

const postSchema = new Schema<IPost>({
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true
  },
  visibility: {
    type: String,
    enum: Object.values(Visibility),
    default: Visibility.PUBLIC,
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
  commentsCount: {
    type: Number, 
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: User,
    default: []
  }]
}, {
    timestamps: true
});

postSchema.methods.toJSON = function() {
  return {
    id: this._id,
    user: this.user,
    visibility: this.visibility,
    content: this.content,
    image: this.image && `/images/${this.image}`,
    likesCount: this.likesCount,
    commentsCount: this.commentsCount,
    sharesCount: this.sharesCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Post = model('posts', postSchema);

export default Post;
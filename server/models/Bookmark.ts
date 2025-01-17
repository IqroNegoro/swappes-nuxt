import { Schema, model } from 'mongoose';
import User from './User';
import Post from './Post';

const bookmarkSchema = new Schema<IBookmark>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  post: {
    type: Schema.Types.ObjectId, 
    ref: "posts",
    required: true
  }
}, {
  timestamps: true
});

bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

bookmarkSchema.methods.toJSON = function() {
  return {
    id: this._id,
    user: this.user,
    post: this.post,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Bookmark = model('bookmarks', bookmarkSchema);

export default Bookmark;
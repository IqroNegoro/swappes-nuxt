import { Schema, model } from 'mongoose';
import Post from './Post';
import User from './User';
import Notification from './Notification';

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  post: {
    type: Schema.Types.ObjectId, 
    ref: "posts",
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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: User,
    default: []
  }],
  replyId: {
    type: Schema.Types.ObjectId,
    ref: 'comments',
    default: null,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

commentSchema.methods.toJSON = function() {
  return {
    id: this._id,
    user: this.user,
    post: this.post,
    content: this.content,
    image: this.image && `/images/${this.image}`,
    likesCount: this.likesCount,
    replies: this.replies,
    replyId: this.replyId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

commentSchema.pre('save',  async function(doc: IComment) {
  const post = await Post.findById(this.post);
  if (!post) {
    throw new Error("Post not found");
  }
});

commentSchema.post('save', {document: true}, async function(doc: IComment) {
  const post = await Post.findById(doc.post);
  if (!post) {
    throw new Error("Post not found");
  }
  await post.updateOne({$inc: {commentsCount: 1}});
  if (doc.user.toString() != post.user.toString()) {
    await Notification.findOneAndUpdate({
      post: doc.post,
      to: post.user,
      type: 'comment'
    }, {
      from: doc.user,
      isRead: false,
      $addToSet: {
        users: doc.user
      }
    }, {
      upsert: true
    })
  }
});

commentSchema.post('deleteOne', {document: true}, async function(doc: IComment) {
  const post = await Post.findById(doc.post);
  if (!post) {
    throw new Error("Post not found");
  }
  const comments = await Comment.deleteMany({replyId: doc.id});
  await post.updateOne({$inc: {commentsCount: -(1 + comments.deletedCount)}});
});

commentSchema.virtual("replies").get(function() {
  if (!this.replyId) return []
});

const Comment = model('comments', commentSchema);

export default Comment;
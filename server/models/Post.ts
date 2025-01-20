import { Schema, model } from 'mongoose';
import User from './User';
import Comment from './Comment';
import Notification from './Notification';

const postSchema = new Schema<IPost>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
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
  }],
  share: {
    type: Schema.Types.ObjectId,
    ref: "posts"
  },
  isShare: {
    type: Boolean,
    default: false
  }
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
    share: this.share,
    isShare: this.isShare,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

postSchema.post("save", {document: true}, async function(doc: IPost) {
  if (doc.isShare) {
    const post = await Post.findById(doc.share);
    if (!post) {
      throw new Error("Post not found");
    }
    await post.updateOne({$inc: {sharesCount: 1}});
  }
});

postSchema.post("deleteOne", {document: true}, async function(doc: IPost) {
  await Comment.deleteMany({post: doc._id});
  await Notification.deleteMany({post: doc._id});
});

const Post = model('posts', postSchema);

export default Post;
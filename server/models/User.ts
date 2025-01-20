import { Schema, model } from 'mongoose';

const userSchema = new Schema<IUser & { toProfile: () => IUser }>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String, 
    required: false
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    default: null,
    required: false
  },
  avatar: {
    type: String,
    default: null,
    required: false
  },
  bio: {
    type: String,
    default: null,
    required: false
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  login_type: {
    type: String,
    enum: ['google', 'password'],
    default: 'password'
  }
}, {
  timestamps: true
});

userSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    avatar: this.login_type === 'google' && this.avatar.startsWith('http') ? this.avatar : this.avatar && `/images/${this.avatar}`,
    banner: this.banner && `/images/${this.banner}`,
  }
}

userSchema.methods.toProfile = function() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    avatar: this.login_type === 'google' && this.avatar.startsWith('http') ? this.avatar : this.avatar && `/images/${this.avatar}`,
    bio: this.bio,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const User = model('users', userSchema);

export default User;

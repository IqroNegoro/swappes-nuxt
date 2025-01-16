import { Schema, model } from 'mongoose';

const userSchema = new Schema<IUser>({
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
    required: true
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
    avatar: this.login_type === 'google' ? this.avatar : this.avatar && `/images/${this.avatar}`,
    banner: this.banner && `/images/${this.banner}`
  }
}

const User = model('users', userSchema);

export default User;

import { Schema, model } from 'mongoose';
import User from './User';
const followerSchema = new Schema<IFollower>({
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    following: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, {
    timestamps: true
});

followerSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follower = model('followers', followerSchema);

export default Follower;
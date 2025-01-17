import mongoose from 'mongoose'
import User from "models/User";

const tokenSchema = new mongoose.Schema<IToken>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiredAt: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

const Token = mongoose.model('Token', tokenSchema)

export default Token;
import Comment from "models/Comment";
import { Types } from "mongoose";
const { ObjectId } = Types;

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const id = getRouterParam(e, "id");
            const exists = await Comment.exists({
                _id: new ObjectId(id),
                likes: {
                    $in: [new ObjectId(e.context.auth.id)]
                }
            });

            let comment;

            if (exists) {
                comment = await Comment.findByIdAndUpdate(id, {
                    $inc: {
                        likesCount: -1
                    },
                    $pull: {
                        likes: e.context.auth.id
                    }
                }, {
                    new: true
                }).select("likesCount replyId");
            } else {
                comment = await Comment.findByIdAndUpdate(id, {
                    $inc: {
                        likesCount: 1
                    },
                    $addToSet: {
                        likes: e.context.auth.id
                    }
                }, {
                    new: true
                }).select("likesCount replyId");
            }

            return {
                data: comment
            }
        } catch (error : any) {
            console.log(error)
            throw createError({
                statusCode: error.statusCode || 500,
                message: "Internal Server Error"
            })
        }
    }
});
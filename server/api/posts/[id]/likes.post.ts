import Post from "models/Post";
import { Types } from "mongoose";
const { ObjectId } = Types;

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const id = getRouterParam(e, "id");
            const exists = await Post.exists({
                _id: new ObjectId(id),
                likes: {
                    $in: [new ObjectId(e.context.auth.id)]
                }
            });

            console.log(exists)

            let post;

            if (exists) {
                post = await Post.findByIdAndUpdate(id, {
                    $inc: {
                        likesCount: -1
                    },
                    $pull: {
                        likes: e.context.auth.id
                    }
                }, {
                    new: true
                }).select("likesCount");
            } else {
                post = await Post.findByIdAndUpdate(id, {
                    $inc: {
                        likesCount: 1
                    },
                    $addToSet: {
                        likes: e.context.auth.id
                    }
                }, {
                    new: true
                }).select("likesCount");
            }

            return {
                data: post
            }
        } catch (error : any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: "Internal Server Error"
            })
        }
    }
});
import Post from "models/Post";
import Notification from "models/Notification";
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
                }).select("user likesCount");
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
                }).select("user likesCount");
            }
            
            if (post!.user.toString() != e.context.auth.id) {
                await Notification.findOneAndUpdate({
                  post: post!._id,
                  to: post!.user,
                  type: 'like'
                }, {
                  from: e.context.auth.id,
                  isRead: false,
                  $addToSet: {
                    users: e.context.auth.id
                  }
                }, {
                  upsert: true
                })
              }

            return {
                data: post
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
import Comment from "models/Comment";
import { Types } from "mongoose";
const { ObjectId } = Types;

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        try {
            const id = getRouterParam(e, "id");
            // const comments = await Comment.find({ post: id }).populate("user").populate("replyId");
            const comments = await Comment.aggregate([
                {
                    $match: {
                        post: new ObjectId(id),
                        replyId: null
                    }
                },
                {
                    $lookup: {
                        from: 'comments', localField: '_id', foreignField: 'replyId', as: 'replies',
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "user",
                                    foreignField: "_id",
                                    as: "user",
                                    pipeline: [
                                        {
                                            $project: {
                                                id: "$_id",
                                                _id: 0,
                                                name: 1,
                                                avatar: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: "$user"
                            },
                            {
                                $project: {
                                    id: "$_id",
                                    _id: 0,
                                    user: "$user",
                                    replies: "$replies",
                                    post: "$post",
                                    content: "$content",
                                    image: "$image",
                                    likesCount: "$likesCount",
                                    createdAt: "$createdAt",
                                    updatedAt: "$updatedAt"
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users', localField: 'user', foreignField: '_id', as: 'user',
                        pipeline: [
                            {
                                $project: {
                                    id: "$_id",
                                    _id: 0,
                                    name: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $project: {
                        id: "$_id",
                        _id: 0,
                        user: "$user",
                        replies: "$replies",
                        post: "$post",
                        content: "$content",
                        image: "$image",
                        likesCount: "$likesCount",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt"
                    }
                }
            ])
            return { data: comments };
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: "Internal Server Error"
            });
        }
    }
});

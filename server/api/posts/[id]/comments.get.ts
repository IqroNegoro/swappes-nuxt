import Comment from "models/Comment";
import { Types } from "mongoose";
const { ObjectId } = Types;

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        try {
            const id = getRouterParam(e, "id");
            // const comments = await Comment.find({ post: id }).populate([
            //     {
            //         path: "user",
            //         select: "name avatar"
            //     }, {
            //         path: "replyId",
            //         // as: "replies",
            //     }
            // ]);
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
                                $project: {
                                    post: 0,
                                    likes: 0
                                }
                            },
                            {
                                $unwind: "$user"
                            },
                            {
                                $addFields: {
                                    "user.avatar": {
                                        $concat: ["/images/", "$user.avatar"]
                                    },
                                    id: "$_id"
                                }
                            },
                            {
                                $unset: ["_id", "__v"]
                            }
                        ],
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
                                    avatar: {
                                        $concat: ["/images/", "$avatar"]
                                    }
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
            console.log(error)
            throw createError({
                statusCode: 500,
                statusMessage: "Internal Server Error"
            });
        }
    }
});

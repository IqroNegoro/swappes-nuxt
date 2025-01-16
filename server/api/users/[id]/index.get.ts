import User from "models/User";
import Post from "models/Post";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        try {
            const id = getRouterParam(event, 'id')
            const user = await User.findOne({ username: id })
            if (!user) {
                throw createError({
                    statusCode: 404,
                    message: "User not found"
                })
            }

            const posts = await Post.find({ user: user.id }).populate([{
                path: "user",
                select: "-email -password",
            }, {
                path: "share",
                select: '-likesCount -commentsCount -sharesCount -likes -comments -share',
                populate: {
                    path: "user",
                    select: "-email -password"
                }
            }]).sort({createdAt: -1});

            return {data: {
                user,
                posts
            }}
        } catch (error : any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })
        }
    }
})

import Post from "models/Post";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        try {
            const id = getRouterParam(event, 'id')
            
            const posts = await Post.find({ user: event.context.auth.id, $or: [
                {
                    visibility: 'Public'
                },
                {
                    user: event.context.auth.id,
                    visibility: 'Private'
                }
            ] }).populate([{
                path: "user",
                select: "-email -password",
            }, {
                path: "share",
                select: '-likes -comments -share',
                populate: {
                    path: "user",
                    select: "-email -password"
                }
            }]).sort({createdAt: -1});

            return { data: posts }
        } catch (error: any) {
            console.log(error);
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })
        }
    }
})

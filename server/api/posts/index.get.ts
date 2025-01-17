import Post from "models/Post";

export default defineEventHandler({
    onRequest: [auth],
    handler:async (e) => {
        try {
            const posts = await Post.find({
                $or: [
                    {
                        visibility: 'Public'
                    },
                    {
                        user: e.context.auth.id,
                        visibility: 'Private'
                    }
                ]
            }).populate([{
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

            return {data: posts};
        } catch (error : any) {
            console.log(error)
            throw createError({
                statusCode: 500,
                message: "Internal Server Error"
            })
        }
    }
})
import Post from "models/Post";

export default defineEventHandler(async (e) => {
    try {
        const posts = await Post.find().populate([{
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
        console.log(posts[0].share)
        return {data: posts};
    } catch (error : any) {
        throw createError({
            statusCode: 500,
            message: "Internal Server Error"
        })
    }
});
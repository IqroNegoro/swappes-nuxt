import Post from "models/Post";

export default defineEventHandler(async (e) => {
    try {
        const posts = await Post.find().populate("user", "-email -password -username").sort({createdAt: -1});
        return {data: posts};
    } catch (error : any) {
        throw createError({
            statusCode: 500,
            message: "Internal Server Error"
        })
    }
});
import Post from "models/Post";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        try {
            const id = getRouterParam(event, 'id')
            
            const posts = await Post.find({ user: id });

            return { data: posts }
        } catch (error: any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })
        }
    }
})

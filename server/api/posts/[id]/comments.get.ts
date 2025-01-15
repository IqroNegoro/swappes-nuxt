import Comment from "models/Comment";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        try {
            const id = getRouterParam(e, "id");
            const comments = await Comment.find({ post: id }).populate("user");
            return { data: comments };
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: "Internal Server Error"
            });
        }
    }
});

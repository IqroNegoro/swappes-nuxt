import Post from "models/Post";
import Bookmark from "models/Bookmark";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        try {
            const body = await readBody(event);
            
            if (!body.post) {
                throw createError({
                    statusCode: 400,
                    message: "Post is required"
                });
            }

            const post = await Post.findById(body.postId);

            if (!post) {
                throw createError({
                    statusCode: 404, 
                    message: "Post not found"
                });
            }

            const bookmark = await Bookmark.create({
                user: event.context.auth.id,
                post: body.postId
            });

            return {
                data: await bookmark.populate([{
                    path: "post",
                    populate: {
                        path: "user",
                        select: "-password -email"
                    }
                }])
            };

        } catch (error: any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            });
        }
    }
});

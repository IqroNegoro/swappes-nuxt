import Post from "models/Post";
import { join } from "path";
import { unlinkSync, existsSync } from "fs";

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const id = getRouterParam(e, "id");
            const post = await Post.findById(id);
            
            if (!post || post.user.toString() !== e.context.auth.id) {
                throw createError({
                    statusCode: 404,
                    message: "Post not found"
                });
            }
    
            if (post.image && existsSync(join(process.cwd(), "public", "images", post.image))) {
                unlinkSync(join(process.cwd(), "public", "images", post.image));
            }
    
            await post.deleteOne();
    
            return {data: post.id};
        } catch (error: any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error, try again"
            });
        }
    }
});

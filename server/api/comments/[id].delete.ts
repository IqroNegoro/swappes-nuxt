import Comment from "models/Comment";
import { join } from "path";
import { unlinkSync, existsSync } from "fs";

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const id = getRouterParam(e, "id");
            const comment = await Comment.findById(id);
            
            if (!comment || comment.user !== e.context.auth.id) {
                throw createError({
                    statusCode: 404,
                    message: "Comment not found"
                });
            }
    
            if (comment.image && existsSync(join(process.cwd(), "public", "images", comment.image))) {
                unlinkSync(join(process.cwd(), "public", "images", comment.image));
            }
    
            await comment.deleteOne();
    
            return {data: {
                id: comment.id,
                post: comment.post
            }};
        } catch (error: any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error, try again"
            });
        }
    }
});

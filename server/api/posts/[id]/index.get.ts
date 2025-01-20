import Post from "models/Post"

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const post = await Post.findOne({
                _id: e.context.params?.id,
                $or: [
                    {
                        visibility: 'Public'
                    },
                    {
                        user: e.context?.auth?.id,
                        visibility: 'Private'
                    }
                ]
            }).populate("user", "-email -password -banner");
    
            return {data: post};
        } catch (error : any) {
            throw createError({
                statusCode: 500,
                message: "Internal Server Error"
            })
        }
    }
});
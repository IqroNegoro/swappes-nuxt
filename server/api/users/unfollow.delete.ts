import Follower from 'models/Follower';
import User from 'models/User';

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        try {
            const { id } = await readBody(e);

            if (e.context.auth.id === id) {
                throw createError({
                    statusCode: 400,
                    message: "You cant unfollow yourself"
                })
            }

            const user = await User.findById(id);

            if (!user) {
                createError({
                    statusCode: 404,
                    message: "User not found!"
                });
            }
    
            const follower = await Follower.deleteOne({ follower: e.context.auth.id, following: id });

            await Promise.all([
                user!.updateOne({ $inc: { followersCount: -1 } }),
                User.updateOne({ _id: e.context.auth.id }, { $inc: { followingCount: -1 } })
            ]);
    
            return {
                data: follower
            };
        } catch (error : any) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })
        }
    }
});
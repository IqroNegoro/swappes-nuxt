import User from "models/User";
import Follower from "models/Follower";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        try {
            const id = getRouterParam(event, 'id')
            let user = await User.findOne({ username: id })

            if (!user) {
                throw createError({
                    statusCode: 404,
                    message: "User not found"
                })
            }

            // @ts-ignore
            user = user.toProfile();

            if (user!.id != event.context.auth.id) {
                const isFollowing = await Follower.exists({ follower: event.context.auth.id, following: user!.id })
                user!.isFollowing = isFollowing ? true : false;
            }

            return {
                data: user
            }
        } catch (error : any) {
            console.log(error)
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })
        }
    }
})

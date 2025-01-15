import User from "models/User";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (event) => {
        const id = getRouterParam(event, 'id')
        const user = await User.findById(id)
        return {data: user}
    }
})

import Notification from "models/Notification";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        const notifications = await Notification.find({
          to: e.context.auth.id
        }).populate([{
            path: "from",
            select: "-banner"
        }, {
            path: "post",
            select: "content"
        }]).sort({updatedAt: -1});
      
        return {
            data: notifications
        }
      }
})

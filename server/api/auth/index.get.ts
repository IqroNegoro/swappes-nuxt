export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        return {data: e.context.auth};
    }
});
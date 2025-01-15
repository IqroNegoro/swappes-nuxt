import Token from "models/Token";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        const { refresh_token } = parseCookies(e);

        await Token.findOneAndUpdate({
            _id: e.context.auth.id,
            token: refresh_token
        }, {
            token: null
        });

        deleteCookie(e, 'access_token', {
            httpOnly: true,
            secure: true
        });
    
        deleteCookie(e, 'refresh_token', {
            httpOnly: true,
            secure: true
        });
    
        setResponseStatus(e, 204)
    
        return {
            message: 'Logout success'
        }
    }
})
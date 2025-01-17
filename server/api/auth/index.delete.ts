import Token from "models/Token";

export default defineEventHandler({
    onRequest: [auth],
    handler: async (e) => {
        try {
            await Token.findByIdAndDelete(e.context.auth.id);
    
            deleteCookie(e, 'access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
        
            deleteCookie(e, 'refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
        
            setResponseStatus(e, 204)
        
            return {};
        } catch (error : any ) {
            throw createError({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            })            
        }
    }
})
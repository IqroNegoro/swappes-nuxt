import jwt from "jsonwebtoken";

export default defineEventHandler(e => {
    try {
        const {access_token} = parseCookies(e);

        const config = useRuntimeConfig();
        
        const user = jwt.verify(access_token, config.JWT_SECRET);
    
        // @ts-ignore
        delete user.iat;
        // @ts-ignore
        delete user.exp;

        e.context.auth = user;
    } catch (error : any) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            deleteCookie(e, "access_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            });

            deleteCookie(e, "refresh_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            });
        }
        
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        });
    }
});
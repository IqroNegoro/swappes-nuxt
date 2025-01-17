import jwt from "jsonwebtoken";
import Token from "models/Token";
import User from "models/User";

export default defineEventHandler(async e => {
    try {
        const {access_token, refresh_token} = parseCookies(e);

        let user = null;
        const config = useRuntimeConfig();
        
        if (access_token) {
            user = jwt.verify(access_token, config.JWT_SECRET);
        }

        if (!access_token && refresh_token) {
            const refresh = jwt.verify(refresh_token, config.REFRESH_SECRET) as {id: string} | null;
            if (refresh) {
                const token = await Token.findOne({user: refresh.id, token: refresh_token, expiredAt: {
                    $gt: +new Date()
                }});
                
                if (token) {
                    user = await User.findById(token.user).select("-password -email -banner -createdAt -updatedAt");
                    if (user) {
                        const accessToken = jwt.sign({
                            id: user._id,
                            username: user.username,
                            name: user.name, 
                            avatar: user.login_type === 'google' && user.avatar.startsWith('http') ? user.avatar : user.avatar && `/images/${user.avatar}`,
                        }, config.JWT_SECRET);
                
                        const refreshToken = jwt.sign({
                            id: user._id,
                        }, config.REFRESH_SECRET);
                
                        setCookie(e, 'access_token', accessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: "strict",
                            maxAge: 60 * 60
                        });
                
                        setCookie(e, 'refresh_token', refreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: "strict",
                            maxAge: 60 * 60 * 24 * 30
                        });
                
                        await Token.findByIdAndUpdate(user._id, { token: refreshToken, expiredAt: Date.now() + (1000 * 60 * 60 * 24 * 30) }, { upsert: true });
                    }
                }
            }
        }
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
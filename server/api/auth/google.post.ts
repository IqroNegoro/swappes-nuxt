import { OAuth2Client } from "google-auth-library";
import User from "models/User";
import jwt from "jsonwebtoken";
import Token from "models/Token";

export default defineEventHandler(async (event) => {
    try {
        const { token } = await readBody(event);
        const config = useRuntimeConfig();

        const auth = new OAuth2Client({
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET
        });

        auth.setCredentials({
            access_token: token
        });

        const userInfo : any = await auth.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });

        let user = await User.findOne({ email: userInfo.data.email }).select('-password');

        if (!user) {
            user = await User.create({
                email: userInfo.data.email,
                name: userInfo.data.name,
                login_type: 'google',
                avatar: userInfo.data.picture
            });
        }

        const accessToken = jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name, 
            avatar: user.avatar,
        }, config.JWT_SECRET);

        const refreshToken = jwt.sign({
            id: user._id,
        }, config.REFRESH_SECRET);

        setCookie(event, 'access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 60 * 60
        });

        setCookie(event, 'refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30
        });

        await Token.findByIdAndUpdate(user._id, { token: refreshToken }, { upsert: true });

        return {
            data: user
        };
    } catch (error : any) {
        console.log(error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Invalid Authentication'
        });
    }
})
import { OAuth2Client } from "google-auth-library";
import User from "models/User";
import Token from "models/Token";
import jwt from "jsonwebtoken";
import slugify from "slugify";

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

        let user = await User.findOne({ email: userInfo.data.email }).select('-password -banner');

        if (!user) {
            user = await User.create({
                email: userInfo.data.email,
                name: userInfo.data.name,
                username: slugify(userInfo.data.name, { lower: true, strict: true, trim: true, remove: /[^a-zA-Z0-9.]/gi, replacement: '' }) + Math.floor(Math.random() * 1000000),
                login_type: 'google',
                avatar: userInfo.data.picture
            });
        }

        const accessToken = jwt.sign({
            id: user._id,
            username: user.username,
            name: user.name, 
            avatar: user.login_type === 'google' && user.avatar.startsWith('http') ? user.avatar : user.avatar && `/images/${user.avatar}`,
        }, config.JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({
            id: user._id,
        }, config.REFRESH_SECRET, { expiresIn: '30d' });

        setCookie(event, 'access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 60 * 60,
            path: '/'   
        });

        setCookie(event, 'refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        });

        await Token.findByIdAndUpdate(user._id, { user: user._id, token: refreshToken, expiredAt: Date.now() + (1000 * 60 * 60 * 24 * 30) }, { upsert: true });

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
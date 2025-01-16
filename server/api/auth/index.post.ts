import User from "models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { object, string, ValidationError } from 'yup';

export default defineEventHandler(async e => {
    try {
        const payload = await readBody(e);
    
        const { credential, password } = await object({
            credential: string().required().ensure().trim(),
            password: string().min(8).required().ensure().trim()
        }).validate(payload, {abortEarly: false});

        const user = await User.findOne({ $or: [{ email: credential }, { username: credential }] });
    
        if (!user) {
            throw createError({
                statusCode: 401,
                message: "Email or Password Wrong"
            });
        }
    
        if (user.login_type == 'google') {
            throw createError({
                statusCode: 401,
                message: "Login With Google Instead"
            })
        }
    
        const isValid = bcrypt.compareSync(password, user.password);
    
        if (!isValid) {
            throw createError({
                statusCode: 401,
                message: "Email or Password Wrong"
            });
        }
    
        const config = useRuntimeConfig();
    
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
    
        return {
            data: user
        };
    } catch (error : any) {
        if (error instanceof ValidationError) {
            const errors = error.inner.reduce((acc: any, v: any) => {
                acc[v.path] = v.message;
                return acc;
            }, {});
            throw createError({
                statusCode: 400,
                message: "Validation Error",
                data: errors
            })
        }
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: "Internal Server Error",
            message: error.message || "",
            data: error.data || {}
        })
    }
});
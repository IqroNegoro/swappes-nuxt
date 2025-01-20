import User from "models/User";
import bcrypt from "bcryptjs";
import { object, string, ValidationError } from 'yup';
import slugify from "slugify";

export default defineEventHandler(async e => {
    try {
        const payload = await readBody(e);

        const { username, name, email, password, bio } = await object({
            name: string().max(100).required().ensure().trim(),
            username: string().required().ensure().trim().matches(/^[a-zA-Z0-9.]+$/gi, "Username not valid!").max(25),
            email: string().email().required().ensure().trim(),
            password: string().min(8).required().ensure().trim(),
            bio: string().required().max(300).ensure().trim()
        }).validate(payload, {abortEarly: false});
    
        const exists = await User.exists({ $or: [{ email }, { username }] });
    
        if (exists) {
            throw createError({
                statusCode: 409,
                message: "Email or Username already exists"
            });
        }

        let hashedPassword;

        if (password) {
            hashedPassword = bcrypt.hashSync(password, 12);
        }

        const user = await User.findByIdAndUpdate(e.context.auth.id, { email, username, password: hashedPassword, name, bio }, {
            new: true
        });
    
        return {
            data: user
        }
    } catch (err : any) {
        if (err instanceof ValidationError) {
            const errors = err.inner.reduce((acc: any, v: any) => {
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
            statusCode: err.statusCode || 500,
            statusMessage: "Internal Server Error",
            message: err.message || "",
            data: err.data || {}
        })
    }
});
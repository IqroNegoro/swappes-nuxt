import User from "models/User";
import bcrypt from "bcryptjs";
import { object, string, ValidationError } from 'yup';
import slugify from "slugify";

export default defineEventHandler(async e => {
    try {
        const payload = await readBody(e);

        const { name, username, email, password } = await object({
            name: string().required().ensure().trim(),
            username: string().required().ensure().trim().matches(/^[a-zA-Z0-9.]+$/gi, "Username not valid!").max(25),
            email: string().email().required().ensure().trim(),
            password: string().min(8).required().ensure().trim(),
        }).validate(payload, {abortEarly: false});
    
        const exists = await User.exists({ $or: [{ email }, { username }] });
    
        if (exists) {
            throw createError({
                statusCode: 409,
                message: "Email or Username already exists"
            });
        }
    
        const hashedPassword = bcrypt.hashSync(password, 12);

        const user = await User.create({ email, username, password: hashedPassword, name, login_type: 'password' });
    
        return {
            message: "User created successfully",
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
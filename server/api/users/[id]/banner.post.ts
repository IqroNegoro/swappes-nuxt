import User from "models/User";
import { join } from "path";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers"
import slugify from "slugify";
import { unlinkSync, existsSync } from "fs";
import jwt from "jsonwebtoken";

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        let image: string | null = null;
        try {
            const user = await User.findById(e.context.auth.id);
            if (!user) {
                throw createError({
                    statusCode: 404,
                    message: "User not found"
                })
            }
            const { files, form } = await readFiles(e, {
                // @ts-ignore
                uploadDir: join(process.cwd(), "public", "images"),
                createDirsFromUploads: true,
                keepExtensions: true,
                maxFileSize: 1024 * 1024 * 10,
                filter: function ({name, originalFilename, mimetype}: {name: string, originalFilename: string, mimetype: string}) {
                    return mimetype && mimetype.includes("image") && ["jpg", "jpeg", "png", "webp"].includes(mimetype.split("/")[1]);
                },
                filename: (name : string, ext : string) => {
                    const cleanName = slugify(name, {
                        lower: true,
                        strict: true,
                        trim: true
                    })
                  return `${Date.now()}-${cleanName}${ext}`
                }
            });
            
            const image = firstValues(form, files, []).image?.newFilename
            
            const updated = await user.updateOne({ banner: image });

            if (image) {
                if (user!.banner && existsSync(join(process.cwd(), "public", "images", user!.banner))) {
                    unlinkSync(join(process.cwd(), "public", "images", user!.banner));
                }
            }

            const config = useRuntimeConfig();

            const accessToken = jwt.sign({
                id: user!._id,
                username: user!.username,
                name: user!.name, 
                avatar: user!.avatar,
            }, config.JWT_SECRET);
    
            setCookie(e, 'access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: 60 * 60
            });
       
            return {data: {
                banner: `/images/${image}`
            }};
        } catch (error) {
            console.log(error)
            if (image) {
                unlinkSync(join(process.cwd(), "public", "images", image));
            }
            throw createError({
                statusCode: 500,
                message: "Internal Server Error, try again"
            });
        }
    }
});
import Post from "models/Post";
import { join } from "path";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers"
import slugify from "slugify";
import { unlinkSync, existsSync } from "fs";
import { object, string, ValidationError, mixed } from "yup";

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        let newImage : string | null = null;
        try {
            const id = getRouterParam(e, "id");
            let post = await Post.findById(id);

            if (!post || post.user.toString() !== e.context.auth.id) {
                throw createError({
                    statusCode: 404,
                    message: "Post not found"
                });
            }
    
            const { fields, files, form } = await readFiles(e, {
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
            
            newImage = firstValues(form, files, []).image?.newFilename;
            const body = firstValues(form, fields, []);
            body.image = newImage ?? body.image?.replace('/images/', '') ?? null;
    
            const { content, image, visibility } = await object<Pick<IPost, "content" | "visibility">>().shape({
                content: string().max(5000).ensure().trim().when("image", ([val], schema) => val ? schema.notRequired() : schema.required()).ensure().trim(),
                image: mixed().when("content", ([val], schema) => val ? schema.notRequired() : schema.required()),
                visibility: string().oneOf(Object.values(Visibility)).required().default(Visibility.PUBLIC)
            }, [["content", "image"]]).validate(body, {abortEarly: false});
    
            let updatedPost = await Post.findOneAndUpdate({ _id: id }, { visibility, content, image }, {
                new: true
            }).populate([
                {
                    path: "user",
                },
                {
                    path: "share",
                    select: '-likesCount -commentsCount -likes -comments -share',
                    populate: {
                        path: "user"
                    }
                }
            ]);
    
            if (!image) {
                if (post!.image && existsSync(join(process.cwd(), "public", "images", post!.image))) {
                    unlinkSync(join(process.cwd(), "public", "images", post!.image));
                }
            }
    
            return {data: updatedPost};
        } catch (error : any) {
            if (newImage) {
                if (existsSync(join(process.cwd(), "public", "images", newImage))) {
                    unlinkSync(join(process.cwd(), "public", "images", newImage));
                }
            }
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
                message: error.message || "Internal Server Error, try again"
            });
        }
    }
});
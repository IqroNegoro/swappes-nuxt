import Post from "models/Post";
import { join } from "path";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers"
import slugify from "slugify";
import { unlink } from "fs/promises";
import { object, string, ValidationError, mixed, boolean } from "yup";

export default defineEventHandler({
    onRequest: [auth],
    handler: async e => {
        let image: string | null = null;
        try {
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
            
            image = firstValues(form, files, []).image?.newFilename
            const body = firstValues(form, fields, []);
            body.image = image;
            const { content, visibility, isShare, share } = await object<Pick<IPost, "content" | "visibility">>().shape({
                content: string().max(5000).ensure().trim().when("image", ([val], schema) => val ? schema.notRequired() : schema.required()),
                image: mixed().when("content", ([val], schema) => val ? schema.notRequired() : schema.required()),
                isShare: boolean().nullable().default(false),
                share: string().nullable().when("isShare", ([val], schema) => !val ? schema.notRequired() : schema.required()),
                visibility: string().oneOf(Object.values(Visibility)).required().default(Visibility.PUBLIC)
            }, [["content", "image"], ["isShare", "share"]]).validate(body, {abortEarly: false});

            if (isShare) {
                const post = await Post.findById(share);
                if (!post) {
                    throw createError({
                        statusCode: 404,
                        message: "Post not found"
                    });
                }
            }
            
            const post = await Post.create({ user: e.context.auth.id, visibility, content, image, share, isShare });
       
            const data = await post.populate([
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
            
            return {data};
        } catch (error) {
            console.log(error)
            if (image) {
                await unlink(join(process.cwd(), "public", "images", image));
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
                statusCode: 500,
                message: "Internal Server Error, try again"
            });
        }
    }
});
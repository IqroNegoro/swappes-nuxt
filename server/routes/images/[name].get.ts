import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler((event) => {
    const name = getRouterParam(event, 'name')
    
    if (!name) {
        throw createError({
            statusCode: 404,
        })
    }
    
    const filePath = join(process.cwd(), 'public', 'images', name)
    
    try {
        if (existsSync(filePath)) {
            return createReadStream(filePath)
        }
    } catch (error) {
        throw createError({
            statusCode: 404,
            message: 'Image not found!'
        })
    }
})

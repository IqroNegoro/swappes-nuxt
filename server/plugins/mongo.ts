import mongoose from 'mongoose'

export default defineNitroPlugin(async (nuxtApp) => {
    try {
        const config = useRuntimeConfig();
        await mongoose.connect(process.env.NODE_ENV === 'production' ? config.MONGODB_URI : config.MONGODB_DEV);
        console.log("MongoDB Connected") 

        nuxtApp.hooks.hook("close", async () => {
            await mongoose.disconnect();
            console.log("MongoDB Disconnected")
        })
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
})

<template>
    <div class="container mx-auto p-4">
        <!-- <div class="bg-primary rounded-lg shadow-lg p-6">
            <div class="flex flex-col items-center mb-6">
                <Avatar class="w-32 h-32 mb-4">
                    <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Profile Picture" class="rounded-full" />
                    <AvatarFallback>
                        <Skeleton class="rounded-full" />
                    </AvatarFallback>
                </Avatar>
                <h1 class="text-2xl font-bold text-white">{{ user.name }}</h1>
                <p class="text-gray-300">@{{ user.username }}</p>
            </div>

            <div class="text-center mb-6">
                <p class="text-gray-300">{{ user.bio || "No bio yet" }}</p>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6 text-center">
                <div class="bg-black/10 p-4 rounded-lg">
                    <p class="text-xl font-bold text-white">245</p>
                    <p class="text-gray-300">Posts</p>
                </div>
                <div class="bg-black/10 p-4 rounded-lg">
                    <p class="text-xl font-bold text-white">14.3K</p>
                    <p class="text-gray-300">Followers</p>
                </div>
                <div class="bg-black/10 p-4 rounded-lg">
                    <p class="text-xl font-bold text-white">892</p>
                    <p class="text-gray-300">Following</p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <Post v-for="i in 5" :key="i" :post="{
                    id: i.toString(),
                    user: user,
                    content: 'Sample post content',
                    visibility: 'PUBLIC',
                    likesCount: 0,
                    commentsCount: 0,
                    sharesCount: 0,
                    createdAt: new Date()
                }" />
            </div>
        </div> -->
    </div>
</template>
<script setup lang="ts">
const { id } = useRoute().params;

const { data: user, status: userStatus, error: userError } = await getUser(id as string);
const { data: posts, status: postStatus, error: postError} = await getUserPosts(user.value!.id, {
    watch: [user]
});
</script>
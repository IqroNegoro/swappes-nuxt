<template>
    <div class="w-3/4 mx-auto">
        <div class="w-full max-h-96 relative aspect-video rounded-b-lg overflow-hidden" @click="">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 z-10"></div>
            <img src="https://images3.alphacoders.com/127/1273121.jpg" alt="" class="w-full h-full object-cover aspect-video">
        </div>
        <div class="w-full flex px-8 -translate-y-16 relative z-20">
            <div class="flex flex-col gap-4">
                <Avatar class="w-32 h-32">
                    <AvatarImage v-if="user?.user?.avatar" :src="user.user.avatar" alt="Profile Picture" class="rounded-full" />
                    <AvatarFallback>
                        <Skeleton class="rounded-full" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p class="text-white text-2xl font-bold">{{ user?.user?.name }}</p>
                    <p class="text-gray-300 font-light">@{{ user?.user?.username }}</p>
                    <p class="">{{ user?.user?.bio ?? 'This user has no bio yet' }}</p>
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <Button></Button>
            </div>
        </div>
        <div class="w-3/4 mx-auto flex flex-col gap-4 px-8">
            <p class="text-white text-2xl font-bold">Posts</p>
            <div class="w-full flex flex-col gap-4" v-if="user.user.id == userStore.id">
                <div class="flex gap-2 w-full bg-primary p-4">
                    <Avatar>
                        <AvatarImage v-if="userStore.avatar" :src="userStore.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                        <AvatarFallback>
                            <Skeleton class="rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                    <button @click="createPostStatus = true"
                        class="rounded-md bg-black/10 w-full p-2 text-left text-white/50">
                        What do you think right now?
                    </button>
                </div>
                <Post v-for="post in user?.posts" :key="post.id" :post="post" @select-post="post => selectedPost = post"
                    @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" @share-post="post => sharePost = post" />
            </div>
        </div>
        <PostCreate v-if="createPostStatus" @close="createPostStatus = false" @create-post="handlePostCreated" />
        <PostSelected v-if="selectedPost" @close="selectedPost = null" :post="selectedPost" @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" @delete-comment="handleDeleteComment" @post-comment="handlePostComment" @share-post="post => sharePost = post" />
        <PostEdit v-if="editPost" @close="editPost = null" :post="editPost" @update-post="handlePostUpdated" />
        <PostShare v-if="sharePost" @close="sharePost = null" :post="sharePost" @share-post="handlePostCreated" />
    </div>
</template>
<script setup lang="ts">
const { id } = useRoute().params as { id: string };

const userStore = useUserStore();

const { data: user, status: userStatus, error: userError } = await getUser(id);

useHead({
    title: () => `${user.value?.user.name} in Swappes`
})

const selectedPost = ref<IPost | null>(null);
const createPostStatus = ref<boolean>(false);
const editPost = ref<IPost | null>(null);
const sharePost = ref<IPost | null>(null);

const handlePostCreated = (post: IPost) => {
    user.value!.posts.unshift(post);
    createPostStatus.value = false;
    sharePost.value = null;
    if (post.isShare && post.share) {
        const index = user.value!.posts.findIndex(p => p.id === post.share?.id);
        if (index !== -1) {
            user.value!.posts[index].sharesCount = post.share!.sharesCount;
        }
    }
}

const handlePostUpdated = (post: IPost) => {
    const index = user.value!.posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
        user.value!.posts[index] = post;
    }
    editPost.value = null;
    selectedPost.value = null;
}

const handleDeletePost = (id: string) => {
    user.value!.posts = user.value!.posts.filter(post => post.id !== id);
}

const handleLikePost = (data: Pick<IPost, "id" | "likesCount">) => {
    const index = user.value!.posts.findIndex(p => p.id === data.id);
    if (index !== -1) {
        user.value!.posts[index].likesCount = data.likesCount;
    }
}

const handlePostComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = user.value!.posts.findIndex(v => v.id == data.id);
    if (index !== -1) {
        user.value!.posts[index].commentsCount = data.commentsCount;
    }
}

const handleDeleteComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = user.value!.posts.findIndex(v => v.id == data.id);
    if (index !== -1) {
        user.value!.posts[index].commentsCount = data.commentsCount;
    }
}
</script>
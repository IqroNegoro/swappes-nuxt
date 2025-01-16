<template>
    <div class="w-full md:w-3/4 lg:w-1/2 mx-auto flex justify-center py-2">
        <div class="w-full flex flex-col gap-2">
            <div class="flex gap-2 w-full bg-primary p-4">
                <Avatar>
                    <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                    <AvatarFallback>
                        <Skeleton class="rounded-full" />
                    </AvatarFallback>
                </Avatar>
                <button @click="createPostStatus = true"
                    class="rounded-md bg-black/10 w-full p-2 text-left text-white/50">
                    What do you think right now?
                </button>
            </div>
            <template v-if="status === 'pending'">
                <PostSkeleton v-for="i in 5" :key="i" />
            </template>
            <div v-else-if="status === 'error'">Error</div>
            <p v-else-if="!posts.length" class="text-center">There is no posts, create one!</p>
            <template v-else>
                <Post v-for="post in posts" :key="post.id" :post="post" @select-post="post => selectedPost = post"
                    @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" @share-post="post => sharePost = post" />
            </template>
        </div>
        <PostCreate v-if="createPostStatus" @close="createPostStatus = false" @create-post="handlePostCreated" />
        <PostSelected v-if="selectedPost" @close="selectedPost = null" :post="selectedPost" @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" @delete-comment="handleDeleteComment" @post-comment="handlePostComment" />
        <PostEdit v-if="editPost" @close="editPost = null" :post="editPost" @update-post="handlePostUpdated" />
        <PostShare v-if="sharePost" @close="sharePost = null" :post="sharePost" @share-post="handlePostCreated" />
    </div>
</template>
<script setup lang="ts">

useHead({
    title: "Swappes"
});

const user = useUserStore();

const { data: posts, status, error, refresh } = await getPosts();

const selectedPost = ref<IPost | null>(null);
const createPostStatus = ref<boolean>(false);
const editPost = ref<IPost | null>(null);
const sharePost = ref<IPost | null>(null);

const handlePostCreated = (post: IPost) => {
    posts.value.unshift(post);
    createPostStatus.value = false;
    sharePost.value = null;
    if (post.isShare && post.share) {
        const index = posts.value.findIndex(p => p.id === post.share?.id);
        if (index !== -1) {
            posts.value[index].sharesCount = post.share!.sharesCount;
        }
    }
}

const handlePostUpdated = (post: IPost) => {
    const index = posts.value.findIndex(p => p.id === post.id);
    if (index !== -1) {
        posts.value[index] = post;
    }
    editPost.value = null;
    selectedPost.value = null;
}

const handleDeletePost = (id: string) => {
    posts.value = posts.value.filter(post => post.id !== id);
}

const handleLikePost = (data: Pick<IPost, "id" | "likesCount">) => {
    const index = posts.value.findIndex(p => p.id === data.id);
    if (index !== -1) {
        posts.value[index].likesCount = data.likesCount;
    }
}

const handlePostComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = posts.value.findIndex(v => v.id == data.id);
    if (index !== -1) {
        posts.value[index].commentsCount = data.commentsCount;
    }
}

const handleDeleteComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = posts.value.findIndex(v => v.id == data.id);
    if (index !== -1) {
        posts.value[index].commentsCount = data.commentsCount;
    }
}
</script>
<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col gap-2 rounded-lg shadow-lg p-6">
            <div class="flex flex-col items-center mb-6">
                <Avatar class="w-32 h-32 mb-4">
                    <AvatarImage v-if="user?.user?.avatar" :src="user.user.avatar" alt="Profile Picture" class="rounded-full" />
                    <AvatarFallback>
                        <Skeleton class="rounded-full" />
                    </AvatarFallback>
                </Avatar>
                <h1 class="text-2xl font-bold text-white">{{ user?.user?.name }}</h1>
                <p class="text-gray-300">@{{ user?.user?.username }}</p>
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

            <div class="flex flex-col gap-2 md:w-2/3 w-full mx-auto">
                <div class="flex gap-2 w-full bg-primary p-4">
                    <template v-if="userStore.id == user?.user.id">
                        <Avatar>
                            <AvatarImage v-if="user.user.avatar" :src="user.user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                            <AvatarFallback>
                                <Skeleton class="rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                        <button @click="createPostStatus = true"
                            class="rounded-md bg-black/10 w-full p-2 text-left text-white/50">
                            What do you think right now?
                        </button>
                    </template>
                </div>
                <Post v-for="post in user?.posts" :key="post.id" :post="post" @select-post="post => selectedPost = post"
                    @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" />
            </div>
        </div>
        <PostCreate v-if="createPostStatus" @close="createPostStatus = false" @create-post="handlePostCreated" />
        <PostSelected v-if="selectedPost" @close="selectedPost = null" :post="selectedPost" @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost" @delete-comment="handleDeleteComment" @post-comment="handlePostComment" />
        <PostEdit v-if="editPost" @close="editPost = null" :post="editPost" @update-post="handlePostUpdated" />
    </div>
</template>
<script setup lang="ts">
const { id } = useRoute().params as { id: string };

const userStore = useUserStore();

const { data: user, status: userStatus, error: userError } = await getUser(id);

const selectedPost = ref<IPost | null>(null);
const createPostStatus = ref<boolean>(false);
const editPost = ref<IPost | null>(null);

const handlePostCreated = (post: IPost) => {
    user.value!.posts.unshift(post);
    createPostStatus.value = false;
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
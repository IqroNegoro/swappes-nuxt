<template>
    <div class="md:w-3/4 w-full mx-auto">
        <UserSkeleton v-if="status === 'pending'" />
        <div v-else-if="status === 'error'" class="w-full flex flex-col h-dvh justify-center items-center gap-4">
            <i class="bx bx-error text-white text-2xl"></i>
            <p class="text-white text-2xl font-bold">Error</p>
            <p class="text-gray-300 font-light">We cannot load this user right now, please try again later.</p>
            <Button @click="refresh">
                Refresh
            </Button>
        </div>
        <template v-else>
            <div class="w-full max-h-96 relative aspect-video rounded-b-lg overflow-hidden">
                <input type="file" id="banner" name="banner" accept="image/*" hidden @change="handleBannerUpload" />
                <div
                    class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 z-10 flex justify-end items-end pointer-events-none">
                    <Button v-if="previewBanner && banner" class="cursor-pointer pointer-events-auto m-2"
                        @click="handleUploadBanner" :disabled="statusUpload">
                        Update Banner
                    </Button>
                    <Button v-if="previewBanner && banner" class="cursor-pointer pointer-events-auto m-2"
                        @click="banner = null" :disabled="statusUpload">
                        Cancel
                    </Button>
                </div>
                <label for="banner" @click="user?.user.id != userStore.id || banner ? $event.preventDefault() : null"
                    :class="{ 'pointer-events-none': user?.user.id != userStore.id || banner }">
                    <img v-if="previewBanner && banner" :src="previewBanner" alt="User Banner"
                        class="w-full h-full object-cover aspect-video">
                    <img v-else-if="user?.user.banner" :src="user?.user.banner" :alt="`${user?.user.name} Banner`"
                        class="w-full h-full object-cover aspect-video">
                    <div v-else class="w-full h-full object-cover aspect-video bg-white/50">
                    </div>
                </label>
            </div>
            <div class="w-full flex px-8 -translate-y-16 relative z-20 pointer-events-none">
                <div class="flex flex-col gap-4 pointer-events-auto relative">
                    <input type="file" id="avatar" name="avatar" accept="image/*" hidden @change="handleAvatarUpload" />
                    <label for="avatar" class="cursor-pointer pointer-events-auto"
                        @click="user?.user.id != userStore.id || avatar ? $event.preventDefault() : null"
                        :class="{ 'pointer-events-none': user?.user.id != userStore.id || avatar }">
                        <Avatar class="w-32 h-32">
                            <AvatarImage referrer-policy="no-referrer" v-if="previewAvatar && avatar"
                                :src="previewAvatar" alt="Profile Picture" class="rounded-full" />
                            <AvatarImage referrer-policy="no-referrer" v-else-if="user?.user?.avatar"
                                :src="user.user.avatar" alt="Profile Picture" class="rounded-full" />
                            <AvatarFallback>
                                <Skeleton class="rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                    </label>
                    <div>
                        <p class="text-white text-2xl font-bold">{{ user?.user?.name }}</p>
                        <p class="text-gray-300 font-light">@{{ user?.user?.username }}</p>
                        <p class="">{{ user?.user?.bio ?? 'This user has no bio yet' }}</p>
                    </div>
                    <div class="bg-primary p-1 flex flex-col w-max rounded-sm absolute top-2 left-full"
                        v-if="user?.user?.id == userStore.id && previewAvatar && avatar">
                        <div class="w-2 h-2 rotate-45 absolute -left-1 top-2 bg-primary"></div>
                        <Button class="cursor-pointer pointer-events-auto m-2" @click="handleUploadAvatar"
                            :disabled="statusUpload">
                            Update Avatar
                        </Button>
                        <Button class="cursor-pointer pointer-events-auto m-2 text-left" @click="avatar = null"
                            :disabled="statusUpload">
                            Cancel
                        </Button>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <Button></Button>
                </div>
            </div>
            <div class="lg:w-3/4 w-full mx-auto flex flex-col gap-4">
                <p class="text-white text-2xl font-bold">Posts</p>
                <div class="flex gap-2 w-full bg-primary p-4" v-if="user?.user?.id == userStore.id">
                    <Avatar>
                        <AvatarImage referrer-policy="no-referrer" v-if="userStore.avatar" :src="userStore.avatar"
                            alt="Irene Arknight" class="w-16 h-16 rounded-full" />
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
                    @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost"
                    @share-post="post => sharePost = post" />
            </div>
            <PostCreate v-if="createPostStatus" @close="createPostStatus = false" @create-post="handlePostCreated" />
            <PostSelected v-if="selectedPost" @close="selectedPost = null" :post="selectedPost"
                @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost"
                @delete-comment="handleDeleteComment" @post-comment="handlePostComment"
                @share-post="post => sharePost = post" />
            <PostEdit v-if="editPost" @close="editPost = null" :post="editPost" @update-post="handlePostUpdated" />
            <PostShare v-if="sharePost" @close="sharePost = null" :post="sharePost" @share-post="handlePostCreated" />
        </template>
    </div>
</template>
<script setup lang="ts">
import { useToast } from '@/components/ui/toast/use-toast';
const { id } = useRoute().params as { id: string };

const userStore = useUserStore();

const { data: user, status, error, refresh } = await getUser(id);

useHead({
    title: () => `@${user.value?.user.username} in Swappes`
})

const { toast } = useToast();

const selectedPost = ref<IPost | null>(null);
const createPostStatus = ref<boolean>(false);
const editPost = ref<IPost | null>(null);
const sharePost = ref<IPost | null>(null);

const banner = ref<File | null>(null);
const previewBanner = ref<string | null>(null);

const avatar = ref<File | null>(null);
const previewAvatar = ref<string | null>(null);

const statusUpload = ref<boolean>(false);

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

const handleUploadAvatar = async () => {
    try {
        statusUpload.value = true;
        const formData = new FormData();
        formData.append("image", avatar.value as File);
        const response = await $fetch<{ data: Pick<IUser, "avatar"> }>(`/api/users/${userStore.id}/avatar`, {
            method: "POST",
            body: formData
        });

        user.value!.user.avatar = response.data.avatar;
        userStore.$patch({
            avatar: response.data.avatar
        });
        avatar.value = null;

        statusUpload.value = false;

        toast({
            title: "Success!",
            description: "Your avatar has been updated successfully.",
        })
    } catch (error: any) {
        statusUpload.value = false;
        toast({
            title: "Error!",
            description: "We cannot update your avatar right now, please try again later. Error : " + error.message,
        })
    }
}

const handleAvatarUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file?.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return;
    }

    if (file) {
        avatar.value = file;
        input.value = "";
    }
}

const avatarListener = watch(avatar, (val, oldVal) => {
    if (previewAvatar.value) {
        URL.revokeObjectURL(previewAvatar.value);
        previewAvatar.value = null;
    }
    if (val) {
        previewAvatar.value = URL.createObjectURL(val as File);
    }
});

const handleUploadBanner = async () => {
    try {
        statusUpload.value = true;

        const formData = new FormData();
        formData.append("image", banner.value as File);
        const response = await $fetch<{ data: Pick<IUser, "banner"> }>(`/api/users/${userStore.id}/banner`, {
            method: "POST",
            body: formData
        });

        user.value!.user.banner = response.data.banner;
        banner.value = null;

        statusUpload.value = false;

        toast({
            title: "Success!",
            description: "Your banner has been updated successfully.",
        })
    } catch (error: any) {
        statusUpload.value = false;
        toast({
            title: "Error!",
            description: "We cannot update your banner right now, please try again later. Error : " + error.message,
        })
    }
}

const handleBannerUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file?.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return;
    }

    if (file) {
        banner.value = file;
        input.value = "";
    }
}

const bannerListener = watch(banner, (val, oldVal) => {
    if (previewBanner.value) {
        URL.revokeObjectURL(previewBanner.value);
        previewBanner.value = null;
    }
    if (val) {
        previewBanner.value = URL.createObjectURL(val as File);
    }
});

onBeforeUnmount(() => {
    if (previewBanner.value) {
        URL.revokeObjectURL(previewBanner.value);
    }

    bannerListener();
    avatarListener();
});
</script>
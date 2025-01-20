<template>
    <div class="md:w-3/4 w-full mx-auto">
        <UserSkeleton v-if="status === 'pending'" />
        <Error v-else-if="error" :refresh="refresh" :full="true" />
        <template v-else>
            <div class="w-full max-h-96 relative aspect-video rounded-b-lg overflow-hidden">
                <input v-if="user!.id == userStore.id" type="file" id="banner" name="banner" accept="image/*" hidden @change="handleBannerUpload" />
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
                <label for="banner" @click="user!.id != userStore.id || banner ? $event.preventDefault() : null"
                    :class="{ 'pointer-events-none': user!.id != userStore.id || banner }">
                    <img v-if="previewBanner && banner" :src="previewBanner!" alt="User Banner"
                        class="w-full h-full object-cover aspect-video">
                    <img v-else-if="user!.banner" :src="user!.banner" :alt="`${user!.name} Banner`"
                        class="w-full h-full object-cover aspect-video">
                    <div v-else class="w-full h-full object-cover aspect-video bg-white/50">
                    </div>
                </label>
            </div>
            <div class="w-full flex justify-between px-8 -translate-y-16 relative z-20 pointer-events-none">
                <div class="flex flex-col gap-4 pointer-events-auto relative">
                    <input v-if="user!.id == userStore.id" type="file" id="avatar" name="avatar" accept="image/*" hidden @change="handleAvatarUpload" />
                    <label for="avatar" class="cursor-pointer pointer-events-auto"
                        @click="user!.id != userStore.id || avatar ? $event.preventDefault() : null"
                        :class="{ 'pointer-events-none': user!.id != userStore.id || avatar }">
                        <Avatar class="w-32 h-32">
                            <AvatarImage referrer-policy="no-referrer" v-if="previewAvatar && avatar"
                                :src="previewAvatar!" alt="Profile Picture" class="rounded-full" />
                            <AvatarImage referrer-policy="no-referrer" v-else-if="user!.avatar"
                                :src="user!.avatar" alt="Profile Picture" class="rounded-full" />
                            <AvatarFallback>
                                <Skeleton class="rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                    </label>
                    <div class="flex flex-col gap-2">
                        <div>
                            <p class="text-white text-2xl font-bold">{{ user!.name }}</p>
                            <p class="text-gray-300 font-light">@{{ user!.username }}</p>
                            <p class="">{{ user!.bio ?? 'This user has no bio yet' }}</p>
                            <p class="text-gray-300 text-sm font-light flex items-center gap-2">
                                <i class="bx bx-calendar"></i>
                                {{ moment(user!.createdAt).format('LL') }}
                            </p>
                        </div>
                        <div class="flex flex-col gap-1">
                            <div class="flex gap-2">
                                <p>
                                    Followers
                                    {{ user!.followersCount }}
                                </p>
                                <p>
                                    Following
                                    {{ user!.followingCount }}
                                </p>
                            </div>
                            <div class="flex gap-2" v-if="user!.id != userStore.id">
                                <Button class="bg-blue-500" @click="handleUnfollowUser" v-if="user!.isFollowing">
                                    <i class="bx bx-check-double"></i>
                                    Unfollow
                                </Button>
                                <Button class="bg-blue-500" @click="handleFollowUser" v-else>
                                    <i class="bx bx-check"></i>
                                    Follow
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-primary p-1 flex flex-col w-max rounded-sm absolute top-2 left-full"
                        v-if="id == userStore.id && previewAvatar && avatar">
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
                <div class="self-center pointer-events-auto">
                    <Button>
                        <i class="bx bx-cog text-2xl"></i>
                    </Button>
                </div>
            </div>
            <div class="lg:w-3/4 w-full mx-auto flex flex-col gap-4">
                <p class="text-white text-2xl font-bold mx-2">Posts</p>
                <div class="flex gap-2 w-full bg-primary p-4" v-if="id == userStore.id">
                    <Avatar class="w-8 h-8">
                        <AvatarImage referrer-policy="no-referrer" v-if="userStore.avatar" :src="userStore.avatar"
                            :alt="`${userStore.name} avatar`" />
                        <AvatarFallback>
                            <Skeleton class="rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                    <button @click="createPostStatus = true"
                        class="rounded-md bg-black/10 w-full p-2 text-left text-white/50">
                        What do you think right now?
                    </button>
                </div>
                <Post v-for="post in posts" :key="post.id" :post="post" @select-post="post => selectedPost = post"
                    @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost"
                    @share-post="post => sharePost = post" />
            </div>
            <PostCreate v-if="createPostStatus" @close="createPostStatus = false" @create-post="handlePostCreated" />
            <PostSelected v-if="selectedPost" @close="selectedPost = null" :post="selectedPost!"
                @edit-post="post => editPost = post" @delete-post="handleDeletePost" @like-post="handleLikePost"
                @delete-comment="handleDeleteComment" @post-comment="handlePostComment"
                @share-post="post => sharePost = post" />
            <PostEdit v-if="editPost" @close="editPost = null" :post="editPost!" @update-post="handlePostUpdated" />
            <PostShare v-if="sharePost" @close="sharePost = null" :post="sharePost!" @share-post="handlePostCreated" />
            <ProfileEdit />
        </template>
    </div>
</template>
<script setup lang="ts">
import moment from 'moment';
import { useToast } from '@/components/ui/toast/use-toast';
const { id } = useRoute().params as { id: string };

const userStore = useUserStore();

const { data: user, status, error, refresh } = await getUser(id);
const { data: posts, status: statusPosts, error: errorPosts, refresh: refreshPosts} = await getUserPosts(id);

useHead({
    title: () => `@${user.value?.username ?? ''} in Swappes`,
});

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

const handleFollowUser = async () => {
    try {
        const response = await $fetch<{ data: Pick<IFollower, "id"> }>(`/api/users/follow`, {
            method: "POST",
            body: { id: user!.value!.id }
        });

        user!.value!.followersCount++;
        user!.value!.isFollowing = true;

        toast({
            title: "Success!",
            description: "You are now following this user"
        })
    } catch (error : any) {
        toast({
            title: "Error!",
            description: "Something went wrong, try again. Error : " + error.data.message
        })
    }
}

const handleUnfollowUser = async () => {
    try {
        const response = await $fetch<{ data: Pick<IFollower, "id"> }>(`/api/users/unfollow`, {
            method: "DELETE",
            body: { id: user!.value!.id }
        });

        user!.value!.followersCount--;
        user!.value!.isFollowing = false;

        toast({
            title: "Gotcha!",
            description: "You are no longer following this user"
        })
    } catch (error : any) {
        toast({
            title: "Error!",
            description: "Something went wrong, try again. Error : " + error.data.message
        })
    }
}

const handlePostCreated = (post: IPost) => {
    posts.value!.unshift(post);
    createPostStatus.value = false;
    sharePost.value = null;
    if (post.isShare && post.share) {
        const index = posts.value!.findIndex(p => p.id === post.share?.id);
        if (index !== -1) {
            posts.value![index].sharesCount = post.share!.sharesCount;
        }
    }
}

const handlePostUpdated = (post: IPost) => {
    const index = posts.value!.findIndex(p => p.id === post.id);
    if (index !== -1) {
        posts.value![index] = post;
    }
    editPost.value = null;
    selectedPost.value = null;
}

const handleDeletePost = (id: string) => {
    posts.value! = posts.value!.filter(post => post.id !== id);
}

const handleLikePost = (data: Pick<IPost, "id" | "likesCount">) => {
    const index = posts.value!.findIndex(p => p.id === data.id);
    if (index !== -1) {
        posts.value![index].likesCount = data.likesCount;
    }
}

const handlePostComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = posts.value!.findIndex(v => v.id == data.id);
    if (index !== -1) {
        posts.value![index].commentsCount = data.commentsCount;
    }
}

const handleDeleteComment = (data: Pick<IPost, "id" | "commentsCount">) => {
    const index = posts.value!.findIndex(v => v.id == data.id);
    if (index !== -1) {
        posts.value![index].commentsCount = data.commentsCount;
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

        user!.value!.avatar = response.data.avatar;
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

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
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

        user!.value!.banner = response.data.banner;
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

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
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
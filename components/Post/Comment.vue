<template>
    <Transition name="fade-up" appear mode="out-in">
        <div class="p-2 flex gap-4">
            <NuxtLink :to="{name: 'users-id', params: {id: comment.user.username}}">
                <Avatar class="w-8 h-8">
                    <AvatarImage referrer-policy="no-referrer" v-if="comment.user.avatar" :src="comment.user.avatar"
                        :alt="comment.user.name" class="rounded-full" />
                    <AvatarFallback>
                        <Skeleton class="rounded-full" />
                    </AvatarFallback>
                </Avatar>
            </NuxtLink>
            <div class="flex flex-col gap-2">
                <div class="bg-secondary rounded-md min-w-0 w-max"
                    :class="{ 'bg-transparent': !comment.content, 'p-2 px-3': comment.content }">
                    <NuxtLink :to="{name: 'users-id', params: {id: comment.user.username}}">
                        <p class="text-sm font-medium">{{ comment.user.name }}</p>
                    </NuxtLink>
                    <p class="text-xs w-max text-justify break-words whitespace-pre-line" :class="{'max-w-96 lg:max-w-64': isPage, 'max-md:max-w-56 max-w-96': !isPage}">{{
                        comment.content }}</p>
                </div>
                <img v-if="comment.image" :src="comment.image" alt="Image Comment" class="max-w-48 aspect-auto object-contain rounded-sm">
                <div class="flex gap-4 text-xs">
                    <p>{{ moment(comment.createdAt).fromNow() }}</p>
                    <Button class="flex gap-1 text-xs w-max p-0 h-auto hover:bg-transparent" @click="handleLikeComment" :disabled="loadingLike">
                        <i v-if="loadingLike" class="bx bx-loader-alt bx-spin"></i>
                        <i v-else class="bx bx-heart"></i>
                        <p>{{ comment.likesCount }}</p>
                    </Button>
                    <Button class="flex gap-2 text-xs w-max p-0 h-auto hover:bg-transparent"
                        @click="emit('replyComment', comment)">
                        <p>Reply</p>
                    </Button>
                    <Button v-if="user.id === comment.user.id" class="flex gap-2 text-xs w-max p-0 h-auto hover:bg-transparent"
                        @click="handleDeleteComment" :disabled="loadingDelete">
                        <i class="bx bx-loader-alt bx-spin" v-if="loadingDelete"></i>
                        <p v-else>Delete</p>
                    </Button>
                </div>
                <div v-if="comment.replies?.length" class="flex flex-col gap-2">
                    <PostComment v-for="reply in comment.replies" :key="reply.id" :comment="reply"
                        @delete-comment="emit('deleteComment', $event)" @like-comment="emit('likeComment', $event)"
                        @reply-comment="emit('replyComment', $event)" :isPage="isPage" />
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import moment from "moment";
import { useToast } from '@/components/ui/toast/use-toast'
const props = defineProps<{
    comment: IComment,
    isPage?: boolean
}>();

const { toast } = useToast();

const user = useUserStore();

const emit = defineEmits<{
    (e: 'deleteComment', data: Pick<IComment, "id" | "post" | "replyId">): void
    (e: 'likeComment', data: Pick<IComment, "id" | "likesCount" | "replyId">): void
    (e: 'replyComment', data: IComment): void
}>();

const loadingDelete = ref<boolean>(false);
const loadingLike = ref<boolean>(false);

const handleLikeComment = async () => {
    try {
        loadingLike.value = true;
        const response = await $fetch<{ data: Pick<IComment, "id" | "likesCount" | "replyId"> }>(`/api/comments/${props.comment.id}/likes`, {
            method: "POST"
        });

        loadingLike.value = false;
        emit('likeComment', response.data)
    } catch (error: any) {
        loadingLike.value = false;
        toast({
            title: "Failed to like comment",
            description: "Oops, we cannot like your comment right now, try again. \n Error : " + error.data.message,
        })
    }
}

const handleDeleteComment = async () => {
    try {
        loadingDelete.value = true;
        const { data } = await $fetch<{ data: Pick<IComment, "id" | "post" | "replyId"> }>(`/api/comments/${props.comment.id}`, {
            method: "DELETE"
        });
        loadingDelete.value = false;
        emit("deleteComment", data);
    } catch (error) {
        loadingDelete.value = false;
        toast({
            title: "Error",
            description: "Failed to delete comment",
        });
    }
}
</script>
<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
    opacity: 0;
    transform: translateY(20px)
}
</style>
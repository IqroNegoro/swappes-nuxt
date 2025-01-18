<template>
    <Transition name="fade-up" appear mode="out-in">
        <div class="p-2 flex gap-4">
            <Avatar>
                <AvatarImage referrer-policy="no-referrer" v-if="comment.user.avatar" :src="comment.user.avatar"
                    :alt="comment.user.name" class="w-16 h-16 rounded-full" />
                <AvatarFallback>
                    <Skeleton class="rounded-full" />
                </AvatarFallback>
            </Avatar>
            <div class="flex flex-col gap-2">
                <div class="bg-secondary rounded-sm min-w-0 w-max"
                    :class="{ 'bg-transparent': !comment.content, 'p-2': comment.content }">
                    <p class="text-sm font-medium">{{ comment.user.name }}</p>
                    <p class="text-sm max-md:max-w-72 max-w-96 w-max text-justify break-words whitespace-pre-line">{{
                        comment.content }}</p>
                </div>
                <img v-if="comment.image" :src="comment.image" alt="Image Comment" class="w-32 rounded-sm">
                <div class="flex gap-4">
                    <p class="text-sm">{{ moment(comment.createdAt).fromNow() }}</p>
                    <Button class="flex gap-1 w-max p-0 h-auto hover:bg-transparent" @click="handleLikeComment">
                        <i class="bx bx-heart"></i>
                        <p>{{ comment.likesCount }}</p>
                    </Button>
                    <Button class="flex gap-2 w-max p-0 h-auto hover:bg-transparent"
                        @click="emit('replyComment', comment)">
                        <p>Reply</p>
                    </Button>
                    <Button v-if="user.id === comment.user.id" class="flex gap-2 w-max p-0 h-auto hover:bg-transparent"
                        @click="handleDeleteComment" :disabled="loading">
                        <i class="bx bx-loader-alt bx-spin" v-if="loading"></i>
                        <p v-else>Delete</p>
                    </Button>
                </div>
                <div v-if="comment.replies?.length" class="flex flex-col gap-2">
                    <PostComment v-for="reply in comment.replies" :key="reply.id" :comment="reply"
                        @delete-comment="emit('deleteComment', $event)" @like-comment="emit('likeComment', $event)"
                        @reply-comment="emit('replyComment', $event)" />
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import moment from "moment";
import { useToast } from '@/components/ui/toast/use-toast'
const props = defineProps<{
    comment: IComment
}>();

const { toast } = useToast();

const user = useUserStore();

const emit = defineEmits<{
    (e: 'deleteComment', data: Pick<IComment, "id" | "post" | "replyId">): void
    (e: 'likeComment', data: Pick<IComment, "id" | "likesCount" | "replyId">): void
    (e: 'replyComment', data: IComment): void
}>();

const loading = ref<boolean>(false);

const handleLikeComment = async () => {
    try {
        loading.value = true;
        const response = await $fetch<{ data: Pick<IComment, "id" | "likesCount" | "replyId"> }>(`/api/comments/${props.comment.id}/likes`, {
            method: "POST"
        });

        loading.value = false;
        emit('likeComment', response.data)
    } catch (error: any) {
        loading.value = false;
        toast({
            title: "Failed to like comment",
            description: "Oops, we cannot like your comment right now, try again. \n Error : " + error.data.message,
        })
    }
}

const handleDeleteComment = async () => {
    try {
        loading.value = true;
        const { data } = await $fetch<{ data: Pick<IComment, "id" | "post" | "replyId"> }>(`/api/comments/${props.comment.id}`, {
            method: "DELETE"
        });
        loading.value = false;
        emit("deleteComment", data);
    } catch (error) {
        loading.value = false;
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
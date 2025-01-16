<template>
    <div class="p-2 flex gap-4">
        <Avatar>
            <AvatarImage v-if="comment.user.avatar" :src="comment.user.avatar" :alt="comment.user.name" class="w-16 h-16 rounded-full" />
            <AvatarFallback>
                <Skeleton class="rounded-full" />
            </AvatarFallback>
        </Avatar>
        <div class="flex flex-col gap-2">
            <div class="bg-secondary rounded-sm min-w-0 w-max" :class="{'bg-transparent': !comment.content, 'p-2': comment.content}">
                <p class="text-sm font-medium">{{ comment.user.name }}</p>
                <p class="text-sm max-md:max-w-72 max-w-96 w-max text-justify break-words whitespace-pre-line">{{ comment.content }}</p>
            </div>
            <img v-if="comment.image" :src="comment.image" alt="Image Comment" class="w-32 rounded-sm">
            <div class="flex gap-4">
                <p class="text-sm">{{ moment(comment.createdAt).fromNow() }}</p>
                <Button class="flex gap-1 w-max p-0 h-auto hover:bg-transparent" @click="handleLikeComment">
                    <i class="bx bx-heart"></i>
                    <p>{{ comment.likesCount }}</p>
                </Button>
                <Button class="flex gap-2 w-max p-0 h-auto hover:bg-transparent" @click="emit('replyComment', comment)">
                    <p>Reply</p>
                </Button>
                <Button v-if="user.id === comment.user.id" class="flex gap-2 w-max p-0 h-auto hover:bg-transparent" @click="handleDeleteComment">
                    <p>Delete</p>
                </Button>
            </div>
            <div v-if="comment.replies?.length" class="flex flex-col gap-2">
                <PostComment v-for="reply in comment.replies" :key="reply.id" :comment="reply" @delete-comment="emit('deleteComment', $event)" @like-comment="emit('likeComment', $event)" @reply-comment="emit('replyComment', $event)" />
            </div>
        </div>
    </div>
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
    (e: 'likeComment', data: Pick<IComment, "id" | "likesCount">): void
    (e: 'replyComment', data: IComment): void
}>();

const handleLikeComment = async () => {
  try {
    const response = await $fetch<{data: Pick<IComment, "id" | "likesCount">}>(`/api/comments/${props.comment.id}/likes`, {
      method: "POST"
    });

    emit('likeComment', response.data)
  } catch (error : any) {
    toast({
      title: "Failed to like comment",
      description: "Oops, we cannot like your comment right now, try again. \n Error : " + error.data.message,
    })
  }
}

const handleDeleteComment = async () => {
    try {
        const { data } = await $fetch<{data: Pick<IComment, "id" | "post" | "replyId">}>(`/api/comments/${props.comment.id}`, {
            method: "DELETE"
        });

        emit("deleteComment", data);
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete comment",
        });
    }
}
</script>
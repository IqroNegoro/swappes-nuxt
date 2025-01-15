<template>
    <div class="p-2 flex gap-4">
        <Avatar>
            <AvatarImage :src="comment.user.avatar" :alt="comment.user.name" class="w-16 h-16 rounded-full" />
            <AvatarFallback>
                <Skeleton class="rounded-full" />
            </AvatarFallback>
        </Avatar>
        <div class="flex flex-col gap-2">
            <div class="bg-secondary rounded-sm min-w-0 w-max" :class="{'bg-transparent': !comment.content, 'p-2': comment.content}">
                <p class="text-sm font-bold">{{ comment.user.name }}</p>
                <p class="text-sm max-md:max-w-72 max-w-96 w-max text-justify break-words">{{ comment.content }}</p>
            </div>
            <img v-if="comment.image" :src="comment.image" alt="Image Comment" class="w-32 rounded-sm">
            <div class="flex gap-4">
                <p class="text-sm">{{ moment(comment.createdAt).fromNow() }}</p>
                <Button class="flex gap-1 w-max p-0 h-auto hover:bg-transparent">
                    <i class="bx bx-heart"></i>
                    <p>{{ comment.likesCount }}</p>
                </Button>
                <Button class="flex gap-2 w-max p-0 h-auto hover:bg-transparent">
                    <p>Reply</p>
                </Button>
                <Button class="flex gap-2 w-max p-0 h-auto hover:bg-transparent" @click="handleDeleteComment">
                    <p>Delete</p>
                </Button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import moment from "moment";
const props = defineProps<{
    comment: IComment
}>();

const { toast } = useToast();

const emit = defineEmits<{
    (e: 'deleteComment', data: Pick<IComment, "id" | "post">): void
}>();

const handleDeleteComment = async () => {
    try {
        const { data } = await $fetch<{data: Pick<IComment, "id" | "post">}>(`/api/comments/${props.comment.id}`, {
            method: "DELETE"
        });

        emit("deleteComment", data.data);
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete comment",
        });
    }
}
</script>
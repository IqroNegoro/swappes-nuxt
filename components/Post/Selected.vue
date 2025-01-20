<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-30 flex justify-center items-center"
    @click.self="emit('close')">
    <Transition name="fade-up" appear mode="in-out">
      <div ref="container"
        class="bg-primary text-white relative md:rounded-md w-full md:w-3/4 lg:w-1/2 max-h-full md:max-h-[85%] h-max overflow-hidden flex flex-col"
        @click.stop>
        <div class="flex justify-between items-center relative text-center p-2">
          <div></div>
          <p class="text-xl"> {{ post.user.name }} Post </p>
          <button @click="emit('close')">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>
        <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
          <Post :post="post" @edit-post="emit('editPost', $event)" @delete-post="emit('deletePost', $event)"
            @like-post="emit('likePost', $event)" @share-post="emit('sharePost', $event)" />
          <div class="p-2">
            <template v-if="status === 'pending'">
              <PostCommentSkeleton v-for="i in 5" :key="i" />
            </template>
            <Error v-else-if="error" :refresh="refresh" />
            <template v-else>
              <PostComment v-for="comment in comments" :key="comment.id" :comment="comment"
                @delete-comment="handleDeleteComment" @like-comment="handleLikeComment"
                @reply-comment="comment => reply = comment" />
            </template>
          </div>
        </div>
        <form class="flex flex-col gap-2 w-full bg-primary p-4" @submit.prevent="handleSubmitForm">
          <p class="text-sm" v-if="reply">Reply to <span class="font-medium">{{ reply.user.name }}</span></p>
          <div class="flex gap-4 w-full">
            <Avatar class="w-8 h-8">
              <AvatarImage referrer-policy="no-referrer" v-if="user.avatar" :src="user.avatar"
                :alt="`${user.name} avatar`" />
              <AvatarFallback>
                <Skeleton class="rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div ref="inputArea" contenteditable @input="content = ($event.target as HTMLDivElement)!.innerText"
              placeholder="Write your comment..."
              class="bg-black/10 w-full p-2 max-h-48 overflow-y-auto overflow-x-hidden before:truncate before:whitespace-nowrap before:break-words before:max-md:text-sm"
              @keyup.ctrl.enter="handleSubmitForm"
              :class="{ 'border border-red-500': errors.image || errors.content }" />
            <div class="flex gap-2">
              <input type="file" id="image" name="image" hidden accept="image/*" @change="handleImageUpload" />
              <label for="image" class="flex justify-center items-center cursor-pointer">
                <i class="bx bx-image text-2xl"></i>
              </label>
              <button :disabled="isValidating || isSubmitting || (!content && !image)" type="submit"
                class="cursor-pointer disabled:cursor-default">
                <i class="bx bx-loader-alt bx-spin" v-if="isSubmitting || isValidating"></i>
                <i class="bx bx-send text-2xl" v-else></i>
              </button>
            </div>
          </div>
          <img v-if="previewImage" :src="previewImage" alt="Preview Image"
            class="max-w-48 aspect-auto object-contain rounded-sm cursor-pointer" @click="image = null" />
        </form>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { object, string, mixed } from "yup";
import { useToast } from '@/components/ui/toast/use-toast'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'editPost', post: IPost): void
  (e: 'deletePost', id: string): void
  (e: 'sharePost', post: IPost): void
  (e: 'likePost', data: Pick<IPost, "id" | "likesCount">): void
  (e: 'postComment', data: Pick<IPost, "id" | "commentsCount">): void
  (e: 'deleteComment', data: Pick<IPost, "id" | "commentsCount">): void
}>();

const props = defineProps<{
  post: IPost
}>();

useHead({
  title: `Post from ${props.post.user.name} | Swappes`
});

const user = useUserStore();

const { toast } = useToast();

const { data: comments, status, error, refresh } = await getComments(props.post.id);

const inputArea = ref<HTMLDivElement | null>(null);

const { errors, defineField, handleSubmit, isValidating, isSubmitting, resetForm } = useForm<Pick<IComment, "content"> & { image: File | null }>({
  validationSchema: toTypedSchema(object().shape({
    content: string().max(5000).ensure().trim().when("image", ([val], schema) => val ? schema.notRequired() : schema.required()),
    image: mixed().when("content", ([val], schema) => val ? schema.notRequired() : schema.required()),
  }, [["content", "image"]])),
  initialValues: {
    content: "",
    image: null
  }
});

const validateRule = {
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
}

const [content, contentAttr] = defineField("content", validateRule);
const [image, imageAttr] = defineField("image", validateRule);

const previewImage = ref<string | null>(null);
const reply = ref<IComment | null>(null);

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const fileExtension = file?.name.split('.').pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return;
  }

  if (file) {
    image.value = file;
    input.value = "";
  }
}

const handleLikeComment = (data: Pick<IComment, "id" | "likesCount" | "replyId">) => {
  if (data.replyId) {
    const index = comments.value.findIndex(comment => comment.id === data.replyId);
    if (index !== -1) {
      const indexReply = comments.value[index].replies?.findIndex(reply => reply.id === data.id);
      if (indexReply !== -1) {
        // @ts-ignore
        comments.value[index].replies![indexReply].likesCount = data.likesCount;
      }
    }
  } else {
    const index = comments.value.findIndex(comment => comment.id === data.id);
    if (index !== -1) {
      comments.value[index].likesCount = data.likesCount;
    }
  }
}

const handleDeleteComment = (data: Pick<IComment, "id" | "post" | "replyId">) => {
  if (data.replyId) {
    const index = comments.value.findIndex(comment => comment.id === data.replyId);
    if (index !== -1) {
      comments.value[index].replies = comments.value[index].replies?.filter(reply => reply.id !== data.id) ?? [];
    }
  } else {
    comments.value = comments.value.filter(comment => comment.id !== data.id);
  }
  emit("deleteComment", data.post);
}

const handleSubmitForm = handleSubmit(async ({ content, image }) => {
  try {
    let formData = new FormData();

    formData.append("post", props.post.id);
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);
    if (reply.value) formData.append("replyId", reply.value!.replyId ? reply.value!.replyId : reply.value!.id)

    const response = await $fetch<{ data: IComment }>("/api/comments", {
      method: "POST",
      body: formData,
    });

    if (response.data.replyId) {
      const index = comments.value.findIndex(comment => comment.id === response.data.replyId);
      if (index !== -1) {
        comments.value[index].replies?.unshift(response.data);
      }
    } else {
      comments.value.unshift(response.data);
    }

    resetForm();
    if (inputArea.value) {
      inputArea.value.innerText = "";
    }

    emit("postComment", response.data.post);
  } catch (error: any) {
    toast({
      title: "Error!",
      description: "Oops, we cannot create your comment right now, try again. Error : " + error.message,
    });
  }
});

const imageListener = watch(image, (val, oldVal) => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
    previewImage.value = null;
  }
  if (val) {
    previewImage.value = URL.createObjectURL(val as File);
  }
});

const handleClose = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
  }
}

onBeforeUnmount(() => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }

  imageListener();
  window.removeEventListener("keydown", handleClose)
});

onMounted(() => {
  window.addEventListener("keydown", handleClose)
})
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
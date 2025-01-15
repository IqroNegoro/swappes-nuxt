<template>
    <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-10 flex justify-center items-center" @click.self="emit('close')">
        <Transition name="fade-up" appear mode="in-out">
            <div ref="container" class="bg-primary text-white relative md:rounded-md w-full md:w-3/4 lg:w-1/2 h-full md:max-h-[85%] overflow-hidden flex flex-col" @click.stop>
                <div class="flex justify-between items-center relative text-center p-2">
                    <div></div>
                    <p class="text-2xl">Irene Post</p>
                    <button @click="emit('close')">
                        <i class="bx bx-x text-2xl"></i>
                    </button>
                </div>
                <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
                    <Post :post="post" @edit-post="emit('editPost', $event)" @delete-post="emit('deletePost', $event)" @like-post="emit('likePost', $event)" />
                    <div class="p-2">
                        <PostComment v-for="comment in comments" :key="comment.id" :comment="comment" @delete-comment="handleDeleteComment" />
                    </div>
                </div>
                <form class="flex flex-col gap-2 w-full bg-primary p-4" @submit.prevent="handleSubmitForm">
                    <div class="flex gap-4 w-full">
                        <Avatar>
                            <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                            <AvatarFallback>
                                <Skeleton class="rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                        <Input v-model="content" placeholder="What do you think right now?" class="bg-black/10" @keyup.ctrl.enter="handleSubmitForm" :class="{ 'border border-red-500': errors.image || errors.content }" />
                        <div class="flex gap-2">
                            <input type="file" id="image" name="image" hidden accept="image/*" @change="handleImageUpload" />
                            <label for="image" class="flex justify-center items-center cursor-pointer">
                                <i class="bx bx-image text-2xl"></i>
                            </label>
                            <button :disabled="isValidating || isSubmitting || (!content && !image)" type="submit" class="cursor-pointer disabled:cursor-default">
                                <i class="bx bx-send text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    <img v-if="previewImage" :src="previewImage" alt="Preview Image" class="w-32 h-32 object-cover rounded-md cursor-pointer" @click="image = null" />
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
    (e: 'likePost', data: Pick<IPost, "id" | "likesCount">): void
    (e: 'commentPost', data: IComment): void
    (e: 'deleteComment', data: Pick<IComment, "id" | "post">): void
}>();

const props = defineProps<{
    post: IPost
}>();

const user = useUserStore();

const { toast } = useToast();

const { data : comments, status, error } = await getComments(props.post.id);

const { errors, defineField, handleSubmit, isValidating, isSubmitting } = useForm<Pick<IComment, "content"> & { image: File | null }>({
  validationSchema: toTypedSchema(object().shape({
    content: string().ensure().trim().when("image", ([val], schema) => val ? schema.notRequired() : schema.required()),
    image: mixed().when("content", ([val], schema) => val ? schema.notRequired() : schema.required()),
  }, [["content", "image"]])),
});

const handleDeleteComment = (data: Pick<IComment, "id" | "post">) => {
    comments.value = comments.value.filter(comment => comment.id !== data.id);
    emit("deleteComment", data);
}

const validateRule = {
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
}

const [content, contentAttr] = defineField("content", validateRule);
const [image, imageAttr] = defineField("image", validateRule);

const previewImage = ref<string | null>(null);
const replyId = ref<IComment | null>(null);

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const fileExtension = file?.name.split('.').pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return;
  }

  if (file) {
    image.value = file;
    input.value = "";
  }
}

const handleSubmitForm = handleSubmit(async ({ content, image }) => {
  try {
    let formData = new FormData();

    formData.append("post", props.post.id);
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);
    if (replyId.value) formData.append("replyId", replyId.value!.id)

    const response = await $fetch<{ data: IComment }>("/api/comments", {
      method: "POST",
      body: formData,
    });

    emit("commentPost", response.data);
  } catch (error) {
    toast({
      title: "Error!",
      description: "Oops, we cannot create your post right now, try again.",
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

const handleClose = (e : KeyboardEvent) => {
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
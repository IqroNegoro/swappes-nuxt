<template>
  <div class="bg-black/90 overflow-x-hidden w-full h-dvh flex max-lg:flex-col text-white">
    <PostPageSkeleton v-if="status === 'pending'" />
    <Error v-else-if="error" :refresh="refresh" />
    <template v-else>
      <div class="relative w-full flex justify-center items-center" v-if="post?.image">
        <img :src="post.image" :alt="post.image" class="object-contain">
        <NuxtLink :to="{ name: 'index' }" class="absolute top-2 left-2 cursor-pointer bg-primary px-1 rounded-full">
          <i class="bx bx-x text-white text-2xl"></i>
        </NuxtLink>
      </div>
      <div class="w-full flex flex-col gap-2 max-h-dvh pt-4"
        :class="{ 'lg:max-w-[28rem] lg:w-[28rem] lg:min-w-[28rem]': post?.image }">
        <NuxtLink v-if="!post?.image" :to="{ name: 'index' }"
          class="w-max cursor-pointer px-1 rounded-full flex gap-2 items-center">
          <div class="bg-primary flex justify-center items-center px-1 rounded-full">
            <i class="bx bx-left-arrow-alt text-white text-2xl"></i>
          </div>
          Back
        </NuxtLink>
        <div class="flex justify-between px-4 py-2">
          <div class="flex gap-2">
            <NuxtLink :to="{ name: 'users-id', params: { id: post!.user?.username } }">
              <Avatar>
                <AvatarImage referrer-policy="no-referrer" v-if="post!.user.avatar" :src="post!.user.avatar"
                  :alt="`${user.name} avatar`" class="w-16 h-16 rounded-full" />
                <AvatarFallback>
                  <Skeleton class="rounded-full" />
                </AvatarFallback>
              </Avatar>
            </NuxtLink>
            <div class="flex flex-col">
              <NuxtLink :to="{ name: 'users-id', params: { id: post!.user?.username } }" class="hover:underline">
                <p>{{ post!.user.name }}</p>
              </NuxtLink>
              <div class="flex gap-1 items-center">
                <i class="bx text-xs"
                  :class="{ 'bx-world': post!.visibility === Visibility.PUBLIC, 'bx-group': post!.visibility === Visibility.FOLLOWERS, 'bx-lock': post!.visibility === Visibility.PRIVATE }"></i>
                &bull;
                <i class="bx bx-time-five text-xs"></i>
                <p class="text-xs">{{ moment(post!.createdAt).fromNow() }}</p>
              </div>
            </div>
          </div>
          <DropdownMenu v-if="!post!.isShare">
            <DropdownMenuTrigger as-child>
              <Button class="w-max p-0 h-auto hover:bg-transparent">
                <i class="bx bx-dots-horizontal text-xl"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56 bg-primary text-white border-0">
              <DropdownMenuLabel class="font-bold">Post Menu</DropdownMenuLabel>
              <DropdownMenuGroup>
                <KeepAlive>
                  <PostBookmarkButton :id="post!.id" />
                </KeepAlive>
                <template v-if="post!.user.id == user.id">
                  <DropdownMenuItem @click="editPost = post">
                    <span>Edit</span>
                    <DropdownMenuShortcut>
                      <i class="bx bx-edit text-xl"></i>
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @select.stop="e => e.preventDefault()">
                    <AlertDialog>
                      <AlertDialogTrigger class="w-full flex justify-between items-center">
                        Delete
                        <i class="bx bx-trash-alt text-xl"></i>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction @click="handleDeletePost">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </template>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="px-4 min-w-0">
          <p ref="contentContainer" class="text-justify text-sm whitespace-pre-line break-words line-clamp-6">{{
            post!.content }}
          </p>
          <button class="text-blue-400 text-sm" v-if="isOverflowing && !showLess" @click="handleOverflowing">
            Read More...
          </button>
          <button class="text-blue-400 text-sm" v-if="isOverflowing && showLess" @click="handleOverflowing">
            See Less...
          </button>
        </div>
        <div class="flex gap-2 px-2">
          <Button @click="handleLikePost">
            <i class="bx bx-heart"></i>
            <p>{{ post!.likesCount }}</p>
          </Button>
          <Button>
            <i class="bx bx-comment"></i>
            <p>{{ post!.commentsCount }}</p>
          </Button>
          <Button @click="sharePost = post">
            <i class="bx bx-share-alt"></i>
            <p>{{ post!.sharesCount }}</p>
          </Button>
        </div>
        <div class="p-2 h-full overflow-y-auto overflow-x-hidden">
          <ClientOnly>
            <template v-if="commentsStatus === 'pending' && status != 'success'">
              <PostCommentSkeleton v-for="i in 5" :key="i" />
            </template>
            <Error v-else-if="errorStatus" :refresh="execute" />
            <template v-else>
              <PostComment v-for="comment in comments" :key="comment.id" :comment="comment"
                @delete-comment="handleDeleteComment" @like-comment="handleLikeComment"
                @reply-comment="comment => reply = comment" :isPage="true" />
            </template>
          </ClientOnly>
        </div>
        <form class="flex flex-col gap-2 w-full bg-primary p-4" @submit.prevent="handleSubmitForm">
          <p class="text-sm" v-if="reply">Reply to <span class="font-medium">{{ reply.user.name }}</span></p>
          <div class="flex gap-4 w-full">
            <Avatar>
              <AvatarImage referrer-policy="no-referrer" v-if="user.avatar" :src="user.avatar"
                :alt="`${user.name} avatar`" class="w-16 h-16 rounded-full" />
              <AvatarFallback>
                <Skeleton class="rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div ref="inputArea" contenteditable @input="content = ($event.target as HTMLDivElement)!.innerText"
              placeholder="What do you think right now"
              class="bg-black/10 w-full p-2 max-h-48 overflow-y-auto overflow-x-hidden before:truncate before:whitespace-nowrap before:break-words"
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
            class="w-32 h-32 object-cover rounded-md cursor-pointer" @click="image = null" />
        </form>
      </div>
      <PostEdit v-if="editPost" @close="editPost = null" :post="editPost!" @update-post="handlePostUpdated" />
      <PostShare v-if="sharePost" @close="sharePost = null" :post="sharePost" @share-post="handlePostShared" />
    </template>
  </div>
</template>
<script setup lang="ts">
import moment from 'moment';
import { useToast } from '@/components/ui/toast/use-toast';
import { object, string, mixed } from "yup";

definePageMeta({
  layout: false
});

const { id } = useRoute().params as { id: string };

const sharePost = ref<IPost | null>(null);
const editPost = ref<IPost | null>(null);

const { data: post, error, status, refresh } = await useFetch<IPost>(`/api/posts/${id}`, {
  lazy: true,
  transform: (res: any) => res.data,
  key: `get-post-${id}`
});

useHead({
  title: () => `@${post.value?.user.username ?? ''} in Swappes`,
})

const { data: comments, status: commentsStatus, error: errorStatus, execute } = await getComments(id);

const { toast } = useToast()

const user = useUserStore();

const contentContainer = ref<HTMLDivElement | undefined>(undefined);
const isOverflowing = ref<boolean>(false);
const showLess = ref<boolean>(false);

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

const handlePostShared = (post: IPost) => {
  sharePost.value = null;
  if (post.isShare) {
    if (post.share) {
      post.value!.share!.sharesCount = post.share!.sharesCount;
    }
  } else {
    post.value!.sharesCount = post.sharesCount;
  }
}

const handlePostUpdated = (updatedPost: IPost) => {
  post.value = updatedPost;
  editPost.value = null;
}

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

const handleLikePost = async () => {
  try {
    const response = await $fetch<{ data: Pick<IPost, "id" | "likesCount"> }>(`/api/posts/${post.value!.id}/likes`, {
      method: "POST"
    });

    post.value!.likesCount = response.data.likesCount;
  } catch (error: any) {
    toast({
      title: "Failed to like post",
      description: "Oops, we cannot like your post right now, try again. \n Error : " + error.data.message,
    })
  }
}

const handleDeletePost = async () => {
  try {
    toast({
      title: "Deleting post..."
    });

    const response = await $fetch<{ data: string }>(`/api/posts/${post.value?.id}`, {
      method: 'DELETE'
    });

    toast({
      title: "Post deleted"
    });

    await navigateTo({ name: 'index' });
  } catch (error: any) {
    toast({
      title: "Failed to delete post",
      description: "Oops, we cannot delete your post right now, try again. \n Error : " + error.data.message,
    })
  }
}

const handleOverflowing = () => {
  if (contentContainer.value) {
    contentContainer.value.classList.toggle("line-clamp-6");
    showLess.value = !showLess.value
  }
}

onMounted(() => {
  if (contentContainer.value) {
    if (contentContainer.value.clientHeight < contentContainer.value.scrollHeight) {
      isOverflowing.value = true;
    }
  }
});

const handleDeleteComment = (data: Pick<IComment, "id" | "post" | "replyId">) => {
  if (data.replyId) {
    const index = comments.value.findIndex(comment => comment.id === data.replyId);
    if (index !== -1) {
      comments.value[index].replies = comments.value[index].replies?.filter(reply => reply.id !== data.id) ?? [];
    }
  } else {
    comments.value = comments.value.filter(comment => comment.id !== data.id);
  }
}

const handleSubmitForm = handleSubmit(async ({ content, image }) => {
  try {
    let formData = new FormData();

    formData.append("post", post.value!.id);
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

onBeforeUnmount(() => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }

  imageListener();
});
</script>
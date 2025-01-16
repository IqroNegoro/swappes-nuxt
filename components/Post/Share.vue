<template>
    <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-30 flex justify-center items-center" @click.self="emit('close')">
        <Transition name="fade-up" appear mode="in-out">
            <form @submit.prevent="handleSubmitForm" ref="container" class="bg-primary text-white relative md:rounded-md w-full md:w-3/4 lg:w-1/2 md:max-h-[85%] max-h-full overflow-hidden flex flex-col" @click.stop>
                <div class="flex justify-between items-center relative text-center p-2">
                    <button @click="emit('close')" :disabled="isSubmitting || isValidating" type="button">
                      <i class="bx bx-x text-2xl"></i>
                    </button>
                    <p class="text-2xl">Share Post</p>
                    <Button type="submit" :disabled="isSubmitting || isValidating || !content">
                      <i class="bx bx-loader-alt bx-spin" v-if="isSubmitting || isValidating"></i>
                      <i class="bx bx-send text-2xl" v-else></i>
                    </Button>
                  </div>
                  <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
                    <div class="flex justify-between px-4 py-2">
                      <div class="flex gap-4">
                        <Avatar>
                          <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                          <AvatarFallback>
                            <Skeleton class="rounded-full" />
                          </AvatarFallback>
                        </Avatar>
                        <div class="flex-col justify-between">
                          <p>{{ user.name }}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                              <Button class="w-max p-0 h-auto hover:bg-transparent">
                                <i class="bx"
                                  :class="{ 'bx-world': visibility === Visibility.PUBLIC, 'bx-group': visibility === Visibility.FRIENDS, 'bx-lock': visibility === Visibility.PRIVATE }"></i>
                                <p>{{ visibility }}</p>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent class="w-56 bg-primary text-white border-0">
                              <DropdownMenuLabel class="font-bold">Post Visibility</DropdownMenuLabel>
                              <DropdownMenuGroup>
                                <DropdownMenuItem @click="visibility = Visibility.PUBLIC">
                                  <span>Public</span>
                                  <DropdownMenuShortcut>
                                    <i class="bx bx-world text-xl"></i>
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem @click="visibility = Visibility.FRIENDS">
                                  <span>Friend Only</span>
                                  <DropdownMenuShortcut>
                                    <i class="bx bx-group text-xl"></i>
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem @click="visibility = Visibility.PRIVATE">
                                  <span>Only Me</span>
                                  <DropdownMenuShortcut>
                                    <i class="bx bx-lock text-xl"></i>
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div contenteditable class="w-full min-h-24 px-4 py-1 inline-block" placeholder="What do you think about this?" @keyup.ctrl.enter="handleSubmitForm" :class="{ 'border border-red-500': errors.content }"
                      @input="e => content = (e.target as HTMLDivElement).innerText"></div>
                      <div class="flex flex-col gap-2 bg-primary rounded-sm" :class="{'py-2': post.isShare && !post.share?.image}">
                          <div class="flex justify-between px-4 py-2">
                              <div class="flex gap-2">
                                  <Avatar>
                                      <AvatarImage v-if="post.user.avatar" :src="post.user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                                      <AvatarFallback>
                                          <Skeleton class="rounded-full" />
                                      </AvatarFallback>
                                  </Avatar>
                                  <div class="flex flex-col">
                                      <p>{{ post.user.name }}</p>
                                      <div class="flex gap-1 items-center">
                                          <i class="bx text-xs" :class="{'bx-world': post.visibility === Visibility.PUBLIC, 'bx-group': post.visibility === Visibility.FRIENDS, 'bx-lock': post.visibility === Visibility.PRIVATE}"></i>
                                          &bull;
                                          <i class="bx bx-time-five text-xs"></i>
                                          <p class="text-xs">{{ moment(post.createdAt).fromNow() }}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="px-4">
                              <p class="text-justify text-sm">{{ post.content }}</p>
                          </div>
                          <img v-if="post.image" :src="post.image" alt="Image Post" class="w-full h-auto object-contain cursor-pointer">
                      </div>
                  </div>
            </form>
        </Transition>
    </div>
</template>
<script setup lang="ts">
import { object, string } from "yup";
import { useToast } from '@/components/ui/toast/use-toast'
import moment from 'moment';

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'sharePost', data: IPost): void
}>();

const props = defineProps<{
    post: IPost
}>();

const user = useUserStore();

const { toast } = useToast();

const { errors, defineField, handleSubmit, isValidating, isSubmitting } = useForm<Pick<IPost, "content" | "visibility">>({
  validationSchema: toTypedSchema(object().shape({
    content: string().required().max(5000).ensure().trim(),
    visibility: string().oneOf(Object.values(Visibility)).required().default(Visibility.PUBLIC)
  })),
  initialValues: {
    content: "",
    visibility: Visibility.PUBLIC
  }
});

const validateRule = {
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
}

const [content, contentAttr] = defineField("content", validateRule);
const [visibility, visibilityAttr] = defineField("visibility", validateRule);

const handleSubmitForm = handleSubmit(async ({ content }) => {
  try {
    toast({
      title: "Posting...",
    });

    const request = await $fetch<{ data: IPost }>("/api/posts", {
      method: "POST",
      body: {
        content,
        isShare: true,
        share: props.post.id,
        visibility: Visibility.PUBLIC
      },
    });

    toast({
      title: "Your post has created!",
    });
    emit("sharePost", request.data);
  } catch (error) {
    toast({
      title: "Error!",
      description: "Oops, we cannot create your post right now, try again.",
    });
  }
});

const handleClose = (e : KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
  }
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleClose)
});

onMounted(() => {
  window.addEventListener("keydown", handleClose)
});
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
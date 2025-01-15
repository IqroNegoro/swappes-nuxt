<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-10 flex justify-center items-center overscroll-contain">
    <Transition name="fade-up" appear mode="in-out">
      <form @submit.prevent="handleSubmitForm"
        class="bg-primary text-white relative md:rounded-md w-full md:w-3/4 lg:w-1/2 h-full md:max-h-[85%] overflow-hidden flex flex-col"
        @click.stop>
        <div class="flex justify-between items-center relative text-center p-2">
          <button @click="emit('close')" :disabled="isSubmitting || isValidating" type="button">
            <i class="bx bx-x text-2xl"></i>
          </button>
          <p class="text-2xl">Create Post</p>
          <Button type="submit" :disabled="isSubmitting || isValidating || (!content && !image)">
            Post
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
          <div contenteditable class="w-full min-h-24 px-4 py-1 inline-block" placeholder="What do you think right now?" @keyup.ctrl.enter="handleSubmitForm"
            @input="e => content = (e.target as HTMLDivElement).innerText"></div>
          <input type="file" id="image" name="image" accept="image/*" hidden @change="handleImageUpload" />
          <div class="w-full h-96">
            <div v-if="image" class="relative">
              <img :src="previewImage!" class="w-full h-full object-cover" />
              <button @click="image = null"
                class="absolute top-0 right-0 text-white p-2 rounded-full flex justify-center items-center"
                type="button">
                <i class="bx bx-x text-2xl"></i>
              </button>
            </div>
            <label v-else for="image"
              class="w-full h-full bg-secondary flex justify-center items-center cursor-pointer">
              <i class="bx bx-image-alt text-3xl"></i>
            </label>
          </div>
        </div>
      </form>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { object, string, mixed } from "yup";
import { useToast } from '@/components/ui/toast/use-toast'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'createPost', data: IPost): void
}>();

const { toast } = useToast();

const user = useUserStore();

const { defineField, handleSubmit, isValidating, isSubmitting } = useForm<Pick<IPost, 'content' | 'visibility'> & { image: File | null }>({
  validationSchema: toTypedSchema(object().shape({
    content: string().ensure().trim().when("image", ([val], schema) => val ? schema.notRequired() : schema.required()),
    image: mixed().when("content", ([val], schema) => val ? schema.notRequired() : schema.required()),
    visibility: string().oneOf(Object.values(Visibility)).required().default(Visibility.PUBLIC)
  }, [["content", "image"]])),
  initialValues: {
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
const [image, imageAttr] = defineField("image", validateRule);
const [visibility, visibilityAttr] = defineField("visibility", validateRule);

const previewImage = ref<string | null>(null);

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

const handleSubmitForm = handleSubmit(async ({ content, image, visibility }) => {
  try {
    toast({
      title: "Posting...",
    });
    let formData = new FormData();

    if (content) formData.append("content", content);
    if (image) formData.append("image", image);
    formData.append("visibility", visibility);

    const request = await $fetch<{ data: IPost }>("/api/posts", {
      method: "POST",
      body: formData,
    });

    toast({
      title: "Your post has created!",
    });
    emit("createPost", request.data);
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
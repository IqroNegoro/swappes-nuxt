<template>
    <div class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 z-30 overflow-hidden overscroll-contain">
        <Transition name="fade-up" appear>
            <form class="flex flex-col gap-8 justify-between w-full h-full md:h-max md:w-1/3 md:max-h-[85%] bg-primary rounded-md p-4" @submit.prevent="handleSubmitForm">
                <div class="flex flex-col justify-between">
                    <div class="flex justify-between items-center">
                        <p class="text-2xl">Update Profile</p>
                        <button @click="emit('close')">
                            <i class="bx bx-x text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-1">
                        <p>Username</p>
                        <div class="flex px-2 justify-center items-center bg-black/10 border rounded-md" :class="{'border-red-500': errors.username || username.length > 25}">
                            <i class="bx bx-at"></i>
                            <Input v-model="username" class="bg-transparent px-0" />
                        </div>
                        <p v-if="username.length > 25" class="text-red-500 text-xs"> Username cannot more long then 25 characters! </p>
                        <p v-if="errors.username" class="text-red-500"> {{ errors.username }} </p>
                    </div>
                    <div>
                        <p>Name</p>
                        <Input v-model="name" class="bg-black/25 border" :class="{'border-red-500': errors.name || name.length > 100}" />
                        <p v-if="name.length > 100" class="text-red-500 text-xs"> Name cannot more long then 100 characters! </p>
                        <p v-if="errors.name" class="text-red-500"> {{ errors.name }} </p>
                    </div>
                    <div>
                        <p>Email</p>
                        <Input type="email" v-model="password" class="bg-black/25 border" :class="{'border-red-500': errors.email}" />
                        <p v-if="errors.email" class="text-red-500"> {{ errors.email }} </p>
                    </div>
                    <div>
                        <p>Password</p>
                        <Input type="password" v-model="password" class="bg-black/25 border" :class="{'border-red-500': errors.password}" />
                        <p v-if="errors.password" class="text-red-500"> {{ errors.password }} </p>
                    </div>
                    <div>
                        <p>Bio</p>
                        <div contenteditable :class="{ 'border border-red-500': bio!.length > 300 || errors?.bio }"
                            class="w-full min-h-24 px-4 py-1 inline-block rounded-md border"
                            @keyup.ctrl.enter="handleSubmitForm" @input="e => bio = (e.target as HTMLDivElement).innerText"></div>
                        <p v-if="bio.length > 300" class="text-red-500 text-xs"> Bio cannot more long then 300 characters! </p>
                        <p v-if="errors.bio" class="text-red-500"> {{ errors.bio }} </p>
                    </div>
                    <p class="text-xs text-white/50">You can update your username again in 1 month</p>
                </div>
                <div class="self-end">
                    <Button type="button">
                        Cancel
                    </Button>
                    <Button variant="secondary" type="submit" :disabled="isSubmitting || isValidating || !name || !username">
                        <i v-if="isSubmitting || isValidating" class="bx bx-loader-alt bx-spin"></i>
                        <p>Update</p>
                    </Button>
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
  (e: 'profileUpdate', data: IPost): void
}>();

const { toast } = useToast();

const user = useUserStore();

const { defineField, handleSubmit, isValidating, isSubmitting, errors } = useForm<Pick<IUser, 'name' | 'username' | 'bio' | 'email' | 'password'>>({
  validationSchema: toTypedSchema(object({
    name: string().max(100).required().ensure().trim(),
    username: string().required().ensure().trim().matches(/^[a-zA-Z0-9.]+$/gi, "Username not valid!").max(25),
    email: string().email().required().ensure().trim(),
    password: string().min(8).required().ensure().trim(),
    bio: string().required().max(300).ensure().trim()
  })),
  initialValues: {
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio
  }
});

const validateRule = {
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
}

const [username, usernameAttr] = defineField("username", validateRule);
const [name, nameAttr] = defineField("name", validateRule);
const [email, emailAttr] = defineField("email", validateRule);
const [password, passwordAttr] = defineField("password", validateRule);
const [bio, bioAttr] = defineField("bio", validateRule);

const handleSubmitForm = handleSubmit(async ({ username, name, email, password, bio }) => {
  try {
    toast({
      title: "Updating...",
    });
    const request = await $fetch<{ data: IPost }>(`/api/users/${user.id}`, {
      method: "PUT",
      body: {
        username,
        name,
        email,
        password,
        bio
      }
    });

    toast({
      title: "Profile updated",
    });
    emit("profileUpdate", request.data);
  } catch (error : any) {
    toast({
      title: "Error!",
      description: "Oops, we cannot create your post right now, try again. Error : " + error.data.message,
    });
  }
});

const handleClose = (e: KeyboardEvent) => {
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
<template>
    <div class="bg-black/90 w-full min-h-dvh flex items-center justify-center">
        <div class="w-full max-w-md bg-primary p-8 rounded-lg">
            <h1 class="text-2xl font-bold text-center mb-8 text-white">Welcome Back To Swappes!</h1>
            <form @submit.prevent="handleSubmitForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-white mb-1">Email or Username</label>
                    <input type="text" v-model="credential"
                        class="w-full px-3 py-2 bg-black/10 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:font-light"
                        :class="{ 'border-red-500': errors.credential }" placeholder="Enter your email or username" required />
                    <span v-if="errors.credential" class="text-red-500 text-xs">{{ errors.credential }}</span>
                </div>

                <div>
                    <label class="block text-sm font-medium text-white mb-1">Password</label>
                    <input type="password" v-model="password"
                        class="w-full px-3 py-2 bg-black/10 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:font-light"
                        :class="{ 'border-red-500': errors.password }" placeholder="Enter your password" required />
                    <span v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</span>
                </div>

                <button type="submit"
                :disabled="isSubmitting || isValidating || !credential || !password"
                    class="w-full bg-white text-primary font-semibold py-2 px-4 rounded-md hover:bg-white/90 transition duration-200">
                    <i v-if="isSubmitting || isValidating" class="bx bx-loader-alt bx-spin"></i>
                    <p v-else>Login</p>
                </button>

                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-white/10"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 text-white bg-primary">Or continue with</span>
                    </div>
                </div>

                <button :disabled="!isReady || isSubmitting || isValidating" type="button" @click="() => login()"
                    class="w-full bg-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2">
                    <i class="bx bxl-google text-xl"></i>
                    Continue with Google
                </button>
                <NuxtLink to="/register"
                    class="w-full bg-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2">
                    Register
                </NuxtLink>
            </form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { object, string } from "yup";
import { useTokenClient, type AuthCodeFlowSuccessResponse, type AuthCodeFlowErrorResponse } from "vue3-google-signin";
import { toTypedSchema } from "@vee-validate/yup";
import { useToast } from "~/components/ui/toast";

useHead({
    title: "Login to Swappes"
});

definePageMeta({
    layout: false
});

const user = useUserStore();
const { toast } = useToast();

const emit = defineEmits(['close']);

const { defineField, errors, handleSubmit, isValidating, isSubmitting, setErrors } = useForm<{
    credential: string,
    password: string,
}>({
    validationSchema: toTypedSchema(object({
        credential: string().required().ensure().trim(),
        password: string().min(8).required().ensure().trim()
    }))
});

const validateRule = {
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false
}

const [credential, credentialAttr] = defineField("credential", validateRule);
const [password, passwordAttr] = defineField("password", validateRule);

const handleSubmitForm = handleSubmit(async ({ credential, password }) => {
    try {
        const data = await $fetch<{ data: IUser }>("/api/auth", {
            method: "POST",
            body: {
                credential,
                password
            }
        });

        user.$patch(data.data);

        return await navigateTo("/");
    } catch (error: any) {
        if (error.statusCode === 400) {
            setErrors(error.data.data);
        } else {
            toast({
                title: "Error!",
                description: error.data.message,
            })
        }
    }
});

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
    try {
        const data = await $fetch<{ data: IUser }>("/api/auth/google", {
            method: "POST",
            body: {
                token: response.access_token
            },
        });

        user.$patch(data.data);

        await navigateTo("/");
    } catch (error: any) {
        toast({
            title: "Error!",
            description: error.data.message,
        })
    }
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    if (errorResponse.error === 'access_denied') {
        toast({
            title: "Error!",
            description: "You have denied the request to access your account",
        })
    } else {
        toast({
            title: "Error!",
            description: errorResponse.error_description || "Internal Server Error",
        })
    }
};

const { isReady, login } = useTokenClient({
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    scope: "email profile"
});
</script>
<template>
    <div class="w-96 h-dvh bg-primary p-4 flex flex-col gap-4 top-0 sticky">
        <div class="flex flex-col items-center gap-2">
            <Avatar class="w-20 h-20">
                <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Profile Picture" />
                <AvatarFallback>
                    <Skeleton class="rounded-full" />
                </AvatarFallback>
            </Avatar>
            <p class="font-light text-sm">@{{ user.username || 'Guest-chan~' }}</p>
            <p class="font-medium text-sm">{{ user.name || 'Guest-chan~' }}</p>
        </div>

        <nav class="flex flex-col gap-2 mt-4">
            <NuxtLink :to="{name: 'index'}" class="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-all">
                <i class="bx bx-home-alt text-2xl"></i>
                <span>Home</span>
            </NuxtLink>
            <NuxtLink v-if="user.username" :to="{name: 'users-id', params: {id: user.username}}" class="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-all">
                <i class="bx bx-user text-2xl"></i>
                <span>Profile</span>
            </NuxtLink>
            <button @click="handleLogout" class="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-all text-left">
                <i class="bx bx-log-out text-2xl"></i>
                <span>Logout</span>
            </button>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { useToast } from '@/components/ui/toast'

const user = useUserStore()
const { toast } = useToast()

const handleLogout = async () => {
    try {
        await $fetch('/api/auth', {
            method: 'DELETE'
        })
        return await navigateTo("/login")
    } catch (error: any) {
        toast({
            title: "Error!",
            description: "Cannot proceed to log out right now, try again, Error : " + error.data.message
        })
    }
}
</script>

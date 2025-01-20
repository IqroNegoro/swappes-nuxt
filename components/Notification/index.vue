<template>
    <NuxtLink :to="{name: 'posts-id', params: {id: notification.post?.id}}" class="flex gap-4 hover:bg-white/20 p-2 rounded-sm cursor-pointer" :class="{'bg-blue-500/25': !notification.isRead}">
        <NuxtLink :to="{name: 'users-id', params: {id: notification.from.username}}" class="font-medium text-white w-max h-max relative">
            <Avatar class="w-16 h-16">
                <AvatarImage referrer-policy="no-referrer" v-if="notification.from.avatar" :src="notification.from.avatar" :alt="notification.from.name" />
                <AvatarFallback>
                    <Skeleton class="rounded-full" />
                </AvatarFallback>
            </Avatar>
            <div class="absolute bottom-1 right-0 rounded-full bg-primary flex justify-center items-center px-1 py-0.5">
                <i v-if="notification.type === 'like'" class="bx bxs-heart text-red-500 text-xs"></i>
                <i v-else-if="notification.type === 'comment'" class="bx bxs-comment text-blue-500 text-xs"></i>
            </div>
        </NuxtLink>
        <div class="text-sm min-w-0 whitespace-pre-line break-words">
            <p class="text-gray-200">
                <NuxtLink :to="{name: 'users-id', params: {id: notification.from.username}}" class="font-medium text-white">
                    {{ notification.from.name }}
                </NuxtLink>
                {{ notification.content }} :
            </p>
            <span class="text-white line-clamp-2">
                "{{ notification.post?.content }}"
            </span>
            <span class="text-white line-clamp-2 text-xs">
                {{ moment(notification.updatedAt).fromNow() }}
            </span>
        </div>
    </NuxtLink>
</template>
<script setup lang="ts">
import moment from "moment";
const props = defineProps<{
    notification: INotification
}>();
</script>
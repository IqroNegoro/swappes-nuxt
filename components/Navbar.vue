<template>
    <div class="w-full h-16 p-4 flex items-center justify-between bg-primary">
        <h1 class="text-white font-medium text-2xl">Swappes</h1>
        <div>
            <NuxtLink class="" :to="{name: 'index'}">
                <Button variant="link">
                    <i class="bx bx-home-alt text-white text-3xl"></i>
                </Button>
            </NuxtLink>
        </div>
        <div class="relative flex justify-center items-center gap-4">
            <div class="relative">
                <button class="flex justify-center items-center text-white text-3xl" @click="openNotifications = !openNotifications">
                    <i class="bx bx-bell"></i>
                </button>
                <div class="absolute top-full right-0 w-96 h-auto bg-primary rounded-sm max-h-96 overflow-y-auto p-2 z-30" v-if="openNotifications">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <h1 class="text-white font-medium text-2xl">Notifications</h1>
                            <button class="text-white text-3xl" @click="openNotifications = false">
                                <i class="bx bx-x"></i>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2" v-if="notifications?.data?.length">
                            <div class="flex gap-4 hover:bg-white/20 p-2 rounded-sm" v-for="notification in notifications?.data">
                                <img :src="notification.from.avatar" :alt="notification.from.name" class="w-12 h-12 rounded-full">
                                <div class="text-sm min-w-0 border truncate">
                                    <p class="text-gray-200">
                                        <NuxtLink :to="{name: 'users-id', params: {id: notification.from.username}}" class="font-medium text-white">
                                            {{ notification.from.name }}
                                        </NuxtLink>
                                        {{ notification.content }}
                                    </p>
                                    <span class="text-white">
                                        : "{{ notification.post?.content }}"
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Avatar>
                        <AvatarImage referrer-policy="no-referrer" v-if="user.avatar" :src="user.avatar" alt="Irene Arknight" class="w-20 h-20 rounded-full" />
                        <AvatarFallback>
                            <Skeleton class="rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 bg-primary text-white border-0 mr-5">
                  <DropdownMenuLabel class="font-bold">Profile Menu</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem @click="() => navigateTo(`/users/${user.username}`)">
                    <span>My Profile</span>
                      <DropdownMenuShortcut>
                        <i class="bx bx-user text-xl"></i>
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleLogout">
                      <span>Log Out</span>
                      <DropdownMenuShortcut>
                        <i class="bx bx-log-out text-xl"></i>
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useToast } from '@/components/ui/toast';

const user = useUserStore();

const { toast } = useToast();

const openNotifications = ref<boolean>(false);

const { data: notifications, error, status, refresh } = await useFetch<{data: INotification[]}>('/api/notifications', {
    key: `get-notifications-${user.id}`
});

const notificationListener = watch(openNotifications, (newVal, oldVal) => {
    console.log(newVal)
    if (newVal) {
        refresh();
    }
});

onBeforeUnmount(() => {
    notificationListener();
});

const handleLogout = async () => {
    try {
        const response = await $fetch('/api/auth', {
            method: 'DELETE'
        });

        return await navigateTo("/login");
    } catch (error : any) {
        toast({
            title: "Error!",
            description: "Cannot proceed to log out right now, try again, Error : " + error.data.message
        })
    }
}
</script>
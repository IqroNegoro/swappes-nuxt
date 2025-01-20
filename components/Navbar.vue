<template>
    <div class="w-full h-16 p-4 flex items-center justify-between bg-primary">
        <h1 class="text-white font-medium md:text-2xl">Swappes</h1>
        <div>
            <NuxtLink :to="{ name: 'index' }">
                <Button variant="link">
                    <i class="bx bx-home-alt text-white text-3xl"></i>
                </Button>
            </NuxtLink>
        </div>
        <div class="relative flex justify-center items-center gap-4">
            <div class="relative">
                <button class="flex justify-center items-center text-white text-3xl"
                    @click="openNotifications = !openNotifications">
                    <i class="bx bx-bell"></i>
                </button>
                <div class="fixed md:absolute top-0 md:top-full max-md:left-0 md:right-0 w-full md:w-96 md:h-auto overscroll-contain bg-primary rounded-sm h-screen md:max-h-96 overflow-y-auto py-2 z-30"
                    v-if="openNotifications">
                    <div class="flex flex-col gap-2 h-full">
                        <div class="flex justify-between items-center p-2">
                            <h1 class="text-white font-medium text-2xl">Notifications</h1>
                            <div class="flex justify-center items-center gap-2">
                                <button class="text-white text-3xl" @click="refresh">
                                    <i class="bx bx-refresh" :class="{'bx-spin': status === 'pending'}"></i>
                                </button>
                                <button class="text-white text-3xl" @click="openNotifications = false">
                                    <i class="bx bx-x"></i>
                                </button>
                            </div>
                        </div>
                        <template v-if="status === 'pending'">
                            <NotificationSkeleton v-for="i in 5" :key="i" />
                        </template>
                        <Error v-else-if="error" :refresh="refresh" :full="true" />
                        <div class="flex flex-col gap-1" v-else>
                            <Notification v-for="notification in notifications" :key="notification.id"
                                :notification="notification" />
                        </div>
                    </div>
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Avatar>
                        <AvatarImage referrer-policy="no-referrer" v-if="user.avatar" :src="user.avatar"
                            :alt="`${user.name} avatar`" class="w-20 h-20 rounded-full" />
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

const { data: notifications, error, status, refresh } = await useFetch<INotification[]>('/api/notifications', {
    default: () => [],
    transform: (res: any) => res.data,
    key: `get-notifications-${user.id}`
});

const routeListener = watch(() => useRoute().fullPath, () => {
    openNotifications.value = false;
});

onBeforeUnmount(() => {
    routeListener();
});

const handleLogout = async () => {
    try {
        const response = await $fetch('/api/auth', {
            method: 'DELETE'
        });

        return await navigateTo("/login");
    } catch (error: any) {
        toast({
            title: "Error!",
            description: "Cannot proceed to log out right now, try again, Error : " + error.data.message
        })
    }
}
</script>
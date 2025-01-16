<template>
    <div class="w-full h-16 p-4 flex items-center justify-between bg-primary">
        <h1 class="text-white font-medium text-2xl">Swappes</h1>
        <div>
            <NuxtLink class="">
                <Button variant="link">
                    <i class="bx bx-home-alt text-white text-3xl"></i>
                </Button>
            </NuxtLink>
        </div>
        <div class="relative">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Avatar>
                        <AvatarImage v-if="user.avatar" :src="user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                        <AvatarFallback>
                            <Skeleton class="rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 bg-primary text-white border-0 mr-5">
                  <DropdownMenuLabel class="font-bold">Profile Menu</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                    <NuxtLink v-if="user.username" :to="{name: 'users-id', params: {id: user.username}}">
                        <span>My Profile</span>
                    </NuxtLink>
                    <span v-else>My Profile</span>
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
<template>
    <div class="flex flex-col gap-2 bg-primary py-2 rounded-sm">
        <div class="flex justify-between px-4 py-2">
            <div class="flex gap-2">
                <NuxtLink :to="{name: 'users-id', params: {id: post.user?.username}}">
                    <Avatar>
                        <AvatarImage v-if="post.user.avatar" :src="post.user.avatar" alt="Irene Arknight" class="w-16 h-16 rounded-full" />
                        <AvatarFallback>
                            <Skeleton class="rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                </NuxtLink>
                <div class="flex flex-col">
                  <NuxtLink :to="{name: 'users-id', params: {id: post.user?.username}}" class="hover:underline">
                    <p>{{ post.user.name }}</p>
                  </NuxtLink>
                    <div class="flex gap-1 items-center">
                        <i class="bx text-xs" :class="{'bx-world': post.visibility === Visibility.PUBLIC, 'bx-group': post.visibility === Visibility.FRIENDS, 'bx-lock': post.visibility === Visibility.PRIVATE}"></i>
                        &bull;
                        <i class="bx bx-time-five text-xs"></i>
                        <p class="text-xs">{{ moment(post.createdAt).fromNow() }}</p>
                    </div>
                </div>
            </div>
            <DropdownMenu v-if="!isShare">
                <DropdownMenuTrigger as-child>
                  <Button class="w-max p-0 h-auto hover:bg-transparent">
                    <i class="bx bx-dots-horizontal text-xl"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 bg-primary text-white border-0">
                  <DropdownMenuLabel class="font-bold">Post Menu</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <span>Save</span>
                      <DropdownMenuShortcut>
                        <i class="bx bx-bookmark text-xl"></i>
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <template v-if="post.user.id == user.id">
                        <DropdownMenuItem @click="emit('editPost', post)">
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
                                  This action cannot be undone. This will permanently delete your post.
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
        <div class="px-4">
            <p class="text-justify text-sm">{{ post.content }}</p>
        </div>
        <div v-if="post.isShare && post.share" class="px-4">
          <Post :post="post.share!" :isShare="post.isShare" @select-post="emit('selectPost', $event)" />
        </div>
        <div v-else-if="!isShare && post.isShare && !post.share" class="text-center my-4">
          <i class="bx bx-ghost"></i>
          <p>
            This share post has been ghosted
          </p>
        </div>
        <img v-else-if="post.image" :src="post.image" alt="Image Post" class="w-full h-auto object-contain cursor-pointer" @click.self="emit('selectPost', post)">
        <div v-if="!isShare" class="flex gap-2 px-2">
            <Button @click="handleLikePost">
                <i class="bx bx-heart"></i>
                <p>{{ post.likesCount }}</p>
            </Button>
            <Button @click="emit('selectPost', post)">
                <i class="bx bx-comment"></i>
                <p>{{ post.commentsCount }}</p>
            </Button>
            <Button @click="emit('sharePost', post.isShare ? post.share ? post.share : post : post)">
                <i class="bx bx-share-alt"></i>
                <p>{{ post.sharesCount }}</p>
            </Button>
        </div>
    </div>
</template>
<script setup lang="ts">
import moment from 'moment';
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

const user = useUserStore();

const props = defineProps<{
    post: IPost,
    isShare?: boolean | null
}>();

const emit = defineEmits<{
    (e: 'selectPost', data: IPost): void
    (e: 'editPost', data: IPost): void
    (e: 'deletePost', data: string): void
    (e: 'likePost', data: Pick<IPost, "id" | "likesCount">): void
    (e: 'sharePost', data: IPost): void
}>();

const handleLikePost = async () => {
  try {
    const response = await $fetch<{data: Pick<IPost, "id" | "likesCount">}>(`/api/posts/${props.post.id}/likes`, {
      method: "POST"
    });

    emit('likePost', response.data)
  } catch (error : any) {
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

    const response = await $fetch<{data: string}>(`/api/posts/${props.post.id}`, {
      method: 'DELETE'
    });

    toast({
      title: "Post deleted"
    });

    emit('deletePost', response.data);
  } catch (error : any) {
    toast({
      title: "Failed to delete post",
      description: "Oops, we cannot delete your post right now, try again. \n Error : " + error.data.message,
    })
  }
}
</script>
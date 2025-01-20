<template>
    <div class="bg-primary overflow-x-hidden w-full min-h-dvh flex max-lg:flex-col text-white">
        <Skeleton class="relative w-full max-lg:h-96 h-full flex justify-center items-center" />
        <div class="w-full lg:max-w-[28rem] lg:w-[28rem] lg:min-w-[28rem] flex flex-col gap-2 max-h-dvh pt-4">
            <div class="flex justify-between px-4 py-2">
                <div class="flex gap-2">
                    <Skeleton class="w-16 h-16 rounded-full" />
                    <div class="flex flex-col gap-2">
                        <Skeleton class="w-32 h-4" />
                        <Skeleton class="w-64 h-4" />
                        <Skeleton class="w-64 h-4" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 px-2 py-4">
                <Skeleton class="w-full h-4" />
                <Skeleton class="w-1/2 h-4" />
                <Skeleton class="w-1/3 h-4" />
            </div>
            <div class="flex gap-2 px-2">
                <Skeleton class="w-16 h-4" />
                <Skeleton class="w-16 h-4" />
                <Skeleton class="w-16 h-4" />
            </div>
            <div class="p-2 h-full overflow-y-auto overflow-x-hidden">
                <PostCommentSkeleton />
            </div>
        </div>
    </div>
</template>
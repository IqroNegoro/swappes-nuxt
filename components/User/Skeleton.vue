<template>
    <div class="w-full max-h-96 relative aspect-video rounded-b-lg overflow-hidden">
        <Skeleton class="w-full h-full aspect-video" />
    </div>
    <div class="w-full flex px-8 -translate-y-16 relative z-20 pointer-events-none">
        <div class="flex flex-col gap-4 pointer-events-auto relative">
            <Skeleton class="w-32 h-32 rounded-full" />
            <div class="flex flex-col gap-2">
                <Skeleton class="w-32 h-4 rounded-full" />
                <Skeleton class="w-20 h-4 rounded-full" />
                <Skeleton class="w-64 h-4 rounded-full" />
            </div>
        </div>
    </div>
</template>
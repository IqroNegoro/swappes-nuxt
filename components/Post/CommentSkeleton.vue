<template>
    <div class="p-2 flex gap-4">
        <Skeleton class="w-12 h-12 rounded-full aspect-square" />
        <div class="flex flex-col gap-2">
            <div class="w-max">
                <Skeleton class="h-4 w-32 mb-2" />
                <Skeleton class="h-4 w-64 mb-2" />
                <Skeleton class="h-4 w-64 mb-2" />
                <Skeleton class="w-48 h-48" />
            </div>
            <div class="flex gap-4">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-16" />
                <Skeleton class="h-4 w-16" />
            </div>
        </div>
    </div>
</template>
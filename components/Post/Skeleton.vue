<template>
    <div class="flex flex-col gap-2 bg-primary py-2 rounded-sm">
        <div class="flex justify-between px-4 py-2">
            <div class="flex gap-2">
                <Skeleton class="w-16 h-16 rounded-full" />
                <div class="flex flex-col gap-2">
                    <Skeleton class="w-24 h-4 rounded-sm" />
                    <Skeleton class="w-16 h-4 rounded-sm" />
                </div>
            </div>
        </div>
        <div class="px-4">
            <Skeleton class="w-full h-4 rounded-sm" />
        </div>
        <Skeleton class="w-full h-96 object-cover" />
        <div class="flex gap-2 px-2">
            <Button>
                <Skeleton class="w-4 h-4 rounded-sm" />
            </Button>
            <Button>
                <Skeleton class="w-4 h-4 rounded-sm" />
            </Button>
            <Button>
                <Skeleton class="w-4 h-4 rounded-sm" />
            </Button>
        </div>
    </div>
</template>
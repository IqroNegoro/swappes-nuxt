<template>
    <div class="w-full flex flex-col justify-center items-center gap-4 pt-2" :class="{'h-full': full}">
        <i class="bx bx-error text-white text-2xl"></i>
        <p class="text-white text-2xl font-bold">Error</p>
        <p class="text-gray-300 font-light text-center">
            {{ message ?? "We cannot load this right now, please try again later." }}
        </p>
        <Button v-if="refresh" @click="refresh">
            Refresh
        </Button>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    message?: string
    refresh?: () => void
    full?: boolean
}>();
</script>
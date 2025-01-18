<template>
    <DropdownMenuItem>
        <span>Save</span>
        <DropdownMenuShortcut>
            <i class="bx bx-loader-alt bx-spin" v-if="status === 'pending'"></i>
            <i v-else class="bx bx-bookmark text-xl"></i>
        </DropdownMenuShortcut>
    </DropdownMenuItem>
</template>
<script setup lang="ts">
const props = defineProps<{ id: Pick<IPost, 'id'>['id'] }>();
const { data: bookmark, error, status, refresh } = await useFetch('/api/posts/bookmark', {
    lazy: true
});
</script>
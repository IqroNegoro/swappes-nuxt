export const getPosts = async () => await useFetch<IPost[]>("/api/posts", {
    lazy: true,
    default: () => [],
    transform: (res : any) => res.data,
    key: "get-posts"
});

export const getComments = async (postId: string) => await useFetch<IComment[]>(`/api/posts/${postId}/comments`, {
    lazy: true,
    default: () => [],
    transform: (res : any) => res.data,
    key: "get-comments"
});
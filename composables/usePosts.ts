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
    key: `get-comments-${postId}`
});

export const copyLink = id => {
    let text = `${window.location.origin}/posts/${id}`
    navigator.clipboard.writeText(text);
}
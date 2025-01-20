export const getUser = (id : string) => useFetch<IUser>(`/api/users/${id}`, {
    lazy: true,
    default: () => null,
    transform: (res : any) => res.data,
    key: `get-user-${id}`
});

export const getUserPosts = (id: string) => useFetch<IPost[]>(`/api/users/${id}/posts`, {
    lazy: true,
    default: () => [],
    transform: (res : any) => res.data,
    key: `get-users-${id}-posts`
});
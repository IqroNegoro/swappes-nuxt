import type { UseFetchOptions } from "#app";

export const getUser = (id : string) => useFetch<IUser>(`/api/users/${id}`, {
    lazy: true,
    default: () => null,
    transform: (res : any) => res.data,
    key: `get-user-${id}`
});

export const getUserPosts = <T>(id: string, options? : UseFetchOptions<T>) => useFetch<T>(`api/users/${id}/posts`, {
    ...options,
    lazy: true,
    immediate: false,
    default: () => [],
    transform: (res : any) => res.data,
    key: `get-users-${id}-posts`
});
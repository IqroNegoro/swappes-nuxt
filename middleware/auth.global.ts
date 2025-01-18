export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useUserStore();
    
    const whitelists = ["login", "register"];
    try {
        const data = await $fetch<{data: IUser}>('/api/auth', {
            credentials: 'include',
            headers: useRequestHeaders(["cookie"]),
        });
    
        if (data) {
            user.$patch(data.data);
            if (whitelists.includes(to.name as string)) return await navigateTo("/");
        }
    } catch (error : any) {
        user.$reset();
        if (whitelists.includes(to.name as string)) return;
        else return await navigateTo("/login");
    }
});
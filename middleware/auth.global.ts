export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useUserStore();
   
    const whitelists = ["login", "register"];

    const { data, error } = await useFetch<{data: IUser}>('/api/auth');

    if (data.value) {
        user.$patch(data.value.data);
        if (whitelists.includes(to.name as string)) return await navigateTo("/");
    }

    if (error.value) {
        user.$reset();
        if (whitelists.includes(to.name as string)) return;
        else {
            return await navigateTo("/login");
        } 
    }
});
export default defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    name: '', 
    avatar: '',
  } as IUser),
})
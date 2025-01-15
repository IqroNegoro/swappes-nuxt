export default defineStore('user', {
  state: () => ({
    id: '',
    email: '',
    username: '',
    name: '', 
    avatar: '',
  } as IUser),
})
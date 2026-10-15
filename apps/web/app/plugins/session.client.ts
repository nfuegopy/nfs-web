export default defineNuxtPlugin(() => {
  useSession().refresh()
})

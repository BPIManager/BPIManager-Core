export default {
 onUpdate: (registration:any) => {
   registration.unregister().then(() => {
   window.location.reload()
 })
},
onSuccess: (registration:any) => {
  console.log(registration)
 },
}

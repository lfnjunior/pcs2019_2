export const doLogout = () => {
   localStorage.removeItem('token')
}

export const isLogin = () => {
   if (localStorage.getItem('token')) {
      return true
   } else {
      return false
   }
}

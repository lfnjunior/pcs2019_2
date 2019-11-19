export const TOKEN_KEY = 'pcs2019_2'

export const doLogout = () => {
   localStorage.removeItem(TOKEN_KEY)
}

export const isLogin = () => {
   if (localStorage.getItem(TOKEN_KEY)) {
      return true
   } else {
      return false
   }
}

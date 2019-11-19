import React from 'react'
import { BrowserRouter, Switch } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import PrivateRoute from './Services/privateRoute'
import PublicRoute from './Services/publicRoute'
import Login from './Pages/Public/Login/Login'
import NewUser from './Pages/Public/NewUser/NewUser'
import Dashboard from './Pages/Private/Dashboard/Dashboard'
import User from './Pages/Private/User/User'

export default function Routes() {
   return (
      <SnackbarProvider maxSnack={2}>
         <BrowserRouter>
            <Switch>
               <PublicRoute component={Login} restricted={true} path="/" exact />
               <PublicRoute component={NewUser} restricted={true} path="/newuser" exact />
               <PrivateRoute component={Dashboard} path="/dashboard" exact />
               <PrivateRoute component={User} path="/user" exact />
            </Switch>
         </BrowserRouter>
      </SnackbarProvider>
   )
}

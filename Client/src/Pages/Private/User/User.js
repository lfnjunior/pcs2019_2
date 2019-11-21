import React, { useState, useEffect } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import MenuIcon from '@material-ui/icons/Menu'
import Container from '@material-ui/core/Container';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField'
import DateFnsUtils from '@date-io/date-fns'
import ptLocale from 'date-fns/locale/pt-BR'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import { useSnackbar } from 'notistack'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import isEmail from 'isemail'
import moment from 'moment'
import clsx from 'clsx'
import useStyles from './useStyles'
import { mainListItems } from '../../../Components/ListItems'
import { doLogout } from '../../../Services/utils'
import api from '../../../Services/api'


export default function User({ history }) {
   const [openListItens, setOpenListItens] = React.useState(false)
   const { enqueueSnackbar } = useSnackbar() //success, error, warning, info, or default
   const [loading, setLoading] = React.useState(false)
   const [idUser, setIdUser] = useState(0)
   const [username, setUsername] = useState('')
   // const [password, setPassword] = useState('')
   // const [password2, setPassword2] = useState('')
   const [email, setEmail] = useState('')
   const [birthdate, setBirthdate] = useState(null)
   const [sex, setSex] = useState('')
   const [disabledForm, setDisabledForm] = useState(true)

   async function snack(msg, v = 'error') {
      let snack = {
         variant: v, //success, error, warning, info, or default
         persist: false,
         preventDuplicate: true
      }
      enqueueSnackbar(msg, snack)
   }

   const handleDrawerOpen = () => {
      setOpenListItens(true)
   }

   const handleDrawerClose = () => {
      setOpenListItens(false)
   }

   const [openAlert, setOpenAlert] = useState(false);

   const handleOpenAlert = () => {
      setOpenAlert(true);
   };

   const handleCloseAlert = () => {
      setOpenAlert(false);
   };

   const handleEditForm = () => {
      setDisabledForm(!disabledForm)
   };

   const classes = useStyles()


   useEffect(() => {
      async function loadUser() {
         let userId = localStorage.getItem('userId')
         let token = localStorage.getItem('token')
         if (userId && token) {
            await api
               .get(`/user/${userId}`, { headers: { token: token } })
               .then(response => {
                  console.log(response.data)
                  if (response.status === 200) {
                     if (response.data.id) setIdUser(response.data.id)
                     if (response.data.username) setUsername(response.data.username)
                     if (response.data.email) setEmail(response.data.email)
                     if (response.data.sex) setSex(response.data.sex)
                     if (response.data.birthdate) setBirthdate(response.data.birthdate)
                  }
               })
               .catch(function (error) {
                  console.log(error.config.data)
                  if (error.response) {
                     if (error.response.status === 400) {
                        this.snack(error.response.data.message)
                     }
                  }
               })
         } else {
            this.snack('Não foi encontrado token ou id do usuário armazenados localmente')
         }

      }
      loadUser()
   }, [])

   const handleExitApp = () => {
      doLogout()
      history.push('/')
   }


   async function handleSubmit(event) {
      event.preventDefault()
      setLoading(prevLoading => !prevLoading)
      if (username === '') snack('Campo Nome de usuário é obrigatório')
      else if (email === '') snack('Campo Email é obrigatório')
      // else if (password === '') snack('Campo Senha é obrigatório')
      // else if (password2 === '') snack('Campo Repetir Senha é obrigatório')
      // else if (password !== password2) snack('As senhas devem ser identicas')
      else if (!isEmail.validate(email)) snack('Email inválido')
      else {
         let bdt = birthdate ? moment(birthdate).format('YYYY-MM-DDTHH:mm:ss.sssZ') : null
         await api
            .put('/user', {
               id: idUser,
               username: username,
               // password: password,
               email: email,
               birthdate: bdt,
               sex: sex
            },
               { headers: { Token: localStorage.getItem('token') } })
            .then(response => {
               if (response.status === 200) {
                  snack('Cadastro do usuário atualizado com sucesso.', 'success')
               }
               console.log(response.status)
               console.log(response.data)
            })
            .catch(function (error) {
               console.log(error.config.data)
               if (error.response) {
                  if (error.response.status === 400) {
                     snack(error.response.data.message)
                  }
               }
            })
      }
      setLoading(prevLoading => !prevLoading)
   }

   async function handleConfirmDelete(event) {
      event.preventDefault()
      setLoading(prevLoading => !prevLoading)
      await api
         .delete(`/user/${idUser}`, { headers: { Token: localStorage.getItem('token') } })
         .then(response => {
            if (response.status === 200) {
               localStorage.removeItem('userId')
               localStorage.removeItem('token')
               history.push('/')
            }
            console.log(response.status)
            console.log(response.data)
         })
         .catch(function (error) {
            console.log(error.config.data)
            if (error.response) {
               if (error.response.status === 400) {
                  snack(error.response.data.message)
               }
            }
         })
      setLoading(prevLoading => !prevLoading)
   }

   return (
      <div className={classes.root}>
         <CssBaseline />
         <AppBar position="absolute" className={clsx(classes.appBar, openListItens && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
               <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  className={clsx(classes.menuButton, openListItens && classes.menuButtonHidden)}>
                  <MenuIcon />
               </IconButton>
               <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                  Dados cadastrais
               </Typography>
               <IconButton color="inherit" onClick={handleExitApp}>
                  <ExitToAppIcon />
               </IconButton>
            </Toolbar>
         </AppBar>
         <Drawer
            variant="permanent"
            classes={{ paper: clsx(classes.drawerPaper, !openListItens && classes.drawerPaperClose) }} open={openListItens}>
            <div className={classes.toolbarIcon}>
               {username &&
                  <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                     {username}
                  </Typography>
               }
               <IconButton onClick={handleDrawerClose}>
                  <ChevronLeftIcon />
               </IconButton>
            </div>
            <Divider />
            <List>{mainListItems}</List>
            <Divider />
         </Drawer>
         <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <div className={classes.heroContent}>
               <Typography className={classes.heroTitle} component="h4" variant="h5" align="left" color="textPrimary" gutterBottom>
                     Edição
                  <Switch
                     //checked={state.checkedB}
                     onChange={handleEditForm}
                     value="checkedB"
                     color="primary"
                     inputProps={{ 'aria-label': 'primary checkbox' }} />
               </Typography>
            </div>
            <Container component="main" maxWidth="xs" className={classes.containerForm}>
               <CssBaseline />
               <div className={classes.paperCad}>
                  <form className={classes.form} onSubmit={handleSubmit} noValidate>
                     <Grid container spacing={2}>
                        <Grid item xs={12}>
                           <TextField
                              autoComplete="fname"
                              name="firstName"
                              variant="outlined"
                              disabled={disabledForm}
                              required
                              fullWidth
                              value={username}
                              onChange={event => setUsername(event.target.value)}
                              id="firstName"
                              label="Nome de usuário"
                              autoFocus/>
                        </Grid>
                        <Grid item xs={12}>
                           <TextField
                              variant="outlined"
                              required
                              fullWidth
                              disabled={disabledForm}
                              value={email}
                              onChange={event => setEmail(event.target.value)}
                              id="email"
                              label="Email"
                              type="email"
                              name="email"
                              autoComplete="email"/>
                        </Grid>
                        {/* <Grid item xs={12}>
                           <TextField
                              variant="outlined"
                              required
                              fullWidth
                              disabled={disabledForm}
                              value={password}
                              onChange={event => setPassword(event.target.value)}
                              name="password"
                              label="Senha"
                              type="password"
                              id="password"
                              autoComplete="current-password"/>
                        </Grid>
                        <Grid item xs={12}>
                           <TextField
                              variant="outlined"
                              required
                              disabled={disabledForm}
                              fullWidth
                              value={password2}
                              onChange={event => setPassword2(event.target.value)}
                              name="password2"
                              label="Repetir senha"
                              type="password"
                              id="password2"
                              autoComplete="current-password"/>
                        </Grid> */}
                        <Grid item xs={12}>
                           <div className={classes.date}>
                              <FormLabel component="legend">Sexo</FormLabel>
                              <RadioGroup
                                 aria-label="position"
                                 name="position"
                                 value={sex}
                                 onChange={event => setSex(event.target.value)}
                                 row>
                                 <FormControlLabel value="M" control={<Radio color="primary" />} label="Masculino" labelPlacement="end" disabled={disabledForm} />
                                 <FormControlLabel value="F" control={<Radio color="primary" />} label="Feminino" labelPlacement="end" disabled={disabledForm} />
                              </RadioGroup>
                           </div>
                        </Grid>
                        <Grid item xs={12}>
                           <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptLocale}>
                              <KeyboardDatePicker
                                 autoOk
                                 fullWidth
                                 variant="inline"
                                 disabled={disabledForm}
                                 inputVariant="outlined"
                                 label="Data de nascimento"
                                 format="dd/MM/yyyy"
                                 value={birthdate}
                                 onChange={date => setBirthdate(date)}
                                 InputAdornmentProps={{ position: 'start' }}
                              />
                           </MuiPickersUtilsProvider>
                        </Grid>
                     </Grid>
                     <Grid container justify="flex-end">
                        {!disabledForm &&
                           <Button
                              variant="contained"
                              color="primary"
                              className={classes.submit}
                              startIcon={<SaveIcon />}
                              type="submit">
                              {loading ? <CircularProgress size="1.55rem" color="inherit" /> : <>Gravar</>}
                           </Button>}
                        <Button
                           variant="contained"
                           color="secondary"
                           onClick={handleOpenAlert}
                           className={classes.submit}
                           startIcon={<DeleteIcon />}>
                           {loading ? <CircularProgress size="1.55rem" color="inherit" /> : <>Excluir</>}
                        </Button>
                     </Grid>
                  </form>
               </div>
            </Container>
         </main>
         <div>
            <Dialog
               open={openAlert}
               onClose={handleCloseAlert}
               aria-labelledby="alert-dialog-title"
               aria-describedby="alert-dialog-description">
               <DialogTitle id="alert-dialog-title">{"Alerta"}</DialogTitle>
               <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                     Após a exclusão você será redirecionado para fora do sistema,<br /> e não será possível recuperar a conta.<br /> Confirma a exclusão?
                  </DialogContentText>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleConfirmDelete} color="primary">
                     Confirmar
                  </Button>
                  <Button onClick={handleCloseAlert} color="primary" autoFocus>
                     Cancelar
                  </Button>
               </DialogActions>
            </Dialog>
         </div>
      </div>
   )
}

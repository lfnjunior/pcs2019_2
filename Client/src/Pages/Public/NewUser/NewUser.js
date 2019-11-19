import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import DateFnsUtils from '@date-io/date-fns'
import ptLocale from 'date-fns/locale/pt-BR'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import api from '../../../Services/api'
import { useSnackbar } from 'notistack'
import CircularProgress from '@material-ui/core/CircularProgress'
import useStyles from './useStyles'
import isEmail from 'isemail'
import moment from 'moment'

export default function SignUp({ history }) {
   const classes = useStyles()

   const { enqueueSnackbar } = useSnackbar() //success, error, warning, info, or default
   const [loading, setLoading] = React.useState(false)
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [password2, setPassword2] = useState('')
   const [email, setEmail] = useState('')
   const [birthdate, setBirthdate] = useState(null)
   const [sex, setSex] = useState('')

   async function snack(msg, v = 'error') {
      let snack = {
         variant: v, //success, error, warning, info, or default
         persist: false,
         preventDuplicate: true
      }
      enqueueSnackbar(msg, snack)
   }

   async function handleSubmit(event) {
      event.preventDefault()

      setLoading(prevLoading => !prevLoading)
      if (username === '') snack('Campo Nome de usuário é obrigatório')
      else if (email === '') snack('Campo Email é obrigatório')
      else if (password === '') snack('Campo Senha é obrigatório')
      else if (password2 === '') snack('Campo Repetir Senha é obrigatório')
      else if (password !== password2) snack('As senhas devem ser identicas')
      else if (!isEmail.validate(email)) snack('Email inválido')
      else {
         let bdt = birthdate ? moment(birthdate).format('YYYY-MM-DDTHH:mm:ss.sssZ') : null
         await api
            .post('/user', {
               username: username,
               password: password,
               email: email,
               birthdate: bdt,
               sex: sex
            })
            .then(response => {
               console.log(response.data)
               if (response.status === 201) {
                  history.push('/')
               }
            })
            .catch(function(error) {
               console.log(error.config.data)
               if (error.response) {
                  if (error.response.status === 405) {
                     snack(error.response.data.message)
                  }
               }
            })
      }
      setLoading(prevLoading => !prevLoading)
   }

   return (
      <Container component="main" maxWidth="xs">
         <CssBaseline />
         <div className={classes.paper}>
            <Avatar className={classes.avatar}>
               <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
               Cadastro de Usuário
            </Typography>
            <form className={classes.form} onSubmit={handleSubmit} noValidate>
               <Grid container spacing={2}>
                  <Grid item xs={12}>
                     <TextField
                        autoComplete="fname"
                        name="firstName"
                        variant="outlined"
                        required
                        fullWidth
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                        id="firstName"
                        label="Nome de usuário"
                        autoFocus
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        variant="outlined"
                        required
                        fullWidth
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        id="email"
                        label="Email"
                        type="email"
                        name="email"
                        autoComplete="email"
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        variant="outlined"
                        required
                        fullWidth
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        name="password"
                        label="Senha"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        variant="outlined"
                        required
                        fullWidth
                        value={password2}
                        onChange={event => setPassword2(event.target.value)}
                        name="password2"
                        label="Repetir senha"
                        type="password"
                        id="password2"
                        autoComplete="current-password"
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <div className={classes.date}>
                        <FormLabel component="legend">Sexo</FormLabel>
                        <RadioGroup
                           aria-label="position"
                           name="position"
                           value={sex}
                           onChange={event => setSex(event.target.value)}
                           row
                        >
                           <FormControlLabel value="M" control={<Radio color="primary" />} label="Masculino" labelPlacement="end" />
                           <FormControlLabel value="F" control={<Radio color="primary" />} label="Feminino" labelPlacement="end" />
                        </RadioGroup>
                     </div>
                  </Grid>
                  <Grid item xs={12}>
                     <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptLocale}>
                        <KeyboardDatePicker
                           autoOk
                           fullWidth
                           variant="inline"
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
               <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                  {loading ? <CircularProgress size="1.55rem" color="inherit" /> : <>Cadastrar</>}
               </Button>
               <Grid container justify="flex-end">
                  <Grid item>
                     <Link href="/" variant="body2">
                        Já possui uma conta? Login
                     </Link>
                  </Grid>
               </Grid>
            </form>
         </div>
      </Container>
   )
}

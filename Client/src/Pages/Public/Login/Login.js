import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import api from '../../../Services/api';
import { useSnackbar } from 'notistack';
import CircularProgress from '@material-ui/core/CircularProgress';
import useStyles from './useStyles';
import { TOKEN_KEY } from '../../../Services/utils';

export default function SignIn({ history }) {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar(); //success, error, warning, info, or default
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function snack(msg, v = 'error') {
    let snack = {
      variant: v, //success, error, warning, info, or default
      persist: false,
      preventDuplicate: true
    };
    enqueueSnackbar(msg, snack);
  }

  async function loginSubmit(event) {
    event.preventDefault();

    setLoading(prevLoading => !prevLoading);

    if (email === '') snack('Campo email é obrigatório');
    else if (password === '') snack('Campo Senha é obrigatório');
    else {
      await api
        .post('/user/login', {
          email,
          password
        })
        .then(response => {
          //console.log(response);
          //console.log(response.data);
          if (response.status === 200) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            localStorage.setItem('EMAIL', email);
            history.push('/dashboard');
          }
        })
        .catch(function(error) {
          //console.log('error.config');
          console.log(error.config.data);
          if (error.response) {
            if (error.response.status === 400) {
              snack(error.response.data.message);
            }
            //console.log(error.response.data);
            //console.log(error.response.headers);
          } else if (error.request) {
            console.log('error.request');
            console.log(error.request);
          } else {
            console.log('"Error", error.message:');
            console.log('Error', error.message);
          }
        });
    }
    setLoading(prevLoading => !prevLoading);
  }

  return (
    <Container component="main" maxWidth="xs" onSubmit={loginSubmit}>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="current-email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {loading ? <CircularProgress size="1.55rem" color="inherit" /> : <b>acessar</b>}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/newuser" variant="body2">
                {'É novo por aqui? Cadastre-se'}
              </Link>
            </Grid>
            <Grid item />
          </Grid>
        </form>
      </div>
    </Container>
  );
}

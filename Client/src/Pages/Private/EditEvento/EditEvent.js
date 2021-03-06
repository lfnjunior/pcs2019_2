import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import MenuIcon from "@material-ui/icons/Menu";
import Container from "@material-ui/core/Container";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import TextField from "@material-ui/core/TextField";
import DateFnsUtils from "@date-io/date-fns";
import ptLocale from "date-fns/locale/pt-BR";
import FormControl from "@material-ui/core/FormControl";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from "@material-ui/pickers";
import { useSnackbar } from "notistack";
import CircularProgress from "@material-ui/core/CircularProgress";
import moment from "moment";
import clsx from "clsx";
import useStyles from "./useStyles";
import { mainListItems } from "../../../Components/ListItems";
import { doLogout } from "../../../Services/utils";
import api from "../../../Services/api";

export default function EditEvent({ history, match }) {
  const [openListItens, setOpenListItens] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar(); //success, error, warning, info, or default
  const [loading, setLoading] = React.useState(false);
  const [eventTypes, setEventTypes] = useState([{ id: 0, name: "" }]);
  const [select, setSelect] = useState(false);

  const [idEvent] = useState(match.params.idEvent);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [status] = useState(true);

  const classes = useStyles();

  async function snack(msg, v = "error") {
    let snack = {
      variant: v, //success, error, warning, info, or default
      persist: false,
      preventDuplicate: true
    };
    if (msg) {
      enqueueSnackbar(msg, snack);
    }
  }

  const handleDrawerOpen = () => {
    setOpenListItens(true);
  };

  const handleDrawerClose = () => {
    setOpenListItens(false);
  };

  const handleExitApp = () => {
    doLogout();
    history.push("/");
  };

  const selectClose = () => {
    setSelect(false);
  };

  const selectOpen = () => {
    setSelect(true);
  };

  useEffect(() => {
    loadEvent();
  }, [idEvent]);

  async function loadEvent() {
    let token = localStorage.getItem("token");
    console.log(`Envio GET => /event/${idEvent}`);
    console.log({ headers: { token: token } });
    if (token) {
      await api
        .get(`/event/${idEvent}`, { headers: { token: token } })
        .then(response => {
          console.log(`Resposta GET => /event/${idEvent}:`);
          console.log(response.status);
          console.log(response.data);
          if (response.status === 200) {
            setStartDate(response.data.startDate);
            setEndDate(response.data.endDate);
            setStreet(response.data.street);
            setCity(response.data.city);
            setNeighborhood(response.data.neighborhood);
            setEventType(response.data.eventType.id);
            if (response.data.referencePoint) {
              setReferencePoint(response.data.referencePoint);
            }
            if (response.data.description) {
              setDescription(response.data.description);
            }
            setTitle(response.data.title);
          }
        })
        .catch(function(error) {
          console.log(`Resposta GET => /event/${idEvent}:`);
          console.log(error.response.status);
          console.log(error.response.data);
          if (error.response) {
            if (error.response.status === 400) {
              this.snack(error.response.data.message);
            }
          }
        });
    } else {
      this.snack(
        "Não foi encontrado token ou id do evento armazenados localmente"
      );
    }
  }

  useEffect(() => {
    async function loadEventTypes() {
      let token = localStorage.getItem("token");
      console.log(`Envio GET => /tipoEvento`);
      console.log({ headers: { token: token } });
      if (token) {
        await api
          .get(`/tipoEvento`, { headers: { token: token } })
          .then(response => {
            console.log(`Resposta GET => /tipoEvento:`);
            console.log(response.status);
            console.log(response.data);
            if (response.status === 200) {
              setEventTypes(response.data);
            }
          })
          .catch(function(error) {
            console.log(`Resposta GET => /tipoEvento:`);
            console.log(error.response.status);
            console.log(error.response.data);
            if (error.response) {
              if (error.response.status === 400) {
                this.snack(error.response.data.message);
              }
            }
          });
      } else {
        this.snack(
          "Não foi encontrado token ou id do evento armazenados localmente"
        );
      }
    }
    loadEventTypes();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(prevLoading => !prevLoading);
    if (title === "") snack("Campo Título de Evento é obrigatório");
    else if (startDate === "") snack("Campo Data de Início é obrigatório");
    else if (endDate === "") snack("Campo Data de Término é obrigatório");
    else if (street === "") snack("Campo Rua é obrigatório");
    else if (neighborhood === "") snack("Campo Bairro é obrigatório");
    else if (eventType <= 0) snack("Tipo de Evento é obrigatório");
    else if (city === "") snack("Campo Cidade é obrigatório");
    else {
      let body = {
        id: idEvent,
        title: title,
        startDate: moment(startDate).format("YYYY-MM-DDTHH:mm:ss.sssZ"),
        endDate: moment(endDate).format("YYYY-MM-DDTHH:mm:ss.sssZ"),
        street: street,
        neighborhood: neighborhood,
        city: city,
        eventTypeId: eventType,
        referencePoint: referencePoint ? referencePoint : null,
        description: description ? description : null,
        status: status
      };
      let config = { headers: { Token: localStorage.getItem("token") } };
      console.log(`Envio PUT => /event :`);
      console.log(body);
      console.log(config);
      await api
        .put("/event", body, config)
        .then(response => {
          console.log("Resposta PUT => /event :");
          console.log(response.status);
          console.log(response.data);
          if (response.status === 200) {
            history.push("/dashboard");
          }
        })
        .catch(function(error) {
          console.log("Resposta PUT => /event :");
          console.log(error.response.status);
          console.log(error.response.data);
          if (error.response.status === 400) {
            snack(error.response.data.message);
            setLoading(prevLoading => !prevLoading);
          }
        });
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, openListItens && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              openListItens && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Dados cadastrais
          </Typography>
          <IconButton color="inherit" onClick={handleExitApp}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !openListItens && classes.drawerPaperClose
          )
        }}
        open={openListItens}
      >
        <div className={classes.toolbarIcon}>
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
        <Container component="main" className={classes.containerForm}>
          <CssBaseline />
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="title"
                  name="title"
                  variant="outlined"
                  required
                  fullWidth
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  id="title"
                  label="Título do Evento"
                  autoFocus
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <div className={classes.date}>
                    <MuiPickersUtilsProvider
                      utils={DateFnsUtils}
                      locale={ptLocale}>
                      <KeyboardDateTimePicker
                        value={startDate}
                        onChange={setStartDate}
                        label="Data de início"
                        minDate={new Date("01/01/0100 01:00")}
                        format="dd/MM/yyyy hh:mm"
                        className={classes.larguraCampo}/>
                    </MuiPickersUtilsProvider>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className={classes.date}>
                    <MuiPickersUtilsProvider
                      utils={DateFnsUtils}
                      locale={ptLocale}>
                      <KeyboardDateTimePicker
                        value={endDate}
                        onChange={setEndDate}
                        label="Data de término"
                        minDate={new Date("01/01/0100 01:00")}
                        format="dd/MM/yyyy hh:mm"
                        className={classes.larguraCampo}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoComplete="street"
                  name="street"
                  variant="outlined"
                  required
                  fullWidth
                  value={street}
                  onChange={event => setStreet(event.target.value)}
                  id="street"
                  label="Rua"/>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoComplete="neighborhood"
                  name="neighborhood"
                  variant="outlined"
                  required
                  fullWidth
                  value={neighborhood}
                  onChange={event => setNeighborhood(event.target.value)}
                  id="neighborhood"
                  label="Bairro"/>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="city"
                  name="city"
                  variant="outlined"
                  required
                  fullWidth
                  value={city}
                  onChange={event => setCity(event.target.value)}
                  id="city"
                  label="Cidade"/>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="referencePoint"
                  name="referencePoint"
                  variant="outlined"
                  required
                  fullWidth
                  value={referencePoint}
                  onChange={event => setReferencePoint(event.target.value)}
                  id="referencePoint"
                  label="Ponto de Referência"/>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="description"
                  name="description"
                  variant="outlined"
                  required
                  fullWidth
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  id="description"
                  label="Descrição do Evento"/>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.date}>
                  <FormControl className={classes.larguraCampo}>
                    <InputLabel id="event-type-label">Eventos</InputLabel>
                    <Select
                      id="event-type"
                      open={select}
                      onClose={selectClose}
                      onOpen={selectOpen}
                      value={eventType}
                      onChange={event => setEventType(event.target.value)}
                      className={classes.larguraCampo}>
                      {eventTypes.map(et => (
                        <MenuItem key={et.id} value={et.id}>
                          {et.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>
            <Grid container justify="flex-end">
              <Grid container>
                <Grid item xs />
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    startIcon={<SaveIcon />}
                    type="submit">
                    {loading ? (
                      <CircularProgress size="1.55rem" color="inherit" />
                    ) : (
                      <>Gravar</>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Container>
      </main>
    </div>
  );
}

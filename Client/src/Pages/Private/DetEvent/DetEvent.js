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
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { useSnackbar } from "notistack";
import moment from "moment";
import clsx from "clsx";
import useStyles from "./useStyles";
import { mainListItems } from "../../../Components/ListItems";
import { doLogout } from "../../../Services/utils";
import api from "../../../Services/api";

export default function DetEvent({ history, match }) {
  const [openListItens, setOpenListItens] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar(); //success, error, warning, info, or default

  const [idUser] = useState(localStorage.getItem("userId"));
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(true);
  const [participant, setParticipant] = useState(0);
  const [participants, setParticipants] = useState([]);

  const classes = useStyles();

  async function snack(msg, v = "error") {
    let snack = {
      variant: v, //success, error, warning, info, or default
      persist: false,
      preventDuplicate: true,
      anchorOrigin: {
        vertical: "top",
        horizontal: "left"
      }
    };
    enqueueSnackbar(msg, snack);
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

  const handleEnviarMensagem = () => {
    console.log(participant);
    if (participant === 0) snack("Você não está participando desse evento");
    else if (message === "") snack("Escreva uma mensagem");
    else {
      let config = { headers: { token: localStorage.getItem("token") } };
      let body = {
        message: message,
        participantId: participant.id
      };
      console.log(`Envio POST => /mensagem :`);
      console.log(config);
      console.log(body);
      api
        .post(`/mensagem`, body, config)
        .then(response => {
          console.log(`Resposta POST => /mensagem :`);
          console.log(response.status);
          console.log(response.data);
          if (response.status === 200) {
            snack(`Mensagem, gravada com sucesso`, "success");
          }
        })
        .catch(function(error) {
          console.log(`Resposta POST => /mensagem :`);
          console.log(error.response.status);
          console.log(error.response.data);
          if (error.response.status === 400) {
            snack(error.response.data.message);
          }
        })
        .finally(function(error) {
          setMessage("");
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
      loadEvent();
    }, 3000);
    return () => clearInterval(interval);
  });  

  useEffect(() => {
    loadEvent();
    loadMessages();
  }, [match.params.idEvent]);

  async function loadEvent() {
    let idEvent = match.params.idEvent;
    let pts = [];
    let token = localStorage.getItem("token");
    console.log(`Envio GET => /event/${idEvent}`);
    //console.log({ headers: { token: token } });
    if (token) {
      await api
        .get(`/event/${idEvent}`, { headers: { token: token } })
        .then(response => {
         //  console.log(`Resposta GET => /event/${idEvent}:`);
         //  if (response.status) console.log(response.status);
         //  console.log(response.data);
          if (response.status === 200) {
            setTitle(response.data.title);
            setStartDate(
              moment(response.data.startDate).format("DD/MM/YYYY - HH:mm")
            );
            setEndDate(
              moment(response.data.endDate).format("DD/MM/YYYY - HH:mm")
            );
            setStreet(response.data.street);
            setCity(response.data.city);
            setNeighborhood(response.data.neighborhood);
            setEventType(response.data.eventType.name);
            setStatus(response.data.status);
            if (response.data.referencePoint) {
              setReferencePoint(response.data.referencePoint);
            }
            if (response.data.description) {
              setDescription(response.data.description);
            }
            if (participant === 0) pts = response.data.participant;
            setParticipants(response.data.participant);
          }
        })
        .catch(function(error) {
         //  console.log(`Resposta GET => /event/${idEvent}:`);
         //  console.log(error.response.statu);
         //  console.log(error.response.data);
          if (error.response) {
            if (error.response.status === 400) {
              if (error.response.data.message) {
                snack(error.response.data.message);
              }
            }
          }
        })
        .finally(function(error) {
         if (participant === 0) {
            pts.forEach(part => {
              console.log(part);
              loadParticipant(part, token);
            });
         }
        });
    } else {
      snack("Não foi encontrado token ou id do evento armazenados localmente");
    }
  }

  async function loadParticipant(part, token) {
    await api
      .get(`/participant/${part.id}`, { headers: { token: token } })
      .then(response => {
        console.log(`Resposta GET => /participant/${part.id}:`);
        if (response.status) console.log(response.status);
        console.log(response.data);
        if (response.status === 200) {
          if (Number(idUser) === Number(response.data.userId)) {
            setParticipant(response.data);
          }
        }
      })
      .catch(function(error) {
        console.log(`Resposta GET => /participant/${part.id}:`);
        console.log(error.response.status);
        console.log(error.response.data);
        if (error.response) {
          if (error.response.status === 400) {
            if (error.response.data.message) {
              snack(error.response.data.message);
            }
          }
        }
      });
  }

  async function loadMessages() {
    let token = localStorage.getItem("token");
    console.log(`Envio GET => /mensagem/evento/${match.params.idEvent}`);
    //console.log({ headers: { token: token } });
    if (token) {
      api
        .get(`/mensagem/evento/${match.params.idEvent}`, {
          headers: { token: token }
        })
        .then(response => {
         //  console.log(
         //    `Resposta GET => /mensagem/evento/${match.params.idEvent}:`
         //  );
         //  console.log(response.status);
         //  console.log(response.data);
          if (response.status === 200) {
            setMessages(response.data);
          }
        })
        .catch(function(error) {
         //  console.log(
         //    `Resposta GET => /mensagem/evento/${match.params.idEvent}:`
         //  );
         //  if (error.response.status) {
         //    console.log(error.response.status);
         //  }
         //  console.log(error.response.data);
          if (error.response) {
            if (error.response.status === 400) {
              if (error.response.data.message) {
                snack(error.response.data.message);
              }
            }
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
        <Grid container>
          <Grid item xs={6} className={classes.grade}>
            <Card className={classes.card}>
              <CardContent>
                <Typography>
                  <b>{title}</b>
                </Typography>
                <Typography
                  className={classes.title}
                  color="textPrimary"
                  gutterBottom
                >
                  Início: {startDate} <br /> Término {endDate}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Rua: {street} - Bairro: {neighborhood}
                  <br />
                  Cidade: {city}
                  <br />
                  {referencePoint}
                </Typography>
                <Typography variant="body2">
                  Tipo do evento: {eventType}
                  <br />
                  Descrição: {description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} className={classes.grade}>
            <Card className={classes.card}>
              <CardContent>
                <Typography
                  className={classes.title}
                  color="textPrimary"
                  gutterBottom
                >
                  <b>Participantes - data de participação</b>
                </Typography>
                {participants.length > 0 ? (
                  <>
                    {participants.map(pa => (
                      <div key={pa.id}>
                        {pa.username} -{" "}
                        {moment(pa.registrationDate).format(
                          "DD/MM/YYYY - HH:mm"
                        )}
                        <br />
                        {pa.id === participant.id ? (
                          <div>Minha mensagem</div>
                        ) : (
                          <></>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <> Nenhum participante no evento :/ </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Container className={classes.grade}>
          <Paper className={classes.grade}>
            <Typography variant="h5" component="h3">
              Mensagens do evento:
            </Typography>
          </Paper>
          {messages.length > 0 ? (
            <>
              {messages.map(m => (
                <div key={m.id}>
                  <Paper className={classes.grade}>
                    <Typography component="p">
                      {m.username} : {m.message}
                      {m.idUser === idUser && <>Sou eu, posso apagar</>}
                      <br />
                      {moment(m.messageDate).format("DD/MM/YYYY - HH:mm")}
                    </Typography>
                  </Paper>
                </div>
              ))}
            </>
          ) : (
            <>
              <Paper className={classes.grade}>
                <Typography component="p">Nenhuma Mensagem :/</Typography>
              </Paper>
            </>
          )}
        </Container>

        { status === false &&
          <Container className={classes.grade}>
            <Paper className={classes.grade}>
              <Typography style={{color: 'red'}} component="p">O evento foi cancelado :/</Typography>
            </Paper>
          </Container>
        }

        <Container className={classes.grade}>
          <Grid container>
            <Grid item xs={10}>
              <TextField
                style={{ width: "100%" }}
                id="outlined-basic"
                label="Escreva aqui sua mensagem"
                value={message}
                onChange={event => setMessage(event.target.value)}
                variant="outlined"
                multiline
                rowsMax="15"
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                style={{ width: "100%", height: "100%" }}
                variant="outlined"
                onClick={handleEnviarMensagem}
                className={classes.button}
              >
                Postar
              </Button>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

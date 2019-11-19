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
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import DialogActions from '@material-ui/core/DialogActions';

import clsx from 'clsx'
import useStyles from './useStyles'
import { mainListItems } from '../../../Components/ListItems'
import ModalEvent from '../../../Components/ModalEvent'
import { doLogout, TOKEN_KEY } from '../../../Services/utils'
import api from '../../../Services/api'


export default function Dashboard({ history }) {
   const classes = useStyles()
   const [openListItens, setOpenListItens] = React.useState(false)
   const [events, setEvents] = useState([]);  
   const [event, setEvent] = useState(null);  

   const [user, setUser] = useState(null);  

   const [openModal, setOpenModal] = React.useState(false);
   const [scroll, setScroll] = React.useState('body');
 
   const handleOpenModal = (scrollType, evt) => () => {
      setEvent(evt)
      setOpenModal(true);
      setScroll(scrollType);
   };
 
   const handleCloseModal = () => {
      setOpenModal(false);
   };

   const handleDrawerOpen = () => {
      setOpenListItens(true)
   }

   const handleDrawerClose = () => {
      setOpenListItens(false)
   }

   const handleExitApp = () => {
      doLogout()
      history.push('/') 
   }

   useEffect(() => {
      async function loadEvents() {
         const response = await api.get('/event')
         setEvents(response.data);
      }
      loadEvents()
   }, [])

   useEffect(() => {
      async function loadUser() {
         let config = {headers: {'Authorization': "bearer " + localStorage.getItem(TOKEN_KEY)}};
         const response = await api.post('/me',{},config)
         setUser(response.data);
      }
      loadUser()
   }, [])

   const descriptionElementRef = React.useRef(null);
   useEffect(() => {
     const { current: descriptionElement } = descriptionElementRef;
     if (descriptionElement !== null) {
       descriptionElement.focus();
     }
   }, [openModal]);

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
                  className={clsx(classes.menuButton, openListItens && classes.menuButtonHidden)}
               >
                  <MenuIcon />
               </IconButton>
               <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                  Dashboard
               </Typography>
               <IconButton color="inherit" onClick={handleExitApp}>
                  <ExitToAppIcon />
               </IconButton>
            </Toolbar>
         </AppBar>
         <Drawer
            variant="permanent"
            classes={{paper: clsx(classes.drawerPaper, !openListItens && classes.drawerPaperClose)}}open={openListItens}>
            <div className={classes.toolbarIcon}> 
               {user &&
                  <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                     {user.username}
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
            <React.Fragment>
               <CssBaseline />
               <main>
                  <div className={classes.heroContent}>
                     <Typography className={classes.heroTitle} component="h4" variant="h5" align="left" color="textPrimary" gutterBottom>
                        Eventos
                     </Typography>
                  </div>
                  <Container className={classes.cardGrid} maxWidth="md">
                     {events.length > 0 ? (
                        <Grid container spacing={2}>
                           {events.map(ev => (
                              <Grid item key={ev.id} xs={12} sm={6} md={4}>
                                 <Card className={classes.card}>
                                    <CardMedia
                                       className={classes.cardMedia}
                                       image={(() => {
                                          switch(ev.eventType.name.toLowerCase()) {
                                            case 'corrida':
                                              return 'https://image.freepik.com/vetores-gratis/desportivos-pessoas-correndo-maratona-na-ilustracao-do-parque_1262-18978.jpg';
                                            case 'warning':
                                              return '';
                                            case 'error':
                                              return '';
                                            default:
                                              return '';
                                          }
                                        })()}
                                       title="Image title"
                                    />
                                    <CardContent className={classes.cardContent}>
                                       <Typography gutterBottom variant="h5" component="h2">
                                          {ev.title}
                                       </Typography>
                                       <Typography>
                                          {ev.description}
                                       </Typography>
                                    </CardContent>
                                    <CardActions>
                                       <Button size="small" 
                                               color="primary" 
                                               onClick={handleOpenModal('paper',ev)}>
                                          Detalhes
                                       </Button>
                                    </CardActions>
                                 </Card>
                              </Grid>
                           ))}
                        </Grid>
                     ) : (<Grid container spacing={4}></Grid>)}
                  </Container>
                  <Dialog
                  open={openModal}
                  onClose={handleCloseModal}
                  scroll={scroll}
                  aria-labelledby="scroll-dialog-title"
                  aria-describedby="scroll-dialog-description"
                  >
                     <ModalEvent event={event} 
                                 scroll={scroll} 
                                 descriptionElementRef={descriptionElementRef}/>
                     <DialogActions>
                        <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                        <Button onClick={handleCloseModal} color="primary">Subscribe</Button>
                     </DialogActions>
                  </Dialog>
               </main>
            </React.Fragment>
         </main>
      </div>
   )
}

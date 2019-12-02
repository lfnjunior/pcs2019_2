import React, { useState, useEffect } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack'

import clsx from 'clsx'
import useStyles from './useStyles'
import { mainListItems } from '../../../Components/ListItems'
import { doLogout } from '../../../Services/utils'
import moment from 'moment'
import api from '../../../Services/api'


export default function Dashboard({ history }) {
   const classes = useStyles()
   const [openListItens, setOpenListItens] = React.useState(false)
   const [events, setEvents] = useState([]);  
   const { enqueueSnackbar } = useSnackbar() //success, error, warning, info, or default

   async function snack(msg, v = 'error') {
      let snack = {
         variant: v, //success, error, warning, info, or default
         persist: false,
         preventDuplicate: true
      }
      if (msg) {
          enqueueSnackbar(msg, snack)
      }
   }

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
      loadEvents()
   }, []) 

   async function loadEvents() {
      let token = localStorage.getItem('token')
      const response = await api.get('/event', { headers: { token: token } })
      let evts = response.data
      for (let i = 0; i < evts.length; i++) {
         if (evts[i].status === true) {
            evts[i].situacao = 'Ativo'
         } else if (evts[i].status === false) {
            evts[i].situacao = 'Cancelado'
         }
         evts[i].startDate = moment(evts[i].startDate).format('DD/MM/YYYY - HH:mm')
         evts[i].endDate = moment(evts[i].endDate).format('DD/MM/YYYY - HH:mm')
      }
      setEvents(evts);
      //console.log(evts)
   }

  useEffect(() => {
      const interval = setInterval(() => {
         console.log(`Consulta GET => /event `)
         let token = localStorage.getItem('token')
         api.get('/event', { headers: { token: token } }).then(response => {
            // console.log(`Resposta GET => /event :`)
            // console.log(response.status)
            // console.log(response.data)
            if (response.status === 200) {
               let evts = response.data
               for (let i = 0; i < evts.length; i++) {
                  if (evts[i].status === true) {
                     evts[i].situacao = 'Ativo'
                  } else if (evts[i].status === false) {
                     evts[i].situacao = 'Cancelado'
                  }
                  evts[i].startDate = moment(evts[i].startDate).format('DD/MM/YYYY - HH:mm')
                  evts[i].endDate = moment(evts[i].endDate).format('DD/MM/YYYY - HH:mm')
               }
               setEvents(evts)
               //console.log(evts)
            }
         })
         .catch(function (error) {
            // console.log(`Resposta GET => /event:`)
            // console.log(error.response.status)
            // console.log(error.response.data)
            if (error.response) {
               if (error.response.status === 400) {
                  this.snack(error.response.data.message)
               }
            }
         })
      }, 5000);
      return () => clearInterval(interval);
   });

   const descriptionElementRef = React.useRef(null);
   useEffect(() => {
     const { current: descriptionElement } = descriptionElementRef;
     if (descriptionElement !== null) {
       descriptionElement.focus();
     }
   }, []);


   const [tabela] = useState({
      columns: [
        { title: 'Nome', field: 'title' },
        { title: 'Data de Início', field: 'startDate' },
        { title: 'Data de Términno', field: 'endDate' },
        { title: 'Cidade', field: 'city' },
        { title: 'Status', field: 'situacao' },
        { title: 'Criador', field: 'user.username' }
      ]
    });

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
               {localStorage.getItem('user') &&
                  <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                     {localStorage.getItem('user').username}
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
                  <MaterialTable
                     title="Eventos"
                     columns={tabela.columns}
                     data={events}
                     actions={[
                        {
                           icon: 'add',
                           tooltip: 'Adicionar',
                           isFreeAction: true,
                           iconProps: {color: 'primary'},
                           onClick: (event, rowData) => {
                              history.push(`/evento`)
                                 
                           }
                        },
                        (rowData) => {
                           return (rowData.status === true)
                           ? 
                           {
                              icon: 'edit',
                              tooltip: 'Editar',
                              iconProps: {color: 'primary'},
                              onClick: (event, rowData) => {
                                 if (rowData.status) {
                                    history.push(`/evento/${rowData.id}`)
                                 } else {
                                    snack('O evento está cancelado, não é possível editar!')
                                 }
                              }
                           }
                           :
                           {
                              icon: 'edit',
                              tooltip: 'Editar',
                              iconProps: {color: 'disabled'},
                              disabled: true
                           }
                        },
                        (rowData) => {
                           return (rowData.status === true)
                           ? 
                           {
                              icon: 'cancel',
                              iconProps: {color: 'error'},
                              tooltip: 'Cancelar',
                              onClick: (event, rowData) => {
                                 if (rowData.status) {
                                    let config = { headers: { token: localStorage.getItem('token') } }
                                    console.log(`Envio DELETE => /event/${rowData.id} :`)
                                    console.log( config )
                                    api.delete(`/event/${rowData.id}`, config)
                                       .then(response => {
                                          console.log(`Resposta DELETE => /event/${rowData.id} :`)
                                          console.log(response.status)
                                          console.log(response.data)
                                          if (response.status === 200) {
                                             window.location.reload();
                                          } 
                                       })
                                       .catch(function (error) {
                                          console.log(`Resposta DELETE => /event/${rowData.id} :`)
                                          console.log(error.response.status)
                                          console.log(error.response.data)
                                          if (error.response.status === 400) {
                                             snack(error.response.data.message)
                                          }
                                       })
                                 } else {
                                    snack('O evento está cancelado, não é possível cancelar novamente!')
                                 }
                              }
                           }
                           :{
                              icon: 'cancel',
                              iconProps: {color: 'disabled'},
                              disabled: true,
                              tooltip: 'Cancelar',
                           }
                        },    
                        (rowData) => {
                           return (rowData.status === true)
                             ? 
                             {
                              icon: 'check',
                              iconProps: {color: 'primary'},
                              disabled: false,
                              tooltip: 'Participar',
                              onClick: (event, rowData) => {
                                 if (rowData.status) {
                                 let config = { headers: { token: localStorage.getItem('token') } }
                                 let body = { 
                                    userId: localStorage.getItem('userId'),
                                    eventoId: rowData.id
                                 }
                                 console.log(`Envio POST => /participant :`)
                                 console.log( config )
                                 console.log( body )
                                 api.post(`/participant` , body , config)
                                    .then(response => {
                                       console.log(`Resposta POST => /participant :`)
                                       console.log(response.status)
                                       console.log(response.data)
                                       if (response.status === 200) {
                                          snack(`Você agora está participando do evento ${rowData.title}`,"success")
                                       } 
                                    })
                                    .catch(function (error) {
                                       console.log(`Resposta POST => /participant :`)
                                       console.log(error.response.status)
                                       console.log(error.response.data)
                                       if (error.response.status === 400) {
                                          snack(error.response.data.message)
                                       }
                                    })
                                 } else {
                                    snack('O evento está cancelado, não é possível participar do evento!')
                                 }
                              }
                             }
                             : 
                             {
                              icon: 'check',
                              iconProps: {color: 'disabled'},
                              disabled: true,
                              tooltip: 'Participar',
                             }
                        },
                         
                        (rowData) => {
                           return (rowData.status === true)
                             ? 
                             {
                              icon: 'search',
                              iconProps: {color: 'primary'},
                              disabled: false,
                              tooltip: 'Detalhes',
                              onClick: (event, rowData) => {
                                 if (rowData.status) {
                                    history.push(`/detalhamento/evento/${rowData.id}`)
                                 } else {
                                    snack('O evento está cancelado, não é possível detalhar!')
                                 }
                              }
                             }
                             : 
                             {
                              icon: 'search',
                              iconProps: {color: 'disabled'},
                              disabled: true,
                              tooltip: 'Detalhes',
                             }
                        }
                     ]} 
                           
                     localization={{
                        body: {
                        emptyDataSourceMessage: 'Nenhum evento cadastrado no sistema'
                        },
                        toolbar: {
                           searchPlaceholder: 'Pesquisar',
                           searchTooltip: 'Pesquisar',
                           exportName: 'exportar para CSV',
                           exportAriaLabel: 'Exportar',
                           exportTitle: 'Exportar'
                        },        
                        header: {
                           actions: 'Ações',
                        },
                        pagination: {
                           labelRowsSelect: 'Linhas',
                           labelDisplayedRows: '{count} eventos / {from}-{to} ',
                           firstTooltip: 'Primeiro',
                           previousTooltip: 'Anterior',
                           nextTooltip: 'Próximo',
                           lastTooltip: 'Último'
                        }
                     }}    
                     options={{
                        filtering: true,
                        exportButton: true
                     }}
                  />
               </main>
            </React.Fragment>
         </main>
      </div>
   )

   
}


















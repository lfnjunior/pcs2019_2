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

import clsx from 'clsx'
import useStyles from './useStyles'
import { mainListItems } from '../../../Components/ListItems'
import { doLogout } from '../../../Services/utils'
import api from '../../../Services/api'


export default function Dashboard({ history }) {
   const classes = useStyles()
   const [openListItens, setOpenListItens] = React.useState(false)
   const [events, setEvents] = useState([]);  


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
         let token = localStorage.getItem('token')
         const response = await api.get('/event', { headers: { token: token } })
         setEvents(response.data);
      }
      loadEvents()
   }, []) 

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
        { title: 'Cidade', field: 'city' }
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
                           onClick: (event, rowData) => {
                                 history.push('/evento') 
                           }
                        },
                        {
                           icon: 'edit',
                           tooltip: 'Editar',
                           onClick: (event, rowData) => {
                              history.push('/') 
                           }
                        },
                        {
                           icon: 'delete',
                           color: 'danger',
                           tooltip: 'Remover',
                           onClick: (event, rowData) => {
                              history.push('/') 
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


















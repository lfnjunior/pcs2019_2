import { makeStyles } from '@material-ui/core/styles'

const drawerWidth = 200
const useStyles = makeStyles(theme => ({
   root: {
      display: 'flex',
      flexGrow: 1
   },
   toolbar: {
      paddingRight: 24
   },
   toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar
   },
   appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.leavingScreen
      })
   },
   appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.enteringScreen
      })
   },
   menuButton: {
      marginRight: 25
   },
   menuButtonHidden: {
      display: 'none'
   },
   title: {
      flexGrow: 1
   },
   drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.enteringScreen
      })
   },
   drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
         width: theme.spacing(7)
      }
   },
   appBarSpacer: theme.mixins.toolbar,
   content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto'
   },
   container: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
   },
   paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column'
   },
   fixedHeight: {
      height: 200
   },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    titleCard: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    paperGrid: {
      padding: theme.spacing(1),
      margin: theme.spacing(3),
      textAlign: 'left',
      color: theme.palette.text.primary,
    },  icon: {
      marginRight: theme.spacing(2),
    },
    heroContent: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(1,1,1)
    },
    heroTitle: {
      margin: theme.spacing(0)
    },
    heroButtons: {
      marginTop: theme.spacing(1)
    },
    cardGrid: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    card: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    cardMedia: {
      paddingTop: '56.25%', 
    },
    cardContent: {
      flexGrow: 1,
    }
}))
export default useStyles

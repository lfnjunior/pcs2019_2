import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import AccountBoxIcon from '@material-ui/icons/AccountBox';
//import DashboardIcon from "@material-ui/icons/Dashboard";

import { Link } from "react-router-dom";

const linksButtons = [
  //{ text: "DashBoard", pathLink: "/", component: <DashboardIcon /> },
  { text: "Usuário", pathLink: "/user", component: <AccountBoxIcon /> }
];

export const mainListItems = (
  <List>
    {linksButtons.map(btns => (
      <ListItem
        button
        key={btns.text}
        component={Link}
        to={btns.pathLink}
      >
        <ListItemIcon>
          {btns.component}
        </ListItemIcon>
        <ListItemText primary={btns.text} />
      </ListItem>
    ))}
  </List>
);


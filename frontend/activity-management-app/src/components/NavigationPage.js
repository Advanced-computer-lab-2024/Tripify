import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const NavigationPage = () => {
  const links = [
    { name: "Activity Category Management", path: "/activity-categories" },
    { name: "Preference Tag Management", path: "/preference-tags" },
    { name: "Tag Management", path: "/tags" },
  ];

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Management Dashboard
      </Typography>
      <List>
        {links.map((link, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton component={Link} to={link.path}>
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default NavigationPage;

import React from "react";
import { Container, Grid } from "@mui/material";
import ActivityCategoryManagement from "./components/ActivityCategoryManagement";
import PreferenceTagManagement from "./components/PreferenceTagManagement";
import TagManagement from "./components/TagManagement";

function App() {
  return (
    <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ActivityCategoryManagement />
        </Grid>
        <Grid item xs={12} md={6}>
          <PreferenceTagManagement />
        </Grid>
        <Grid item xs={12}>
          <TagManagement />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;

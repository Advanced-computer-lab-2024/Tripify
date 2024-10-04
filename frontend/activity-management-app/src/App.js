import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "@mui/material";
import NavigationPage from "./components/NavigationPage";
import ActivityCategoryManagement from "./components/ActivityCategoryManagement";
import PreferenceTagManagement from "./components/PreferenceTagManagement";
import TagManagement from "./components/TagManagement";

function App() {
  return (
    <Router>
      <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
        <Routes>
          <Route path="/" element={<NavigationPage />} />
          <Route
            path="/activity-categories"
            element={<ActivityCategoryManagement />}
          />
          <Route
            path="/preference-tags"
            element={<PreferenceTagManagement />}
          />
          <Route path="/tags" element={<TagManagement />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

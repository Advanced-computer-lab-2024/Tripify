import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TouristRegister from "./pages/tourist/TouristRegister";

function App() {
  return (
    <Router>
      <div className="App">
       
        <Routes>
          <Route path="/" element={<TouristRegister />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
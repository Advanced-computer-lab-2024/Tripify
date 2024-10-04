import React from "react";
import ActivityList from "./components/ActivityList";
import ActivityForm from "./components/ActivityForm";
import ActivityUpdateForm from "./components/ActivityUpdateForm";

function App() {
  return (
    <div className="App">
      <h1>Activity Manager</h1>
      <ActivityForm />
      <ActivityList />
    </div>
  );
}

export default App;

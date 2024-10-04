import React from "react";
import ActivityList from "./components/ActivityList";
import ActivityForm from "./components/ActivityForm";
import ActivityUpdateForm from "./components/ActivityUpdateForm";
import ActivityCategoryManagement from "./components/ActivityCategoryManagement";
import PreferenceTagManagement from "./components/PreferenceTagManagement";
import TagManagement from "./components/TagManagement";
function App() {
  return (
    <div className="App">
      <h1>Activity Manager</h1>
      <ActivityForm />
      <ActivityList />
      {/* <ActivityList />
      <ActivityCategoryManagement />
      <PreferenceTagManagement />
      <TagManagement /> */}
    </div>
  );
}

export default App;

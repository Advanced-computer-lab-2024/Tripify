// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateUser from './components/CreateUser';
import UserList from './components/UserList';
import UpdateUser from './components/UpdateUser';
import UserAccount from './components/UserAccount'; // Import the new component

const App = () => {
  return (
    <Router>
      <div>
        <h1>User Management</h1>
        <nav>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ margin: '10px 0' }}>
              <Link to="/">User List</Link>
            </li>
            <li style={{ margin: '10px 0' }}>
              <Link to="/create">Create User</Link>
            </li>
            <li style={{ margin: '10px 0' }}>
              <Link to="/account">User Account</Link> {/* Link to User Account */}
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/create" element={<CreateUser />} />
          <Route path="/update/:id" element={<UpdateUser />} />
          <Route path="/account" element={<UserAccount />} /> {/* Add route for User Account */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

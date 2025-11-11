import React from "react";
import Home from "./components/Home"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Welcome from "./components/Welcome";
import Admin from "./components/Admin";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="/welcome" element={
            <PrivateRoute>
              <Welcome />
            </PrivateRoute>
          }/>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

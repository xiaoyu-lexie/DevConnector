import React, {Fragment} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

const App = () => {
  return (
    <Fragment>
      <Router>
      <Navbar />
        <Routes>
          <Route exact path='/' element={<Landing />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/login' element={<Login />} />

        </Routes>
      </Router>
    </Fragment>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import Admin from './Admin';
import User from './User';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './fonts/Poppins/Poppins-SemiBold.ttf';
import './styles/index.css';

window.SERVER_PORT = '3500';
window.AUTH_SERVER_PORT = '4000';
window.SERVER_HOST = '192.168.1.5';

ReactDOM.render(
  <React.StrictMode>
    <Router basename="/">
      <Switch>
        <Route path="/admin">
          <Admin/>
        </Route>

        <Route path="/">
          <User/>
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

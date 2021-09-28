import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Admin from './Admin';
import User from './User';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

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


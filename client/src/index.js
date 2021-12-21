import React from 'react';
import ReactDOM from 'react-dom';
import Admin from './Admin';
import User from './User';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import './fonts/Poppins/Poppins-SemiBold.ttf';
import './styles/index.css';

window.SERVER_PORT = '3500';
window.AUTH_SERVER_PORT = '4000';
window.SERVER_HOST = '192.168.1.3';

const Main = () => {
  return(  
    <SnackbarProvider 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      dense
      maxSnack={2} 
      preventDuplicate
    >
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
    </SnackbarProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

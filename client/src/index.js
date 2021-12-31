import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import Admin from './Admin';
import User from './User';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import './fonts/Poppins/Poppins-SemiBold.ttf';
import './styles/index.css';

window.SERVER_PORT = '3500';
window.AUTH_SERVER_PORT = '4000';
window.SERVER_HOST = 'localhost';

const Main = () => {
  const handleNumberInputFields = e => {
    if( e?.target?.attributes?.["1"]?.nodeValue === "number" ){
      if( (e?.which < 48 || e?.which > 57) && 
        (e?.which !== 9 && e?.which !== 8 &&
         e?.which !== 189 && e?.which !== 190 &&
         e?.which !== 37 && e?.which !== 39)
        ){
        return e.preventDefault();
      }
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleNumberInputFields);

    return () => window.removeEventListener('keydown', handleNumberInputFields); 
  }, []);

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

serviceWorkerRegistration.unregister();

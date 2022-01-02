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

const Main = () => {
  const handleNumberInputFields = e => {
    if( e?.target?.attributes?.["1"]?.nodeValue === "number" ){
      if( (e?.which < 48 || e?.which > 57) && // numbers from 0 to 9
        (e?.which !== 9 && e?.which !== 8 && // exclude backspace and tab
         e?.which !== 189 && e?.which !== 190 && // exclude negative sign and point
         e?.which !== 37 && e?.which !== 39) // exclude left and right arrow
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

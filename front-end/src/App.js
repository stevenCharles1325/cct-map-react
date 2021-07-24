import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './styles/App.css';

// Main routes:
import AdminBrowser from './admin-gate';
import UserBrowser from './user';

// Admin sub routes:
import Dashboard from './sections/dashboard';

class App extends React.Component {

  render() {
    return(
      <div className="App">
        <Switch>
          <Route path='/admin' exact>
            <AdminBrowser />            
          </Route>
          <Route path='/admin/dashboard' exact>
            <Dashboard />            
          </Route>
          <Route path='/' exact>
            <UserBrowser />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;

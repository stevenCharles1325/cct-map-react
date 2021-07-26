import React from 'react';
import axios from 'axios';
import { Redirect, Route, Switch } from 'react-router-dom';
import './styles/admin.css';

// Admin sub routes:
import Loading from './components/load-bar/loading';
import Dashboard from './sections/dashboard';
import Settings from './sections/settings';
import Map from './sections/map';
import Signin from './sections/sign-in';
import Signup from './sections/sign-up';

class App extends React.Component {
  constructor( props ){
    super( props );

    this.state = {
      admin: null
    };
  
    this.setToLoggedIn = this.setToLoggedIn.bind( this );
  }

  setToLoggedIn( data ){
    this.setState({
      admin:{
        status: {
          exist: data.status.exist || this.state.admin.status.exist ,
          loggedIn: data.status.loggedIn
        },
        username: data.username || this.state.admin.username,
        password: data.password || this.state.admin.password,
        email: data.email || this.state.admin.email,
        number: data.number || this.state.admin.number
      }
    });

    axios.put('http://localhost:7000/admin/log-status', { status: data.status.loggedIn })
    .then( res => {
      console.log( res.data.message );
    })
    .catch( err => {
      console.log( err );
    });
  }

  componentDidMount(){
    console.log('[Started the App]');
    axios.get('http://localhost:7000/admin')
    .then( res => {
      this.setState({
        admin: res.data
      })
    })
    .catch( err => {
      console.log(err)
    })
  }

  render() {
    let view;

    if( this.state.admin ){
      if( !this.state.admin.status.exist ){
        // Redirect to Sign up
        view = <Redirect to="/sign-up" />;
      }
      else if( this.state.admin.status.exist && !this.state.admin.status.loggedIn ){
        // Redirect to Sign in
        view = <Redirect to="/sign-in" />;
      }
      else{
        // Redirect to dashboard
        view = <Redirect to="/dashboard" />;
      }

      return (
        <div className="admin">
          <Switch>
            <Route path="/sign-up" exact>
              <Signup statusKey={this.setToLoggedIn}/>
            </Route>

            <Route path="/sign-in" exact>
              <Signin admin={this.state.admin} statusKey={this.setToLoggedIn}/>
            </Route>

            <Route path="/dashboard" exact>
              <Dashboard admin={this.state.admin} statusKey={this.setToLoggedIn}/>
            </Route>

            <Route path="/settings" exact>
              <Settings admin={this.state.admin} statusKey={this.setToLoggedIn}/>
            </Route>

            <Route path="/map" exact>
              <Map admin={this.state.admin} statusKey={this.setToLoggedIn}/>
            </Route>
          </Switch>

          {view}
        </div>
      );
    }
    else{
      // loading
      return (
        <div className="admin">
          <Loading />
        </div>
      );
    }
  }
}

export default App;

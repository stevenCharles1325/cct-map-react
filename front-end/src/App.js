import React from 'react';
import axios from 'axios';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import './styles/admin.css';

// Admin sub routes:
import Loading from './components/load-bar/loading';
import Dashboard from './sections/dashboard';
import Settings from './sections/settings';
import Map from './sections/map';
import Signin from './sections/sign-in';
import Signup from './sections/sign-up';


import NavPanel from './components/navigator/nav-panel';

import dashboardImg from './images/dashboard.png';
import mapImg from './images/map.png';
import equalizerImg from './images/equalizer.png';

class App extends React.Component {
  constructor( props ){
    super( props );

    this.state = {
      admin: null
    };
  
    this.setToLoggedIn = this.setToLoggedIn.bind( this );
    this.fetchData = this.fetchData.bind( this );
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
      },
      path: window.location.pathname
    });

    axios.put('http://localhost:7000/admin/log-status', { status: data.status.loggedIn })
    .then( res => {
      console.log( res.data.message );
    })
    .catch( err => {
      console.log( err );
    });
  }

  createNavPanel(){
    return (
      <NavPanel
        key="navPanel"
        dirs={
            [
                {url: '/dashboard', icon: dashboardImg, title:'Dashboard'},
                {url: '/map', icon: mapImg, title:'Map'},
                {url: '/settings', icon: equalizerImg, title:'Settings'}
            ]
        }
        admin={this.state.admin}
        statusKey={this.setToLoggedIn}
      />
    );

  }

  fetchData() {
    axios.get('http://localhost:7000/admin')
    .then( res => {
      this.setState({
        admin: res.data,
        path: window.location.pathname
      });
      this.forceUpdate();
    })
    .catch( err => {
      console.log(err)
    });

  }

  pathExists( path ){
    return ['/dashboard', '/settings', '/map'].indexOf( path.replace('/admin', '') ) >= 0 ? true : false;
  }

  pathTruncateRoot( path ){
    return path.replace('/admin', '');
  }

  componentDidMount(){
    console.log('[Started the App]');
    this.fetchData();
    this.setState({
      admin: this.state.admin,
      path: window.location.pathname
    });
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
      else if( this.pathExists( this.state.path ) ){
        // Redirect to dashboard
        console.log('here')
        view = <Redirect to={window.location.pathname.replace('/admin','')}/>;
      }
      else if( window.location.pathname === '/admin' ||
       this.pathTruncateRoot( window.location.pathname) === '/sign-up' ||
        this.pathTruncateRoot( window.location.pathname) === '/sign-in' ||
         (this.state.admin.status.exist && this.state.admin.status.loggedIn && this.pathExists( this.state.path ))){

        this.setState({
          admin: this.state.admin,
          path: '/admin/dashboard'
        })
        view = <Redirect to='/dashboard'/>;
      }
      else{
        view = (
          <div style={{width: '100vw', height: '100vh'}} className="err-page bg-secondary d-flex flex-column justify-content-center align-items-center">
            <div style={{width: '200px', height: '150px', border: '5px solid black', padding: '5px'}}>
              <h1>404</h1>
            </div>
            <br/>
            <h3>Oops! We're really sorry, but seems like the page you're looking for doesn't exist.</h3>
            <br/>
            <br/>
            <p>Go back <Link to="/dashboard" onClick={ () => {
              setTimeout(() => {
                this.setState({
                  admin: this.state.admin,
                  path: window.location.pathname
                })
              }, 1000)
            }}
            >Home?</Link></p>
          </div>
        );
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
              <Dashboard admin={this.state.admin} statusKey={this.setToLoggedIn} />
            </Route>

            <Route path="/settings" exact>
              <Settings admin={this.state.admin} statusKey={this.setToLoggedIn} fetchData={this.fetchData} />
            </Route>

            <Route path="/map" exact>
              <Map admin={this.state.admin} statusKey={this.setToLoggedIn} />
            </Route>
          </Switch>

          { 
            this.state.admin.status.loggedIn &&
            this.pathTruncateRoot( this.state.path) !== '/map' &&
            (this.pathExists( this.state.path ) ||
            this.pathTruncateRoot( window.location.pathname) === '/sign-up' ||
            this.pathTruncateRoot( window.location.pathname) === '/sign-in') ?
            this.createNavPanel() : null 
          }
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

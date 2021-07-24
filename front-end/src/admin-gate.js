import axios from 'axios';
import React from 'react';
import { Redirect } from 'react-router-dom';
import './styles/admin.css';

import Signup from './sections/sign-up';
import Signin from './sections/sign-in';

import Loading from './components/load-bar/loading';


export default class AdminBrowser extends React.Component {

  constructor( props ){
    super( props );
  
    this.state = {
      admin: null 
    };
  
    this.admin_data_url = 'http://localhost:7000/admin';
  
  }

  _changeState( res ) {
    this.setState({ 
      admin : res.data.status
    })
  }

  componentDidMount() {
    const changeState = this._changeState.bind( this );

    axios.get(this.admin_data_url).then( changeState );
  }

  render() {
    if( this.state.admin ){
      if( this.state.admin.loggedIn ){
        console.log('here')
        return <Redirect to="/admin/dashboard"/>
      } 
      else if( !this.state.admin.loggedIn ){
        console.log('here2')

        return (
            <div className="Admin">
              {
                this.state.admin.exist ?
                <Signin gateway={this.setToLoggedIn} /> : !this.state.admin.exist ? 
                <Signup gateway={this.setToLoggedIn} /> : <Loading/>         
              }
            </div>
        );
      }
    }
    else{
      return (
        <div className="Admin"> 
          <Loading />
        </div>
      );
    }
  }
}


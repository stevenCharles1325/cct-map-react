import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import Loading from '../components/load-bar/loading';
import NavPanel from '../components/navigator/nav-panel'

import '../styles/dashboard.css';

export default class Dashboard extends React.Component{

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
              return (
                  <div className="dashboard">
                      <NavPanel dirs={
                          [
                              {url: '/admin/dashboard', icon: null, title:'Dashboard'},
                              {url: '/admin/map', icon: null, title:'Map'},
                              {url: '/admin/settings', icon: null, title:'Settings'}

                          ]
                      }/>
                  </div>
              );
            } 
            else if( !this.state.admin.loggedIn ){
              return (
                  <div className="dashboard">
                    <Redirect to="/admin" />         
                  </div>
              );
            }
          }
          else{
            return (
              <div className="dashboard"> 
                <Loading />
              </div>
            );
        }
    }
}
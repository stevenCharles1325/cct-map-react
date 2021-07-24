import React from 'react';
import axios from 'axios';

import '../styles/settings.css';

import NavPanel from '../components/navigator/nav-panel';

export default class Settings extends React.Component{

    render(){
        return(
            <div className="settings">
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
}
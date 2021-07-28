import React from 'react';

import MapMenu from '../components/menu/map-menu';
import '../styles/map.css';


export default class Settings extends React.Component{

    render(){
        return(
            <div className="map">
                <MapMenu />
            </div>
        );
    }
}
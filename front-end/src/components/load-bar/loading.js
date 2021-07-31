import React from 'react';
import loadingGIF from '../../images/ajax-loader.gif';
import loadingLogo from '../../images/cctLogo_new.png';
import '../../styles/loading.css';

export default class Loading extends React.Component{
    render() {
        return(
            <div className="load-frame">
                <div className="load-box d-flex flex-column justify-content-center align-items-center">
                    <img className="load-logo" src={loadingLogo} />                    
                    <img className="load-gif" src={loadingGIF} />
                </div>
            </div>
        );
    }

}
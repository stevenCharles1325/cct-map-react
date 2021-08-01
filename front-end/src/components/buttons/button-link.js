import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/button-link.css';


export default function ButtonLink( props ) {
    const [active, setActive] = useState( window.location.pathname === ('/admin' + props.url) );

    const activityClassName = ( isActive ) => {
        return `btn-link my-2 d-flex justify-content-center align-items-center ${ isActive ? 'btn-link-active' : ''}`;
    }

    const requestSetActive = () => {
        setTimeout( async () => {
            setActive(window.location.pathname === ('/admin' + props.url));        
        }, 100);
    }

    useEffect( () => {
        document.querySelector('.nav-panel').addEventListener('click', requestSetActive);

        return () => { 
            document.querySelector('.nav-panel').removeEventListener('click', requestSetActive);
        }
    });

    return(
        <Link id={props.id} to={props.url}  className={ activityClassName( active ) }>                  
            <div className="btn-link-icon-box d-flex align-items-center">
                {/* insert link icon here */}
                <img style={{filter: !active ? 'invert(1)' : 'none'}} width="100%" height="100%" src={props.icon}/>
            </div>
            <div className="btn-link-title-box">
                <h5 className="btn-link-title m-0">
                    { props.title }
                </h5>
            </div>
        </Link>
    );

}

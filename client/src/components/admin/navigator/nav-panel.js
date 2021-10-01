import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ImageBall from '../image/image-ball';
import ButtonLink from '../buttons/button-link';

import '../../../styles/admin/nav-panel.css';
import menuImg from '../../../images/admin/menu.png';

import CustomErrorHandler from '../../../modules/customErrorHandler';


const ErrorHandler = new CustomErrorHandler( 5, 5000 );

export default function NavPanel( props ){
    const [admin, setAdmin] = useState( null );
    const [navSwitch, setNavSwitch] = useState( false );


    const requestSignOut = async ( data ) => {
        await axios.put('/admin/sign-out')
        .then( () => props.Event.emit('exit'))
        .catch( err => {
            ErrorHandler.handle( err, requestSignOut, 11, data );  
        });
    }

    const handleNavPanel = () => {
        setNavSwitch( !navSwitch );
    }

    useEffect(() => {
        const fetchAdminData = async () => {
            axios.get('/admin')
            .then( res => setAdmin( res.data ) )
            .catch( err => {
                ErrorHandler.handle( err, requestSignOut, 12 );  
            });
        }

        fetchAdminData();
    }, []);

    useEffect( () => {
        const navBtn = document.querySelector('#menu-btn');
        navBtn.addEventListener('click', handleNavPanel);

        return () => {
            navBtn.removeEventListener('click', handleNavPanel);    
        }
    }, [navSwitch]);


    useEffect( () => {
        window.addEventListener('keydown', (e) => {
            if( e.key === 'Escape' ) setNavSwitch( false );
        });

        return window.removeEventListener('keydown', () => setNavSwitch( false ))
    }, []);


    return (
        <div className={navSwitch ? "nav-panel p-0 d-flex flex-row" : "nav-panel p-0 "} style={{width: navSwitch ? '400px' : '50px', marginRight: navSwitch ? '0px' : '3%'}}>
            <div className="np-menu-bar p-3 mt-3 d-flex justify-content-center">
                <img style={{width: '41px', height: '43px', transform: navSwitch ? 'rotate(0deg)' : 'rotate(-90deg)'}} id="menu-btn" src={menuImg}/>
            </div>
            <div style={{width: navSwitch ? '100%' : '0%'}} className="np-content p-0 py-5">
                {/* Profile box */}
                <div className="np-profile-box d-flex mx-5 flex-row justify-content-start align-items-center">
                    <div style={{width: '64px', height: '64px'}} className="col-3 d-flex justify-content-end align-items-start">
                        <div className="col-3 np-img-container" style={{width: navSwitch ? '64px' : '15px', height: navSwitch ? '64px' : '15px'}}>
                            <ImageBall Event={props.Event}/>
                        </div>
                    </div>
                    <div className="col-10 np-name-container" >
                        <h4 className="user-name text-truncate m-0">
                            { admin?.username ?? 'Fetching name...' }
                        </h4>
                    </div>
                </div>

                <hr className="np-divider my-4 mx-5"/>

                {/* Navigation panel links */}
                <div className="np-link-box d-flex flex-column align-items-end">
                    { produceBtnLinks( props.dirs ) }
                </div>

                <hr className="np-divider mx-5"/>

                {/* Log out button */}
                <div className="np-logout-box mx-5 d-flex justify-content-center align-items-center">
                    <div className="np-logout-container d-flex flex-row">
                        {/* Insert leave icon here */}
                        <button className="np-logout-btn" 
                        onClick={ requestSignOut }>Log out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}



function produceBtnLinks( dirs ){
    return dirs.map( dir => (
        <ButtonLink
            key={dirs.indexOf(dir).toString()}
            id={'btn-link-'.concat(dirs.indexOf(dir).toString())}
            url={dir.url}
            icon={dir.icon}
            title={dir.title}
        />
    ));
}

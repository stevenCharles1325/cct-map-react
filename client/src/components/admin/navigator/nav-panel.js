import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

import ImageBall from '../image/image-ball';
import ButtonLink from '../buttons/button-link';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import '../../../styles/admin/nav-panel.css';
import menuImg from '../../../images/admin/menu.png';

import CustomErrorHandler from '../../../modules/customErrorHandler';


const ErrorHandler = new CustomErrorHandler( 5, 5000 );

export default function NavPanel( props ){
    const [admin, setAdmin] = useState( null );
    const [navSwitch, setNavSwitch] = useState( false );

    const requestSignOut = async ( data ) => {
        const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

        await axios.delete(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/sign-out/token/${ rtoken }`, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
        .then(() => {
            Cookies.remove('token');
            Cookies.remove('rtoken');

            return props?.Event?.emit?.('exit')
        })
        .catch( err => {
            ErrorHandler.handle( err, requestSignOut, 11, data );  

            if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)
                    setTimeout(() => requestSignOut( data ), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            } 
        });
    }

    const handleNavPanel = () => {
        setNavSwitch( !navSwitch );
    }

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = Cookies.get('token');
            const rtoken = Cookies.get('rtoken');

            if( !token ){
                return props?.Event?.emit?.('unauthorized');
            }

            axios.get(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin`, {
                headers: {
                    'authentication': `Bearer ${token}`
                }
            })
            .then( res => setAdmin( res.data ) )
            .catch( err => {
                ErrorHandler.handle( err, requestSignOut, 12 );  
                
                if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                    return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                    .then( res => {
                        Cookies.set('token', res.data.accessToken)
                        setTimeout(() => fetchAdminData(), 1000);
                    })
                    .catch( err => props?.Event?.emit?.('unauthorized'));
                } 
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
        <div
            className={navSwitch ? "nav-panel p-0 d-flex flex-row" : "nav-panel p-0 "} 
            style={{width: navSwitch ? '400px' : '50px', marginRight: navSwitch ? '0px' : '3%'}}
        >
            <div className="np-menu-bar p-3 mt-3 d-flex justify-content-center">
                <img style={{width: '41px', height: '43px', transform: navSwitch ? 'rotate(0deg)' : 'rotate(-90deg)'}} id="menu-btn" src={menuImg}/>
            </div>
            <div style={{width: navSwitch ? '100%' : '0%', boxShadow: '-5px 0px 10px rgba(0, 0, 0, 0.3)'}} className="np-content p-0 py-5">
                {/* Profile box */}
                <div className="np-profile-box d-flex mx-5 flex-row justify-content-start align-items-center">
                    <div style={{width: '64px', height: '64px'}} className="col-3 d-flex justify-content-end align-items-start">
                        <div className="col-3 np-img-container d-flex justify-content-center align-items-center" style={{width: navSwitch ? '64px' : '15px', height: navSwitch ? '64px' : '15px', backgroundColor: 'transparent'}}>
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
                        <Button 
                            onClick={ requestSignOut }
                            variant="outlined"
                        >
                            Log out
                        </Button>
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

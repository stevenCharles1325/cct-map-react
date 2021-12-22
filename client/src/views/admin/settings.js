import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Validator from '../../modules/validate-input';

import { Input, displayMessage }from '../../components/admin/inputs/input';
import ImageBall from '../../components/admin/image/image-ball';
import Button from '@mui/material/Button';
import { red, yellow } from '@mui/material/colors';
import Alert from '@mui/material/Alert';

import '../../styles/admin/settings.css';

export default function Settings( props ){
    const { ErrorHandler } = props;

    const validator = new Validator();

    const [admin, setAdmin] = useState( null );

    const [username, setUsername] = useState( null );
    const [password, setPassword] = useState( null );
    const [email, setEmail] = useState( null );
    const [number, setNumber] = useState( null );
    const [cPassword, setCPassword] = useState( null );

    const [sysMessage, setSysMessage] = useState( null );
    
    const usernameChangeHandler = ( e ) => setUsername( e.target.value ); 
    const passwordChangeHandler = ( e ) => setPassword( e.target.value ); 
    const emailChangeHandler = ( e ) => setEmail( e.target.value ); 
    const numberChangeHandler = ( e ) => setNumber( e.target.value ); 
    const cPasswordChangeHandler = ( e ) => setCPassword( e.target.value ); 


    const evaluateResult = ( result, msg, id ) => {
        if( !result ) displayMessage( msg, id );
    }

    const saveHandler = () => {
        const nameCheck = validator.check('username', username ?? '');
        const passCheck = validator.check('password', password ?? '');
        const cPassCheck = validator.check('cPassword', cPassword ?? '');
        const emailCheck = validator.check('email', email ?? '');
        const numCheck = validator.check('number', number ?? '');

        const finalResult = (
                nameCheck.result && 
                passCheck.result && 
                cPassCheck.result && 
                emailCheck.result && 
                numCheck.result
            );

        Array(
            [numCheck.result, numCheck.msg, 'set-number'],
            [emailCheck.result, emailCheck.msg, 'set-email'],
            [nameCheck.result, nameCheck.msg, 'set-username'],
            [passCheck.result, passCheck.msg, 'set-password'],
            [cPassCheck.result, cPassCheck.msg, 'set-cPassword']
        ).forEach( elem => evaluateResult( ...elem ) );


        if( finalResult ){
            const newData = {
                username: username,
                password: password,
                email: email,
                number: number
            }

            setAdmin( newData );
            requestSetAdmin( newData );    
        }       
        else{
            return;
        } 
    }

    const requestSetAdmin = async ( data ) => { 
        const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

        await axios.put(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin/set-admin`, data, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
        .then( res => setSysMessage({ variant: 'success', message: res.data.message }))
        .catch( err => {
            ErrorHandler.handle( err, requestSetAdmin, 5, data );

            if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestSetAdmin( data ), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            } 
        });
    }

    const resetHandler = () => {
        setEmail( admin?.email );
        setNumber( admin?.number );
        setUsername( admin?.username );
        setPassword( admin?.password );
        setCPassword( null );       
    }

    const fetchAdminData = async () => {
        const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

        await axios.get(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin`, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
        .then( res => setAdmin(() => res.data) )
        .catch( err => {
            ErrorHandler.handle( err, fetchAdminData, 6 );

            if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => fetchAdminData(), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            } 
        });
    }

    useEffect( () => fetchAdminData(), []);

    useEffect( () => resetHandler(), [admin]);

    useEffect( () => {
        document.querySelector('#set-email').value = email;
        document.querySelector('#set-number').value = number;
        document.querySelector('#set-username').value = username;
        document.querySelector('#set-password').value = password;
        document.querySelector('#set-cPassword').value = cPassword;
    }, [username, password, cPassword, email, number]);

    useEffect(() => {
        if( sysMessage ){
            setTimeout(() => {
                setSysMessage( null );
            }, [3000]);
        }
    }, [sysMessage]);

    return(
        <div className="settings">
            {
                sysMessage
                    ? <div 
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '3vh',
                            transform: 'translate(-50%, 0%)'
                        }}
                        >
                        <Alert variant="filled" severity={sysMessage.variant}> {sysMessage.message }</Alert>
                    </div>
                    : null
            }
            <div className="settings-bar"></div>
            <div className="settings-pic-bar d-flex flex-row">
                <div className="settings-pic-cont d-flex justify-content-center align-items-center">
                    <ImageBall active={true} Event={props.Event}/>
                </div>
                <div className="settings-title">Settings</div>
            </div>

            <div className="settings-inp-frame d-flex justify-content-center align-items-center">
                <div className="settings-inp-box d-flex flex-column justify-content-between align-items-center">
                    <Input id="set-username" value={username} size={{height: '100%'}} handleChange={usernameChangeHandler} type="text" name="username" placeholder="Enter new username"/>
                    <Input 
                        id="set-password" 
                        size={{height: '100%'}}
                        value={password} 
                        handleChange={passwordChangeHandler} 
                        type="password" 
                        name="password" 
                        placeholder="Enter new password" 
                        peekBtn={createPeekButton("set-password")}
                    />
                    <Input 
                        id="set-cPassword" 
                        value={cPassword} 
                        size={{height: '100%'}}
                        handleChange={cPasswordChangeHandler} 
                        type="password" 
                        name="cPassword" 
                        placeholder="Re-enter password" 
                        peekBtn={createPeekButton("set-cPassword")}
                    />
                    <Input id="set-email" value={email} size={{height: '100%'}} handleChange={emailChangeHandler} type="text" name="email" placeholder="Enter new email"/>
                    <Input id="set-number" value={number} size={{height: '100%'}} handleChange={numberChangeHandler} type="text" name="number" placeholder="Enter new number"/>

                    
                    <div className="settings-btn-box d-flex flex-row justify-content-around align-items-center">
                        { produceBtn(
                            [
                                {
                                    id: "settings-save", 
                                    title: "Save",
                                    variant: 'outlined',
                                    sx: { color: yellow[ 200 ], borderColor: yellow[ 200 ] }, 
                                    clickHandler: () => saveHandler()
                                }, 
                                {
                                    id: "settings-reset", 
                                    title: "Reset",
                                    variant: 'filled',
                                    sx: { bgcolor: red[ 200 ] },
                                    clickHandler: () => resetHandler()
                                }
                            ]
                        )}
                    </div>
                </div>
            </div>
        </div>
     );
}



function createPeekButton( id ){
    const handleClick = () => {
        document.querySelector(`#${id}`).type = 'text';

        setTimeout(() => {
            document.querySelector(`#${id}`).type = 'password';
        }, 500);
    }

    return <button key={id} onClick={handleClick} className="peek-btn"> peek </button>
}



function produceMessageContainer( ids ){
    return ids.map( id => (<div key={id} className={`${id} number-msg msg-container`}></div>) );
}


function produceBtn( ids ){
    return ids.map( id => (<Button key={id.id} onClick={id.clickHandler} variant={id.variant} sx={ id.sx }>{ id.title }</Button>) );
}


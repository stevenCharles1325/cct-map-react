import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Validator from '../../modules/validate-input';

import { Input, displayMessage }from '../../components/admin/inputs/input';
import ImageBall from '../../components/admin/image/image-ball';

import '../../styles/admin/settings.css';

export default function Settings( props ){
    const validator = new Validator();
    

    const [admin, setAdmin] = useState( null );

    const [username, setUsername] = useState( null );
    const [password, setPassword] = useState( null );
    const [email, setEmail] = useState( null );
    const [number, setNumber] = useState( null );
    const [cPassword, setCPassword] = useState( null );

    
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
        await axios.put('/admin/set-admin', data)
        .then( res => console.log( res.data.message ))
        .catch( err => {
            console.log( err );
            setTimeout( () => requestSetAdmin(), 5000 );
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
        axios.get('/admin')
        .then( res => setAdmin(() => res.data) )
        .catch( err => {
            console.log( err );
            setTimeout( () => fetchAdminData(), 5000 );
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


    return(
        <div className="settings">
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
                                    clickHandler: () => saveHandler()
                                }, 
                                {
                                    id: "settings-reset", 
                                    title: "Reset",
                                    clickHandler: () => resetHandler()
                                }
                            ]
                        )}
                    </div>
                    <h5 id="settings-msg-success"></h5>
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
    return ids.map( id => (<button key={id.id} id={id.id} onClick={id.clickHandler} className="settings-btn">{ id.title }</button>) );
}


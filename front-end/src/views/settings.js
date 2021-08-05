import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Validator from '../modules/validate-input';

import { Input, displayMessage }from '../components/inputs/input';

import '../styles/settings.css';
import userFace from '../images/happy.png';

export default function Settings( props ){
    const validator = new Validator();
    const requestSetAdmin = props.reqSetAdmin;

    const [admin, setAdmin] = useState(props.admin);

    const [username, setUsername] = useState(admin.username);
    const [password, setPassword] = useState(admin.password);
    const [email, setEmail] = useState(admin.email);
    const [number, setNumber] = useState(admin.number);
    const [cPassword, setCPassword] = useState('');

    
    const usernameChangeHandler = ( e ) => { setUsername( e.target.value ); }
    const passwordChangeHandler = ( e ) => { setPassword( e.target.value ); }
    const emailChangeHandler = ( e ) => { setEmail( e.target.value ); }
    const numberChangeHandler = ( e ) => { setNumber( e.target.value ); }
    const cPasswordChangeHandler = ( e ) => { setCPassword( e.target.value ); }


    const saveHandler = () => {
        const nameCheck = validator.check('username', username);
        const passCheck = validator.check('password', password);
        const cPassCheck = validator.check('cPassword', cPassword);
        const emailCheck = validator.check('email', email);
        const numCheck = validator.check('number', number);

        const finalResult = nameCheck.result && passCheck.result && cPassCheck.result && emailCheck.result && numCheck.result;


        if( !nameCheck.result ){
            displayMessage( nameCheck.msg, 'set-username' );
        }

        if( !passCheck.result ){
            displayMessage( passCheck.msg, 'set-password' );
        }

        if( !cPassCheck.result ){
            displayMessage( cPassCheck.msg, 'set-cPassword' );
        }

        if( !emailCheck.result ){
            displayMessage( emailCheck.msg, 'set-email' );
        }

        if( !numCheck.result ){
            displayMessage( numCheck.msg, 'set-number' );
        }


        if( finalResult ){
            const newData = {
                status : admin.status,
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


    const resetHandler = () => {
        setUsername( admin.username );
        setPassword( admin.password );
        setEmail( admin.email );
        setNumber( admin.number );
        setCPassword('');       
    }


    useEffect( () => {
        resetHandler();
    }, [admin]);


    useEffect( () => {
        document.querySelector('#set-username').value = username;
        document.querySelector('#set-password').value = password;
        document.querySelector('#set-cPassword').value = cPassword;
        document.querySelector('#set-email').value = email;
        document.querySelector('#set-number').value = number;
    }, [username, password, cPassword, email, number])


    return(
        <div className="settings">
            <div className="settings-bar"></div>
            <div className="settings-pic-bar d-flex flex-row">
                <div className="settings-pic-cont d-flex justify-content-center align-items-center">
                    <img width="80%" height="80%" src={userFace}/>
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
                        placeholder="Confirm new password" 
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
                                    clickHandler: saveHandler
                                }, 
                                {
                                    id: "settings-reset", 
                                    title: "Reset",
                                    clickHandler: resetHandler 
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


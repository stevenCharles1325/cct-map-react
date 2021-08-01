import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../styles/settings.css';
import userFace from '../images/happy.png';

export default function Settings( props ){
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

            <div className="settings-inp-frame d-flex justify-content-end align-items-center">
                <div className="settings-inp-box d-flex flex-column justify-content-between align-items-center">
                    
                    { createInputField({ 
                        id: "set-username", 
                        title: "Username:", 
                        type: "text", 
                        value: username, 
                        inputHandler: usernameChangeHandler
                    })}
                    
                    { createInputField({ 
                        id: "set-password", 
                        title: "Password:", 
                        type: "password", 
                        value: password, 
                        inputHandler: passwordChangeHandler
                    })}
                    
                    { createInputField({ 
                        id: "set-cPassword", 
                        title: "Confirm-password:", 
                        type: "password", 
                        value: cPassword,
                        inputHandler: cPasswordChangeHandler 
                    })}
                    
                    { createInputField({ 
                        id: "set-email", 
                        title: "Email:", 
                        type: "email", 
                        value: email, 
                        inputHandler: emailChangeHandler 
                    })}
                    
                    { createInputField({ 
                        id: "set-number", 
                        title: "Number:", 
                        type: "text", 
                        value: number, 
                        inputHandler: numberChangeHandler
                    })}

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
                <div className="settings-msg-box p-0 m-0 px-2 d-flex flex-column justify-content-between align-items-center">
                    { produceMessageContainer(["username-msg", "password-msg", "cPassword-msg", "email-msg", "number-msg"]) }
                </div>
            </div>
        </div>
     );
}




function createInputField({ id, type, title, value, inputHandler, btn }){
    return (
        <div key={id.concat("settings")} className="settings-inp-cont d-flex justify-content-center align-items-center">
            <div className="inp-label">
                <h5>{ title }</h5>
            </div> 
            <input id={id} className="inp-bar" type={type} defaultValue={value} onChange={inputHandler}/>
            { btn ? btn : null }
            { type === 'password' ? createPeekButton(id) : null }
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
    return ids.map( id => (<button id={id.id} onClick={id.clickHandler} className="settings-btn">{ id.title }</button>) );
}


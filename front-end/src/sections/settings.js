import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import '../styles/settings.css';

import NavPanel from '../components/navigator/nav-panel';

export default class Settings extends React.Component{
    
    constructor( props ){
        super( props );

        this.admin = props.admin;
        this.statusKey = props.statusKey;
    }

    openPass( field ){
        const time = 500;

        field.type = 'text';
        setTimeout(() => {
            field.type = 'password';
        }, time);
    }

    nameEval( uName ) {
        let name = uName.value;
        let result;

        const isValidName = ( name ) => {
            let valids = /\w/g
            let filtered = name.replaceAll(valids, '');
            
            return filtered ? false : true;
        }

        if( !name.length ){
            result = {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( !isValidName( name ) ){
            result = {msg: `Oops! Invalid username.`, result: false};   
        }
        else if( name.length > 0 && name.length <= 2 ){
            result = {msg:`It must be greater-than 2.`, result: false};   
        }
        else{
            result = {msg:`Username is good!`, result: true};   
        }

        this.displayMessage( result.msg, uName.id );
    }

    passEval( uPass ) {
        let pass = uPass.value;
        let result;

        if( !pass.length ){
            result = {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( pass.length > 1 && pass.length < 7 ){
            result = {msg: `It must be greater-than 7.`, result: false};   
        }
        else{
            result = {msg: `Password is good!`, result: true};   
        }

        this.displayMessage( result.msg, uPass.id );
    }

    cPassEval( uCpass ) {
        let cpass = uCpass.value;
        let result;

        if( !cpass.length ){
            result = {msg: `Hey! You left me empty!`, result: false};
        }
        else if( cpass.length > 1 && cpass.length < 7 ){
            result = {msg: `It must be greater-than 7.`, result: false};
        }
        else if( cpass !== document.querySelector('#set-password').value ){
            result = {msg: `Didn't match!`, result: false};
        }
        else{
            result = {msg: `It matched!`, result: true};   
        }

        this.displayMessage( result.msg, uCpass.id );
    }

    emailEval( uEmail ) {
        let email = uEmail.value;
        let result;
        if( !email.length ){
            result = {msg: `Hey! You left me empty!`, result: false};
        }
        else{
            result = {msg: `Email is good!`, result: true};   
        }

        this.displayMessage( result.msg, uEmail.id );
    }

    cNumberEval( uCnum ) {
        let cnum = uCnum.value;
        let result;

        const isValidNumber = ( number ) => {
            const isLengthAccepted = number.length === 11 ? true : false;
            const isPhpNumber = number.search('09') === 0 ? true : false;

            return isLengthAccepted && isPhpNumber;
        }

        if( !cnum.length ){
            result = {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( !isValidNumber( cnum ) ){
            result = {msg: `Oops! Invalid number`, result: false};   
        }
        else{
            result = {msg: `Number is good!`, result: true};   
        }

        this.displayMessage( result.msg, uCnum.id );
    }


    displayMessage( msg, id ){

        console.log(id.replace('set-', ''))
        const DECAY_TIME = 2500;

        const message = document.querySelector(`.${id.replace('set-', '')}-msg`);

        message.style.visibility = 'visible';
        message.innerHTML = msg;

        setTimeout( () => {

            message.style.visibility = 'hidden';
            message.innerHTML = '';

        }, DECAY_TIME );

    }

    componentDidMount(){
        const passPeek = document.querySelector('#pass-peek');
        const cPassPeek = document.querySelector('#cPass-peek');
        
        const username = document.querySelector('#set-username');
        const email = document.querySelector('#set-email');
        const number = document.querySelector('#set-number');
        const pass = document.querySelector('#set-password');
        const cPass = document.querySelector('#set-cPassword');

        // Peek event listener
        passPeek.addEventListener('click', () => { this.openPass(pass) });
        cPassPeek.addEventListener('click', () => { this.openPass(cPass) });

        username.addEventListener('input', () => { this.nameEval(username) });
        pass.addEventListener('input', () => { this.passEval(pass) });
        cPass.addEventListener('input', () => { this.cPassEval(cPass) });
        email.addEventListener('input', () => { this.emailEval(email) });
        number.addEventListener('input', () => { this.cNumberEval(number) });

    }

    render(){
        return(
            <div className="settings">
                <NavPanel 
                    dirs={
                        [
                            {url: '/dashboard', icon: null, title:'Dashboard'},
                            {url: '/map', icon: null, title:'Map'},
                            {url: '/settings', icon: null, title:'Settings'}
                        ]
                    }

                    admin={ this.admin }
                    statusKey={ this.statusKey }
                />

                <div className="settings-bar">
                </div>

                <div className="settings-pic-bar d-flex flex-row">

                    <div className="settings-pic-cont"></div>
                    <div className="settings-title">Settings</div>


                </div>

                <div className="settings-inp-frame d-flex justify-content-end align-items-center">

                    <div className="settings-inp-box d-flex flex-column justify-content-between align-items-center">
                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>Username:</h5>
                            </div>
                            <input id="set-username" className="inp-bar" type="text" defaultValue={this.admin.username}/>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>Password:</h5>
                            </div>
                            <input id="set-password" className="inp-bar" type="password" defaultValue={this.admin.password}/>
                            <button id="pass-peek" className="peek-btn">peek</button>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>Confirm-password:</h5>
                            </div>
                            <input id="set-cPassword" className="inp-bar" type="password" />
                            <button id="cPass-peek" className="peek-btn">peek</button>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>email:</h5>
                            </div>
                            <input id="set-email" className="inp-bar" type="email" defaultValue={this.admin.email}/>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>number:</h5>
                            </div>
                            <input id="set-number" className="inp-bar" type="text" defaultValue={this.admin.number}/>
                        </div>

                        <div className="settings-btn-box d-flex flex-row justify-content-around align-items-center">
                            <button id="settings-save" className="settings-btn">save</button>
                            <button id="settings-reset" className="settings-btn">reset</button>
                        </div>
                    </div>

                    <div className="settings-msg-box p-0 m-0 px-2 d-flex flex-column justify-content-between align-items-center">
                        <div className="username-msg msg-container"></div>
                        <div className="password-msg msg-container"></div>
                        <div className="cPassword-msg msg-container"></div>
                        <div className="email-msg msg-container"></div>
                        <div className="number-msg msg-container"></div>
                    </div>

                    
                </div>
            </div>
        );
    }
}
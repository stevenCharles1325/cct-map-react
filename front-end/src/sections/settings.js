import React from 'react';
import axios from 'axios';

import '../styles/settings.css';
import userFace from '../images/happy.png';

export default class Settings extends React.Component{
    
    constructor( props ){
        super( props );

        this.admin = props.admin;
        this.statusKey = props.statusKey;
        this.navPanel = props.navPanel;

        this.reFetch = props.fetchData;

        this.saveChanges = this.saveChanges.bind( this );
        this.resetChanges = this.resetChanges.bind( this );

        this.successMsg = null;

        this.username = null;
        this.email = null;
        this.number = null;
        this.pass = null;
        this.cPass = null;
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

    saveChanges(){
        this.successMsg.innerHTML = 'Please wait...';
        const url = 'http://localhost:7000/admin/set-admin';
        axios.put(url, {
            username: this.username.value,
            password: this.pass.value,
            email: this.email.value,
            number: this.number.value
        })
        .then( res => {
            if( res.status === 200 ){
                this.reFetch();   
                this.admin.username = this.username.value;
                this.admin.password = this.pass.value;
                this.admin.email = this.email.value;
                this.admin.number = this.number.value;

                this.successMsg.innerHTML = res.data.message;             
                setTimeout(() => {
                    this.successMsg.innerHTML = 'You might wanna refresh the app for changes.';             
                }, 2000);
            }
        })
        .catch( err => {
            console.log( err );
        });
    }

    resetChanges(){
        this.username.value = this.admin.username;
        this.pass.value = this.admin.password;
        this.email.value = this.admin.email;
        this.number.value = this.admin.number;
    }

    componentDidMount(){
        const passPeek = document.querySelector('#pass-peek');
        const cPassPeek = document.querySelector('#cPass-peek');
        
        this.username = document.querySelector('#set-username');
        this.email = document.querySelector('#set-email');
        this.number = document.querySelector('#set-number');
        this.pass = document.querySelector('#set-password');
        this.cPass = document.querySelector('#set-cPassword');

        this.username.value = this.admin.username;
        this.email.value = this.admin.email;
        this.number.value = this.admin.number;
        this.pass.value = this.admin.password;

        this.successMsg = document.querySelector('#settings-msg-success');

        const save = document.querySelector('#settings-save');
        const reset = document.querySelector('#settings-reset');

        // Peek event listener
        passPeek.addEventListener('click', () => { this.openPass(this.pass) });
        cPassPeek.addEventListener('click', () => { this.openPass(this.cPass) });

        this.username.addEventListener('input', () => { this.nameEval(this.username) });
        this.pass.addEventListener('input', () => { this.passEval(this.pass) });
        this.cPass.addEventListener('input', () => { this.cPassEval(this.cPass) });
        this.email.addEventListener('input', () => { this.emailEval(this.email) });
        this.number.addEventListener('input', () => { this.cNumberEval(this.number) });

        save.addEventListener('click', this.saveChanges);
        reset.addEventListener('click', this.resetChanges);

    }

    render(){
        return(
            <div className="settings">
                <div className="settings-bar">
                </div>

                <div className="settings-pic-bar d-flex flex-row">

                    <div className="settings-pic-cont d-flex justify-content-center align-items-center">
                        <img width="80%" height="80%" src={userFace}/>
                    </div>
                    <div className="settings-title">Settings</div>


                </div>

                <div className="settings-inp-frame d-flex justify-content-end align-items-center">

                    <div className="settings-inp-box d-flex flex-column justify-content-between align-items-center">
                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>Username:</h5>
                            </div>
                            <input id="set-username" className="inp-bar" type="text"/>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>Password:</h5>
                            </div>
                            <input id="set-password" className="inp-bar" type="password"/>
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
                            <input id="set-email" className="inp-bar" type="email"/>
                        </div>

                        <div className="settings-inp-cont d-flex justify-content-center align-items-center">
                            <div className="inp-label">
                                <h5>number:</h5>
                            </div>
                            <input id="set-number" className="inp-bar" type="text" />
                        </div>

                        <div className="settings-btn-box d-flex flex-row justify-content-around align-items-center">
                            <button id="settings-save" className="settings-btn">save</button>
                            <button id="settings-reset" className="settings-btn">reset</button>
                        </div>
                        <h5 id="settings-msg-success"></h5>
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
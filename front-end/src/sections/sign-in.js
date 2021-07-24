import React from 'react';
import axios from 'axios';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import '../styles/sign-in.css';

import Input from '../components/inputs/input';
import Button from '../components/buttons/button';
import FormCard from '../components/cards/form-card';

import signin_img from '../images/sign-in.png';

export default class Signin extends React.Component{
    constructor( props ){
        super( props );

        this.size = {
            width: '85%'
        };

        this.state = {
            username : {
                client: null,
                server: null
            },
            password : {
                client: null,
                server: null
            }
        }

        this.submit = this.submit.bind( this );
        this.updateStateServer = this.updateStateServer.bind( this);
    }

    displayMessage( msg, id ){
        const DECAY_TIME = 2000;

        const cover = document.querySelector(`#${id.concat('-msg-box')}`);
        const message = document.querySelector(`#${id.concat('-msg')}`);

        cover.style.width = '100%';
        message.innerHTML = msg;

        setTimeout( () => {

            cover.style.width = '0%';
            message.innerHTML = '';

        }, DECAY_TIME );

    }

    async submit(e) {
        e.preventDefault();
        console.log(this.state);
        if( this.state.username.client === this.state.username.server ){
            if( this.state.password.client === this.state.password.server ){
                
                axios.put('http://localhost:7000/admin/sign-in', {
                    username: this.state.username.client,
                    password: this.state.password.client
                })
                .then( res => {
                    if( res.status === 200 && res.data.redirect_url ){
                        window.location.href = res.data.redirect_url;
                    }
                })
                .catch( err => {
                    console.log( err );
                });
            }
            else{
                this.displayMessage( 'Incorrect password!', 'password' );
            }
        }
        else{
            this.displayMessage( 'Incorrect username!', 'name' );
        }
    }

    updateState( name, pass ){
        this.setState({
            username: {
                client: name.value,
                server: this.state.username.server
            },
            password:{
                client: pass.value,
                server: this.state.password.server
            } 
        });
    }

    updateStateServer( res ){
        const name = document.querySelector('#name');
        name.value = res.data.username;
        this.setState({
            username: {
                client: this.state.username.client,
                server: res.data.username
            },
            password: {
                client: this.state.password.client,
                server: res.data.password
            }
        });
    }

    componentDidMount() {
        
        const name = document.querySelector('#name');
        const pass = document.querySelector('#password');

        axios.get('http://localhost:7000/admin')
        .then( this.updateStateServer )
        .catch( err => {
            console.log( err );
        })

        name.addEventListener('input', () => { this.updateState(name, pass) });
        pass.addEventListener('input', () => { this.updateState(name, pass) });
    }

    render() {
        return (
            <div className="sign-in-frame d-flex flex-row">
                <div className="sign-in-form-box p-5">
                    <FormCard title={{content: 'Welcome!', color: '#ffffff'}} action={this.submit}>
                        <h3>Log in to your account</h3>
                        <br/>
                        <br/>
                        <div className="sign-in-inp-box d-flex flex-column align-items-center">
                            <Input id="name" type="text" name="username" placeholder="Enter username" size={this.size}/>
                            <Input id="password" type="password" name="password" placeholder="Enter password" size={this.size}/>
                            <Router>
                                <Link to="/admin" style={{color: 'black'}}>forgot password?</Link>                        
                            </Router>
                        </div>
                        <br/>
                        <br/>
                        <Button name="Log in" type="Submit" />
                        

                        <p style={{margin: '20% 0% 0% 0%'}}>"Yeah, It automatically checks if you have an account or not"</p>
                        <p>&copy; 2021</p>
                    </FormCard>
                </div>
                <div className="sign-in-img-box d-flex justify-content-center align-items-center">
                    <img width="90%" height="95%" src={signin_img}/>
                </div>
            </div>
        );
    }
    
}
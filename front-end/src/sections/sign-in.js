import React from 'react';
import axios from 'axios';
import { Link, BrowserRouter as Router, Redirect } from 'react-router-dom';
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

        this.admin = props.admin;
        this.statusKey = props.statusKey;
        this.state = {
            username: null,
            password: null
        }

        this.submit = this.submit.bind( this );
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

    submit(e) {
        e.preventDefault();

        if( this.admin.username === this.state.username ){
            if( this.admin.password === this.state.password ){
                
                axios.put('http://localhost:7000/admin/sign-in', {
                    username: this.state.username,
                    password: this.state.password
                })
                .then( res => {
                    if( res.status === 200 ){
                        this.statusKey({
                            status: {loggedIn: true}
                        });
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
            username: name.value,
            password: pass.value
        });
    }

    componentDidMount() {
        console.log('sign-in');
        
        const name = document.querySelector('#name');
        const pass = document.querySelector('#password');

        name.value = this.admin.username ? this.admin.username : "";

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
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Link, BrowserRouter as Router, Redirect } from 'react-router-dom';
import '../../styles/admin/sign-in.css';

import { Input, displayMessage }from '../../components/admin/inputs/input';
import Button from '../../components/admin/buttons/button';
import FormCard from '../../components/admin/cards/form-card';

import signin_img from '../../images/admin/sign-in.png';


export default function Signin( props ){
    const admin = props.admin;

    const [username, setUsername] = useState( admin.username );
    const [password, setPassword] = useState('');

    const size = {
            width: '85%'
        };

    const requestSignIn = async () => {

        if( username === admin.username ){
            if( password === admin.password ){
                
                const data = {
                    status: { exist: admin.status.exist, loggedIn: true},
                    username: username,
                    password: password,
                    email: admin.email,
                    number: admin.number
                }

                props.reqSetAdminSignIn( data );
            }
            else{
                displayMessage('Incorrect password', 'password');
            }
        }
        else{
            displayMessage('Incorrect username', 'username');
        }
    }

    const handleUsername = (e) => {
        setUsername( e.target.value );
    }

    const handlePassword = (e) => {
        setPassword( e.target.value );
    }

    return(
        <div className="sign-in-frame d-flex flex-row">
            <div className="sign-in-form-box p-5">
                <div title={{content: 'Welcome!', color: '#ffffff'}}>
                    <h1>Welcome</h1>
                    <h3>Log in to your account</h3>
                    <br/>
                    <br/>
                    <div className="sign-in-inp-box d-flex flex-column align-items-center">
                        <Input id="username" type="text" name="username" placeholder="Enter username" value={username} handleChange={handleUsername} size={size}/>
                        <Input id="password" type="password" name="password" placeholder="Enter password" handleChange={handlePassword} size={size}/>
                        <Router>
                            <Link to="/admin" style={{color: 'black'}}>forgot password?</Link>                        
                        </Router>
                    </div>
                    <br/>
                    <br/>
                    <Button name="Log in" click={requestSignIn} />
                    

                    <p style={{margin: '20% 0% 0% 0%'}}>"Yeah, It automatically checks if you have an account or not"</p>
                    <p>&copy; 2021</p>
                </div>
            </div>
            <div className="sign-in-img-box d-flex justify-content-center align-items-center">
                <img width="90%" height="95%" src={signin_img}/>
            </div>
        </div>
    );
}



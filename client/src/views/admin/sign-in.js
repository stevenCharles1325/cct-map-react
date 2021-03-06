import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, BrowserRouter as Router, Redirect } from 'react-router-dom';
import '../../styles/admin/sign-in.css';

import { Input, displayMessage }from '../../components/admin/inputs/input';
import Button from '../../components/admin/buttons/button';
import FormCard from '../../components/admin/cards/form-card';

import signin_img from '../../images/admin/sign-in.png';


export default function Signin( props ){
    const { ErrorHandler } = props;

    const [username, setUsername] = useState( null );
    const [password, setPassword] = useState( null );
    const [signIn, setSignIn] = useState( false );

    const size = {
            width: '85%'
        };

    const checkAdminExistence = async () => {
        const token = Cookies.get('token');
        
        if( token ){
            axios.get(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/check-status`, {
                headers: {
                    'authentication': `Bearer ${token}`
                }
            })
            .then( res => {
                return props?.Event?.emit?.('enter');
            });    
        }
        
        axios.get(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/check-existence`)
        .then( res => {
            if( !res.data.adminExist ){
                return props?.Event?.emit?.('forbidden');
            }
        })
        .catch( err => {
            ErrorHandler.handle( err, checkAdminExistence, 14 );        
        });
    }

    const reqSetAdminSignIn = async ( data ) => { 
        await axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/sign-in`, data)
        .then( res => {
            Cookies.set('token', res.data.accessToken);
            Cookies.set('rtoken', res.data.refreshToken);

            console.log( res.data.message );
            return props?.Event?.emit?.('enter');
        })
        .catch( err => {
            if( err?.response?.data?.which ){
                switch( err.response.data.which ){
                    case 'username':
                        return displayMessage('Incorrect username', 'username');

                    case 'password':
                        return displayMessage('Incorrect password', 'password');

                    default:
                        throw new Error('Something is wrong please try again');
                }
            }
            else{
                ErrorHandler.handle( err, reqSetAdminSignIn, 7, data );
            }
        });
    }


    const requestSignIn = async () => {
        reqSetAdminSignIn({
            username: username,
            password: password
        });

        setSignIn( () => false );
    }

    const handleUsername = (e) => {
        setUsername( () => e.target.value );
    }

    const handlePassword = (e) => {
        setPassword( () => e.target.value );
    }

    useEffect(() => checkAdminExistence(), []);

    useEffect(() => {
        if( signIn ) requestSignIn();

    }, [username, password, signIn]);

    return(
        <div className="sign-in-frame d-flex flex-row">
            <div className="sign-in-form-box p-5">
                <div>
                    <h1>Welcome</h1>
                    <h3>Log in to your account</h3>
                    <br/>
                    <br/>
                    <div className="sign-in-inp-box mb-5 d-flex flex-column align-items-center">
                        <Input autoFocus={true} id="username" type="text" name="username" placeholder="Enter username" value={username} handleChange={handleUsername} size={size}/>
                        <Input id="password" type="password" name="password" placeholder="Enter password" handleChange={handlePassword} size={size}/>
                        {/*<Router>
                            <Link to="/admin" style={{color: 'black'}}>forgot password?</Link>                        
                        </Router>*/}
                    </div>
                    <br/>
                    <br/>
                    <Button listenTo="Enter" name="Log in" click={() => setSignIn( () => true )} />
                    

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



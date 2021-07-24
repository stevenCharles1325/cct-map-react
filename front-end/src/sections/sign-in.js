import React from 'react';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import '../styles/sign-in.css';

import Input from '../components/inputs/input';
import Button from '../components/buttons/button';
import FormCard from '../components/cards/form-card';


export default class Signin extends React.Component{
    constructor( props ){
        super( props );
        this.size = {
            width: '85%'
        }
    }

    render() {
        return (
            <div className="sign-in-frame">
                <div className="sign-in-form-box p-5">
                    <FormCard title={{content: 'Welcome!', color: '#ffffff'}} url={this.url} action={this.submit}>
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
                        <Button name="Log in" type="Submit" onclick={() => {}} />
                        

                        <p style={{margin: '20% 0% 0% 0%'}}>"Yeah, It automatically checks if you have an account or not"</p>
                        <p>&copy; 2021</p>
                    </FormCard>
                </div>
                <div className="sign-in-img-box">

                </div>
            </div>
        );
    }
    
}
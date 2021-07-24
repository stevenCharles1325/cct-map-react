import React from 'react';
import axios from 'axios';
import '../styles/sign-up.css';

import Input from '../components/inputs/input';
import Button from '../components/buttons/button';
import FormCard from '../components/cards/form-card';


export default class Signup extends React.Component{
    constructor( props ){
        super( props );

        this.url = 'http://localhost:7000/admin/sign-up';

        this.state = {
            username: { isReady: false, value: null },
            password: { isReady: false, value: null },
            email: { isReady: false, value: null },
            number: { isReady: false, value: null }
        }

        this.size = {
            width: '90%'
        }

        this.updateState = this.updateState.bind( this );
        this.submit = this.submit.bind( this );

        this.nameListener = this.nameListener.bind( this );
        this.passListener = this.passListener.bind( this );
        this.cPassListener = this.cPassListener.bind( this );
        this.emailListener = this.emailListener.bind( this );
        this.cNumberListener = this.cNumberListener.bind( this );

        this.monitor = null;

    }

    displayMessage( msg, id ){
        const DECAY_TIME = 2000;

        switch( id ){
            case 'name':
                this.state.username.isReady = false;
                break;
            case 'password':
                this.state.password.isReady = false;
                break;
            case 'email':
                this.state.email.isReady = false;
                break;
            case 'cnumber':
                this.state.number.isReady = false;
                break;
            default:
                console.log('Something is not right!');
                break;
        }

        const cover = document.querySelector(`#${id.concat('-msg-box')}`);
        const message = document.querySelector(`#${id.concat('-msg')}`);

        cover.style.width = '100%';
        message.innerHTML = msg;

        setTimeout( () => {

            cover.style.width = '0%';
            message.innerHTML = '';

        }, DECAY_TIME );

    }

    nameListener( name ) {
        const id = 'name';
        const isValidName = ( name ) => {
            let valids = /\w/g
            let filtered = name.replaceAll(valids, '');
            
            return filtered ? false : true;
        }

        if( !name.length ){
            const msg = `Hey! You left me empty!`;
            this.displayMessage(msg, id);

        }
        else if( !isValidName( name ) ){
            const msg = `Oops! Invalid username.`;
            this.displayMessage(msg, id);

        }
        else if( name.length > 0 && name.length <= 2 ){
            const msg = `It must be greater-than 2.`;
            this.displayMessage(msg, id);

        }
        else{
            console.log('username ready');
            this.state.username.isReady = true;
            this.state.username.value = name.value;
        }
    }

    passListener( pass ) {
        const id = 'password';

        if( !pass.length ){
            const msg = `Hey! You left me empty!`;
            this.displayMessage(msg, id);

        }
        else if( pass.length > 1 && pass.length < 7 ){
            const msg = `It must be greater-than 7.`;
            this.displayMessage(msg, id);

        }
        else{
            console.log('password ready');
            this.state.password.isReady = true;
            this.state.password.value = pass.value;

        }
    }

    cPassListener( cpass ) {
        const id = 'conf-pass';

        if( !cpass.length ){
            const msg = `Hey! You left me empty!`;
            this.displayMessage(msg, id);

        }
        else if( cpass.length > 1 && cpass.length < 7 ){
            const msg = `It must be greater-than 7.`;
            this.displayMessage(msg, id);

        }
        else if( cpass !== this.state.password.value ){
            const msg = `Didn\'t match!`;
            this.displayMessage(msg, id);

        }
        
    }

    emailListener( email ) {
        const id = 'email';

        if( !email.length ){
            const msg = `Hey! You left me empty!`;
            this.displayMessage(msg, id);
        }
        else{
            console.log('email ready');
            this.state.email.isReady = true;
            this.state.email.value = email.value;
        }
    }

    cNumberListener( cnum ) {
        const id = 'cnumber';

        const isValidNumber = ( number ) => {
            const isLengthAccepted = number.length === 11 ? true : false;
            const isPhpNumber = number.search('09') === 0 ? true : false;

            return isLengthAccepted && isPhpNumber;
        }

        if( !cnum.length ){
            const msg = `Hey! You left me empty!`;
            this.displayMessage(msg, id);

        }
        else if( !isValidNumber( cnum ) ){
            const msg = `Oops! Invalid number`;
            this.displayMessage(msg, id);
        
        }
        else{
            console.log('number ready');
            this.state.number.isReady = true;
            this.state.number.value = cnum.value;
        }
    }

    updateState( name, pass, email, cnum ) {
        this.state.username.value = name.value;
        this.state.password.value = pass.value;
        this.state.email.value = email.value;
        this.state.number.value = cnum.value;
    }

    submit() {
        const new_data = {
            username: this.state.username.value,
            password: this.state.password.value,
            email: this.state.email.value,
            number: this.state.number.value,
        }
            
        axios.post(this.url, new_data)
        .then( (res) => {
            if( res.status === 201 ){
                window.location.href = res.data.redirect_url;
            }
        })
        .catch( err => { 
            console.log( err ) 
            window.location.href = '/admin';
        });
    }

    componentDidMount(){
        const name = document.querySelector('#name');
        const pass = document.querySelector('#password');   
        const cpass = document.querySelector('#conf-pass')
        const email = document.querySelector('#email');   
        const cnum = document.querySelector('#cnumber');  
        
        const checkReady = function(){
            this.updateState(name, pass, email, cnum);
        }.bind( this );

        for( let field of [name, pass, email, cnum]){
            field.addEventListener('input', checkReady);
            field.addEventListener('paste', checkReady);
            field.addEventListener('change', checkReady);
        }

        name.addEventListener('focusout', () => { this.nameListener( name.value ) });
        pass.addEventListener('focusout', () => { this.passListener( pass.value ) });
        cpass.addEventListener('focusout', () => { this.cPassListener( cpass.value ) });
        email.addEventListener('focusout', () => { this.emailListener( email.value ) });
        cnum.addEventListener('focusout', () => { this.cNumberListener( cnum.value ) });

        this.monitor = setInterval(() => {
            const isReady = (
                this.state.username.isReady &&
                this.state.password.isReady &&
                this.state.email.isReady &&
                this.state.number.isReady
            );
            document.querySelector('#signup-submit').disabled = !isReady;
        }, 500); 
    }

    render(){
        
        return(
            <div className="sign-up-frame d-flex flex-row">
                <div className="sign-up-inp-box p-5 text-center" style={{margin: '0% 0% 0% 5%'}}>
                    <FormCard title={{content: 'Sign-up', color: '#ffffff'}} url={this.url} action={this.submit}>
                        <div className="my-5 d-flex flex-column justify-content-center align-items-center">
                            <Input id="name" type="text" name="username" placeholder="Enter username" size={this.size}/>
                            <Input id="password" type="password" name="password" placeholder="Enter password" size={this.size}/>
                            <Input id="conf-pass" type="password" name="password" placeholder="Re-enter password" size={this.size}/>
                            <Input id="email" type="email" name="email" placeholder="Enter email" size={this.size}/>
                            <Input id="cnumber" type="text" name="cnumber" placeholder="Enter contact number" size={this.size}/>
                        </div>

                        <Button disabled={true} id="signup-submit" name="Sign Up" type="Submit" onCLick={() => { clearInterval(this.monitor) }}/>
                    </FormCard>
                </div>
                <div className="sign-up-intro-box">
                    <h3>Nature of College</h3>
                    <br/>
                    <p className="p-3">
                        The City College of Tagaytay in Tagaytay City is an institution of higher learning, a Local College, which was established by virtue of City Ordinance 2002-229.

                        In this compendium, the name of the Institution will be CITY COLLEGE OF TAGAYTAY or CCT or simply COLLEGE.

                        The dream of the then Mayor of Tagaytay, Hon. Francis N. Tolentino,to provide affordable quality tertiary education came into reality through the passage of City Ordinance No. 2002-229, authored by then Councilor Celso P. De Castro, thatestablished the City College of Tagaytayon September 30, 2002. The College is principally supported by local government funds.
                    </p>
                    <br/>
                    <br/>
                    <h3>History</h3>
                    <p className="p-3">
                        The City College of Tagaytay has come a long way, tested and persevered through the challenges and trials to what today it has become, a beacon of hope and enlightenment for the youth of Tagaytay. It was founded by two devoted and visionary sons of Tagaytay.

                        It all started when in 2002, Hon. Francis N. Tolentino, then the City Mayor, saw the increasing number of high school graduates of Tagaytay who were unable to continue their education in college due to lack of financial means, thought about establishing a local tertiary institution.

                        On September 30, 2002, the SangguniangPanglungsod, through the sponsorship of the then City Councilor, Hon. Celso P. De Castro, passed City Ordinance No. 2002-229, establishing the City College of Tagaytay.

                        In 2003 the City College of Tagaytay(CCT) officially opened its doors to the public providing affordable quality tertiary education, offering the following courses: Bachelor of Science in Computer Science, Bachelor of Science in Commerce Major in Management, Bachelor of Science in Nursing, Bachelor of Secondary Education (Major in Biology, English, Mathematics), Bachelor of Science in Hospitality Management and Tourism, Associate in Computer Science, Associate in Computer Secretarial, and Associate in Hospitality Management and Tourism, and Associate in Health Science Education.

                        The primary objective of CCT was to inculcate among its students the love for learning side by side with molding their character for them not to be only professionally competitive but also conscientiously responsible towards themselves, their families and the community.

                        With the support of the Local Government, the College strengthened its academic programs, hiring qualified and competent faculty members and staff, producing skilled and competitive graduates.

                        Among the College Administrators who managed CCT in its younger years were Dr. Josefina Roque, Dr. Felipe Balingit, and Dr. Aurora Malabanan.

                        In 2009, CCT transferred to its new home on Akle Road near the City Hall. This was made possible through the effort of the then City Mayor, Hon. Abraham “Bambol” Tolentino. Being also the Chairman of the Board of Trustees of the College, never contented with his accomplishments and being mindful of the plight of his constituents, he made history by providing free college education through the passage of the Sangguniang Panglungsod Ordinance No. 2010-017, popularly known as the “City College of Tagaytay Free College Education Ordinance”.

                        Then in 2010, a new College Administrator, Mr. Edgardo T. Castillo, was appointed by the then City Mayor and Chairman of the Board of Trustees, Hon. Abraham “Bambol” N. Tolentino.

                        CCT may have humble beginnings. However, its unwavering commitment to offer free quality education remains, as the current College President, Mr. Edgardo T. Castillo focuses on holistic development of the students that includes active involvement in the fields of academics, culture and arts, and sports.


                    </p>
                </div>
            </div>
        );
    }
}


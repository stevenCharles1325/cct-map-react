import React, { useState } from 'react';
import axios from 'axios';


import { Input, displayMessage }from '../components/inputs/input';
import Button from '../components/buttons/button';
import FormCard from '../components/cards/form-card';


import Validator from '../modules/validate-input';


import '../styles/sign-up.css';


export default function Signup( props ){
    const validator = new Validator();
    const requestSignUp = props.reqSignUp;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [cPassword, setCPassword] = useState('');

    const size = {
            width: '90%'
        }

    const usernameChangeHandler = ( e ) => { setUsername( e.target.value ); }
    const passwordChangeHandler = ( e ) => { setPassword( e.target.value ); }
    const emailChangeHandler = ( e ) => { setEmail( e.target.value ); }
    const numberChangeHandler = ( e ) => { setNumber( e.target.value ); }
    const cPasswordChangeHandler = ( e ) => { setCPassword( e.target.value ); }

    const handleRequestSignUp = () => {
        const nameCheck = validator.check('username', username);
        const passCheck = validator.check('password', password);
        const cPassCheck = validator.check('cPassword', cPassword);
        const emailCheck = validator.check('email', email);
        const numCheck = validator.check('number', number);

        const finalResult = nameCheck.result && passCheck.result && cPassCheck.result && emailCheck.result && numCheck.result;


        if( !nameCheck.result ){
            displayMessage( nameCheck.msg, 'su-username' );
        }

        if( !passCheck.result ){
            displayMessage( passCheck.msg, 'su-password' );
        }

        if( !cPassCheck.result ){
            displayMessage( cPassCheck.msg, 'su-cPassword' );
        }

        if( !emailCheck.result ){
            displayMessage( emailCheck.msg, 'su-email' );
        }

        if( !numCheck.result ){
            displayMessage( numCheck.msg, 'su-cNumber' );
        }


        if( finalResult ){
            const newData = {
                status : {exist: true, loggedIn: true},
                username: username,
                password: password,
                email: email,
                number: number
            }

            requestSignUp( newData );    
        }
        else{
            return
        }
    }

    return(
            <div className="sign-up-frame d-flex flex-row">
                <div className="sign-up-inp-box p-5 text-center" style={{margin: '0% 0% 0% 5%'}}>
                    <FormCard title={{content: 'Sign-up', color: '#ffffff'}}>
                        <div className="my-5 d-flex flex-column justify-content-center align-items-center">
                            <Input id="su-username" type="text" name="username" handleChange={usernameChangeHandler} placeholder="Enter username" size={size}/>
                            <Input id="su-password" type="password" name="password" handleChange={passwordChangeHandler} placeholder="Enter password" size={size}/>
                            <Input id="su-cPassword" type="password" name="password" handleChange={cPasswordChangeHandler} placeholder="Re-enter password" size={size}/>
                            <Input id="su-email" type="email" name="email" handleChange={emailChangeHandler} placeholder="Enter email" size={size}/>
                            <Input id="su-cNumber" type="text" name="cnumber" handleChange={numberChangeHandler} placeholder="Enter contact number" size={size}/>
                        </div>

                        <Button id="signup-submit" name="Sign Up" click={handleRequestSignUp} />
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

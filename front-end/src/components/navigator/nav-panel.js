import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import '../../styles/nav-panel.css';

import ButtonLink from '../buttons/button-link';

export default class NavPanel extends React.Component {

    constructor(props) {
        super( props );

        this.dirs = props.dirs // Directories: list of objects Ex: [{url: 'path', icon: 'path or element', title: 'Hello'}]
        this.logOut = this.logOut.bind( this );
        this.state = {
            loggingOut : false
        }
    }

    createLinks(){
        const dirList = []
        for( let dir of this.dirs ){
            let customDir = <ButtonLink
                                key={'btn-link-'.concat(this.dirs.indexOf(dir).toString())}
                                url={dir.url}
                                icon={dir.icon}
                                title={dir.title}    
                            />
            dirList.push( customDir );
        }
        return dirList;
    }

    async logOut() {
        const config = { headers: {'Content-Type': 'application/json'} };
        await axios.put('http://localhost:7000/admin/log-out', {loggedIn : false}, config)
        .then( ( req ) => {
            if( req.status === 200 ){
                this.setState({
                    loggingOut : true
                })
            }
        })
        .catch( (err) => { console.log( err )});
    }    

    render() {
        if( this.state.loggingOut ){
            return <Redirect to="/admin" />;
        }
        else{
            return (
            
                <div className="nav-panel py-5">
    
                    {/* Profile box */}
                    <div className="np-profile-box d-flex mx-5 flex-row justify-content-start align-items-center">
                        <div className="col-3 np-img-container">
                            {/* insert img tag here later */}
                        </div>
                        <div className="col-10 np-name-container">
                            <h4 className="user-name text-truncate m-0">
                                Steven Charles Palabyab
                            </h4>
                        </div>
                    </div>
    
                    <hr className="np-divider my-4 mx-5"/>
    
                    {/* Navigation panel links */}
                    <div className="np-link-box d-flex flex-column align-items-end">
                        { this.createLinks() }
                    </div>
    
                    <hr className="np-divider mx-5"/>
    
                    {/* Log out button */}
                    <div className="np-logout-box mx-5 d-flex justify-content-center align-items-center">
                        <div className="np-logout-container d-flex flex-row">
                            {/* Insert leave icon here */}
                            <button className="np-logout-btn" onClick={this.logOut}>Log out</button>
                        </div>
                    </div>
    
                </div>
            );
        }
        
    }
}
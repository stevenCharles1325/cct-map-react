import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import ButtonLink from '../buttons/button-link';

import '../../styles/nav-panel.css';
import menuImg from '../../images/menu.png';

export default class NavPanel extends React.Component {

    constructor(props) {
        super( props );

        this.dirs = props.dirs // Directories: list of objects Ex: [{url: 'path', icon: 'path or element', title: 'Hello'}]
        this.logOut = this.logOut.bind( this );
        this.state = {
            isOpen: false,
            loggingOut : false,
            username : null
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

    open() {
        this.setState({
            isOpen: true,
            loggingOut: this.state.loggingOut,
            username: this.state.username
        });
    }

    close() {
        this.setState({
            isOpen: false,
            loggingOut: this.state.loggingOut,
            username: this.state.username
        });
    }

    componentDidMount(){
        const menuBtn = document.querySelector('#menu-btn');
        menuBtn.addEventListener('click', () => this.state.isOpen ? this.close() : this.open());

        axios.get('http://localhost:7000/admin')
        .then( res => {
            this.setState({
                isOpen: this.state.isOpen,
                loggingOut: this.state.loggingOut,
                username: res.data.username
            })
        })
    }

    render() {
        if( this.state.loggingOut ){
            return <Redirect to="/admin" />;
        }
        else{
            return (
            
                <div className={this.state.isOpen ? "nav-panel p-0 d-flex flex-row" : "nav-panel p-0 "} style={{width: this.state.isOpen ? '30vw' : '5vw', marginRight: this.state.isOpen ? '0px' : '3%'}}>
                    <div className="np-menu-bar p-3 mt-3 d-flex justify-content-center">
                        <img style={{width: '41px', height: '43px', transform: this.state.isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'}} id="menu-btn" src={menuImg}/>
                    </div>
                    <div style={{visibility: this.state.isOpen ? 'visible' : 'hidden', width: this.state.isOpen ? '100%' : '0%'}} className="np-content p-0 py-5">
                        {/* Profile box */}
                        <div className="np-profile-box d-flex mx-5 flex-row justify-content-start align-items-center">
                            <div style={{width: '64px', height: '64px'}} className="col-3 d-flex justify-content-end align-items-start">
                                <div className="col-3 np-img-container" style={{width: this.state.isOpen ? '64px' : '15px', height: this.state.isOpen ? '64px' : '15px'}}>
                                    {/* insert img tag here later */}
                                </div>
                            </div>
                            <div className="col-10 np-name-container" >
                                <h4 className="user-name text-truncate m-0">
                                    { this.state.username }
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
                </div>
            );
        }
        
    }
}
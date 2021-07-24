import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/button-link.css';

export default class ButtonLink extends React.Component{

    constructor( props ){
        super( props );

        this.id = props.id;
        this.title = props.title || props.id;
        this.url = props.url;
        this.icon = props.icon;

    }

    setClassName( isActive ) {
        return `btn-link my-2 d-flex justify-content-center align-items-center ${ isActive ? 'btn-link-active' : ''}`;
    }

    render() {
        return(
            <Link to={this.url}  className={ this.setClassName( document.location.pathname === this.url ) }>                  
                <div className="btn-link-icon-box">
                    {/* insert link icon here */}
                    { this.icon || null }
                </div>
                <div className="btn-link-title-box">
                    <h5 className="btn-link-title m-0">
                        { this.title }
                    </h5>
                </div>
            </Link>
        );
    }

}
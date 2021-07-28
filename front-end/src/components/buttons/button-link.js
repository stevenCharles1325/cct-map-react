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

        this.state = {
            active: document.location.pathname === ('/admin' + this.url)
        };
    }

    setClassName( active ) {
        return `btn-link my-2 d-flex justify-content-center align-items-center ${ active ? 'btn-link-active' : ''}`;
    }

    componentDidMount(){

        window.addEventListener('click', () => {
            console.log('heey')
            this.setState({
                active: document.location.pathname === ('/admin' + this.url)
            });
        })
    }

    render() {
        return(
            <Link id={this.id} to={this.url}  className={ this.setClassName( this.state.active ) }>                  
                <div className="btn-link-icon-box d-flex align-items-center">
                    {/* insert link icon here */}
                    <img style={{filter: !this.state.active ? 'invert(1)' : 'none'}} width="100%" height="100%" src={this.icon}/>
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
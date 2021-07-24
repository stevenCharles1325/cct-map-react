import React from 'react';
import '../../styles/button.css';

export default class Button extends React.Component{

    constructor( props ){
        super( props );

        this.disabled = props.disabled;
        this.name = props.name;
        this.type = props.type || '';
        this.onClick = props.onClick;
        this.id = props.id;
    }

    render() {
        return <button id={this.id} disabled={this.disabled} className="btn" type={this.type} onClick={this.onClick || null}> { this.name } </button>
    }
}
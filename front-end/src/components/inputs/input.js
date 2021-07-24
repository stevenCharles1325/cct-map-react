import React from 'react';
import '../../styles/input.css';

export default class Input extends React.Component{

    constructor( props ){
        super( props );
        
        this.size = props.size;

        this.id = props.id;
        this.name = props.name;
        this.type = props.type;
        this.placeholder = props.placeholder;
    }

    render(){
        return(
            <div style={{width: this.size.width, height: this.size.height || '45px'}} id={this.id.concat('-box')} className="input-bar">
                <div id={this.id.concat('-msg-box')} className="input-cover d-flex justify-content-center align-items-center text-center"> 
                    <p id={this.id.concat('-msg')} className="input-msg p-0 m-0">
                        {/* Message will be prompted here */}
                    </p> 
                </div>
                <input className="input-field" id={this.id} type={this.type} name={this.name} placeholder={this.placeholder} required></input>
            </div>
        ); 
    }

}


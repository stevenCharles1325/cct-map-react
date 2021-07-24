import React from 'react';
import '../../styles/form-card.css'

export default class FormCard extends React.Component{

    constructor( props ){
        super( props );

        this.props = props;

        this.title = this.props.title;
        this.action = this.props.action;

        this.method = 'POST';
    }

    render() {
        return(
            <form method={this.method} onSubmit={this.action} className="form-card text-center" >

                {/* Form Title */}
                <div className="form-title">
                    <h1 style={{color: this.title.color}}>{this.title.content.toUpperCase()}</h1>
                </div>

                { this.props.children }
             </form>
        );
    }
}

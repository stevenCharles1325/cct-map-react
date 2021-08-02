import React from 'react';
import '../../styles/form-card.css'

export default function FormCard( props ){

    return(
        <div className="form-card text-center" >

            {/* Form Title */}
            <div className="form-title">
                <h1 style={{color: props.title.color}}>{props.title.content.toUpperCase()}</h1>
            </div>

            { props.children }
         </div>
    );
}

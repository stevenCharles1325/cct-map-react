import React from 'react';
import '../../../styles/admin/input.css';





function Input( props ){

    const size = props.size || { width: '100%' }

    return(
        <div style={{width: size.width, height: size.height || '45px'}} id={props.id.concat('-box')} className="input-bar">
            <div id={props.id.concat('-msg-box')} className="input-cover d-flex justify-content-center align-items-center text-center"> 
                <p id={props.id.concat('-msg')} className="input-msg p-0 m-0">
                    {/* Message will be prompted here */}
                </p> 
            </div>
            <input 
                className="input-field" 
                
                style={{width: props.peekBtn ? '90%' : '100%'}} 
                
                id={props.id} 

                type={props.type} 
                
                name={props.name || null} 
                
                placeholder={props.placeholder || null} 
                
                onChange={props.handleChange} 
                
                defaultValue={props.value} 
                
                required
            />
            { props.peekBtn || null }
        </div>
    ); 
}


function displayMessage( msg, id ){
    const DECAY_TIME = 2000;

    const cover = document.querySelector(`#${id.concat('-msg-box')}`);
    const message = document.querySelector(`#${id.concat('-msg')}`);

    cover.style.width = '100%';
    message.innerHTML = msg;

    setTimeout( () => {

        cover.style.width = '0%';
        message.innerHTML = '';

    }, DECAY_TIME );
}

export { Input, displayMessage };
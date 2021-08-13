import React from 'react';
import '../../styles/button.css';

export default function Button( props ){

    return <button id={props.id} disabled={props.disabled || false} style={ props.style ?? null } className={ props.classname ?? "btn"} type={props.type} onClick={props.click || null}> { props.name } </button>
}
import React from 'react';
import '../../../styles/admin/button.css';

export default function Button( props ){

    const handleClick = (e) => {
        e.stopPropagation();

        props?.click?.();
    }

    return <button id={props.id} disabled={props.disabled || false} style={ props.style ?? null } className={ props.classname ?? "btn"} type={props.type} onClick={handleClick}> { props.name } </button>
}
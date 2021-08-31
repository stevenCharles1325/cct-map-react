import React, { useEffect } from 'react';
import '../../../styles/admin/button.css';

export default function Button( props ){

    const handleClick = (e) => {
        e.stopPropagation();

        props?.click?.();
    }

    const handleKeyEnter = (e) => {
        if( !props.listenTo ) return;

        if( e.key === props.listenTo ) handleClick(e);
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyEnter);

        return () => window.removeEventListener('keydown', handleKeyEnter);
    }, []);

    return <button id={props.id} disabled={props.disabled || false} style={ props.style ?? null } className={ props.classname ?? "btn"} type={props.type} onClick={handleClick}> { props.name } </button>
}
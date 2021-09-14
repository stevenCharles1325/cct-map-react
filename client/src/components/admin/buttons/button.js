import React, { useEffect } from 'react';
import '../../../styles/admin/button.css';

export default function Button( props ){
    const name = props?.name?.split?.('');


    const handleClick = (e) => {
        e.stopPropagation();

        props?.click?.();
        console.log('went here');
    }

    const handleKeyEnter = (e) => {
        if( !props.listenTo && !props.shortcutKey ) return;

        if( e.key === props.listenTo ) handleClick(e);
        if( e.key === name.slice(0, 1).join('').toLowerCase() ) handleClick(e);
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyEnter);

        return () => window.removeEventListener('keydown', handleKeyEnter);
    }, []);

    return(
        <button 
            id={ props.id} 
            disabled={ props.disabled || false} 
            style={ props.style ?? null } 
            className={ props.classname ?? "btn" } 
            type={ props.type } 
            onClick={ handleClick }
        > 
            { 
                props?.shortcutKey 
                    ? (<>
                            <u>{ name.slice(0, 1).join('') }</u>
                            { name.slice(1, name.length).join('') }
                        </>)
                    : name
            }              
        </button>
    );
}
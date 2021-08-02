import React, { useState, useEffect, useRef } from 'react';

import saveImg from '../../images/download.png';
import updateImg from '../../images/update-arrows.png';
import importImg from '../../images/import.png';
import prevImg from '../../images/preview.png';

import '../../styles/map-menu.css';


function MapMenu( props ){
    const menu = useRef( null );
    const [isOpen, setIsOpen ] = useState( false );

    const requestOpenMapMenu = () => {
        setIsOpen( true );
    }

    const requestCloseMapMenu = () => {
        setIsOpen( false );
    }

    const saveHandler = () => {

    }

    const updateHandler = () => {
        
    }

    const importHandler = () => {
        
    }

    const previewHandler = () => {
        
    }

    useEffect(() => {
        if( menu && menu.current ){
            menu.current.onmouseover = requestOpenMapMenu;
            menu.current.onmouseout = requestCloseMapMenu;
        }
        
        return () => {
            if( menu && menu.current ){
                menu.current.onmouseover = null;
                menu.current.onmouseout = null;    
            }
        }
    });


    return (
        <div ref={menu} style={{opacity: isOpen ? '1' : '0.7'}} className="map-menu d-flex flex-column align-items-center justify-content-center">
            <div className="mm-icon-box mb-3 d-flex justify-content-center">
                <div className="mm-icon-cont pb-2">
                    <img src={props.icon || null}/>
                </div>
            </div>

            <div className="mm-btns-box d-flex flex-column align-items-center">
                {[
                    createButton('mm-save-btn', saveImg, saveHandler),
                    createButton('mm-update-btn', updateImg, updateHandler),
                    createButton('mm-import-btn', importImg, importHandler),
                    createButton('mm-preview-btn', prevImg, previewHandler)
                ]}
            </div>
        </div>
    );
}

function createButton( id, icon, callback ){
    return(
        <div key={id} id={id} className="mm-btn-cont p-3 my-3 d-flex justify-content-center align-items-center">
            <div width="150px" height="50px" className="d-flex justify-content-center align-items-center">
                <img className="mm-btn-icon" width="70%" height="70%" src={icon} onClick={() => {
                    callback()
                }}/>
            </div>
        </div>
    );
}

export default MapMenu;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import saveImg from '../../images/download.png';
import updateImg from '../../images/update-arrows.png';
import importImg from '../../images/import.png';
import prevImg from '../../images/preview.png';

import '../../styles/map-menu.css';


function MapMenu( props ){
    const menu = useRef( null );

    const [isOpen, setIsOpen] = useState( false ); // open and close state of menu
    const [importBox, setImpotBox] = useState( null ); // Sets up import box 


    // -----------------------------------------
    // 
    //        Menu change opacity requests         
    // 
    // -----------------------------------------
        const requestOpenMapMenu = () => {
            setIsOpen( true );
        }

        const requestCloseMapMenu = () => {
            setIsOpen( false );
        }
    // -----------------------------------------



    // ==========================================



    //-------------------------------------------
    // 
    //          Menu event handlers
    // 
    // ------------------------------------------

        // Main menu handlers 
        const saveHandler = () => {
            console.log('clicked Save button');
        }

        const updateHandler = () => {
            console.log('clicked Update button');
            
        }

        const closeImportBox = () => {
            setImpotBox(null);
        }

        const openImportBox = () => {
            setImpotBox(<ImportBox 
                            onClose={closeImportBox}
                            reqSubmit={props.reqSetUpload}
                        />);
        }

        const previewHandler = () => {
            console.log('clicked Preview button');
        }
    // -----------------------------------------

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
        <>
            <div ref={menu} style={{opacity: isOpen ? '1' : '0.1'}} className="map-menu d-flex flex-column align-items-center justify-content-center">
                <div className="mm-icon-box mb-3 d-flex justify-content-center">
                    <div className="mm-icon-cont pb-2">
                        <img src={props.icon || null}/>
                    </div>
                </div>

                <div className="mm-btns-box d-flex flex-column align-items-center">
                    {[
                        createButton('mm-save-btn', saveImg, saveHandler),
                        createButton('mm-update-btn', updateImg, updateHandler),
                        createButton('mm-import-btn', importImg, openImportBox),
                        createButton('mm-preview-btn', prevImg, previewHandler)
                    ]}
                </div>
            </div>

            { importBox }
        </>
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



function ImportBox( props ){

    const [file, setFile] = useState( null );
    const [filename, setFilename] = useState('Click to upload 3D object!');

    const selectFileHandler = (e) => {
            setFile(e.target.files[0]);
            setFilename(e.target.files[0].name);
        }


    const uploadSubmitHandler = async (e) => {
            e.preventDefault();

            const formData = new FormData();

            formData.append('object', file);

            await axios.post('http://localhost:7000/admin/obj-upload', formData, {
                headers: {
                    'Content-Type': 'text/plain'
                }
            })
            .then( res => {
                const { fileName, filePath } = res.data;
                props.reqSubmit( {fileName, filePath} );
                props.onClose();
            })
            .catch( err => {
                if ( err ){
                    console.log( err );
                }
            });
        }

    return (
        <div className="import-box d-flex flex-column p-3 align-items-center justify-content-around">
            <div className="container-fluid d-flex flex-row-reverse mb-2">
                <button style={{width: '20px', height: '20px'}} className="btn btn-danger" style={{color: 'rgba(0, 0, 0, 0.8)'}} onClick={props.onClose} >close</button>
            </div>
            <h4 className="ib-title">Wanna upload your 3D object?</h4>    
            <form onSubmit={uploadSubmitHandler} style={{width: '80%', height:'250px', borderRadius: '5px'}} className="d-flex flex-column justify-content-around align-items-center">
                <div className="ib-form-box">
                    <input className="ib-input" type="file" accept=".obj" lang="es" onChange={ selectFileHandler } />
                    <label className="ib-label">{ filename }</label>
                </div>
                <button type="submit" style={{color: 'rgba(0, 0, 0, 0.4)'}} className="btn btn-block btn-success">Upload this object</button>    
            </form>
        </div>
    );
}


export default MapMenu;
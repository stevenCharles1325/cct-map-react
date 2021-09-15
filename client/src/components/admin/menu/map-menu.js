import React, { useState, useEffect, useRef, Suspense } from 'react';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';

import ImageBall from '../image/image-ball';

import CircStyleLoad from '../load-bar/circ-load';

import saveImg from '../../../images/admin/download.png';
import importImg from '../../../images/admin/import.png';
import prevImg from '../../../images/admin/preview.png';

import '../../../styles/admin/map-menu.css';


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


    //-------------------------------------------
    // 
    //          Menu event handlers
    // 
    // ------------------------------------------

        // Main menu handlers 
        const saveHandler = async () => {
            if( props.saveAllowed ){ 
                props.messenger((mapMessage) => [...mapMessage, 'A checkpoint with no name has been found']);
            }
            else{
                props.messenger((mapMessage) => [...mapMessage, 'Saving Map, please wait...']);                
            }
            
            setTimeout(() => {
                props.reqSaveMap();            
            }, 3000);
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

    const saveShortcut = (e) => {
        if( e.ctrlKey && e.key === "s" ){
            e.stopPropagation(); 
            saveHandler();
        };
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
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', saveShortcut);
        
        return () => document.removeEventListener('keydown', saveShortcut);
    }, []);


    return (
        <>
            <div ref={menu} style={{opacity: isOpen ? '1' : '0.1'}} className="map-menu d-flex flex-column align-items-center justify-content-center">
                <div className="mm-icon-box mb-3 d-flex justify-content-center">
                    <div className="mm-icon-cont mb-2">
                        <ImageBall />
                    </div>
                </div>

                <div className="mm-btns-box d-flex flex-column align-items-center">
                    <ReactTooltip />

                    {[
                        createButton('mm-save-btn', 'Save',saveImg, props.switch ? saveHandler : () => { 
                            props.messenger((mapMessage) => [...mapMessage, 'Unselect an object first']);
                        }),
                        createButton('mm-import-btn', 'Import object',importImg, props.switch ? openImportBox : () => { 
                            props.messenger((mapMessage) => [...mapMessage, 'Unselect an object first']);
                        }),
                        createButton('mm-preview-btn', 'Preview',prevImg, props.switch ? previewHandler : () => { 
                            props.messenger((mapMessage) => [...mapMessage, 'Unselect an object first']);
                        })
                    ]}
                </div>
            </div>
            <Suspense fallback={<CircStyleLoad/>}>
                { importBox }
            </Suspense>
        </>
    );
}



function createButton( id, tipMsg, icon, callback ){
    return(
        <div 
            key={id} 
            id={id} 
            className="mm-btn-cont p-3 my-3 d-flex justify-content-center align-items-center"
        >
            <div width="150px" height="50px" className="d-flex justify-content-center align-items-center">
                <img 
                    className="mm-btn-icon" 
                    data-tip={tipMsg}
                    data-type="light"
                    data-effect="solid" 
                    width="70%" 
                    height="70%" 
                    src={icon} 
                    onClick={() => callback()}
                />
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

            await axios.post('/admin/obj-upload', formData, {
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
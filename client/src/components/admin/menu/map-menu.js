import React, { useState, useEffect, useRef, Suspense } from 'react';
import ReactTooltip from 'react-tooltip';
import Cookies from 'js-cookie';
import axios from 'axios';

import ImageBall from '../image/image-ball';

import CircStyleLoad from '../load-bar/circ-load';

import saveImg from '../../../images/admin/download.png';
import importImg from '../../../images/admin/import.png';
import prevImg from '../../../images/admin/preview.png';

import gizmoViewHelper from '../../../images/admin/gizmoViewHelper.PNG';
import leftPanel from '../../../images/admin/left-panel.PNG';
import toolBox from '../../../images/admin/tool-box.PNG';
import controlButtons from '../../../images/admin/control-buttons.PNG';
import placeCpButton from '../../../images/admin/place-cp-button.PNG';

import '../../../styles/admin/map-menu.css';


import CustomErrorHandler from '../../../modules/customErrorHandler';


const ErrorHandler = new CustomErrorHandler( 5, 5000 );


function MapMenu( props ){
    const menu = useRef( null );

    const [isOpen, setIsOpen] = useState( false ); // open and close state of menu
    const [importBox, setImpotBox] = useState( null ); // Sets up import box
    const [saving, setSaving] = useState( false ); 
    const [isManual, setIsManual] = useState( false );

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
    const saveHandler = async () => props.reqSaveMap();

    const closeImportBox = () => {
        setImpotBox(null);
    }

    const openImportBox = () => {
        setImpotBox(
            <ImportBox 
                onClose={closeImportBox}
                reqSubmit={props.reqSetUpload}
            />
        );
    }

    const manualHandler = () => setIsManual(isManual => !isManual);    
    
    // -----------------------------------------

    const saveShortcut = (e) => {
        if( e.ctrlKey ){
            e.preventDefault(); 
            
            if( e.key === "s" ){
                setSaving( true );

                setTimeout(() => setSaving( false ), 1000);
            }
        }
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
        document.addEventListener('keydown', e => saveShortcut(e));
        
        return () => document.removeEventListener('keydown', e => saveShortcut(e));
    }, []);

    useEffect(() => {
        if( saving ) setTimeout(() => saveHandler(), 1000);
    }, [saving]);


    useEffect(() => {
        if( isManual ){
            props?.setManual?.(() => <Manual setIsManual={setIsManual}/>);
        }
        else{
            props?.setManual?.(() => null);
        }
    }, [isManual]);

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
                        createButton('mm-save-btn', 'Save', saveImg, props.switch ? saveHandler : () => { 
                            props.messenger((mapMessage) => [...mapMessage, 'Unselect an object first']);
                        }),
                        createButton('mm-import-btn', 'Import object', importImg, props.switch ? openImportBox : () => { 
                            props.messenger((mapMessage) => [...mapMessage, 'Unselect an object first']);
                        }),
                        createButton('mm-manual-btn', 'Manual', prevImg, props.switch ? manualHandler : () => { 
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
    const [boxMessage, setBoxMessage] = useState('Select file first');

    const selectFileHandler = (e) => {
        setBoxMessage(() => 'Upload this 3d object?');

        setFile(() => e.target?.files?.[0]);
        setFilename(() => e.target?.files?.[0]?.name);
    }


    const uploadSubmitHandler = async (e) => {
        if( boxMessage === 'Uploading 3d object') return;
        
        const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

        e.preventDefault();

        const formData = new FormData();

        if( !file ) return;
        
        setBoxMessage(() => 'Uploading 3d object');

        formData.append('object', file);

        await axios.post(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin/obj-upload`, formData, {
            headers: {
                'Content-Type': 'text/plain',
                'authentication': `Bearer ${token}`
            }
        })
        .then( res => {
            const { fileName, filePath } = res.data;

            props.reqSubmit( {fileName, filePath} );
            props.onClose();
        })
        .catch( err => {
            ErrorHandler.handle( err, uploadSubmitHandler, 13, e );

            if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)
                    setTimeout(() => uploadSubmitHandler(e), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
        });
    }

    useEffect(() => {
        if( !filename ) {
            setFilename('Click to upload 3D object!');
            setBoxMessage('Select file first');
        }

    }, [filename]);

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
                <button type="submit" style={{color: 'rgba(0, 0, 0, 0.4)'}} className="btn btn-block btn-success"> { boxMessage } </button>    
            </form>
        </div>
    );
}


const Manual = ( props ) => {
    const pStyle = {
        textAlign: 'justify'
    }

    return(
        <div 
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '500px', 
                height: '65%', 
                backgroundColor: 'white',
                transition: '0.5s ease-in-out'
            }}

            className="px-3 py-3 d-flex flex-column justify-content-around align-items-center"
        >
            <div style={{height: '10%'}} className="text-center">
                <h1 style={{letterSpacing: '2px'}}>MANUAL</h1>
            </div>
            <div 
                className="px-3 pt-5 rounded" 
                style={{
                    overflowY: 'auto', 
                    height: '75%', 
                    lineHeight: '2',
                    backgroundColor: '#30336b',
                    color: 'rgba(255, 255, 255, 0.6)'
                }}
            >   
                <ManualContent 
                    title="HOW TO USE❔"
                    pStyle={pStyle}
                >
                    {
                        `Welcome to the manual of the cct-map admin app.
                        As an admin you are bound to manage the data 
                        inside the cct-map application, thus we have 
                        provided you some functionalities that are
                        essential to provide a good map to our beneficiaries.`
                    }
                </ManualContent>
                <p style={pStyle}>
                    Before we start I would like to mention a very important
                    matter in this application. We have formulated an idea
                    of a checkpoint. A <u>Checkpoint</u> serves as a node in a graph.
                    Since this application is a dynamic one, but does not offer you
                    to edit the mesh of each 3d object, it is very inconvenient to
                    switch application each time you need to put a navigation mesh
                    for the path-finding algorithm, therefore we have thought of
                    devising an algorithm that allows you to say that a certain point
                    in this 3d world is searchable by the users. Checkpoint has
                    few properties like name, and position. Checkpoint's name is
                    very important, since checkpoint serves as the location of a
                    certain room or any place inside the map, it is required that
                    you think the name thoroughly. On top of that, there is a special
                    case when naming a checkpoint. When you name a checkpoint you
                    can use the keyword "<u>CONNECTOR</u>". A Connector can connect to
                    another connector or a non-connector checkpoint, thus allows us
                    to travel each node and its neighbors. A non-connector checkpoint
                    is automatically connected to the nearest Connector. It is very 
                    important to name the CONNECTOR with a unique number at the end of it. 
                    For example: 
                </p>
                <div 
                    style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}} 
                    className="p-3 rounded d-flex flex-column justify-content-around align-items-center"
                >
                    <b style={{color: '#82ccdd'}}>CONNECTOR1-[3]</b>
                    <b style={{color: '#82ccdd'}}>CONNECTOR2</b>
                    <b style={{color: '#82ccdd'}}>CONNECTOR3</b>
                    <b style={{color: '#82ccdd'}}>CONNECTOR4-[2]</b>    
                </div>
                <br/>
                <p style={pStyle}>
                    As you can see, connectors have their unique identifier, but what is
                    that "-[3]"? That is what we called connector-neighbor-dependency-list;
                    This list connects the connector with another connector with the same
                    identifier as what the list indicates, so connector1 is connected to 
                    connector3, thus connector3 is automatically connected to connector1.
                </p>
                <br/>
                <div 
                    style={{
                        backgroundColor: '#ff7979', 
                        width: '100%', 
                        height: 'fit-content'
                    }}

                    className="py-2 px-3 rounded"
                >
                    <b style={{color: 'rgba(0, 0, 0, 0.9)'}}>NOTICE❗️</b>
                    <p style={{color: 'rgba(0, 0, 0, 0.9)'}}>
                        Please keep in mind that all checkpoints are not visible in the user-side,
                        connector only accepts number as an identifier, and dependency-list must
                        only contains the number identifier of another connector.
                        <br/>
                        <br/>
                        For naming a <b>CONNECTOR</b> please follow this format:
                        <code> connectorID-[ID, ID, ...] </code> 
                    </p>  
                </div>
                <br/>
                <h3 className="pb-3" style={{color: '#dff9fb'}}>LET'S GET STARTED!</h3>
                <br/>
                <br/>
                <ManualContent 
                    image={gizmoViewHelper}
                    title="GIZMO VIEW HELPER"
                    pStyle={pStyle}
                >
                    {
                        `The first thing that you should know is about the GIZMO VIEW HELPER.
                        It shows the different axes of the plane or the land. It is also interactive
                        so you can click each axis and it will rotate accordingly. The dots which have
                        no labels are the negatives.`
                    }
                </ManualContent>

                <ManualContent 
                    image={leftPanel}
                    title="LEFT PANEL"
                    pStyle={pStyle}
                >
                    {
                        `The left panel has 3 icon buttons, they are the save, import, and manual buttons.
                        The save button allows you to save the scene. The import button allows you to import
                        a 3D object, but please keep in mind that as of this moment this application only
                        accepts files with .obj file extension. The last button on the left panel is the
                        manual button which shows you the guide on how to use this side of the application.`
                    }
                </ManualContent>

                {/*<ManualContent 
                    image={toolBox}
                    title="TOOL BOX"
                    pStyle={pStyle}
                >
                    {
                        `The tool box shows 2 different tools. The first one is the measure-line. Measure-line
                        measures the distance between 2 points, just click the first point and drag the cursor
                        to the second point you wish to measure the distance with. The measure line also disables
                        the control for a moment until you disable the measure-line itself. The second and the last
                        one is the Position-cursor. Position-cursor allows you to identify the exact coordinates of
                        a point by just using the cursor.`
                    }
                </ManualContent>*/}

                <ManualContent 
                    image={controlButtons}
                    title="CONTROL SWITCH"
                    pStyle={pStyle}
                >
                    {
                        `The Control-switch makes it easy to switch between two controls. The left side says "FREE"
                        which allows you to use the first-person-control, just like FPS games. The right side says
                        "ORBIT" which allows you to use Orbit-control that lets you orbit the land.`
                    }
                </ManualContent>

                <ManualContent 
                    image={placeCpButton}
                    title="PLACE CHECKPOINT"
                    pStyle={pStyle}
                >
                    {
                        `Place-checkpoint is a button that generates a single checkpoint. When you press this button
                        a single checkpoint must follow your cursor, but only when the cursor is inside the land or
                        the canvas.`
                    }
                </ManualContent>
                <h3 style={{textAlign: 'center', color: '#dff9fb'}}>THANK YOU FOR READING! 🎉</h3>
                <br/>
            </div>
            <div style={{height: '10%'}} className="d-flex justify-content-center align-items-center">
                <button 
                    onClick={() => props?.setIsManual( false )} 
                    style={{color: 'black'}} 
                    className="btn btn-dark"
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
}


const ManualContent = ( props ) => {
    return(
        <>
            <h5 style={{color: '#badc58'}}> { props.title } </h5>
            <div 
                style={{width: '100%'}}
                className="d-flex justify-content-center align-items-center"
            >
                { 
                    props.image 
                        ? <img 
                            style={{
                                width: 'auto',
                                height: 'auto',
                                imageRendering: 'pixelated',
                                backgroundSize: 'contain',
                                borderRadius: '20px',
                                border: '2px solid white'
                            }} 
                            src={props.image} 
                            alt={props.title}
                        /> 
                        : null 
                }
            </div>
            <p style={props.pStyle}>
                { props.children }
            </p>
            <br/>
            <br/>
        </>
    );
}


export default MapMenu;
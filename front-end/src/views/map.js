import React, { useState, useEffect, useRef, Suspense } from 'react';

import { 
    Stars,
    Html, 
    useProgress,
    SpotLight
} from '@react-three/drei';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three';

import MapMenu from '../components/menu/map-menu';
import { Input } from '../components/inputs/input';
import Button from '../components/buttons/button';


import '../styles/map.css';


// DIY dev tools [Delete on production]
import MapDevTools from '../modules/map-other-dev-tools';


// DIY wrapper function for three first-person-controls
import FirstPersonContols from '../modules/FirstPersonControls';

const devTools = new MapDevTools();

const LAND_SIZE = [5000, 5000];
const CAMERA = {
    position: [0, 2500, -2500],
    far: 10000
}



function MapView( props ){
    const [objectList, setObjectList] = useState( [] );
    const landRef = useRef();


    // ------------------------------------------
    // 
    //              Upload request
    // 
    // ------------------------------------------
        const [upload, setUpload] = useState( null );

        const requestSetUpload = ( object_data ) => {
            setUpload( object_data );
        }


        useEffect(() => {

            if( upload ){
                setObjectList([ ...objectList, <Imported  file={upload} reqOpenPropBox={reqOpenPropBox} reqClosePropBox={reqClosePropBox} />]);
                setUpload( null );    
            }
            
        }, [upload]);
    // -------------------------------------------



    // -------------------------------------------
    // 
    //         Request object property box
    // 
    // -------------------------------------------
        const [propBox, setPropBox] = useState( null );    
        
        const reqOpenPropBox = (properties) => {
            setPropBox( <ObjectPropertyBox properties={properties} handleClose={reqClosePropBox}/> );
        }

        const reqClosePropBox = () => {
            setPropBox( propBox.splice(0, propBox.indexOf) );
        }

    // -------------------------------------------

    return (
        <div className="map">
            <MapMenu reqSetUpload={requestSetUpload} />
            <Canvas camera={{position: CAMERA.position, far: CAMERA.far}}>
                <Suspense fallback={<Loader />}>
                    <MapEssentials />
                    <Land ref={landRef} size={LAND_SIZE}/>
                </Suspense>

                <Suspense fallback={<Loader />}>
                    { objectList }
                </Suspense>
            </Canvas>
            { propBox }
        </div>
    );
}





// ------------------------------------------------
// 
//                Simple loading
// 
// ------------------------------------------------
    function Loader() {
        return <Html center> LOADING... </Html>
    }
// ------------------------------------------------



// ================================================



// ------------------------------------------------
// 
//                 MAP IMPORT HANDLER
// 
// ------------------------------------------------
    function Imported( props ) {
        const openPropBox = props.reqOpenPropBox;
        const closePropBox = props.reqClosePropBox;

        const imported_object = useLoader( OBJLoader, props.file.filePath );
        const objRef = useRef();
        const [isSelected, setIsSelected] = useState( false );

        const reqSelectObject = (e) => {
            setIsSelected( !isSelected );
        }

        useFrame(() => {
            if( isSelected ){
                objRef.current.material.color.set(0x55efc4);
                objRef.current.material.opacity = 0.5;
                objRef.current.material.transparent = true;

                openPropBox( objRef.current );
                devTools.log(objRef, {logCount: 1});
            }
            else{
                objRef.current.material.color.set('white');
                objRef.current.material.opacity = 1;
                objRef.current.material.transparent = false;

                closePropBox();
            }
        });

        return (
            <>
                {imported_object.children.map( child => (
                    <mesh 
                        ref={objRef} 
                        onClick={reqSelectObject} 
                        receiveShadow 
                        castShadow 
                        key={`${props.file.fileName}_${imported_object.children.indexOf( child )}`} 
                        scale={50} 
                        geometry={child.geometry}
                    >
                        <meshStandardMaterial color="white" metalness={0.3} roughness={0.5}/>
                    </mesh>
                    )
                )}
            </>
        );
    }
// ------------------------------------------------



// ================================================



// ------------------------------------------------
// 
//              3D object property box
// 
// ------------------------------------------------
    function ObjectPropertyBox( props ){
        const properties = props.properties;

        const inputSize = {width: '90%', height: '50px'};


        // ---------------------------
        // 
        //      Change object Scale
        // 
        // ---------------------------
            const reqEditScaleX = (e) => {
                properties.scale.x = e.target.value;
            }

            const reqEditScaleY = (e) => {
                properties.scale.y = e.target.value;
            }

            const reqEditScaleZ = (e) => {
                properties.scale.z = e.target.value;
            }
        // ---------------------------



        // ---------------------------
        // 
        //      Change object Scale
        // 
        // ---------------------------
            const reqEditPosX = (e) => {
                properties.position.x = e.target.value;
            }

            const reqEditPosY = (e) => {
                properties.position.y = e.target.value;
            }

            const reqEditPosZ = (e) => {
                properties.position.z = e.target.value;
            }
        // ---------------------------





        // ---------------------------
        // 
        //      Change object Scale
        // 
        // ---------------------------
            const reqEditRotX = (e) => {
                properties.rotation.x = e.target.value;
            }

            const reqEditRotY = (e) => {
                properties.rotation.y = e.target.value;
            }

            const reqEditRotZ = (e) => {
                properties.rotation.z = e.target.value;
            }
        // ---------------------------



        return(
            <div className="obj-prop-box d-flex flex-column justify-content-around align-items-center p-3">
                <div style={{height: '8%'}} className="container-fluid d-flex flex-row-reverse pr-2 mb-2">
                    <Button name="close" click={props.handleClose}/>
                </div>
                <div  style={{height: '10%'}} style={{height: '50px'}}  className="text-center">
                    <h2>Properties</h2>
                </div>
                <div  style={{height: '82%'}} className="obj-props d-flex flex-column justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Scale X</p>
                        <Input id="op-width-inp" size={inputSize} type="number" value={properties.scale.x} handleChange={reqEditScaleX}/>                    
                    </div>

                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Scale Y</p>
                        <Input id="op-height-inp" size={inputSize} type="number" value={properties.scale.y} handleChange={reqEditScaleY}/>           
                    </div>

                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Scale Z</p>
                        <Input id="op-depth-inp" size={inputSize} type="number" value={properties.scale.z} handleChange={reqEditScaleZ}/>           
                    </div>

                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Position X</p>
                        <Input id="op-posX-inp" size={inputSize} type="number" value={properties.position.x} handleChange={reqEditPosX}/>           
                    </div>
                    
                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Position Y</p>
                        <Input id="op-posY-inp" size={inputSize} type="number" value={properties.position.y} handleChange={reqEditPosY}/>           
                    </div>

                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Position Z</p>
                        <Input id="op-posZ-inp" size={inputSize} type="number" value={properties.position.z} handleChange={reqEditPosZ}/>           
                    </div>
                    
                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Rotation X</p>
                        <Input id="op-rotX-inp" size={inputSize} type="number" value={properties.rotation.x} handleChange={reqEditRotX}/>           
                    </div>
                    
                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Rotation Y</p>
                        <Input id="op-rotY-inp" size={inputSize} type="number" value={properties.rotation.y} handleChange={reqEditRotY}/>           
                    </div>

                    <div className="d-flex flex-column">
                        <p className="p-0 m-0">Rotation Z</p>
                        <Input id="op-rotZ-inp" size={inputSize} type="number" value={properties.rotation.z} handleChange={reqEditRotZ}/>    
                    </div>

                </div>     
            </div>
        );
    }
// ------------------------------------------------



// ================================================



// ------------------------------------------------
// 
//              ESSENTIALS AND LOGICS
// 
// ------------------------------------------------

function MapEssentials( props ){
    const spotLightRef = useRef();

    useEffect(() => {
        if(spotLightRef.current){
            spotLightRef.current.lookAt(0, 0, 0);
        }
    })

    return (
        <>
            <Stars radius={2500} count={10000} fade />
            <FirstPersonContols
                lookSpeed={0.3}
                movementSpeed={550}
            />
            <ambientLight intensity={0.3}/>
            <spotLight ref={spotLightRef} castShadow position={[1000, 5000, 0]}/>
        </>
    );
}


const Land = React.forwardRef(( props, ref ) => {

    return (
        <group receiveShadow>
            <mesh ref={ref} visible rotation={[-Math.PI / 2, 0, 0]} >
                <planeBufferGeometry args={props.size || 1}/>
                <meshStandardMaterial color={props.color || "white"} roughness={0.9} metalness={0.5}/>
            </mesh>
        </group>
    );
});



export default MapView;
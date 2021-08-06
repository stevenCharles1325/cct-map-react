import React, { useState, useEffect, useRef, Suspense } from 'react';

import { 
    OrbitControls,
    Stars,
    Html, 
    useProgress,
    SpotLight
} from '@react-three/drei';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three';

import MapMenu from '../components/menu/map-menu';
import '../styles/map.css';


// Initialize the map
// Create land
// Create import handler
const LAND_SIZE = [5000, 5000];

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
                setObjectList( <Imported  file={upload} /> );
                setUpload( null );    
            }
            
        }, [upload]);
    // -------------------------------------------



    return (
        <div className="map">
            <MapMenu reqSetUpload={requestSetUpload} />
            <Canvas
                camera={{position: [0, 2500, -2500], far: 10000}}

            >
                <Suspense fallback={<Loader />}>
                    <MapEssentials />
                    <Land landRef={landRef} size={[5000, 5000]}/>

                    <Suspense fallback={<Loader />}>
                        { objectList }
                    </Suspense>
                </Suspense>

            </Canvas>
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
        const imported_object = useLoader(OBJLoader, props.file.filePath );

        const reqSetSelected = (e) => {
            console.log( e );
            
        }

        const { objRef, isSelected, setIsSelected, reqClickObj } = useClickHandler(reqSetSelected);

        useFrame(() => {
            
        });

        return (
            <group ref={objRef} onClick={reqClickObj} receiveShadow castShadow>
                {imported_object.children.map( child => (
                    <mesh key={`${props.file.fileName}_${imported_object.children.indexOf( child )}`} scale={50} geometry={child.geometry}>
                        <meshStandardMaterial color="white" metalness={0.3} roughness={0.5}/>
                    </mesh>
                    ) 
                )}
            </group>
        );
    }
// ------------------------------------------------







function Copy( props ){

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
            <OrbitControls/>
            <ambientLight intensity={0.3}/>
            <spotLight ref={spotLightRef} castShadow position={[1000, 5000, 0]}/>
        </>
    );
}


function Land( props ){

    return (
        <group receiveShadow>
            <mesh ref={props.landRef} visible rotation={[-Math.PI / 2, 0, 0]} >
                <planeBufferGeometry args={props.size || 1}/>
                <meshStandardMaterial color={props.color || "white"} roughness={0.9} metalness={0.5}/>
            </mesh>
        </group>
    );
}


function useClickHandler( callback ){
    const objectRef = useRef();
    const [isSelected, setIsSelected] = useState( false );
    
    const reqClickObj = (e) => {
        console.log('Clicked');
        callback(e);
    }

    return { 
        objectRef, 
        isSelected, 
        setIsSelected, 
        reqClickObj
    };
}


export default MapView;
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { 
            OrbitControls,
            Stars,
            Html, 
            useProgress 

        } from '@react-three/drei';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three';

import MapMenu from '../components/menu/map-menu';
import '../styles/map.css';


// Initialize the map
// Create land
// Create import handler


function MapView( props ){
    const [upload, setUpload] = useState( null );
    const [objectList, setObjectList] = useState( [] );

    const requestSetUpload = ( object_data ) => {
        console.log(upload)
        setUpload( object_data );
    }


    useEffect(() => {

        if( upload ){
            console.log( upload );
            setObjectList(
                    <Scene filePath={upload.filePath} />
                );
            setUpload( null );    
        }
        
    }, [upload]);

    return (
        <div className="map">
            <MapMenu reqSetUpload={requestSetUpload} />
            <Canvas
                camera={{position: [0, 2500, -2500], far: 10000}}
            >
                <Suspense fallback={<Loader />}>

                    { console.log(Canvas) }
                    <MapEssentials />
                    <Land size={[5000, 5000]}/>

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
// 
//                 MAP IMPORT HANDLER
// 
// 
// ------------------------------------------------

function Loader() {
    const { progress } = useProgress();
    console.log( progress );
    return <Html center> {progress} % loaded </Html>
}


function Scene( props ) {
    const obj = useLoader(OBJLoader, props.filePath );
    const obj_ref = useRef();

    useEffect(() => {
        if( obj_ref.current ){
            for( let child of obj_ref.current.children ){
                for( let material of child.material ){
                    material = new THREE.MeshStandardMaterial();
                }
            }
        }
    });

    return (
        <primitive ref={obj_ref} object={obj} scale={50} >
            { obj_ref.current ? console.log( obj_ref ) : null }
            <meshStandardMaterial color="black" wireFrame={false}/>
        </primitive>
    );
}



// ================================================



// ------------------------------------------------
// 
// 
//          MAP LAND AND OTHER ESSENTIALS
// 
// 
// ------------------------------------------------

function MapEssentials( props ){
    return (
        <>
            <Stars radius={2500} count={10000} fade />
            <OrbitControls/>
            <ambientLight intensity={0.4}/>
        </>
    );
}


function Land( props ){
    const mesh = useRef();

    return (
        <group>
            <mesh ref={mesh} visible rotation={[-Math.PI / 2, 0, 0]} >
                <planeBufferGeometry receiveShadow args={props.size || 1}/>
                <meshStandardMaterial color={props.color || "white"}/>
            </mesh>
        </group>
    );
}

export default MapView;
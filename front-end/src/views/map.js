import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

import MapMenu from '../components/menu/map-menu';
import '../styles/map.css';


// Initialize the map
// Create land
// Create import handler


function MapView( props ){
    return (
        <div className="map">
            <MapMenu />
            <MapCanvas />
        </div>
    );
}


function MapCanvas( props ){
    return (
        <Canvas
            camera={{position: [0, 2500, -2500], far: 10000}}
        >
            <Stars radius={2500} count={10000} fade />
            <OrbitControls/>
            <ambientLight intensity={0.4}/>

            <Land size={[5000, 5000]}/>
        </Canvas>
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
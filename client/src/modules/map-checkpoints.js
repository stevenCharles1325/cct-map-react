import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import Button from '../components/admin/buttons/button';
import { Input } from '../components/admin/inputs/input';



// Default material and geometry
const materialOptions = {
	color: 0x3f4444,
	roughness: 0.4,
	metalness: 0
}

const geometryOptions = [50, 50, 50];

const defaultMaterial = new THREE.MeshStandardMaterial( materialOptions );
const defaultGeometry = new THREE.SphereGeometry( ...geometryOptions );


function Checkpoints ( props ){

	const [isPlaced, setIsPlaced] = useState( false );
	const checkpoint = useRef();


	const mousePos = new THREE.Vector2();
	const raycaster = new THREE.Raycaster();


	useEffect(() => {
		if(checkpoint.current){
			props.saveCheckpoint(checkpoint.current);
		}

	}, [checkpoint.current]);

	// Mouse movement event listener
	useEffect(() => {
		if( !isPlaced ) window.addEventListener('mousemove', mouseLocation);

		return () => window.removeEventListener('mousemove', mouseLocation);
	}, [isPlaced]);


	useEffect(() => {
		!isPlaced ? window.addEventListener('click', place) : window.removeEventListener('click', place);

		return () => window.removeEventListener('click', place);
	}, [isPlaced]);


	useFrame(() => {
		if( !isPlaced ){
			raycaster.setFromCamera( mousePos, props.camera );
			const intersects = raycaster.intersectObjects( props.scene.children );
			
			if( intersects.length ){
				if( intersects[0].object.id === checkpoint.current.id ){
					intersects.shift();
				}	
										
				if( intersects.length ){
					const { x, y, z } = intersects[0].point;
					checkpoint.current.position.set( x, y + geometryOptions[0], z );
				}
			}
		}
		
	});


	const mouseLocation = (e) => {
		e.stopPropagation();

		mousePos.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
	    mousePos.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;
	}


	const place = (e) => {
		e.stopPropagation();

		setIsPlaced( true );
		handleClick(e);
	}


	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: checkpoint });
	}


	return (
		<mesh 
			name={`checkpoint_${props.index}_`} 
			ref={checkpoint} 
			onDoubleClick={handleClick}
			geometry={defaultGeometry}
			material={defaultMaterial}
		>
		</mesh>
	);
}

function CheckpointGen ( props ){
	const checkpoint = useRef();

	useEffect(() => {
		if(checkpoint.current) props.saveCheckpoint(checkpoint.current);

	}, [checkpoint.current]);


	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: checkpoint });
	}


	return (
		<mesh 
			name={`checkpoint_${props.index}_${props.name}`} 
			position={props.position}
			ref={checkpoint} 
			onDoubleClick={handleClick}
			geometry={defaultGeometry}
			material={defaultMaterial}
		>
		</mesh>
	);
}




export { Checkpoints, CheckpointGen };
import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import Button from '../components/buttons/button';
import { Input } from '../components/inputs/input';



function Checkpoints ( props ){
	const [isPlaced, setIsPlaced] = useState( false );
	const checkpoint = useRef();


	const _color = '0x34495e';
	const _size = [
				50, // radius
				50, // width segments
				50  // height segments
			];

	const _mousePos = new THREE.Vector2();
	const _raycaster = new THREE.Raycaster();

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
			_raycaster.setFromCamera( _mousePos, props.camera );
			const intersects = _raycaster.intersectObjects( props.scene.children );
			
			if( intersects.length ){
				if( intersects[0].object.id === checkpoint.current.id ){
					intersects.shift();
				}	
										
				if( intersects.length ){
					const { x, y, z } = intersects[0].point;
					checkpoint.current.position.set( x, y + _size[0], z );
				}
			}
		}
		
	});


	const mouseLocation = (e) => {
		e.stopPropagation();

		_mousePos.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
	    _mousePos.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;
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
		<mesh name="checkpoint" ref={checkpoint} onClick={handleClick}>
			<sphereGeometry args={_size} />
			<meshStandardMaterial color="white"/>
		</mesh>
	);
}


function CheckpointBuilder( props ){	
	const { geometry, object } = props;
	const matrix = new THREE.Matrix4();

	const checkpoint = useRef();

	matrix.set( ...object.matrix.map( elem => (
		elem instanceof String ? parseInt( elem ) : elem)
	));


	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: checkpoint });
	}


	return(
		<mesh ref={checkpoint} name={object.name} matrix={matrix} onClick={handleClick}>
			<sphereGeometry args={[geometry.radius, geometry.widthSegments, geometry.heightSegments]}/>
			<meshStandardMaterial />
		</mesh>
	);
}


export { Checkpoints, CheckpointBuilder };
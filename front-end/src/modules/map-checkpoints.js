import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';
import { Sphere } from '@react-three/drei';

import Button from '../components/buttons/button';
import { Input } from '../components/inputs/input';



export default function Checkpoints ( props ){
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
		if( !isPlaced ) window.addEventListener('click', place);

		return () => window.removeEventListener('click', () => setIsPlaced( false ));
	}, []);


	useFrame(() => {
		_raycaster.setFromCamera( _mousePos, props.camera );
		const intersects = _raycaster.intersectObjects( props.scene.children );
		
		if( intersects.length && !isPlaced ){
			const { x, y, z } = intersects[0].point;
			checkpoint.current.position.set( x, y + _size[0], z );					
		}
	});


	const mouseLocation = (e) => {
		_mousePos.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
	    _mousePos.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;
	}


	const place = () => {
		if( checkpoint.current ){
			setIsPlaced( true );
			props.position( checkpoint.current.position );
		}
	}


	return (
		<mesh name="checkpoint" ref={checkpoint} onClick={() => console.log('Checkpoint has been clicked!')}>
			<Sphere args={_size}>
				<meshStandardMaterial color={_color}/>
			</Sphere>
		</mesh>
	);
}

const PropertyInput = ( props ) => {
	return (
		<div className="d-flex flex-column">
            <p className="p-0 m-0">
            	{props.name}
            </p>
            <Input 
            	id={props.id} 
            	size={props.size ?? {width: "80%"}} 
            	type={ props.type ?? "number"} 
            	value={ props.value } 
            	handleChange={props.handleChange}
            />    
        </div>
	);
}


const PropertyBox = ( props ) => {

	const _propStyle = {
		position: "absolute",
		top: "80%",
		left: "10%",
		width: "300px",
		height: "40vh",
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		borderRadius: "20px"
	};

	return (
		<div style={_propStyle} className="d-flex flex-column justify-items-center align-items-center">
			<div style={{height: '10%'}}> <Button name="close"/> </div>
			<div style={{height: '10%'}}> <h3>Properties</h3> </div>
			<div style={{height: '80%'}}>
				<div style={{overflowY: 'scroll'}}>
					<this.PropertyInput id="cp-name" name="Room name" type="text" value={props.name ?? "Empty"}/>
					
					<this.PropertyInput id="cp-scale-x" name="Scale X" value={props.scale.x ?? "Empty"}/>
					<this.PropertyInput id="cp-scale-y" name="Scale Y" value={props.scale.y ?? "Empty"}/>
					<this.PropertyInput id="cp-scale-z" name="Scale Z" value={props.scale.z ?? "Empty"}/>

					<this.PropertyInput id="cp-pos-x" name="Position X" value={props.pos.x ?? "Empty"}/>
					<this.PropertyInput id="cp-pos-y" name="Position Y" value={props.pos.y ?? "Empty"}/>
					<this.PropertyInput id="cp-pos-z" name="Position Z" value={props.pos.z ?? "Empty"}/>
				</div>
			</div>
		</div>
	);
}


import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';

import Button from '../components/buttons/button';
import Input from '../components/inputs/input';


const COLOR = '';


export default class Checkpoint{

	
	constructor( scene, camera ){
		this._camera = camera;
		this._scene = scene;

		this._raycaster = new THREE.Raycaster();
		this._children = []; // {name: <object_name>, location: <object_location (x, y, z)>}
		
		this._mousePos = new THREE.Vector3();

		this._propStyle = {
			position: "absolute",
			top: "80%",
			left: "10%",
			width: "300px",
			height: "40vh",
			backgroundColor: "rgba(255, 255, 255, 0.75)",
			borderRadius: "20px"
		};

		this._propBoxColor = '0x34495e';
		this._propBoxSize = [
				15, // radius
				32, // width segments
				16  // height segments
			];


	}


	PropertyInput( props ){
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


	PropertyBox( props ){
		return (
			<div style={this._propStyle} className="d-flex flex-column justify-items-center align-items-center">
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


	Checkpoint( props ){
		const [isPlaced, setIsPlaced] = useState( false );
		const checkpoint = useRef();


		// Mouse movement event listener
		useEffect(() => {
			!isPlaced ? window.addEventListener('mousemove', mouseLocation) : null;

			return () => !isPlaced ? window.removeEventListener('mousemove', mouseLocation) : null;
		}, [isPlaced]);


		useEffect(() => {
			!isPlaced ? window.addEventListener('click', () => setIsPlaced( true )) : null;

			return () => !isPlaced ? window.removeEventListener('click', () => setIsPlaced( false )) : null;
		}, []);


		useFrame(() => {
			this._raycaster.setFromCamera(this._mousePos, this._camera);
			const intersects = this._raycaster.intersectObjects( this._scene.children );

			// =============================================================
			//   Should continue working on free positioning with raycaster.
			// =============================================================

			if( checkpoint?.current && !isPlaced ){
				checkpoint.current.position.set( );
			}
		});

		const mouseLocation = (e) => {
			this._mousePos.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
		    this._mousePos.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;
		}



		return (
			<Sphere ref={checkpoint} args={...this._propBoxSize}>
				<meshStandardMaterial color={this._propBoxColor}/>
			</Sphere>
		);
	}
}


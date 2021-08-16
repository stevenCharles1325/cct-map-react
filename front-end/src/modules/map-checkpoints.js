import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import Button from '../components/buttons/button';
import { Input } from '../components/inputs/input';



export default function Checkpoints ( props ){
	const [isPlaced, setIsPlaced] = useState( false );
	const [prop, setProp] = useState({ item: null, isReset: false });
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

		return () => window.removeEventListener('click', () => setIsPlaced( true ));
	}, []);


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

		window.removeEventListener('mousemove', mouseLocation);
		window.removeEventListener('click', () => setIsPlaced( true ));

		handleClick(e);
	}


	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: checkpoint });
		setProp({ item: <PropertyBox object={checkpoint.current} close={setProp}/>, isReset: prop.isReset });
	}

	useEffect(() => {
		if( prop.isReset ){
			props.click({ reset: true });
			setProp({ item: null, isReset: false });
		}
		else{
			props.showProp(prop.item);
		}
	});


	return (
		<mesh name="checkpoint" ref={checkpoint} onClick={handleClick}>
			<sphereGeometry args={_size} />
			<meshStandardMaterial color="white"/>
		</mesh>
	);
}

const PropertyInput = ( props ) => {
	return (
		<div className="d-flex flex-column mb-4">
            <p className="p-0 m-0">
            	{props.name}
            </p>
            <div className="d-flex justify-content-center">
	            <Input 
	            	id={props.id} 
	            	size={props.size ?? {width: "80%"}} 
	            	type={ props.type ?? "number"} 
	            	value={ props.value } 
	            	handleChange={props.handleChange}
	            />    	
            </div>
            
        </div>
	);
}


const PropertyBox = ( props ) => {
	const { object } = props;

	const _propStyle = {
		position: "absolute",
		top: "15%",
		left: "10%",
		width: "300px",
		height: "70vh",
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		borderRadius: "20px",
		padding: '10px'
	};


	const reqEditName = (e) => {
        object.name = e.target.value;
    }


	const reqEditScaleX = (e) => {
        object.scale.x = e.target.value;
    }

    const reqEditScaleY = (e) => {
        object.scale.y = e.target.value;
    }

    const reqEditScaleZ = (e) => {
        object.scale.z = e.target.value;
    }



    // Edit position functions
	const reqEditPosX = (e) => {
        object.position.x = e.target.value;
    }

    const reqEditPosY = (e) => {
        object.position.y = e.target.value;
    }

    const reqEditPosZ = (e) => {
        object.position.z = e.target.value;
    }


    const handleClose = () => {
    	props.close({ item: null, isReset: true });
    }

	return (
		<div style={_propStyle} className="d-flex flex-column align-items-center">
			<div style={{height: '15%', width: '100%'}} className="d-flex justify-content-end"> 
				<Button name="close" click={handleClose}/> 
			</div>
			<div style={{height: '10%'}} className="text-center"> 
				<h3>Properties</h3> 
			</div>
			<div style={{height: '75%', overflowY: 'scroll'}} className="d-flex flex-column align-items-center">
				<PropertyInput 
					id="cp-name" 
					name="Room name" 
					type="text" 
					value={object.name ?? "No name"}
					handleChange={reqEditName}
				/>
				
				<PropertyInput id="cp-scale-x" name="Scale X" value={object.scale.x ?? "Empty"} handleChange={reqEditScaleX}/>
				<PropertyInput id="cp-scale-y" name="Scale Y" value={object.scale.y ?? "Empty"} handleChange={reqEditScaleY}/>
				<PropertyInput id="cp-scale-z" name="Scale Z" value={object.scale.z ?? "Empty"} handleChange={reqEditScaleZ}/>

				<PropertyInput id="cp-pos-x" name="Position X" value={object.position.x ?? "Empty"} handleChange={reqEditPosX}/>
				<PropertyInput id="cp-pos-y" name="Position Y" value={object.position.y ?? "Empty"} handleChange={reqEditPosY}/>
				<PropertyInput id="cp-pos-z" name="Position Z" value={object.position.z ?? "Empty"} handleChange={reqEditPosZ}/>
			</div>
		</div>
	);
}


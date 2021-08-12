// =========== [TO DO]: ==============
// 
// 1. Create path finding algo.


import React, { useState, useReducer, useEffect, useRef, Suspense } from 'react';
import {
	Stars,
	Html,
	useProgress,
	SpotLight
} from '@react-three/drei';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

import * as THREE from 'three';

// Components
import MapMenu from '../components/menu/map-menu';
import { Input } from '../components/inputs/input';
import Button from '../components/buttons/button';


// Style(s)
import '../styles/map.css';


// DIY dev tools [Delete on production]
import MapDevTools from '../modules/map-other-dev-tools';


// DIY wrapper function for three first-person-controls
import FirstPersonContols from '../modules/FirstPersonControls';


// Loading components
import CircStyleLoad from '../components/load-bar/circ-load';
import InfiniteStyleLoad from '../components/load-bar/inf-load';

const devTools = new MapDevTools();

// == constants ==
const LAND_SIZE = [5000, 5000];
const CAMERA = {
	position: [0, 2500, -2500],
	far: 10000
}
const MOUSE = new THREE.Vector2();



const MapView = (props) => {
	const land = useRef();

	const [upload, setUpload] = useState( null );
	const [objList, setObjList] = useState( [] );

	const [selected, setSelected] = useState( null );
	const [pending, setPending] = useState( null );
	
	const [propBox, setPropBox] = useState( null );
	const [swapped, setSwapped] = useState( false );

	const [copyObj, setCopyObj] = useState( null );
	const [deleteObj, setDeleteObj] = useState( null );

	function reqSetPending( object ) {
		setPending( object );
		setSwapped( false );	
	}

	function reqSetPropBox() {
		glassify( selected.material, true );
		setSelected( null );
		setPending( null );		
		setSwapped( false );	
	}

	useEffect(() => {
		if( upload ){
			setObjList([...objList, <MapImport key={upload.fileName} object={upload} click={reqSetPending} />]);
			setUpload( null );
		}
		else if( copyObj ){
			setObjList([...objList, <MapClone key={copyObj.uuid} object={copyObj} click={reqSetPending} />]);
			setCopyObj( null );	
		}
		else if( deleteObj ){
			objList.pop();
			setObjList( objList );
			setSelected( null );
		}
		
	}, [upload, copyObj, deleteObj]);


	useEffect(() => {
		devTools.log({selected, pending}, {logCount: 20});


		if( !selected && pending ){
			setSelected( pending );
			setPending( null );
		}
		else if( selected && pending && !swapped){ // switching two objects
			const temp = selected;

			setSelected( pending );
			setPending( temp );
			setSwapped( true );
		}

	}, [selected, pending, swapped]);


	useEffect(() => {
		if( selected ){
			setPropBox(<PropertyBox properties={selected} close={reqSetPropBox} copy={setCopyObj} delete={setDeleteObj}/>);
		}
		else{
			setPropBox( null );
		}

	}, [selected]); // Added propBox as dependency


	useEffect(() => {
		if( selected ) glassify( selected.material ); 
	}, [selected]);


	useEffect(() => {
		if( pending ) glassify( pending.material, true ); // Unglassify pending
	}, [pending]);


	// Mouse movement event listener
	// useEffect(() => {
	// 	window.addEventListener('mousemove', mouseLocation);

	// 	return () => window.removeEventListener('mousemove', mouseLocation)
	// });

	return(
		<div className="map">
		    <MapMenu reqSetUpload={setUpload} />
		    <MapCanvas landRef={land}>
				<Scene deleteObj={deleteObj} reqSetDelete={setDeleteObj}>		    	
			    	{ objList }
		    	</Scene>
		    </MapCanvas>
		    <Suspense fallback={<CircStyleLoad />}>
		    	{ propBox }
		    </Suspense>
		</div>
	);
}


const Scene = ( props ) => {
	const { scene } = useThree();
	console.log( scene );

	useEffect(() => {
		if( props.deleteObj ){
			scene.remove(props.deleteObj);
			props.reqSetDelete( null );
		}
	}, [props.deleteObj]);

	return (
		<scene> 
			{ props.children }
		</scene>
	);
}


// Canvas
const MapCanvas = (props) => {

	return(
		<Canvas camera={{position: CAMERA.position, far: CAMERA.far}}>
			<Atmosphere />
			<Suspense fallback={<Loader />}>
				{ props.children }
			</Suspense>
			<Land ref={props.landRef} size={LAND_SIZE}/>
		</Canvas>
	);		
}


const MapClone = (props) => {
	const object = props.object;
	const objRef = useRef();

	const handleClick = () => props.click( objRef.current );

	return(
		<mesh 
			ref={objRef}
			onClick={handleClick}
			receiveShadow
			castShadow
			scale={50}
			geometry={object.geometry}
		>
			<meshStandardMaterial
				color="white"
				metalness={0.3}
				roughness={0.5}
			/>	
		</mesh>
	);	
}

// Creates 3D object
const MapImport = (props) => {
	
	const importedOBJ = useLoader( OBJLoader, props.object.filePath );
	const object = importedOBJ.children[0];
	
	const objRef = useRef();

	const handleClick = () => props.click( objRef.current );

	return(
		<mesh 
			ref={objRef}
			onClick={handleClick}
			receiveShadow
			castShadow
			scale={50}
			geometry={object.geometry}
		>
			<meshStandardMaterial
				color="white"
				metalness={0.3}
				roughness={0.5}
			/>	
		</mesh>
	);
}



// Atmosphere
const Atmosphere = (props) => (
	<group>
		<Stars radius={2500} count={50000} fade />
		<FirstPersonContols
			lookSpeed={props.lkSpeed || 0.3}
			movementSpeed={props.mvSpeed || 550}
		/>
		<ambientLight intensity={props.ambInt || 0.3}/>
		<spotLight 
			castShadow 
			position={[1000, 5000, 0]}
		/>
	</group>
);




// Land
const Land = React.forwardRef((props, ref) => (
	<mesh 
		ref={ref} 
		visible
		receiveShadow
		rotation={[-Math.PI / 2, 0, 0]}
	>
		<planeBufferGeometry args={props.size || 1} />
		<meshStandardMaterial 
			color={props.color || "white"} 
			roughness={0.9}
			metalness={0.5}
		/>
	</mesh>
));


// Property Box
const PropertyBox = (props) => {
	const properties = props.properties;

    const inputSize = {width: '90%', height: '50px'};


	// Edit scale functions
	const reqEditScaleX = (e) => {
        properties.scale.x = e.target.value;
    }

    const reqEditScaleY = (e) => {
        properties.scale.y = e.target.value;
    }

    const reqEditScaleZ = (e) => {
        properties.scale.z = e.target.value;
    }



    // Edit position functions
	const reqEditPosX = (e) => {
        properties.position.x = e.target.value;
    }

    const reqEditPosY = (e) => {
        properties.position.y = e.target.value;
    }

    const reqEditPosZ = (e) => {
        properties.position.z = e.target.value;
    }



    // Edit rotation functions
	const reqEditRotX = (e) => {
        properties.rotation.x = e.target.value;
    }

    const reqEditRotY = (e) => {
        properties.rotation.y = e.target.value;
    }

    const reqEditRotZ = (e) => {
        properties.rotation.z = e.target.value;
    }   


    const handleCopy = () => {
    	props.copy( properties );
    }

    const handleDelete = () => {
    	props.delete( properties );
    }

	return(
        <div className="obj-prop-box d-flex flex-column justify-content-around align-items-center p-3">
            <div style={{height: '8%'}} className="container-fluid d-flex flex-row-reverse pr-2 mb-2">
                <Button name="close" click={props.close}/>
            </div>
            <div  style={{height: '10%'}} style={{height: '50px'}}  className="text-center">
                <h2>Properties</h2>
            </div>
            <div  style={{height: '72%'}} className="obj-props d-flex flex-column justify-content-between align-items-center">
            	
            	<PropBoxInp id="scaleX" size={inputSize}  value={properties.scale.x} handleChange={reqEditScaleX} name="Scale X"/>
            	
            	<PropBoxInp id="scaleY" size={inputSize}  value={properties.scale.y} handleChange={reqEditScaleY} name="Scale Y"/> 
            	
            	<PropBoxInp id="scaleZ" size={inputSize}  value={properties.scale.z} handleChange={reqEditScaleZ} name="Scale Z"/> 
            	
            	<PropBoxInp id="posX" size={inputSize}  value={properties.position.x} handleChange={reqEditPosX} name="Position X"/> 
            	
            	<PropBoxInp id="posY" size={inputSize}  value={properties.position.y} handleChange={reqEditPosY} name="Position Y"/> 
            	
            	<PropBoxInp id="posZ" size={inputSize}  value={properties.position.z} handleChange={reqEditPosZ} name="Position Z"/> 
            	
            	<PropBoxInp id="rotX" size={inputSize}  value={properties.rotation.x} handleChange={reqEditRotX} name="Rotation X"/> 
            	
            	<PropBoxInp id="rotY" size={inputSize}  value={properties.rotation.y} handleChange={reqEditRotY} name="Rotation Y"/> 
            	
            	<PropBoxInp id="rotZ" size={inputSize}  value={properties.rotation.z} handleChange={reqEditRotZ} name="Rotation Z"/> 
            	
            </div>   
            <div style={{height: '10%', width: '100%'}} className="d-flex justify-content-between align-items-center">
            	{[
            		{
            			name: 'copy',
            			action: handleCopy
            		},
            		{
            			name: 'delete',
            			action: handleDelete
            		}
            	].map(ops => <Button key={ops.name} name={ops.name} click={ops.action}/>)}
            </div>  
        </div>
    );
}



// Property input field
const PropBoxInp = (props) => {

	return(
		<div className="d-flex flex-column">
            <p className="p-0 m-0">
            	{props.name}
            </p>
            <Input 
            	id={props.id} 
            	size={props.size} 
            	type={ props.type || "number"} 
            	value={ props.value } 
            	handleChange={props.handleChange}
            />    
        </div>
	);
}


// Glassification
const glassify = (material, unGlassify = false) => {
	if( !material ) return;

	material.color.set(unGlassify ? 'white' : 0x55efc4);
	material.opacity = unGlassify ? 1 : 0.5;
	material.transparent = unGlassify ? false : true;	
}



// Loader
const Loader = ( props ) => { 
	const { progress } = useProgress();

	return <Html center> Loading: { progress }% </Html>
}


// // Mouse location
// const mouseLocation = (e) => {
// 	MOUSE.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
// 	MOUSE.y = - ( e.offsetY / window.innerHeight ) * 2 + 1; 
// }

export default MapView;

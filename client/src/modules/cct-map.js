// Libraries
import React, { Suspense, useEffect, useState, useRef } from 'react';

import {
	OrbitControls,
	Stars,
	Html,
	useProgress,
	SpotLight,
	softShadows,
	useHelper
} from '@react-three/drei';


import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';


import * as THREE from 'three';


// Configurations
const LAND_SIZE = [7000, 7000];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const CAMERA = {
	config: [75, WIDTH / HEIGHT, 100, 50000],
	position: [0, 5000, 5000],
	far: 50000
};


// Default material
const materialOptions = {
	color: 0x3f4444,
	roughness: 0.4,
	metalness: 0
}

const defaultMaterial = new THREE.MeshPhysicalMaterial( materialOptions );


// Checker variable
var EMPTY_NAME_CP_SPOTTED = false;


const setEmtyNameCpSpotted = ( value ) => {
	EMPTY_NAME_CP_SPOTTED = value;	
} 


// Scene loader
const loadScene = async ({ userType, data, click, checkPointSaver, setControls }) => {
	if( !data || !userType ) return;

	let key;

	const prevChild = [];
	const memo = [];

	const { geometries, object } = data ;

	const children = object?.children;

	const checkType = ( type ) => {
		switch( type ){
			case 'click':
				return userType === 'admin' ? click : null;

			case 'saver':
				return userType === 'admin' ? checkPointSaver : null;

			default:
				return;
		}
	}

	const isNameInvalid = ( object ) => {
		return !object?.name || /Land/.test(object.name) || /Sky/.test(object.name) ||
		 ( userType !== 'admin' && /connector/.test(object.name.toLowerCase()) );
	}

	if( children ){
		for( let index in children ){

			if (isNameInvalid( children[index] )) continue;

			if( memo.indexOf(children[index].name) < 0 ){
				memo.push( children[index].name )

				if( isCheckpointObject(children[index].name) ){
					key = `checkpoint_${index}`;
				}
				else{
					key = `map_object_${index}`;
				}
				prevChild.push(
					<Build 
						userType={userType}
						index={index}
						key={key}
						geometry={geometries[index]}
						data={object.children[index]}
						click={checkType('click')}
						saveCheckpoint={checkType('saver')}
						setControls={ userType === 'admin' ? setControls : null }
					/>
				);
			}
		}	
	}
	

	return prevChild;
}


// Loading individual 3d object in previous scene
const Build = (props) => {
	const { geometry, data } = props;

	const objRef = useRef();
	const handleClick = () => props.click( objRef.current );

	switch( true ){
		case /checkpoint/.test(data.name): 
			return (
				<CheckpointBuilder 
					userType={props.userType}
					name={getRootName(data.name)}
					index={props.index}
					geometry={geometry} 
					object={data} 
					click={props?.click} 
					saveCheckpoint={props?.saveCheckpoint}
					setControls={props?.setControls} 
				/>
			); 
		case /map_object/.test(data.name):
			return <ObjectBuilder
						userType={props.userType}
						index={props.index}
						geometry={geometry} 
						object={data} 
						click={props?.click} 
					/>;

		default:
			console.warn(`The type ${geometry.type} is not supported at this moment.`);
			break;
	}
}


const ObjectBuilder = (props) => {
	const { geometry, object } = props;
	const objRef = useRef();


	const matrix = new THREE.Matrix4();
	matrix.set(...object.matrix);

	const loader = new THREE.BufferGeometryLoader();
	const parsedGeom = loader.parse( geometry );

	const position = new THREE.Vector3(
		matrix.elements[3], 
		matrix.elements[7], 
		matrix.elements[11]
	);
	
	const scale = new THREE.Vector3(
		matrix.elements[0], 
		matrix.elements[5], 
		matrix.elements[10]
	);

	const handleClick = (e) => {
		e.stopPropagation();

		props?.click?.({ data: objRef });
	}
	
	const produceMaterial = () => {
		return props.userType === 'admin' 
				? new THREE.MeshPhysicalMaterial( materialOptions ) 
				: defaultMaterial;
	}

	return(
		<mesh
			name={`map_object_${props.index}`}
			ref={objRef}
			onDoubleClick={handleClick}
			receiveShadow
			castShadow
			scale={[...Object.values(scale)]}
			geometry={parsedGeom}
			position={[...Object.values(position)]}
			material={produceMaterial()}
		>	
		</mesh>
	);
}



function CheckpointBuilder( props ){	
	const { geometry, object } = props;

	const matrix = new THREE.Matrix4();

	const checkpoint = useRef();

	matrix.set( ...object.matrix );

	const position = new THREE.Vector3(matrix.elements[3], matrix.elements[7], matrix.elements[11]);
	const scale = new THREE.Vector3(matrix.elements[0], matrix.elements[5], matrix.elements[10]);

	const handleClick = (e) => {
		e.stopPropagation();

		props?.click?.({ data: checkpoint });
	}

	const handleHover = () => {
		props?.setControls?.( Controls => {
			const configuration = Controls.config;
			configuration.enabled = false;

			return {
				controls: Controls.controls,
				config: configuration,
				event: Controls.event
			}
		});
	}
	
	const handleHoverOut = () => {
		props?.setControls?.( Controls => {
			console.log(Controls.event);
			const configuration = Controls.config;
			configuration.enabled = !Controls.event
				? true
				: false;;

			return {
				controls: Controls.controls,
				config: configuration,
				event: Controls.event
			}
		});
	}

	const produceMaterial = () => {
		return props.userType === 'admin' ? new THREE.MeshPhysicalMaterial( materialOptions ) : defaultMaterial;
	}

	useEffect(() => {
		if( checkpoint.current ) props?.saveCheckpoint?.( checkpoint.current );
	}, [checkpoint.current]);


	return(
		<mesh 
			name={`checkpoint_${props.index}_${props.name}`} 
			ref={checkpoint} 
			scale={[...Object.values(scale)]} 
			position={position} 
			onDoubleClick={handleClick}
			onPointerEnter={handleHover}
			onPointerLeave={handleHoverOut}
			material={produceMaterial()}
			receiveShadow={true}
			castShadow={true}
		>
			<sphereGeometry 
				args={[
					geometry?.radius ?? 50, 
					geometry?.widthSegments ?? 50, 
					geometry?.heightSegments ?? 50
				]}
			/>
		</mesh>
	);
}


// Canvas;
const MapCanvas = (props) => {
	const land = useRef();

	const { scene, camera, gl } = useThree();
	const set = useThree((state) => state.set);

	useEffect(() => {
		set({camera: new THREE.PerspectiveCamera(...CAMERA.config)});
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = THREE.PCFSoftShadowMap;
	}, []);

	useEffect(() => {
		camera.position.set( ...CAMERA.position );
		camera.updateProjectionMatrix();
		props.setCam( () => camera );
	}, [camera]);

	useEffect(() => {
		if( props?.deleteObj ){
			delete props.deleteObj.__r3f.handlers.onClick;
			props.reqSetDelete(() => null);
		}
	}, [props?.deleteObj]);


	// useEffect(() => props.setScene( () => scene ), [scene]);
	props.setScene( () => scene );

	return(
		<>
			<Atmosphere lightTarget={land} type={props.type} control={props.control} />
			<Suspense fallback={<Loader />}>
				{ props.children }
			</Suspense>
			<Land refer={land} size={LAND_SIZE}/>
		</>
	);		
}



// Atmosphere
const Atmosphere = (props) => {
	return (
		<group name="Sky">
			<Stars radius={LAND_SIZE[0]*0.5} count={LAND_SIZE[0]*2} fade />
			{ 
				props?.type === 'user' ? <OrbitControls /> : <props.control.controls {...props?.control?.config}/>
			}
			<ambientLight intensity={0.5}/>
			<spotLight
				target={props?.lightTarget?.current}
				castShadow={true}
		        position={[-6000, 6000, 0]}
		        intensity={1}
		        shadow-mapSize-width={512}
		        shadow-mapSize-height={512}
		        shadow-camera-far={1000}
		        shadow-camera-near={0.5}
			/>
		</group>
	);
};


const Land = React.forwardRef(( props, ref ) => {
	const object_path = '../default_models/circular_grass/10438_Circular_Grass_Patch_v1_iterations-2.obj';
	const texture_path = '../default_models/circular_grass/10438_Circular_Grass_Patch_v1_Diffuse.jpg';

	const land = useLoader( OBJLoader, object_path );
	const texture = useLoader( TextureLoader, texture_path );

	const geometry = React.useMemo(() => {
		let geom;

		land.traverse( child => {
			if( child.type === 'Mesh' ){
				geom = child.geometry;
			}
		});

		return geom; 
	}, [land]);

	return (
		<mesh 
			ref={ref}
			receiveShadow={true}
			geometry={geometry}
			rotation={[-Math.PI / 2, 0, 0]}
			scale={[50, 50, 10]}
			position={[0, -100, 0]}
		>
			<meshPhysicalMaterial color={0x6ab04c}  map={texture}/>
		</mesh>
	);
});

// Map messenger
const Messenger = (props) => {
	let { message, messenger } = props;
	const [msg, setMsg] = useState('');
	
	const DECAY_TIME = 2000;

	useEffect(() => {
		const displayMessage = async ( newMessage ) => {
			setMsg(() => newMessage);
			setTimeout(() => setMsg(() => ''), DECAY_TIME);
		}

		message.forEach( pendingMsg => {
			if( typeof pendingMsg === 'string' ){
				setTimeout(() => displayMessage(pendingMsg), DECAY_TIME);
			}
		});
	}, [message]);

	return (
		<div className={`map-message ${msg ? 'd-flex' : 'd-none'} justify-content-center align-items-center p-3`}>
			<p className="p-0 m-0 px-2">{ msg }</p>
		</div>
	);
}


const Loader = ( props ) => { 
	const { progress } = useProgress();

	return <Html className="loader-progress" center> Loading: { progress }% </Html>
}


const isCheckpointObject = (name) => name?.search('checkpoint') > -1 ? true : false;

const getRootName = (name) => name?.replace?.(/checkpoint_([0-9]+)_/, ''); // Returns: room123
	
const getBaseName = (name) => name?.replace?.(getRootName(name), ''); // Returns: checkpoint_123_



export {
	Land,
	Build,
	Loader,
	Messenger,
	MapCanvas,
	loadScene,
	Atmosphere,
	ObjectBuilder,
	CheckpointBuilder,
	EMPTY_NAME_CP_SPOTTED,
	isCheckpointObject,
	getBaseName,
	getRootName,
	setEmtyNameCpSpotted,
};
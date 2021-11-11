// Libraries
import React, { Suspense, useEffect, useState, useRef } from 'react';

import {
	OrbitControls,
	Stars,
	Html,
	useProgress,
	SpotLight,
	useHelper,
	useMatcapTexture,
	Shadow,
	Plane,
	useTexture 
} from '@react-three/drei';

import uniqid from 'uniqid';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { TextureLoader } from 'three/src/loaders/TextureLoader';


import * as THREE from 'three';


// Configurations
const LAND_SIZE = [7000, 7000];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const CAMERA = {
	config: [75, WIDTH / HEIGHT, 100, 50000],
	position: [0, 7000, 10000],
	far: 50000
};


// Default material
const materialOptions = {
	color: 0xf8c291,
	roughness: 1,
	metalness: 0
}

const defaultMaterial = new THREE.MeshStandardMaterial( materialOptions );

/*
	Shadow:
	- enable shadow map
	- select type of shadow 
	- castShadow to lights
	-
*/


// Scene loader
const loadScene = async mapData => {
	if( !mapData ) return;

	const { 
		data, 
		click, 
		userType, 
		setControls,
		checkPointSaver 
	} = mapData;

	if( !data || !userType ) return;

	let key;

	const prevChild = [];
	const memo = [];

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


	data.forEach( (object, index) => {
		let key = null;

		if( isCheckpointObject(object.object.name) ){
			key = `checkpoint_${index}`;
		}
		else{
			key = `map_object_${index}`;

		}

		// ======= changes here ==========
		if( (userType === 'user' && !isCheckpointObject( object.object.name )) || userType === 'admin' ){
			prevChild.push(
				<Build 
					userType={userType}
					index={index}
					key={key}
					geometry={object.geometries?.[0] ?? object.geometries}
					data={object.object}
					click={checkType('click')}
					saveCheckpoint={checkType('saver')}
					setControls={ userType === 'admin' ? setControls : null }
				/>
			);
		}
	});

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
	const shadow = useRef();

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
				? new THREE.MeshStandardMaterial( materialOptions ) 
				: defaultMaterial;
	}

	return(
		<>
			<Html
				className="cntnr text-center non-selectable"
				style={{
					width: '150px'
				}}
				zIndexRange={[100, 50]}
				position={[0, Object.values(position)[1] + 4000, 0]}
			>
				CCT BUILDING A
			</Html>
			<mesh
				name={`map_object_${props.index}`}
				ref={objRef}
				onDoubleClick={handleClick}
				castShadow
				// receiveShadow
				scale={[...Object.values(scale)]}
				geometry={parsedGeom}
				position={[...Object.values(position)]}
				material={produceMaterial()}
			>	
			</mesh>
		</>
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

	// const handleHover = () => {
	// 	props?.setControls?.( Controls => {
	// 		const configuration = Controls.config;
	// 		configuration.enabled = false;

	// 		return {
	// 			controls: Controls.controls,
	// 			config: configuration,
	// 			event: Controls.event
	// 		}
	// 	});
	// }
	
	// const handleHoverOut = () => {
	// 	props?.setControls?.( Controls => {
	// 		const configuration = Controls.config;
	// 		configuration.enabled = !Controls.event
	// 			? true
	// 			: false;;

	// 		return {
	// 			controls: Controls.controls,
	// 			config: configuration,
	// 			event: Controls.event
	// 		}
	// 	});
	// }

	const produceMaterial = () => {
		return props.userType === 'admin' 
			? new THREE.MeshStandardMaterial( materialOptions ) 
			: defaultMaterial;
	}

	useEffect(() => {
		if( checkpoint.current ){ 
			props?.saveCheckpoint?.( checkpoint.current );
		}
	}, [checkpoint.current]);


	return(
		<mesh
			name={`checkpoint_${props.index}_${props.name}`} 
			ref={checkpoint} 
			scale={[...Object.values(scale)]} 
			position={position} 
			onDoubleClick={handleClick}
			// onPointerEnter={handleHover}
			// onPointerLeave={handleHoverOut}
			material={produceMaterial()}
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
		
		// gl.shadowMap.enabled = true;
		// gl.shadowMap.type = THREE.PCFSoftShadowMap;
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


	useEffect(() => props.setScene( () => scene ), []);

	useFrame(() => props.update());

	return(
		<>
			<Atmosphere lightTarget={land} type={props.type} control={props.control} controller={props.controller}/>
			<Suspense fallback={<Loader />}>
				{ props.children }
			</Suspense>
			<Land ref={land} size={LAND_SIZE}/>
		</>
	);		
}



// Atmosphere
const Atmosphere = (props) => {
	const { camera } = useThree();
	
	const cloudsRootPath = '/default_models/clouds/FBX Files/'
	const cloud_names = ['Cloud_1.fbx', 'Cloud_2.fbx', 'Cloud_3.fbx', 'Cloud_4.fbx'];

	const cloud1 = useLoader( FBXLoader, cloudsRootPath + cloud_names[ 0 ] );
	const cloud2 = useLoader( FBXLoader, cloudsRootPath + cloud_names[ 1 ] );
	const cloud3 = useLoader( FBXLoader, cloudsRootPath + cloud_names[ 2 ] );
	const cloud4 = useLoader( FBXLoader, cloudsRootPath + cloud_names[ 3 ] );

	const cloudTypes = [cloud1, cloud2, cloud3, cloud4];

	const getRandomNumber = ( min = 0, max = 1 ) => {
		return Math.floor( Math.random() * (max - min) + min )
	}

	const getRandomPosition = ( min = 0, max = 1 ) => [
		getRandomNumber( min, max ),
		getRandomNumber( 5000, 7000 ),
		getRandomNumber( min, max )
	];

	const cloudRange = getRandomNumber( 10, 15 );
	const [clouds, setClouds] = useState([]);

	const addRandomClouds = () => {
		const size = getRandomNumber(4, 5);
		setClouds( clouds => [
				... clouds, 
				<primitive 
					key={uniqid()}
					scale={[ size, size, size + 1 ]}
					rotation={[ 0, getRandomNumber(0, 40), 0 ]}
					object={cloudTypes[  getRandomNumber(0, 3) ].clone()} 
					position={getRandomPosition(-7000, 7000)}
				/>
			]
		);
	}

	useEffect(() => {
		const asyncCloudings = async () => {
			for( let range = 0; range < cloudRange; range++ ){
				addRandomClouds();
			}
		}

		asyncCloudings();
	}, []);

	return (
		<group name="Sky">
			<Stars radius={LAND_SIZE[0] * 0.8} count={LAND_SIZE[0] * 5} fade />
			{ 
				props.controller
				? props.controller
				: props?.type === 'user' 
					? <OrbitControls /> 
					: <props.control.controls {...props?.control?.config}/>
			}
			{ clouds }
			<pointLight castShadow position={[-5000, 4000, 20]} color="red" intensity={0.9} />
			<pointLight castShadow position={[20, 4000, 5000]} color="yellow" intensity={0.9} />
			<pointLight castShadow position={[3000, 4000, -6000]} color="white" intensity={1} />
			<ambientLight intensity={0.2}/>
			<ambientLight color="black" intensity={0.2}/>
			<directionalLight
				castShadow
		        position={[-5000, 7000, 2000]}
		        intensity={0.1}
		        shadow-camera-far={5000}
		        shadow-mapSize-width={1024}
		        shadow-mapSize-height={1024}
		        shadow-camera-left={-7000}
		        shadow-camera-right={7000}
		        shadow-camera-top={7000}
		        shadow-camera-bottom={-7000}
			/>
		</group>
	);
};


const Land = React.forwardRef(( props, ref ) => {
	const object_path = '/default_models/circular_grass/10438_Circular_Grass_Patch_v1_iterations-2.obj';
	const texture_path = '/default_models/circular_grass/10438_Circular_Grass_Patch_v1_Diffuse.jpg';

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
			geometry={geometry}
			rotation={[-Math.PI / 2, 0, 0]}
			scale={[50, 50, 10]}
			position={[0, -100, 0]}
		>
			<meshStandardMaterial roughness={1} color={0x6ab04c} map={texture}/>
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
	const { prog, label } = props;

	return <Html className="loader-progress" center> { label ?? "Loading" }: { prog?.toFixed?.(0) ?? progress?.toFixed?.(0) }% </Html>
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
	isCheckpointObject,
	getBaseName,
	getRootName,
	CAMERA
};
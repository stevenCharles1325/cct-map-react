// Libraries
import React, { Suspense, useEffect, useState, useRef } from 'react';
import {
	OrbitControls,
	Stars,
	Html,
	SpotLight,
	Line,
	softShadows
} from '@react-three/drei';

import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';


// Components
import FloatingButton from '../../components/user/button/floating-button';


// Modules
import pathFind from '../../modules/path-finding';



// Style
import '../../styles/user/map.css';

const LAND_SIZE = [7000, 7000];



const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const CAMERA = {
	config: [75, WIDTH / HEIGHT, 100, 50000],
	position: [0, 5000, 5000],
	far: 50000
};


const MapView = (props) => {
	const [camera, setCamera] = useState( null );
	const [scene, setScene] = useState( null );
	const [objects, setObjects] = useState( null );	
	const [cpPos, setCpPos] = useState( null );
	const [destination, setDestination] = useState( null );
	const [path, setPath] = useState( [] );
	const [line, setLine] = useState( null );


	useEffect(async () => {
		const sceneLoader = async () => {
			if( props.mapData ){
				console.log( props.mapData );
	
				const prevScene  = await loadScene(props.mapData.scene);

				setObjects( prevScene );
				setCpPos( props.mapData.cpPos );
			}
		}
		sceneLoader();

	}, [props.mapData]);



	useEffect(() => {
		const runPathFind = async () => {
			const shortestPath = await pathFind( scene, destination );

			setPath(() => [Object.values(destination.start), ...shortestPath]);

			setDestination(() => null);
		}

		if( destination && scene ) runPathFind();

	}, [destination, scene]);



	useEffect(() => {
		if(destination && path.length ) {
			const createLine = async () => {
					console.log( path );
					setLine( () => <Line 
										points={[...path]} 
										color={0x34495e} 
										lineWidth={3}
									/>);

					// setPath( () => [] );
			}	

			createLine();
		}
		
	}, [destination, path]);

	return(
		<div className="map p-0 m-0">
			<Canvas shadows={true}>
				<Suspense fallback={<Loader />}>
					<MapCanvas setCamera={setCamera} setScene={setScene}>
						{ objects ?? <Loader /> }

						<Suspense fallback={<Loader/>}>
							{ line }
						</Suspense>
					</MapCanvas>
				</Suspense>
			</Canvas>
			<FloatingButton cpPos={cpPos} setDestination={setDestination}/>
		</div>
	);
}


const loadScene = async (data) => {
	if( !data ) return;

	const prevChild = [];
	const memo = [];

	const { geometries, object } = data ;

	const children = object?.children;

	if( children ){
		for( let index in children ){

			if ( /Land/.test(children[index].name) || 
				/Sky/.test(children[index].name)
				) continue;

			if( memo.indexOf(children[index].name) < 0 ){
				memo.push( children[index].name )

				prevChild.push(<Build 
									index={index}
									key={children[index].name}
									geometry={geometries[index]}
									data={object.children[index]}
								/>);
			}
		}	
	}
	

	return prevChild;
}



const MapCanvas = (props) => {
	const { camera } = useThree();
	const { scene } = useThree();

	const set = useThree((state) => state.set);

	useEffect(() => {
		set({camera: new THREE.PerspectiveCamera(...CAMERA.config) });
	}, []);

	useEffect(() => {
		camera.position.set( ...CAMERA.position );
		camera.updateProjectionMatrix();
	}, [camera]);

	props.setCamera( camera );
	props.setScene( scene );

	return(
		<>
			<Atmosphere />
			<Suspense fallback={<Loader />}>
				{ props.children }
			</Suspense>
			<Land size={LAND_SIZE} />
		</>
	);
}


// Loading individual 3d object in previous scene
const Build = (props) => {
	const { geometry, data } = props;

	const objRef = useRef();
	const handleClick = () => props.click( objRef.current );

	switch( true ){
		case /checkpoint/.test(data.name):
			return <CheckpointBuilder index={props.index} geometry={geometry} object={data} />; // Create checkpoint builder

		case /map_object/.test(data.name):
			return <ObjectBuilder index={props.index} geometry={geometry} object={data} />;

		default:
			console.warn(`The type ${geometry.type} is not supported at this moment.`);
			break;
	}
}


// #F8EFBA
// Object Builder (for loading previous scene)
const ObjectBuilder = (props) => {
	const { geometry, object } = props;
	const objRef = useRef();


	const matrix = new THREE.Matrix4();
	matrix.set(...object.matrix);

	const loader = new THREE.BufferGeometryLoader();
	const parsedGeom = loader.parse( geometry );

	const position = new THREE.Vector3(matrix.elements[3], matrix.elements[7], matrix.elements[11]);
	const scale = new THREE.Vector3(matrix.elements[0], matrix.elements[5], matrix.elements[10]);	

	return(
		<mesh
			name={`map_object_${props.index}`}
			ref={objRef}
			castShadow
			receiveShadow
			scale={[...Object.values(scale)]}
			geometry={parsedGeom}
			position={[...Object.values(position)]}
		>	
			<meshStandardMaterial
				color={0xCAD3C8}				
				metalness={1}
				roughness={1}
			/>	
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

		props.click({ data: checkpoint });
	}


	return(
		<mesh 
			name={object.name} 
			ref={checkpoint} 
			scale={[...Object.values(scale)]} 
			name={object.name} 
			position={position} 
			castShadow
			receiveShadow
		>
			<sphereGeometry args={[geometry.radius, geometry.widthSegments, geometry.heightSegments]}/>
			<meshStandardMaterial color={0x6a89cc}/>
		</mesh>
	);
}


// ===========================================
// 
// 				  MAP ESSENTIALS
// 
// ===========================================

// Atmosphere
const Atmosphere = (props) => (

	<group castShadow name="Sky">
		<Stars radius={LAND_SIZE[0] * 0.6} count={LAND_SIZE[0] * 4} fade />
		{/*<props.control.controls {...props?.control?.config}/>*/}
		<OrbitControls />
		<ambientLight intensity={0.5}/>
		<directionalLight
			castShadow
	        position={[1000, 5000, 0]}
	        intensity={1.2}
	        shadow-mapSize-width={5000}
	        shadow-mapSize-height={5000}
	        shadow-camera-far={1000}
	        shadow-camera-left={-100}
	        shadow-camera-right={100}
	        shadow-camera-top={100}
	        shadow-camera-bottom={-100}
		/>
		<directionalLight
			castShadow
	        position={[-1000, 5000, 0]}
	        intensity={1.2}
	        shadow-mapSize-width={5000}
	        shadow-mapSize-height={5000}
	        shadow-camera-far={1000}
	        shadow-camera-left={-100}
	        shadow-camera-right={100}
	        shadow-camera-top={100}
	        shadow-camera-bottom={-100}
		/>
	</group>
);



// Land
const Land = (props) => {

	return (
		<mesh 
			name="Land" 
			receiveShadow
			rotation={[-Math.PI / 2, 0, 0]}
		>
			<planeBufferGeometry attach="geometry" args={props.size || 1} />
			<meshStandardMaterial 
				color="white" 
				roughness={0.9}
				metalness={0.2}
				attach="material"
			/>
		</mesh>
	)
};

const Loader = (props) => {
	return <Html center> Loading </Html>;
}


export default MapView;
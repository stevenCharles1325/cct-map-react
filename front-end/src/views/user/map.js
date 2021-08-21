import React, { Suspense, useEffect, useState, useRef } from 'react';
import {
	OrbitControls,
	Stars,
	Html,
	SpotLight
} from '@react-three/drei';

import { Canvas, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import FloatingButton from '../../components/user/button/floating-button';


// Style
import '../../styles/user/map.css';

const LAND_SIZE = [5000, 5000];



const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const CAMERA = {
	config: [75, WIDTH / HEIGHT, 100, 10000],
	position: [0, 4000, 4000],
	far: 10000
};


const MapView = (props) => {
	const [camera, setCamera] = useState( null );
	const [scene, setScene] = useState( null );
	const [cpPos, setCpPos] = useState( null );
	const [destination, setDestination] = useState( null );


	useEffect(async () => {
		if( props.mapData ){
			console.log( props.mapData );

			const prevScene  = await loadScene(props.mapData.scene);

			setScene( prevScene );
			setCpPos( props.mapData.cpPos );
		}

	}, [props.mapData]);


	useEffect(() => {
		console.log( destination );
	}, [destination]);

	return(
		<div className="map p-0 m-0">
			<Canvas>
				<Suspense fallback={<Loader />}>
					<MapCanvas setCamera={setCamera}>
						{ scene ?? <Loader /> }
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

			console.log(children[index].name);
			if( memo.indexOf(children[index].name) < 0 ){
				memo.push( children[index].name )

				prevChild.push(<Build 
									index={index}
									key={children[index].name}
									geometry={geometries[index]}
									data={object.children[index]}
								/>)
			}
		}	
	}
	

	return prevChild;
}



const MapCanvas = (props) => {
	const { camera } = useThree();
	const set = useThree((state) => state.set);

	useEffect(() => {
		set({camera: new THREE.PerspectiveCamera(...CAMERA.config) });
	}, []);

	useEffect(() => {
		camera.position.set( ...CAMERA.position );
		camera.updateProjectionMatrix();
	}, [camera]);

	props.setCamera( camera );

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
			receiveShadow
			castShadow
			scale={[...Object.values(scale)]}
			geometry={parsedGeom}
			position={[...Object.values(position)]}
		>	
			<meshStandardMaterial
				color="white"
				metalness={0.3}
				roughness={0.5}
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
		<mesh name={object.name} ref={checkpoint} scale={[...Object.values(scale)]} name={object.name} position={position} >
			<sphereGeometry args={[geometry.radius, geometry.widthSegments, geometry.heightSegments]}/>
			<meshStandardMaterial />
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

	<group name="Sky">
		<Stars radius={2500} count={50000} fade />
		{/*<props.control.controls {...props?.control?.config}/>*/}
		<OrbitControls />
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
		name="Land" 
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

const Loader = (props) => {
	return <Html center> Loading </Html>;
}


export default MapView;
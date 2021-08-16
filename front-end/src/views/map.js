// =========== [TO DO]: ==============
// 1. Create checkpoints.


import React, { useState, useReducer, useEffect, useRef, Suspense } from 'react';
import {
	OrbitControls,
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
import Checkpoints from '../modules/map-checkpoints';


// Style(s)
import '../styles/map.css';


// DIY dev tools [Delete on production]
import MapDevTools from '../modules/map-other-dev-tools';


// DIY wrapper function for three first-person-controls
import FirstPersonControls from '../modules/FirstPersonControls';


// Loading components
import CircStyleLoad from '../components/load-bar/circ-load';
import InfiniteStyleLoad from '../components/load-bar/inf-load';

const devTools = new MapDevTools();

// == constants ==
const LAND_SIZE = [5000, 5000];
const CAMERA = {
	position: [0, 2500, 4000],
	far: 10000
}
const MOUSE = new THREE.Vector2();


const MapView = (props) => {
	const land = useRef();

	const [upload, setUpload] = useState( null );
	const [objList, setObjList] = useState( [] );

	const [cpPropBox, setCpPropBox] = useState( null );	
	const [propBox, setPropBox] = useState( null );

	const [copyObj, setCopyObj] = useState( null );
	const [deleteObj, setDeleteObj] = useState( null );

	const [Controls, setControls] = useState( {controls: OrbitControls, config: null} );
	const [isCheckPoint, setIsCheckPoint] = useState( false );

	const [persCam, setPersCam] = useState( null );
	const [scene, setScene] = useState( null );

	const [checkPoints, setCheckPoints] = useState( [] );


	const selectHandler = ( state, action ) => {

		if( action.reset ){
			if( state.selected ){
				glassify( state?.selected?.current?.material, true );
			}
			return { selected: null };
		}

		if( !state.selected && action.data ){
			glassify( action?.data?.current?.material );
		}
		else if( state.selected && action.data ){
			glassify( state?.selected?.current?.material, true );
			glassify( action?.data?.current?.material );
		}
		return { selected: action.data };
	}

	const cpReducer = (state, action) => {
		return selectHandler( state, action );
	}

	const impReducer = (state, action) => {
		return selectHandler( state, action );
	}


	const [impState, impDispatch] = useReducer( impReducer, {selected: null} );
	const [cpState, cpDispatch] = useReducer( cpReducer, {selected: null} );


	// ==========================================================

	function reqSetCheckPoints ( newCheckpoint ) {
		setCheckPoints([...checkPoints, newCheckpoint]);
	}

	function reqSetPropBox() {
		impDispatch({ reset: true });
	}


	useEffect(() => {
		if( upload ){
			setObjList([...objList, <MapImport key={upload.fileName} object={upload} click={impDispatch} />]);
			setUpload( null );
		}
		else if( copyObj ){
			setObjList([...objList, <MapClone key={copyObj.uuid} object={copyObj} click={impDispatch} />]);
			setCopyObj( null );	
		}
		else if( isCheckPoint ){
			setObjList([...objList, 
							<Checkpoints 
								key={objList.length} 
								position={reqSetCheckPoints} 
								openProp={setCpPropBox} 
								camera={persCam} 
								scene={scene}
								click={cpDispatch} 
								showProp={setCpPropBox}
							/>
						]);
			setIsCheckPoint( false );
		}
		else if( deleteObj ){
			setObjList([ ...objList ]);
			impDispatch({ reset: true });
		}
		
	}, [upload, copyObj, deleteObj, isCheckPoint]);


	useEffect(() => {
		if( impState.selected ){
			setPropBox(<PropertyBox 
							properties={impState.selected.current} 
							close={reqSetPropBox} 
							copy={setCopyObj} 
							delete={setDeleteObj}
						/>);
		}
		else{
			setPropBox( null );
		}

	}, [impState.selected]);


	useEffect(() => {
		if( scene && props.mapData ){
			console.log( props.mapData );
		}
	}, [scene, props.mapData]);


	useEffect(() => {
		if( props.mapData ){
			const primitives = _loadScene( props.mapData ); // [TO BE FIXED]
			setObjList([...objList, ...primitives]);
		}
	}, [props.mapData]);


	const requestSaveMap = () => {
		// [BUG]: If scene has other objects saving doesn't work. 
		if( scene ){
			const prevSceneState = saveScene( scene );
			console.log( prevSceneState );
			props.reqSaveMapData( prevSceneState );	
		}	
	}


	return(
		<div className="map">
		    <MapMenu reqSetUpload={setUpload} reqSaveMap={requestSaveMap}/>
		    <Suspense fallback={<CircStyleLoad />}>
				<Canvas>

				    <MapCanvas 
				    	landRef={land} 
				    	control={Controls}
				    	setScene={setScene}
				    	setCam={setPersCam}
				    	deleteObj={deleteObj}
				    	reqSetDelete={setDeleteObj}
				    >
				    	{ objList }
				    </MapCanvas>
				</Canvas>
			    	{ propBox }
			    	{ cpPropBox }
		    </Suspense>
		    <BottomBar control={setControls} setCheckpoint={setIsCheckPoint} />
		</div>
	);
}


const BottomBar = (props) => {
	const [switched, setSwitched] = useState( 'orbit' );

	const handleCreateCheckPoint = () => {
		props.setCheckpoint( true );
	}

	return(
		<div className="map-btm-bar d-flex justify-content-around align-items-center">
			<div className="col-7 map-view-switch d-flex justify-content-end align-items-center">
				<Button classname={`${switched === 'free' ? "map-view-selected" : ''} map-vs-btn map-view-fpc`} name="Free" click={() => { 
						props.control({
								controls: FirstPersonControls,
								config: {
									lookSpeed: 0.3,
									movementSpeed: 550
								}
							});
						setSwitched( 'free' );
				}}/>
				<Button classname={`${switched === 'orbit' ? "map-view-selected" : ''} map-vs-btn map-view-oc`} name="Orbit" click={() => { 
						props.control({ 
								controls: OrbitControls,
								config: null
							});
						setSwitched( 'orbit' );
				}}/>
			</div>

			<div className="col-5 map-checkpoint d-flex justify-content-center align-items-center">
				<Button className="map-checkpoint-btn" name="Place Checkpoint" click={handleCreateCheckPoint}/>
			</div>
		</div>
	);
}


// Canvas
const MapCanvas = (props) => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	const { scene, camera } = useThree();
	const set = useThree((state) => state.set);

	useEffect(() => {
		set({camera: new THREE.PerspectiveCamera(75, width / height, 100, 10000)});
	}, []);

	useEffect(() => {
		camera.position.set( ...CAMERA.position );
		camera.updateProjectionMatrix();
	}, [camera]);

	useEffect(() => {
		if( props.deleteObj ){
			scene.remove(props.deleteObj);
			props.reqSetDelete( null );
		}
	}, [props.deleteObj]);

	props.setCam( camera );
	props.setScene( scene );
	
	return(
		<>
			<Atmosphere control={props.control} />
			<Suspense fallback={<Loader />}>
				{ props.children }
			</Suspense>
			<Land ref={props.landRef} size={LAND_SIZE}/>
		</>
	);		
}




const _loadScene = (data, click) => {
	if( !data ) return;

	const { geometry, object } = data ;
	const prevChild = [];

	for( let index in object.children ){
		prevChild.push(
			<Build 
				geometry={geometry[index]}
				data={object.children[index]}
				click={click}
			/>
		);
	}

	return prevChild;
}



// Loading individual 3d object in previous scene
const Build = (props) => {
	const { geometry, data } = props;

	const objRef = useRef();
	const handleClick = () => props.click( objRef.current );


	const normal = new THREE.Float32BufferAttribute(
							geometry.data.attributes.normal.array,
							geometry.data.attributes.normal.itemSize,
							geometry.data.attributes.normal.normalized
					);

	const position = new THREE.Float32BufferAttribute(
							geometry.data.attributes.position.array,
							geometry.data.attributes.position.itemSize,
							geometry.data.attributes.position.normalized
					); 

	const uv = new THREE.Float32BufferAttribute(
							geometry.data.attributes.uv.array,
							geometry.data.attributes.uv.itemSize,
							geometry.data.attributes.uv.normalized
					);

	const boundingSphere = new THREE.Sphere( 
							new THREE.Vector3( ...geometry.data.boundingSphere.center ),
							geometry.data.boundingSphere.radius
					);

	const matrix = new THREE.Matrix4();
	matrix.set(data.matrix);

	return (
		<mesh
			ref={objRef}
			onClick={handleClick}
			receiveShadow
			castShadow
			layers={data.layers}
			matrix={matrix}
			geometry-attributes-normal={normal}
			geometry-attributes-position={position}
			geometry-attributes-uv={uv}
			geometry-boundingSphere={boundingSphere}
			geometry-groups={geometry.data.groups}
		>
			<meshStandardMaterial
				color="white"
				metalness={0.3}
				roughness={0.5}
			/>	
		</mesh>
	);
}



const MapClone = (props) => {
	const object = props.object;
	const objRef = useRef();

	const handleClick = () => props.click({ data: objRef });

	return(
		<mesh
			name="map_object"
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

	const handleClick = () => props.click({ data: objRef });

	return(
		<mesh
			name="map_object"
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

	<group name="Sky">
		<Stars radius={2500} count={50000} fade />
		<props.control.controls {...props?.control?.config}/>
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



const saveScene = ( scene ) => {
	return scene.toJSON();
}



export default MapView;

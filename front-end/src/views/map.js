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
import { Checkpoints, CheckpointBuilder } from '../modules/map-checkpoints';


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
	const [isPreviousSceneLoaded, setPreviousSceneLoaded] = useState( false );

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

	const reducer = (state, action) => {
		return selectHandler( state, action );
	}

	// const impReducer = (state, action) => {
	// 	return selectHandler( state, action );
	// }


	// const [impState, impDispatch] = useReducer( impReducer, {selected: null} );
	const [state, dispatch] = useReducer( reducer, {selected: null} );
	const [propBox, setPropBox] = useState( null );


	// ==========================================================

	function reqSetCheckPoints ( newCheckpoint ) {
		setCheckPoints([...checkPoints, newCheckpoint]);
	}

	function reqSetPropBox() {
		dispatch({ reset: true });
	}


	useEffect(() => {
		if( upload ){
			setObjList([...objList, <MapImport key={upload.fileName} object={upload} click={dispatch} />]);
			setUpload( null );
		}
		else if( copyObj ){
			setObjList([...objList, <MapClone key={copyObj.uuid} object={copyObj} click={dispatch} />]);
			setCopyObj( null );	
		}
		else if( isCheckPoint ){
			setObjList([...objList, 
							<Checkpoints 
								key={objList.length} 
								position={reqSetCheckPoints} 
								camera={persCam} 
								scene={scene}
								click={dispatch}
							/>
						]);
			setIsCheckPoint( false );
		}
		else if( deleteObj ){
			const newObjList = objList;
			newObjList.splice( newObjList.indexOf( deleteObj), 1 );

			setObjList( newObjList );
			dispatch({ reset: true });
		}
		
	}, [upload, copyObj, deleteObj, isCheckPoint]);


	useEffect(() => {
		if( state.selected ){
			setPropBox(<PropertyBox 
							properties={state.selected.current} 
							close={reqSetPropBox} 
							copy={setCopyObj} 
							delete={setDeleteObj}
						/>);
		}
		else{
			setPropBox( null );
		}

	}, [state.selected]);


	useEffect(() => {
		if( props.mapData && !isPreviousSceneLoaded ){
			(async () => {
				const primitives = await _loadScene( props.mapData, dispatch );
				if( primitives ){
					setObjList([...objList, ...primitives]);
					setPreviousSceneLoaded( true );
				}
			})();
		}
	}, [props.mapData, isPreviousSceneLoaded]);


	const requestSaveMap = async () => {
		if( scene ){
			const prevSceneState = JSON.stringify( scene.toJSON() );
			await props.reqSaveMapData( JSON.parse( prevSceneState ) );	
		}	
	}


	return(
		<div className="map">
		    <MapMenu reqSetUpload={setUpload} reqSaveMap={requestSaveMap}/>
		    <Suspense fallback={<Loader />}>
				<Canvas>
				    <Suspense fallback={<Loader />}>
					    <MapCanvas 
					    	landRef={land} 
					    	control={Controls}
					    	setScene={setScene}
					    	setCam={setPersCam}
					    	deleteObj={deleteObj}
					    	reqSetDelete={setDeleteObj}
					    >
					    	{ objList }
					    	{ console.log( scene ) }				    	
					    </MapCanvas>
				    </Suspense>
				</Canvas>
			    	{ state.selected ? propBox : null }
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




const _loadScene = async (data, click) => {
	if( !data ) return;

	const { geometries, object } = data ;
	const prevChild = [];

	if( !object?.children ) return;

	for( let index in object.children ){
		if ( /Land/.test(object.children[index].name) || 
			/Sky/.test(object.children[index].name)
			) continue;

		prevChild.push(
			<Build 
				key={`${new Date().getMilliseconds()}-${index}`}
				geometry={geometries[index]}
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

	console.log('name: ', data.name );

	switch( true ){
		case /checkpoint/.test(data.name):
			return <CheckpointBuilder geometry={geometry} object={data} click={props.click} />; // Create checkpoint builder

		case /map_object/.test(data.name):
			// setLoadMesh( ); // Create builder for imported objects
			return <ObjectBuilder geometry={geometry} object={data} click={props.click} />;

		default:
			console.warn(`The type ${geometry.type} is not supported at this moment.`);
			break;
	}
}


// Object Builder (for loading previous scene)
const ObjectBuilder = (props) => {
	const { geometry, object } = props;
	const objRef = useRef();

	// position, normal, uv - Float32BufferAttribute
	// center(v3), radius 
	const matrix = new THREE.Matrix4();
	const loader = new THREE.BufferGeometryLoader();
	const parsedGeom = loader.parse( geometry );

	matrix.set(...object.matrix);

	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: objRef });
	}

	console.log( parsedGeom );

	return(
		<mesh
			name="map_object"
			ref={objRef}
			onClick={handleClick}
			receiveShadow
			castShadow
			scale={50}
			geometry={parsedGeom}
			matrix={matrix}
		>	
			<meshStandardMaterial
				color="white"
				metalness={0.3}
				roughness={0.5}
			/>	
		</mesh>
	);
}


// Cloning an imported object
const MapClone = (props) => {
	const object = props.object;
	const objRef = useRef();


	const handleClick = (e) => {
		e.stopPropagation();
		
		props.click({ data: objRef })
	};


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

	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: objRef })
	};

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


    // Object name
    const reqEditName = (e) => {
        properties.name = e.target.value;
    }


	// Edit scale functions
	const reqEditScaleX = (e) => {
        properties.scale.x = parseInt(e.target.value);
    }

    const reqEditScaleY = (e) => {
        properties.scale.y = parseInt(e.target.value);
    }

    const reqEditScaleZ = (e) => {
        properties.scale.z = parseInt(e.target.value);
    }



    // Edit position functions
	const reqEditPosX = (e) => {
        properties.position.x = parseInt(e.target.value);
    }

    const reqEditPosY = (e) => {
        properties.position.y = parseInt(e.target.value);
    }

    const reqEditPosZ = (e) => {
        properties.position.z = parseInt(e.target.value);
    }



    // Edit rotation functions
	const reqEditRotX = (e) => {
        properties.rotation.x = parseInt(e.target.value);
    }

    const reqEditRotY = (e) => {
        properties.rotation.y = parseInt(e.target.value);
    }

    const reqEditRotZ = (e) => {
        properties.rotation.z = parseInt(e.target.value);
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
            	
            	{ 
            		properties?.name === 'checkpoint' ? 
            			<PropBoxInp id="scaleX" size={inputSize}  value={properties.name} handleChange={reqEditName} name="Room Name"/> 
            			: null 
            	}

            	<PropBoxInp id="scaleX" size={inputSize}  value={properties.scale.x} handleChange={reqEditScaleX} name="Scale X"/>
            	
            	<PropBoxInp id="scaleY" size={inputSize}  value={properties.scale.y} handleChange={reqEditScaleY} name="Scale Y"/> 
            	
            	<PropBoxInp id="scaleZ" size={inputSize}  value={properties.scale.z} handleChange={reqEditScaleZ} name="Scale Z"/> 
            	
            	<PropBoxInp id="posX" size={inputSize}  value={properties.position.x} handleChange={reqEditPosX} name="Position X"/> 
            	
            	<PropBoxInp id="posY" size={inputSize}  value={properties.position.y} handleChange={reqEditPosY} name="Position Y"/> 
            	
            	<PropBoxInp id="posZ" size={inputSize}  value={properties.position.z} handleChange={reqEditPosZ} name="Position Z"/> 
            	
            	{ 
            		properties?.name === 'checkpoint' ? () => (
	            		<>
			            	<PropBoxInp id="rotX" size={inputSize}  value={properties.rotation.x} handleChange={reqEditRotX} name="Rotation X"/> 
			            	
			            	<PropBoxInp id="rotY" size={inputSize}  value={properties.rotation.y} handleChange={reqEditRotY} name="Rotation Y"/> 
			            	
			            	<PropBoxInp id="rotZ" size={inputSize}  value={properties.rotation.z} handleChange={reqEditRotZ} name="Rotation Z"/> 
	            		</>
	            	) : null 
            	}
            	
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



export default MapView;

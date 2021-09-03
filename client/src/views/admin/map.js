import React, { 
	useState, 
	useReducer, 
	useEffect, 
	useRef, 
	Suspense, 
} from 'react';

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
import MapMenu from '../../components/admin/menu/map-menu';
import { Input } from '../../components/admin/inputs/input';
import Button from '../../components/admin/buttons/button';
import { Checkpoints, CheckpointBuilder } from '../../modules/map-checkpoints';


// Style(s)
import '../../styles/admin/map.css';



// DIY wrapper function for three first-person-controls
import FirstPersonControls from '../../modules/FirstPersonControls';


// Loading components
import CircStyleLoad from '../../components/admin/load-bar/circ-load';
import InfiniteStyleLoad from '../../components/admin/load-bar/inf-load';


// == constants ==
const LAND_SIZE = [10000, 10000];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const CAMERA = {
	config: [75, WIDTH / HEIGHT, 100, 20000],
	position: [0, 2400, 2400],
	far: 50000
}

var EMPTY_NAME_CP_SPOTTED = false;
var PROP_BOX_DETECTED = false;	

const MapView = (props) => {
	const land = useRef();

	const [upload, setUpload] = useState( null );
	const [objList, setObjList] = useState( [] );

	const [copyObj, setCopyObj] = useState( null );
	const [deleteObj, setDeleteObj] = useState( null );

	const [Controls, setControls] = useState( {controls: OrbitControls, config: null} );
	const [isCheckPoint, setIsCheckPoint] = useState( false );

	const [persCam, setPersCam] = useState( null );
	const [scene, setScene] = useState( null );

	const [checkPoints, setCheckPoints] = useState( [] );

	const [mapMessage, setMapMessage] = useState( [] );

	const [enableMenu, setEnableMenu] = useState( true );

	const [objectCount, setObjectCount] = useState( 0 );

	const selectHandler = ( state, action ) => {

		if( action.reset ){
			if( state.selected ){
				glassify( state?.selected?.current?.material, true );
			}
			setEnableMenu( true );
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

	const [state, dispatch] = useReducer( reducer, {selected: null} );
	const [propBox, setPropBox] = useState( null );


	// ==========================================================

	function reqSetCheckPoints ( newCheckpoint ) {
		setCheckPoints((checkPoints) => {
			if( checkPoints.map( cp => cp.name ).indexOf( newCheckpoint.name ) > - 1){
				return [...checkPoints];
			}
			else{
				return [...checkPoints, newCheckpoint];
			}
		});
	}

	function reqSetPropBox() {
		dispatch({ reset: true });
	}


	useEffect(() => console.log( checkPoints ), [checkPoints]);


	useEffect(() => {
		if( upload || copyObj || isCheckPoint ) setObjectCount((objectCount) => objectCount + 1);


		if( upload ){
			setObjList((objList) => [
										...objList, 
										<MapImport
											key={`map_object_${objectCount}`} 
											index={objectCount} 
											object={upload} 
											click={dispatch} 
										/>
									]);
			setMapMessage((mapMessage) => [...mapMessage, '3D object had been uploaded successfully']);			
			setUpload( null );
		}
		else if( copyObj ){
			if( copyObj.name.search('checkpoint') > -1 ){
				setObjList((objList) => [
											...objList, 
											<Checkpoints 
												index={objectCount} 
												key={`checkpoint_${objectCount}`}
												saveCheckpoint={reqSetCheckPoints} 
												camera={persCam} 
												scene={scene}
												click={dispatch}
											/>
										]);			
			}
			else if( copyObj.name.search('map_object') > -1 ){
				setObjList((objList) => [
											...objList, 
											<MapClone 
												key={`map_object_${objectCount}`} 
												index={objectCount} 
												object={copyObj} 
												click={dispatch} 
											/>
										]);			
			}
			setCopyObj( null );	

		}
		else if( isCheckPoint ){
			setObjList((objList) => [...objList, 
							<Checkpoints 
								index={objectCount}
								key={`checkpoint_${objectCount}`} 
								saveCheckpoint={reqSetCheckPoints} 
								camera={persCam} 
								scene={scene}
								click={dispatch}
							/>
						]);
			setIsCheckPoint( false );
		}
		else if( deleteObj ){
			// work-1
			console.log( checkPoints );

			let newCpList = removeByName( checkPoints, deleteObj );			
			let newObjList = removeByKey( objList, deleteObj );

			setCheckPoints(() => [...newCpList]);
			setObjList(() => [...newObjList]);	


			dispatch({ reset: true });
		}
		
	}, [upload, copyObj, deleteObj, isCheckPoint, checkPoints, objList]);


	useEffect(() => {
		if( state.selected ){
			setEnableMenu( false );
			setPropBox(<PropertyBox 
							properties={state.selected.current} 
							close={reqSetPropBox} 
							copy={setCopyObj} 
							remove={setDeleteObj}
							setCheckPoints={setCheckPoints}
							scene={scene}
						/>);
			PROP_BOX_DETECTED = !PROP_BOX_DETECTED;
		}
		else{
			setPropBox( null );
			PROP_BOX_DETECTED = !PROP_BOX_DETECTED;
		}

	}, [state.selected]);


	useEffect(() => {
		const sceneLoader = async () => {
			if( !objList?.length ){
				const primitives = await loadScene( props.mapData, dispatch, reqSetCheckPoints );
				if( primitives?.length ){
					setObjList((objList) => [ ...primitives ]);

					setObjectCount( () => getLastStringToNumber(primitives[primitives.length - 1].key) + 1  ); // 
					setMapMessage((mapMessage) => [...mapMessage, 'Previous scene has been loaded successfully']);
				};
			}
		}

		if( !props.mapData ){
			setMapMessage((mapMessage) => [...mapMessage, 'Fetching previous scene']);			
		}
		else{
			sceneLoader();
		}

	}, [props.mapData]);

	const requestSaveMap = async () => {
		if( scene ){
			const prevSceneState = JSON.stringify( scene.toJSON() );


			console.log( checkPoints );
			const mapBundle = {
								scene: JSON.parse( prevSceneState ), 
								cpPosition: checkPoints.map(elem => ({name: elem.name, position: elem.position}))
							}
			const message = await props.reqSaveMapData( mapBundle );

			setMapMessage( (mapMessage) => [...mapMessage, message.message] );
		}	
	}


	return(
		<div className="map">
		    <Suspense fallback={<Loader />}>
			    <MapMenu 
			    	reqSetUpload={setUpload} 
			    	reqSaveMap={requestSaveMap} 
			    	switch={enableMenu} 
			    	messenger={setMapMessage} 
			    	saveAllowed={EMPTY_NAME_CP_SPOTTED}
			    />
			    	<Messenger message={mapMessage} messenger={setMapMessage}/>
					<Canvas shadows={true}>
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
						    </MapCanvas>
					    </Suspense>
					</Canvas>
				    	{ state.selected ? propBox : null }
			    <BottomBar control={setControls} setCheckpoint={setIsCheckPoint} />
		    </Suspense>
		</div>
 	);
}


const Messenger = (props) => {
	let { message, messenger } = props;
	const [msg, setMsg] = useState('');
	
	const DECAY_TIME = 2000;

	useEffect(() => {
		const displayMessage = async ( newMessage ) => {
			setMsg(() => newMessage);
			setTimeout(() => setMsg(() => ''), DECAY_TIME);
		}

		message.forEach( pendingMsg => setTimeout(() => displayMessage(pendingMsg), DECAY_TIME) );
	}, [message]);

	return (
		<div className={`map-message ${msg ? 'd-flex' : 'd-none'} justify-content-center align-items-center p-3`}>
			<p className="p-0 m-0 px-2">{ msg }</p>
		</div>
	);
}

const BottomBar = (props) => {
	const [switched, setSwitched] = useState( 'orbit' );

	const handleCreateCheckPoint = () => {
		props.setCheckpoint( true );
		EMPTY_NAME_CP_SPOTTED = true;
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


// Canvas;
const MapCanvas = (props) => {
	const { scene, camera } = useThree();
	const set = useThree((state) => state.set);

	useEffect(() => {
		set({camera: new THREE.PerspectiveCamera(...CAMERA.config)});
	}, []);

	useEffect(() => {
		camera.position.set( ...CAMERA.position );
		camera.updateProjectionMatrix();
		props.setCam( camera );

	}, [camera]);

	useEffect(() => {
		if( props.deleteObj ){
			delete props.deleteObj.__r3f.handlers.onClick;
			props.reqSetDelete(() => null);

		}
	}, [props.deleteObj]);

	props.setScene( () => scene );

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




const loadScene = async (data, click, checkpointSaver) => {
	if( !data ) return;

	let key;

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

			if( isCheckpointObject(children[index].name) ){
				key = `checkpoint_${index}`;
			}
			else{
				key = `map_object_${index}`;
			}
				prevChild.push(<Build 
									index={index}
									key={key}
									geometry={geometries[index]}
									data={object.children[index]}
									click={click}
									saveCheckpoint={checkpointSaver}
								/>);
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
			return (<CheckpointBuilder 
						name={getRootName(data.name)}
						index={props.index}
						geometry={geometry} 
						object={data} 
						click={props.click} 
						saveCheckpoint={props.saveCheckpoint} 
					/>); 

		case /map_object/.test(data.name):
			return <ObjectBuilder
						index={props.index}
						geometry={geometry} 
						object={data} 
						click={props.click} 
					/>;

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

	const handleClick = (e) => {
		e.stopPropagation();

		props.click({ data: objRef });
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
		>	
			<meshStandardMaterial
				color={0xCAD3C8}
				metalness={0.1}
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
		
		props.click({ data: objRef });
	};

	return(
		<mesh
			name={`map_object_${props.index}`}
			ref={objRef}
			onDoubleClick={handleClick}
			receiveShadow
			castShadow
			scale={50}
			geometry={object.geometry}
		>
			<meshStandardMaterial
				color={0xCAD3C8}				
				metalness={0.1}
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

		props.click({ data: objRef });
	};

	return(
		<mesh
			name={`map_object_${props.index}`}
			ref={objRef}
			onDoubleClick={handleClick}
			receiveShadow
			castShadow
			scale={50}
			geometry={object.geometry}
		>
			<meshStandardMaterial
				color={0xCAD3C8}
				metalness={0.1}
				roughness={0.5}
			/>	
		</mesh>
	);
}



// Atmosphere
const Atmosphere = (props) => (

	<group name="Sky">
		<Stars radius={LAND_SIZE[0]} count={LAND_SIZE[0]} fade />
		<props.control.controls enabled={PROP_BOX_DETECTED} {...props?.control?.config}/>
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
			color={0x596275} 
			roughness={0.9}
			metalness={0.5}
		/>
	</mesh>
));



// Property Box
const PropertyBox = (props) => {
	const { scene } = props;

	const properties = props.properties;

    const inputSize = {width: '90%', height: '50px'};

    const checkpointType = (properties?.name.search('checkpoint') > -1) ? true : false;

    const setMonitor = (name) => !getRootName( properties.name ) ? true : false;  

	const [name, setName] = useState( getRootName(properties.name).toLowerCase() );

    if( checkpointType ){
    	EMPTY_NAME_CP_SPOTTED = setMonitor( properties.name );
	    var baseName = getBaseName( properties.name );	  
    }


    // Object name
    const reqEditName = (e) => {
    	const meshData = scene.getObjectById( properties.id );
        setName( e.target.value.toLowerCase() );
        properties.name = `${baseName}${e.target.value.toUpperCase()}`;
    	meshData.name = properties.name;	    


	    EMPTY_NAME_CP_SPOTTED = setMonitor( properties.name );
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
    	props.remove( () => properties );
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
            		checkpointType  ? 
            			<PropBoxInp id="name" size={inputSize} type="text" value={name} placeholder="No name" handleChange={reqEditName} name="Room Name"/> 
            			: null 
            	}

            	<PropBoxInp id="scaleX" size={inputSize}  value={properties.scale.x} handleChange={reqEditScaleX} name="Scale X"/>
            	
            	<PropBoxInp id="scaleY" size={inputSize}  value={properties.scale.y} handleChange={reqEditScaleY} name="Scale Y"/> 
            	
            	<PropBoxInp id="scaleZ" size={inputSize}  value={properties.scale.z} handleChange={reqEditScaleZ} name="Scale Z"/> 
            	
            	<PropBoxInp id="posX" size={inputSize}  value={properties.position.x} handleChange={reqEditPosX} name="Position X"/> 
            	
            	<PropBoxInp id="posY" size={inputSize}  value={properties.position.y} handleChange={reqEditPosY} name="Position Y"/> 
            	
            	<PropBoxInp id="posZ" size={inputSize}  value={properties.position.z} handleChange={reqEditPosZ} name="Position Z"/>             	
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
            	placeholder={props.placeholder}
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
	const prevColor = material.color;

	material.color.set(unGlassify ? prevColor : 0x55efc4);
	material.opacity = unGlassify ? 1 : 0.5;
	material.transparent = unGlassify ? false : true;	
}



// Loader
const Loader = ( props ) => { 
	const { progress } = useProgress();

	return <Html center> Loading: { progress }% </Html>
}

// Remover work-2
const removeByKey = (list, objToDelete) => {
	const removeDeletedObject = (elem) => {
		let name = objToDelete.name;

		if( isCheckpointObject(name) ){
			return elem?.key !== removeEndString( getBaseName(name) );			 
		}

		return elem?.key !== name;			 
	}

	console.log( list );
	return list.filter( removeDeletedObject );
}

const removeByName = (list, objToDelete) => {
	const removeDeletedObject = (elem) => {
		let name = objToDelete.name;

		console.log( elem?.name, name );

		return elem?.name !== name;	 
	}

	return list.filter( removeDeletedObject );
}


const removeEndString = (string) => {
	string = getBaseName(string).split('');
	string.pop();
	string = string.join('');

	return string;
}

const getLastStringToNumber = (string) => {

	string = string.split('_');
	string = string[string.length - 1];

	try{
		return Number( string );
	}
	catch (err) {
		throw new Error( err );
	}
}

const isCheckpointObject = (name) => name?.search('checkpoint') > -1 ? true : false;

const getRootName = (name) => name?.replace?.(/checkpoint_([0-9]+)_/, ''); // Returns: room123
	
const getBaseName = (name) => name?.replace?.(getRootName(name), ''); // Returns: checkpoint_123_



export default MapView;

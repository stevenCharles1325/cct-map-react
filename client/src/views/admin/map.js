import React, { 
	useState, 
	useReducer, 
	useEffect, 
	useRef, 
	Suspense, 
} from 'react';

import axios from 'axios';

import {
	OrbitControls,
	Stars,
	Html,
	useProgress,
	SpotLight
} from '@react-three/drei';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


import * as THREE from 'three';


// Components
import MapMenu from '../../components/admin/menu/map-menu';
import { Input } from '../../components/admin/inputs/input';
import Button from '../../components/admin/buttons/button';
import Checkpoints from '../../modules/map-checkpoints';


// Style(s)
import '../../styles/admin/map.css';


// Module
import FirstPersonControls from '../../modules/FirstPersonControls'; // DIY wrapper function for three first-person-controls
import * as MAP from '../../modules/cct-map';


// Loading components
import CircStyleLoad from '../../components/admin/load-bar/circ-load';
import InfiniteStyleLoad from '../../components/admin/load-bar/inf-load';


const materialOptions = {
	color: 0x3f4444,
	roughness: 0.4,
	metalness: 0
}

const defaultMaterial = new THREE.MeshStandardMaterial( materialOptions );


const MapView = (props) => {
	const land = useRef();

	const [mapData, setMapData] = useState( null );

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


	// Fetches map data
	const requestMapData = async () => {
		await axios.get('/admin/map-data')
		.then( res => {
			setMapData( res.data );
		})
		.catch( err => {
			// errorHandler( err );
		});
	}


	// Requests to save map
	const requestSaveMapData = async (scene) => {	
		if( !scene ) return;

		await axios.post('/admin/update-map', scene)
		.then( res => {
			return { message : res ? 'Map has been saved successfully' : 'Please try again!' };
		})
		.catch( err => {
			// errorHandler( err );
			return { message : err } ;
		});
	}


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
			MAP.setPropBoxDetected( !MAP.PROP_BOX_DETECTED );
		}
		else{
			setPropBox( null );
			MAP.setPropBoxDetected( !MAP.PROP_BOX_DETECTED );
		}

	}, [state.selected]);


	useEffect(() => {
		const sceneLoader = async () => {
			if( !objList?.length ){
				
				const params = {
					userType	: 'admin',
					data 		: mapData,
					click 		: dispatch, 
					checkPointSaver: reqSetCheckPoints
				}

				const primitives = await MAP.loadScene( params );

				if( primitives?.length ){
					setObjList((objList) => [ ...primitives ]);

					setObjectCount( () => getLastStringToNumber(primitives[primitives.length - 1].key) + 1  );

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

			const mapBundle = {
								scene: JSON.parse( prevSceneState ), 
								cpPosition: checkPoints.map(elem => ({name: elem.name, position: elem.position}))
							}
			const message = await requestSaveMapData( mapBundle );

			setMapMessage( (mapMessage) => [...mapMessage, message.message] );
		}	
	}


	return(
		<div className="map">
		    <Suspense fallback={<MAP.Loader />}>
			    <MapMenu 
			    	reqSetUpload={setUpload} 
			    	reqSaveMap={requestSaveMap} 
			    	switch={enableMenu} 
			    	messenger={setMapMessage} 
			    	saveAllowed={MAP.EMPTY_NAME_CP_SPOTTED}
			    />
			    	<MAP.Messenger message={mapMessage} messenger={setMapMessage}/>
					<Canvas mode="concurrent" shadows={true}>
					    <Suspense fallback={<MAP.Loader />}>
						    <MAP.MapCanvas 
						    	type="admin"
						    	control={Controls}
						    	setScene={setScene}
						    	setCam={setPersCam}
						    	deleteObj={deleteObj}
						    	reqSetDelete={setDeleteObj}
						    >
						    	{ objList }
						    </MAP.MapCanvas>
					    </Suspense>
					</Canvas>
				    	{ state.selected ? propBox : null }
			    <BottomBar control={setControls} setCheckpoint={setIsCheckPoint} />
		    </Suspense>
		</div>
 	);
}


const BottomBar = (props) => {
	const [switched, setSwitched] = useState( 'orbit' );

	const handleCreateCheckPoint = () => {
		props.setCheckpoint( true );
		MAP.setEmtyNameCpSpotted( true );
	}

	return(
		<div className="map-btm-bar d-flex justify-content-around align-items-center">
			<div className="col-7 map-view-switch d-flex justify-content-end align-items-center">
				<Button classname={`${switched === 'free' ? "map-view-selected" : ''} map-vs-btn map-view-fpc`} name="Free" click={() => { 
						props.control(() => ({
												controls: FirstPersonControls,
												config: {
													lookSpeed: 0.3,
													movementSpeed: 550
												}
											}));
						setSwitched( 'free' );
				}}/>
				<Button classname={`${switched === 'orbit' ? "map-view-selected" : ''} map-vs-btn map-view-oc`} name="Orbit" click={() => { 
						props.control(() => ({ 
												controls: OrbitControls,
												config: null
											}));
						setSwitched( 'orbit' );
				}}/>
			</div>

			<div className="col-5 map-checkpoint d-flex justify-content-center align-items-center">
				<Button className="map-checkpoint-btn" name="Place Checkpoint" click={handleCreateCheckPoint}/>
			</div>
		</div>
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
			material={defaultMaterial}
		>
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
			material={defaultMaterial}
		>
		</mesh>
	);
}




// Property Box
const PropertyBox = (props) => {
	const { scene } = props;

	const properties = props.properties;

    const inputSize = {width: '90%', height: '50px'};

    const checkpointType = (properties?.name.search('checkpoint') > -1) ? true : false;

    const setMonitor = (name) => !MAP.getRootName( properties.name ) ? true : false;  

	const [name, setName] = useState( MAP.getRootName(properties.name).toLowerCase() );

    if( checkpointType ){
    	MAP.setEmtyNameCpSpotted( setMonitor( properties.name ) );
	    var baseName = MAP.getBaseName( properties.name );	  
    }


    // Object name
    const reqEditName = (e) => {
    	const meshData = scene.getObjectById( properties.id );
        setName( e.target.value.toLowerCase() );
        properties.name = `${baseName}${e.target.value.toUpperCase()}`;
    	meshData.name = properties.name;	    

    	MAP.setEmtyNameCpSpotted( setMonitor( properties.name ) );
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

	material.color.set(unGlassify ? materialOptions.color : 0x55efc4);
	material.opacity = unGlassify ? 1 : 0.5;
	material.transparent = unGlassify ? false : true;	
}


// Remover work-2
const removeByKey = (list, objToDelete) => {
	const removeDeletedObject = (elem) => {
		let name = objToDelete.name;

		if( MAP.isCheckpointObject(name) ){
			return elem?.key !== removeEndString( MAP.getBaseName(name) );			 
		}

		return elem?.key !== name;			 
	}

	return list.filter( removeDeletedObject );
}

const removeByName = (list, objToDelete) => {
	const removeDeletedObject = (elem) => {
		let name = objToDelete.name;

		return elem?.name !== name;	 
	}

	return list.filter( removeDeletedObject );
}


const removeEndString = (string) => {
	string = MAP.getBaseName(string).split('');
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


export default MapView;

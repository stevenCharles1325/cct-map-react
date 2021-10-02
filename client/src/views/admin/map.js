import React, { 
	useState, 
	useReducer, 
	useEffect, 
	useRef, 
	Suspense,
	useCallback
} from 'react';

import {
	OrbitControls,
	Stars,
	Html,
	useProgress,
	SpotLight,
	GizmoHelper,
	GizmoViewport
} from '@react-three/drei';

import { 
	Canvas, 
	useThree,
	useFrame, 
	useLoader, 
} from '@react-three/fiber';


import axios from 'axios';
import uniqid from 'uniqid';
import * as THREE from 'three';
import Cookies from 'js-cookie';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Components
import { 
	Checkpoints, 
	CheckpointGen 
} from '../../modules/map-checkpoints';
import Button from '../../components/admin/buttons/button';
import MapMenu from '../../components/admin/menu/map-menu';
import { Input } from '../../components/admin/inputs/input';


// Style(s)
import '../../styles/admin/map.css';


// Module
import * as MAP from '../../modules/cct-map';
import MapMeasureLine from '../../modules/measure-line';
import PositionCursor from '../../modules/position-cursor';
import FirstPersonControls from '../../modules/FirstPersonControls';
import CheckpointGenerator from '../../modules/checkpoint-generator';


// Loading components
import CircStyleLoad from '../../components/admin/load-bar/circ-load';
import InfiniteStyleLoad from '../../components/admin/load-bar/inf-load';

const width = window.innerWidth;
const height = window.innerHeight;

const materialOptions = {
	color: 0x3f4444,
	roughness: 0.4,
	metalness: 0
}

const defaultMaterial = new THREE.MeshStandardMaterial( materialOptions );


const MapView = (props) => {
	const { ErrorHandler } = props;

	const land = useRef();
	const line = useRef();

	const [mapMessage, setMapMessage] = useState( [] );
	const [enableMenu, setEnableMenu] = useState( true );
	const [objectCount, setObjectCount] = useState( 0 );

	const [mapData, setMapData] = useState( null );

	const [upload, setUpload] = useState( null );
	const [objList, setObjList] = useState( [] );

	const [deleteObj, setDeleteObj] = useState( null );

	const [Controls, setControls] = useState({ 
		controls: OrbitControls, 
		config: {
			enabled: true
		},
		event: null
	});

	const [persCam, setPersCam] = useState( null );
	const [scene, setScene] = useState( null );

	const [isCheckPoint, setIsCheckPoint] = useState( false );
	const [checkPoints, setCheckPoints] = useState( [] );

	const [measureLine, setMeasureLine] = useState( null );
	const [isMeasureLine, setIsMeasureLine] = useState( false );
	const [label, setLabel] = useState( null );

	const LabelDisplay = ({ position, textDisplay }) => {
		return (
			<Html 
				position={ position } 
				className="non-selectable container"
			>
				{ textDisplay }
			</Html>
		);
	}

	const measuredDistanceDisplay = () => {
		if( !label || label[1] === "0.00" ) return;
		
		return <LabelDisplay position={label[0]} textDisplay={label[1]}/>;
	}

	const memoizedLabel = useCallback( () => measuredDistanceDisplay(), [label] );

	const reqSetCheckPoints = ( newCheckpoint ) => {
		setCheckPoints((checkPoints) => {
			if( checkPoints.map( cp => cp.name ).indexOf( newCheckpoint.name ) > - 1 ){

				return [...checkPoints];
			}
			else{
				return [...checkPoints, newCheckpoint];
			}
		});
	}

	const [propBoxCont, setPropBoxCont] = useState( null );
	const [propBox, setPropBox] = useState( null );
	const selectHandler = ( state, action ) => {
		if( action.reset ){
			if( state.selected ){
				glassify( state?.selected?.current?.material, true );
			}
	
			setEnableMenu( true );
			setPropBoxCont( null );
			return { selected: null };
		}

		if( !state.selected && action.data ){
			glassify( action?.data?.current?.material );
		} 
		else if( state.selected && action.data ){
			glassify( state?.selected?.current?.material, true );
			glassify( action?.data?.current?.material );
		}

		if( action.data ){
			setEnableMenu( false );

			setPropBoxCont(action.data.current);
		}

		return { selected: action.data };
	}

	const reducer = ( state, action ) => selectHandler( state, action );
	const [state, dispatch] = useReducer( reducer, {selected: null} );

	const [isPositionCursor, setIsPositionCursor] = useState( false );
	const [positionCursor, setPositionCursor] = useState( null );

	const [isCheckpointGen, setIsCheckpointGen] = useState( false );
	const [checkpointGen, setCheckpointGen] = useState( null );

	const initGenState = () => ({
		initPosition: [ 0, 0, 0 ],
		areaSize: [ 0, 0, 0 ],
		distance: [ 0, 0, 0 ],
		roomName: [ 'room', 0, 0 ]
	});

	const genReducer = ( state, action ) => {
		switch( action.type ){
			case 'initPosition':
				state.initPosition[ action.index ] = action.data;
				return state;

			case 'areaSize':
				state.areaSize[ action.index ] = action.data;
				return state;

			case 'distance':
				state.distance[ action.index ] = action.data;
				return state;

			case 'roomName':
				state.roomName[ action.index ] = action.data;
				return state;

			case 'start':
				let {
					initPosition,
					areaSize,
					distance,
					roomName
				} = state;

				const convertToNumber = ( point ) => {
					return point === '0'
							? 1
							: Number( point );
				}

				distance = distance.map( convertToNumber );
				areaSize = areaSize.map( convertToNumber );
				initPosition = initPosition.map( convertToNumber )
				.map( (elem, index) => index === 1 ? elem + 50 : elem );

				
				let keyNumber = objectCount;
				let roomNumber = Number( roomName[1] );

				const getKeyNumber = () => keyNumber;
				const evaluateCondition = (start, leftOp, rightOp) => {
					return start <= rightOp 
						? leftOp < rightOp
						: leftOp > rightOp;
				}

				const isRoomNumberExist = ( ) => !roomName[1] || !roomName[2] ? false : true;
				const isNegative = ( number ) => number < 0;
				const evaluateIteration = ( start, end, distance ) => {
					return start <= end 
						? true
						: isNegative( distance );
				}

				const heightEnd =  distance[1] * areaSize[1] + initPosition[1];
				const depthEnd =  distance[2] * areaSize[2] + initPosition[2];
				const widthEnd =  distance[0] * areaSize[0] + initPosition[0];

				const cpAccumulator = [];

				( async () => {
					for( let height = initPosition[1]; 
					evaluateCondition(initPosition[1], height, heightEnd); 
					evaluateIteration(initPosition[1], heightEnd, distance[1]) 
						? height += distance[1]
						: height -= distance[1]
					){
					
						for( let depth = initPosition[2];
							 evaluateCondition(initPosition[2], depth, depthEnd); 
							 evaluateIteration(initPosition[2], depthEnd, distance[2]) 
							 	? depth += distance[2] 
							 	: depth -= distance[2]
							){

							for( 
								let width = initPosition[0]; 
								evaluateCondition(initPosition[0], width, widthEnd); 
								evaluateIteration(initPosition[0], widthEnd, distance[0]) 
									? width += distance[0]
									: width -= distance[0] 
								){
									const generatedName = isRoomNumberExist() 
										? `${roomName[0].toUpperCase()}${roomNumber}`
										: 'connector';

									cpAccumulator.push(
										<CheckpointGen
											click={dispatch}
											name={generatedName}
											index={getKeyNumber()}
											setControls={setControls}
											key={`checkpoint_${keyNumber}`}
											saveCheckpoint={reqSetCheckPoints} 
											position={new Array(width, height, depth)}
										/>
									);
									
									roomNumber = isRoomNumberExist() ? roomNumber + 1 : null;
									keyNumber++;
							}
						}
					}

					cpAccumulator.forEach( cp => {
						setObjList( objList => [
							...objList,
							cp		
						]);
					});

					setObjectCount( keyNumber );
				})();

				action.type = 'reset';
				return genReducer( state, action );

			case 'reset':
				setIsCheckpointGen( false );
				state = initGenState();
				return state;

			default:
				throw new Error('Error in updating generator state');
		}
	}

	const [checkpointGenState, checkpointGenDispatch] = useReducer( genReducer, initGenState() );
	const [manual, setManual] = useState( null );

	const reqSetPropBox = () => dispatch({ reset: true });

	// Fetches map data
	const requestMapData = async () => {
		const token = Cookies.get('token');
		const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props.Event.emit('unauthorized');
        }

		axios.get('https://localhost:4443/admin/map-data', {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			setMapData( res.data );
		})
		.catch( err => {
			ErrorHandler.handle( err, requestMapData, 3 );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post('https://localhost:4444/auth/refresh-token', { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestMapData(), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
		});
	}


	// Requests to save map
	const requestSaveMapData = async (scene) => {	
		if( !scene ) return;

		const token = Cookies.get('token');
		const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props.Event.emit('unauthorized');
        }

		return await axios.post('https://localhost:4443/admin/update-map', scene, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			return { 
				message : res 
						? 'Map has been saved successfully' 
						: 'Please try again!' 
			};
		})
		.catch( err => {
			ErrorHandler.handle( err, requestSaveMapData, 4, scene );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post('https://localhost:4444/auth/refresh-token', { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestSaveMapData(scene), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }

			return { message : err };
		});
	}

	useEffect(() => requestMapData(), []);

	useEffect(() => {
		if( upload || isCheckPoint ) setObjectCount((objectCount) => objectCount + 1);

		if( upload ){
			setObjList((objList) => [
				...objList, 
				<MapImport
					object={upload} 
					click={dispatch} 
					index={objectCount} 
					key={`map_object_${objectCount}`} 
				/>
			]);
			setMapMessage((mapMessage) => [...mapMessage, '3D object had been uploaded successfully']);			
			setUpload( null );
		}
		else if( isCheckPoint ){
			setObjList((objList) => [...objList, 
				<Checkpoints 
					scene={scene}
					camera={persCam} 
					click={dispatch}
					index={objectCount}
					setControls={setControls}	
					key={`checkpoint_${objectCount}`} 
					saveCheckpoint={reqSetCheckPoints} 
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
		
	},  [upload, deleteObj, isCheckPoint, checkPoints, objList, objectCount]);

	useEffect(() => {
		if( propBoxCont ){
			setPropBox( null );
			setTimeout(() => {
				setPropBox(() => 
					<PropertyBox
						scene={scene}
						remove={setDeleteObj}
						close={reqSetPropBox} 
						setCheckPoints={setCheckPoints}
						properties={propBoxCont} 
					/>
				);
			}, 1000);
		}
		else{
			setPropBox( null );
		}
	}, [propBoxCont]);


	useEffect(() => {
		if( isMeasureLine ){
			const configuration = Controls.config;
			configuration.enabled = false;

			setControls( Controls => ({
				controls: Controls.controls,
				config: configuration,
				event: 'measuring'						
			}));
			
			setMeasureLine(() => ( 
				<MapMeasureLine 
					camera={ persCam } 
					scene={ scene }
					label={ setLabel }
		 		/>
		 	));
		}
		else{
			const configuration = Controls.config;
			configuration.enabled = true;


			setControls( Controls => ({
				controls: Controls.controls,
				config: configuration,
				event: null						
			}));
			
			setMeasureLine( () => null );
		}

	}, [isMeasureLine]);

	useEffect(() => {
		if( isPositionCursor ){
			setPositionCursor(() => ( 
				<PositionCursor 
					camera={ persCam } 
					scene={ scene }
 		  		/>
	  		));
		}
		else{
			setPositionCursor( () => null );
		}

	}, [isPositionCursor]);

	useEffect(() => {
		if( isCheckpointGen ){
			setCheckpointGen(() => (
				<CheckpointGenerator 
					dispatch={ checkpointGenDispatch }
					setControls={setControls}	
				/>
			));
		}
		else{
			setCheckpointGen( () => null );
		}

	}, [isCheckpointGen]);

	useEffect(() => {
		const sceneLoader = async () => {
			if( !objList?.length ){
				
				const params = {
					userType	: 'admin',
					data 		: mapData,
					click 		: dispatch, 
					setControls : setControls,
					checkPointSaver: reqSetCheckPoints
				}

				const primitives = await MAP.loadScene( params );

				if( primitives?.length ){
					setObjList((objList) => [ ...primitives ]);

					setObjectCount( () => getLastStringToNumber(primitives[primitives.length - 1].key) + 1  );

					setMapMessage((mapMessage) => [
						...mapMessage, 
						'Previous scene has been loaded successfully'
					]);
				};
			}
		}

		if( !mapData ){
			setMapMessage((mapMessage) => [...mapMessage, 'Fetching previous scene']);			
		}
		else{
			sceneLoader();
		}

	}, [mapData]);

	const requestSaveMap = async () => {
		if( scene ){
			const prevSceneState = JSON.stringify( scene.toJSON() );

			const mapBundle = {
				scene: JSON.parse( prevSceneState ), 
				cpPosition: checkPoints.map(elem => ({
					name: elem.name, position: elem.position
				}))
			}

			const message = await requestSaveMapData( mapBundle );

			setMapMessage( (mapMessage) => [...mapMessage, message.message] );
		}	
	}

	return(
		<div className="map">
		    <Suspense fallback={<MAP.Loader />}>
			    <MapMenu 
			    	switch={enableMenu} 
			    	setManual={setManual}
			    	reqSetUpload={setUpload} 			    	
			    	messenger={setMapMessage}
			    	reqSaveMap={() => requestSaveMap()} 
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
						    	{ label }		
						    	{ objList }
						    	{ measureLine }
						    	{ positionCursor }
						    	{ memoizedLabel() }
						    	<GizmoHelper
							    	alignment="top-left"
							    	margin={[width * 0.15, height * 0.15]}
							    >
							    	<GizmoViewport 
							    		axisColors={[
							    			'rgba(130, 204, 221,1.0)', 
							    			'rgba(250, 211, 144,1.0)', 
							    			'rgba(184, 233, 148,1.0)'
							    		]}
							    		labelColor="rgba(60, 99, 130,1.0)"
							    	/>
							    </GizmoHelper>
						    </MAP.MapCanvas>
					    </Suspense>
					</Canvas>
						{ manual }
				    	{ checkpointGen }		
				    	{ state.selected ? propBox : null }
			    <BottomBar 
			    	control={ setControls } 
		    		messenger={ setMapMessage }
			    	setCheckpoint={ setIsCheckPoint }
		    		setIsMeasureLine={ setIsMeasureLine }
		    		setIsCheckpointGen={ setIsCheckpointGen }
		    		setIsPositionCursor={ setIsPositionCursor }
			    />
		    </Suspense>
		</div>
 	);
}


const BottomBar = (props) => {
	const [switched, setSwitched] = useState( 'orbit' );
	const [measuring, setMeasuring] = useState( false );
	const [positionCursor, setPositionCursor] = useState( false );
	const [openToolBox, setOpenToolBox] = useState( false );
	const [checkpointGen, setCheckpointGen] = useState( false );

	const handleCreateCheckPoint = () => {
		props.messenger( (mapMessage) => [...mapMessage, 'Please wait...'] );
		props.setCheckpoint( true );
		MAP.setEmtyNameCpSpotted( true );
	}

	const handleMeasureLine = () => setMeasuring( measuring => !measuring );
	const handlePositionCursor = () => setPositionCursor( positionCursor => !positionCursor );

	const handleFreeControl = () => {
		if( switched === 'free' ) return;

		props.control( Controls => ({
			controls: FirstPersonControls,
			config: {
				lookSpeed: 0.3,
				movementSpeed: 550,
				enabled: true
			},
			event: Controls.event
		}));

		setSwitched( 'free' );
	}

	const handleOrbitControl = () => {
		if( switched === 'orbit' ) return;

		props.control( Controls => ({
			controls: OrbitControls,
			config: {
				enabled: true
			},
			event: Controls.event
		}));

		setSwitched( 'orbit' );
	}

	const handleToolBox = () => setOpenToolBox( openToolBox => !openToolBox );
	const handleCheckpointGenerator = () => setCheckpointGen( checkpointGen => !checkpointGen );

	useEffect(() => {
		props.messenger( mapMessage => [...mapMessage, `Measure-line ${measuring ? 'on' : 'off'}`] );
		props.setIsMeasureLine( () => measuring );
	}, [measuring]);

	useEffect(() => {
		props.messenger( mapMessage => [...mapMessage, `Position-cursor ${positionCursor ? 'on' : 'off'}`] );
		props.setIsPositionCursor( () => positionCursor );
	}, [positionCursor]);

	useEffect(() => {
		props.messenger( mapMessage => [...mapMessage, `Checkpoint-generator ${checkpointGen ? 'on' : 'off'}`] );
		props.setIsCheckpointGen( () => checkpointGen );
	}, [checkpointGen]);

	return(
		<div className="map-btm-bar d-flex justify-content-around align-items-center">
			<div 
				style={{
					height: openToolBox 
								? 'fit-content' 
								: '0px',
					padding: openToolBox
								? '5px 0px 5px 0px'
								: '0px'

						}} 
				className="map-tool-box"
			>
				<Button
					className="tool-button"
					shortcutKey={ true }
					name="Measure line"
					click={ () => handleMeasureLine() }
				/>

				<Button 
					className="tool-button"
					name="Position cursor"
					click={ () => handlePositionCursor() }
				/>

				<Button 
					className="tool-button"
					shortcutKey={ true }
					name="Checkpoint generator"
					click={ () => handleCheckpointGenerator() }
				/>
			</div>
			<div className="col-3 d-flex justify-content-center align-items-center">
	 			<Button 
	 				shortcutKey={ true } 
	 				name="Tools" 
	 				click={() => handleToolBox()}
	 			/>
	 		</div>					

			<div className="col-4 map-view-switch d-flex justify-content-center align-items-center">
				<Button 
					className={`${switched === 'free' ? "map-view-selected" : ''} map-vs-btn map-view-fpc`}
					name="Free" 
					click={() => handleFreeControl()}
				/>
				<Button 
					className={`${switched === 'orbit' ? "map-view-selected" : ''} map-vs-btn map-view-oc`} 
					name="Orbit" 
					click={() => handleOrbitControl()}
				/>
			</div>

			<div className="col-3 d-flex justify-content-center align-items-center">
				<Button shortcutKey={true} name="Place Checkpoint" click={handleCreateCheckPoint}/>
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
	const { scene, properties } = props;

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


    const handleDelete = () => {
    	props.remove( () => properties );
    }

	return(
        <div className="obj-prop-box d-flex flex-column justify-content-around align-items-center p-3">
            <div style={{height: '8%'}} className="container-fluid d-flex flex-row-reverse pr-2 mb-2">
                <Button listenTo='Enter' name="close" click={props.close}/>
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
            <div style={{height: '10%', width: '100%'}} className="d-flex justify-content-center align-items-center">
            	{[
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
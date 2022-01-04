import React, { 
	useState, 
	useReducer, 
	useEffect, 
	useRef, 
	Suspense,
	useCallback
} from 'react';

import Draggable from 'react-draggable';

import {
	OrbitControls,
	Stars,
	Html,
	useProgress,
	SpotLight,
	GizmoHelper,
	GizmoViewport,
	softShadows
} from '@react-three/drei';

import { 
	Canvas, 
	useThree,
	useFrame, 
	useLoader, 
} from '@react-three/fiber';

import BSON from 'bson';
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
import CustomButton from '../../components/admin/buttons/button';
import MapMenu from '../../components/admin/menu/map-menu';
import { Input } from '../../components/admin/inputs/input';
import Alert from '@mui/material/Alert';


// Style(s)
import '../../styles/admin/map.css';


// Module
import * as MAP from '../../modules/cct-map';
import MapMeasureLine from '../../modules/measure-line';
import PositionCursor from '../../modules/position-cursor';
import FirstPersonControls from '../../modules/FirstPersonControls';
import CheckpointGenerator from '../../modules/checkpoint-generator';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CircStyleLoad from '../../components/admin/load-bar/circ-load';
import InfiniteStyleLoad from '../../components/admin/load-bar/inf-load';
import CancelIcon from '@mui/icons-material/Cancel';

const width = window.innerWidth;
const height = window.innerHeight;

const materialOptions = {
	color: 0xf8c291,
	roughness: 0.4,
	metalness: 0
}

const defaultMaterial = new THREE.MeshStandardMaterial( materialOptions );
var restrictedCheckpointNames = [];

softShadows();

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

	const [isSaving, setIsSaving] = useState( false );
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
			if( restrictedCheckpointNames.includes(MAP.getRootName( newCheckpoint.name ).toLowerCase())){
				setMapMessage( mapMessage => [...mapMessage, 'Checkpoint name exists!']);
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
	const [isDoneEditing, setIsDoneEditing] = useState( false );
	const [isCheckpointPlaced, setIsCheckpointPlaced] = useState( true );

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

		axios.get(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/map-data`, {
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
                return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestMapData(), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
		});
	}

	// Changes hereee 
	// Requests to save map
	const requestSaveMapData = async (scene) => {	
		if( !scene ) return;

		const token = Cookies.get('token');
		const rtoken = Cookies.get('rtoken');

		let returnValue = null;

        if( !token ){
            return props.Event.emit('unauthorized');
        }

		await axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/update-map`, scene, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			returnValue = true;
			setMapMessage( mapMessage => [...mapMessage, 'Map has been saved successfully']);
		})
		.catch( err => {
			ErrorHandler.handle( err, requestSaveMapData, 4, scene );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestSaveMapData(scene), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }

			returnValue = false;
			setMapMessage( mapMessage => [...mapMessage, 'Please try again']);
		});

		return returnValue;
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
			setMapMessage((mapMessage) => [...mapMessage, '3D object has been uploaded successfully']);			
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
					isPlaced={val => setIsCheckpointPlaced( val )}
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
		restrictedCheckpointNames = [ ...checkPoints.map( cp => excludeDepList(MAP.getRootName( cp.name )).toLowerCase()) ];
	}, [checkPoints]);

	useEffect(() => {
		if( isDoneEditing ){
			restrictedCheckpointNames = [ ...checkPoints.map( cp => excludeDepList(MAP.getRootName( cp.name )).toLowerCase()) ];
			setIsDoneEditing( false );
		}
	}, [isDoneEditing]);

	useEffect(() => {
		if( propBoxCont ){
			setPropBox( null );
			setTimeout(() => {
				setPropBox(() => 
					<PropertyBox
						scene={scene}
						remove={setDeleteObj}
						close={reqSetPropBox} 
						properties={propBoxCont} 
						setCheckPoints={setCheckPoints}
						setIsDoneEditing={setIsDoneEditing}
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
			if( !objList?.length && mapData ){
				
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
		let isError = false;

		checkPoints.forEach(elem => {
			if( isError ) return;

			if( elem.name.includes('CONNECTOR') ){
				if( !elem.name.length ){
					isError = true;
					return setMapMessage( mapMessage => [...mapMessage, 'Found a unnamed Checkpoint.']);
				}
				else{
					if( MAP.getRootName( elem.name )?.split?.('-')?.length > 2 ){
						isError = true;
						return setMapMessage( mapMessage => [...mapMessage, 'Found an invalid Checkpoint name.']);
					}

					let id = Number(MAP.getRootName( elem.name ).split('-')[0].split('CONNECTOR')[1]);
					let depList = MAP.getRootName( elem.name ).split('-')[1];

					if( isNaN(id) ){ // Check if connector id is valid. CONNECTOR1 is valid but not CONNECTOR*
						isError = true;
						return setMapMessage( mapMessage => [...mapMessage, 'Found an invalid connector ID.']);
					}
					else{
						if( depList ){
							try{
								depList = JSON.parse( depList );

								depList?.forEach( elemID => {
									if( isNaN(Number( elemID )) ){
										isError = true;
										return setMapMessage( mapMessage => [...mapMessage, 'Found an invalid connector ID.']);
									}
								});
							}
							catch( err ) {
								isError = true;
								console.error( err );

								return setMapMessage( mapMessage => [...mapMessage, 'Found an invalid connector dependency list.']);
							}
						}
					}
				}
			}
		});

		if( state?.selected?.current ){
			isError = true;
			
			setMapMessage( mapMessage => [...mapMessage, 'Unselect an object first']);
		}

		if( scene && !isSaving && !isError ){
            setMapMessage( mapMessage => [...mapMessage, 'Saving Map, please wait...']);

			setIsSaving( isSaving => !isSaving );

			const objects = [];

			scene.children.forEach( child => {
				if( /map_object/.test(child.name) || /checkpoint/.test(child.name) ){
					objects.push({
						geometries: child.toJSON().geometries,
						object: child.toJSON().object
					});
				}
			});

			let mapBundle = null;

			try{
				mapBundle = {
					scene: BSON.serialize(objects), 
					cpPos: BSON.serialize(checkPoints.map(elem => ({
						name: elem.name, 
						position: elem.position
					})))
				}
			}
			catch( err ){
				setMapMessage( mapMessage => [
					...mapMessage, 
					'Oops! Maybe the scene is too big.'
				]);

				setIsSaving( false );
				return false;
			}

			if( mapBundle ){
				let returnValue = await requestSaveMapData( mapBundle );
				setIsSaving( isSaving => !isSaving );

				return returnValue;
			}
		}	
	}

	return(
		<div className="map">
			{
                isSaving
                    ? <CustomAlert isLoading={true} message="Saving map..." variant="info"/>
                    : null
            }
		    <Suspense fallback={<MAP.Loader />}>
			    {
			    	scene && isCheckpointPlaced
			    		? <MapMenu
					    	switch={enableMenu} 
					    	setManual={setManual}
					    	reqSetUpload={setUpload} 			    	
					    	messenger={setMapMessage}
					    	reqSaveMap={() => requestSaveMap()} 
					    />
					    : null
			    }
		    	<MAP.Messenger message={mapMessage} messenger={setMapMessage}/>
				<Canvas mode="concurrent" shadowMap colorManagement>
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
			    {
			    	scene && isCheckpointPlaced
			    		? <BottomBar 
					    	control={ setControls } 
				    		messenger={ setMapMessage }
					    	isCheckpointPlaced={ isCheckpointPlaced }
					    	setCheckpoint={ setIsCheckPoint }
				    		setIsMeasureLine={ setIsMeasureLine }
				    		setIsCheckpointGen={ setIsCheckpointGen }
				    		setIsPositionCursor={ setIsPositionCursor }
					    />
					    : null
			    }
		    </Suspense>
		</div>
 	);
}

const CustomAlert = props => {
	return(
		<div 
		    style={{
		        position: 'absolute',
		        left: '50%',
		        top: '3vh',
		        transform: 'translate(-50%, 0%)',
		        zIndex: '1000'
		    }}
		>
		    <Alert icon={false} variant="outlined" severity={props.variant}>
		    	<div className={`row d-flex ${ props.isLoading ? 'justify-content-between' : 'justify-content-center' } align-items-center`}>
		    		{
		    			props.isLoading
		    				? <div className="col-md-3">
					            	<CircularProgress color="success"/>
					        	</div>
					        : null
		    		}
		        	<div className="col-md-9 text-center d-flex justify-content-center align-items-center">
		        		<b><h5 style={{ color: '#78e08f' }} className="p-0 m-0 text-uppercase">{ props.message }</h5></b>
		        	</div>
		    	</div>
		    </Alert>
		</div>
	)
}


const BottomBar = (props) => {
	const [switched, setSwitched] = useState( 'orbit' );
	const [measuring, setMeasuring] = useState( false );
	const [positionCursor, setPositionCursor] = useState( false );
	const [openToolBox, setOpenToolBox] = useState( false );
	const [checkpointGen, setCheckpointGen] = useState( false );
	// const [isACheckpointAllowed, setIsCheckpointAllowed] = useState( true );

	// const handleCheckpointNotAllowed = () => setIsCheckpointAllowed( false );
	// const handleCheckpointAllowed = e => {
	// 	if( e.target.localName === 'canvas' ){
	// 		setIsCheckpointAllowed( true );
	// 		return window.removeEventListener('click', handleCheckpointAllowed);
	// 	}
	// 	else{
	// 		e.stopPropagation();
	// 		e.preventDefault();
	// 	}
	// }

	const handleCreateCheckPoint = () => {
		props.messenger( (mapMessage) => [...mapMessage, 'Please wait...'] );
		props.setCheckpoint( true );
	}

	const handleMeasureLine = () => {
		setMeasuring( measuring => !measuring );
		setPositionCursor( positionCursor => !positionCursor );
	};

	const handlePositionCursor = () => {
		setMeasuring( measuring => !measuring );
		setPositionCursor( positionCursor => !positionCursor );
	};

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
		props.setIsMeasureLine( () => measuring );
	}, [measuring]);

	useEffect(() => {
		props.setIsPositionCursor( () => positionCursor );
	}, [positionCursor]);

	// useEffect(() => {
	// 	window.addEventListener('click', handleCheckpointAllowed);

	// 	return () => window.removeEventListener('click', handleCheckpointAllowed);		
	// }, []);

	return(
		<div className="map-btm-bar d-flex justify-content-around align-items-center">
			{/*<div 
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
				<CustomButton
					className="tool-button"
					shortcutKey={ true }
					name="Measure line"
					click={ () => handleMeasureLine() }
				/>

				<CustomButton 
					className="tool-button"
					name="Position cursor"
					click={ () => handlePositionCursor() }
				/>

				<CustomButton 
					className="tool-button"
					shortcutKey={ true }
					name="Checkpoint generator"
					click={ () => handleCheckpointGenerator() }
				/>
			</div>
			<div className="col-3 d-flex justify-content-center align-items-center">
	 			<CustomButton 
	 				shortcutKey={ true } 
	 				name="Tools" 
	 				click={() => handleToolBox()}
	 			/>
	 		</div>					
			*/}
			<div className="col-4 map-view-switch d-flex justify-content-center align-items-center">
				<CustomButton 
					className={`${switched === 'free' ? "non-selectable" : 'map-view-selected'} map-vs-btn map-view-fpc`}
					name="Free" 
					click={() => handleFreeControl()}
				/>
				<CustomButton 
					className={`${switched === 'orbit' ? "non-selectable" : 'map-view-selected'} map-vs-btn map-view-oc`} 
					name="Orbit" 
					click={() => handleOrbitControl()}
				/>
			</div>

			<div className="col-3 d-flex justify-content-center align-items-center">
				<CustomButton 
					// disabled={ !isACheckpointAllowed } 
					shortcutKey={true} 
					name="Place Checkpoint" 
					click={() => {
						handleCreateCheckPoint();
						// handleCheckpointNotAllowed();
					}}
				/>
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
	const [isNameError, setIsNameError] = useState( false );

    if( checkpointType ){
	    var baseName = MAP.getBaseName( properties.name );	  
    }

    // Object name
    const reqEditName = (e) => {
    	if( name.length ){
	    	if( excludeDepList( e.target.value ).toLowerCase() !== excludeDepList(MAP.getRootName( properties.name )).toLowerCase() ){
		    	if( restrictedCheckpointNames.includes( excludeDepList(e.target.value).toLowerCase()) ){
		    		setIsNameError( true );
		    	}
		    	else{
		    		setIsNameError( false );
		    	}	    
	    	}
    	}
    	else{
    		setIsNameError( true );
    	}

    	setName( e.target.value );
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

    const handleClose = () => {
    	if( !isNameError && name.length && checkpointType ){
    		const meshData = scene.getObjectById( properties.id );
	        properties.name = `${baseName}${name.toUpperCase()}`;
	    	meshData.name = properties.name;
    	}

    	props.setIsDoneEditing( true );
    	props.close();
    }

	return(
		<Draggable>
	        <div className="obj-prop-box d-flex flex-column justify-content-around align-items-center p-3">
	            <div style={{height: '8%'}} className="container-fluid d-flex flex-row-reverse pr-2 mb-2">
	                {/*<CustomButton listenTo='Enter' name="close" click={handleClose}/>*/}
	                <IconButton onClick={handleClose}>
	                	<CancelIcon/>
	                </IconButton>
	            </div>
	            <div  style={{height: '10%'}} style={{height: '50px'}}  className="text-center">
	                <h2>Properties</h2>
	            </div>
	            <form  
	            	autoComplete="off"
	            	style={{height: '72%'}} 
	            	className="obj-props d-flex flex-column justify-content-between align-items-center">
	            	{ 
	            		checkpointType  ? 
	            			<PropBoxInp isError={isNameError} id="name"  size={inputSize} type="text" value={name} placeholder="No name" handleChange={reqEditName} name="Room Name"/> 
	            			: null 
	            	}

	            	<PropBoxInp id="scaleX" size={inputSize}  value={properties.scale.x} handleChange={reqEditScaleX} name="Scale X"/>
	            	
	            	<PropBoxInp id="scaleY" size={inputSize}  value={properties.scale.y} handleChange={reqEditScaleY} name="Scale Y"/> 
	            	
	            	<PropBoxInp id="scaleZ" size={inputSize}  value={properties.scale.z} handleChange={reqEditScaleZ} name="Scale Z"/> 
	            	
	            	<PropBoxInp id="posX" size={inputSize}  value={properties.position.x} handleChange={reqEditPosX} name="Position X"/> 
	            	
	            	<PropBoxInp id="posY" size={inputSize}  value={properties.position.y} handleChange={reqEditPosY} name="Position Y"/> 
	            	
	            	<PropBoxInp id="posZ" size={inputSize}  value={properties.position.z} handleChange={reqEditPosZ} name="Position Z"/>             	
	            </form>   
	            <div style={{height: '10%', width: '100%'}} className="d-flex justify-content-center align-items-center">
	            	<Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
			    		Delete
			    	</Button>
	            </div>  
	        </div>
		</Draggable>
    );
}


// Property input field
const PropBoxInp = (props) => {
	return(
		<div className="d-flex flex-column" >
            <p className="p-0 m-0">
            	{props.name}
            </p>
            <Input
            	error={props.isError}
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

const excludeDepList = name => {
	return name?.split?.('-')?.[ 0 ];
}


export default MapView;
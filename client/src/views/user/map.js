// Libraries
import React, { Suspense, useEffect, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { 
	Line, 
	Html, 
	PointerLockControls,
	OrbitControls
} from '@react-three/drei';
import FirstPersonControls from '../../modules/FirstPersonControls';

import * as THREE from 'three';

// Components
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import FloatingButton from '../../components/user/button/floating-button';
import { useSnackbar } from 'notistack';

import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import OpacityIcon from '@mui/icons-material/Opacity';
import Tooltip from '@mui/material/Tooltip';

// Modules
import { pathFind, createNodes } from '../../modules/path-finding';
import * as MAP from '../../modules/cct-map';



// Style
import '../../styles/user/map.css';



const MapView = (props) => {
	const [controller, setController] = useState( null );
	const [camera, setCamera] = useState( null );
	const [scene, setScene] = useState( null );
	const [objects, setObjects] = useState( null );	
	const [cpPos, setCpPos] = useState( null );
	const [destination, setDestination] = useState( null );
	const [path, setPath] = useState( [] );
	const [line, setLine] = useState( null );
	const [mapMessage, setMapMessage] = useState( [] );
	const [destinationLabel, setDestinationLabel] = useState( null );
	const [searchForm, setSearchForm] = useState( null );
	const [movementDirection, setMovementDirection] = useState('idle');
	const [movementIndex, setMovementIndex] = useState( -1 );

	const { enqueueSnackbar } = useSnackbar();

	useEffect( () => {
		const sceneLoader = async () => {
			if( props.mapData ){
				enqueueSnackbar('Fetched successfully', 'Will now load the scene', { variant: 'success' });
				
				const params = {
					userType	: 'user',
					data 		: props.mapData.scene,
				}

				const prevScene  = await MAP.loadScene( params );

				// setMapMessage((mapMessage) => [...mapMessage, 'Scene has been loaded']);
				enqueueSnackbar('Scene has been loaded', { variant: 'success' });


				setObjects( () => prevScene );
				setCpPos( () => props.mapData.cpPos );
			}
			else{
				enqueueSnackbar('Please wait while fetching scene');
			}
		}
		sceneLoader();

	}, [props.mapData]);

	useEffect(() => {
		if( cpPos ){ 
			enqueueSnackbar('Creating nodes.');
			createNodes( cpPos );
			enqueueSnackbar('Nodes have been created.');
		}
	}, [cpPos]);


	// ===== CHANGES HERE =======
	useEffect(() => {
		const runPathFind = async () => {
			const shortestPath = await pathFind( destination );

			setDestinationLabel(() => (
				<>
					<Html 
						position={Object.values(destination.start.position)}
						className="non-selectable container"
						zIndexRange={[100, 40]}
						style={{
							fontSize: '10px',
							overflow: 'hidden',
							width: 'fit-content',
							height: '20px',
							pointerEvent: 'none',
						}}
					> 
						{ MAP.getRootName( destination.start.name ) } 
					</Html>
					{
						destination.start.name !== destination.end.name
							? <Html 
								position={Object.values(destination.end.position)}
								className="non-selectable container"
								zIndexRange={[100, 40]}
								style={{
									fontSize: '10px',
									overflow: 'hidden',
									width: 'fit-content',
									height: '20px',
									pointerEvent: 'none',
								}}
							> 
								{ MAP.getRootName( destination.end.name ) } 
							</Html> 
							: null
					}
				</>
			));
			
			if( !shortestPath || !shortestPath.length ){
				enqueueSnackbar('Unable to provide path');
			}
			else{
				enqueueSnackbar('Constructing path', { variant: 'info' });
				setPath(() => [...shortestPath.reverse()]);
			}
			setDestination(() => null);	

		}

		if( destination && scene && cpPos ) runPathFind();

	}, [destination, scene]);
	//  ===============================


	useEffect(() => {
		if( destination && path.length ) {
			const createLine = async () => {
				setLine( null );
				setTimeout(() => {
					setLine(() => (
						<Line 
							points={[...path]} 
							color={0x34495e} 
							lineWidth={3}
						/>
					));
				}, 1000);
			}	

			createLine();
		}
		else if( destination && !path.length ){
			setLine(() => null);
		}
		
	}, [destination, path]);

	useEffect(() => {
		if( movementIndex === 0 ){ 
			if( !controller ) {
			}

			enqueueSnackbar('You are in your starting position.');
		}
		if( path.length && movementIndex === path.length - 1 ) enqueueSnackbar(`You've reached your destination.`);

		if( path.length && movementIndex > -1 && movementIndex < path.length - 1 ){
			const [x, y, z] = path[ movementIndex ];
			camera.position.set( x, y + 100, z + 0.01 );
			
			setController( 
				/iPhone|iPad|iPod|Android/i.test( navigator.userAgent )
					? <OrbitControls target={ new THREE.Vector3( x, y, z ) }/>
					: <PointerLockControls />
			);
						
			if( movementDirection === 'forward' && movementIndex <= path.length - 1 ){
				camera.lookAt( new THREE.Vector3(...path[ movementIndex + 1 ]) ); 
			} 
			else if( movementDirection === 'backward' && movementIndex >= 1 ){
				camera.lookAt( new THREE.Vector3(...path[ movementIndex - 1 ]) ); 
			}

			camera.updateProjectionMatrix();
		}
	}, [movementIndex, movementDirection, path]); 

	useEffect(() => {
		if( !path.length && movementDirection !== 'idle' ){
			enqueueSnackbar('Movement is not allowed when there is no path', { variant: 'error' });
		}
		else{
			switch( movementDirection ){
				case 'forward':
					// Do this...
					setMovementIndex( movementIndex + 1 );
					break;

				case 'backward':
					// Set position to path in index movementIndex
					setMovementIndex( movementIndex - 1 );
					break;

				default:
					return;
			}
		}

		setMovementDirection('idle');
	}, [movementDirection, path]);


	const handleMoveForward = () => {
		setMovementDirection('forward');
	}

	const handleMoveBackward = () => {
		setMovementDirection('backward');
	}

	return(
		<div className="map p-0 m-0">
	    	<MAP.Messenger message={mapMessage} messenger={setMapMessage} />		
			<Canvas mode="concurrent" frameloop="demand" shadowMap>
				<Suspense fallback={<MAP.Loader />}>
					<MAP.MapCanvas type="user" setCam={setCamera} setScene={setScene} controller={controller}>
						{ destinationLabel }
						{ objects ?? <MAP.Loader /> }

						<Suspense fallback={<MAP.Loader/>}>
							{ line }
						</Suspense>
					</MAP.MapCanvas>
				</Suspense>
				{ searchForm }
			</Canvas>
			<Controller forward={handleMoveForward} backward={handleMoveBackward}/>
			<FloatingButton cpPos={cpPos} setSearchForm={setSearchForm} setDestination={setDestination}/>
		</div>
	);
}


const Controller = props => {
	const {
		forward,
		backward
	} = props;

	return(
		<>
			<div 
				style={{
					position: 'absolute',
					top: '3vh',
					left: '4vw',
				}}
			>
				<Tooltip title="Transparent" placement="right" arrow>
					<IconButton sx={{ backgroundColor: '#2f3542' }}>
						<OpacityIcon sx={{ color: 'white' }} fontSize="medium"/>
					</IconButton>
				</Tooltip>
			</div>
			<div 
				style={{
					position: 'absolute',
					bottom: '3vh',
					left: '4vw',
				}}
			>	
				<Stack spacing={2}>
					<Tooltip title="Move forward" placement="right" arrow>
						<IconButton sx={{ backgroundColor: '#1e90ff' }} onClick={forward}>
							<ArrowCircleUpIcon sx={{ color: 'white' }} fontSize="medium"/>
						</IconButton>
					</Tooltip>
					<Tooltip title="Move backward" placement="right" arrow>
						<IconButton sx={{ backgroundColor: '#1e90ff' }} onClick={backward}>
							<ArrowCircleDownIcon sx={{ color: 'white' }} fontSize="medium"/>
						</IconButton>
					</Tooltip>
				</Stack>
			</div>
		</>
	)
}


export default MapView;
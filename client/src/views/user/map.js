// Libraries
import React, { Suspense, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import Cookie from 'js-cookie';
import TWEEN from '@tweenjs/tween.js';

import { Canvas } from '@react-three/fiber';
import { 
	Line, 
	Html, 
	PointerLockControls,
	OrbitControls
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import FirstPersonControls from '../../modules/FirstPersonControls';

import * as THREE from 'three';

// Components
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import FloatingButton from '../../components/user/button/floating-button';
import { useSnackbar } from 'notistack';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import OpacityIcon from '@mui/icons-material/Opacity';
import FlightIcon from '@mui/icons-material/Flight';
import ClearIcon from '@mui/icons-material/Clear';

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
	
	const [facing, setFacing] = useState('forward');
	const [disMovement, setDisMovement] = useState( true );
	const [movementDirection, setMovementDirection] = useState('idle');
	const [movementIndex, setMovementIndex] = useState( -1 );
	const [transparent, setTransparent] = useState( false );
	const [clear, setClear] = useState( false );
	const [flight, setFlight] = useState( true );

	const { enqueueSnackbar } = useSnackbar();

	useEffect( () => {
		const sceneLoader = async () => {
			if( props.mapData ){
				enqueueSnackbar('Fetched successfully', 'Will now load the scene', { variant: 'success' });
				
				const params = {
					userType	: 'user',
					data 		: props.mapData.scene
				}

				const prevScene  = await MAP.loadScene( params );

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

			if( !shortestPath || !shortestPath.length ){
				enqueueSnackbar('Unable to provide path');
			}
			else{
				enqueueSnackbar('Constructing path', { variant: 'info' });
				const sPath = [...shortestPath.reverse()];
				sPath.push([
					destination.end.position.x,
					destination.end.position.y,
					destination.end.position.z,
				]);

				Cookie.set(`${destination.start.name}&${destination.end.name}`, JSON.stringify( sPath ));

				setPath(() => [ ...sPath ]);
				setDisMovement( false );
			}
			setDestination(() => null);	
		}

		if( destination && scene && cpPos ){
			const cachedPath1 = Cookie.get(`${destination.start.name}&${destination.end.name}`);
			const cachedPath2 = Cookie.get(`${destination.end.name}&${destination.start.name}`);

			if( cachedPath1 ){
				setPath(() => [...JSON.parse( cachedPath1 )]);
				setDisMovement( false );
			}
			else if( cachedPath2 ){
				setPath(() => [...JSON.parse( cachedPath2 ).reverse()]);
				setDisMovement( false );
			}
			else{
				runPathFind();
			}
		}

	}, [destination, scene]);
	//  ===============================


	useEffect(() => {
		if( path && path.length ){
			setDestinationLabel(() => (
				<>
					<Html 
						position={[
							destination.start.position.x,
							destination.start.position.y,
							destination.start.position.z,
						]}
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
								position={[
									destination.end.position.x,
									destination.end.position.y,
									destination.end.position.z,
								]}
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
		}
	}, [path]);


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
		console.log( movementIndex );

		if( !path.length && movementDirection !== 'idle' ){
			enqueueSnackbar('Movement is not allowed when there is no path', { variant: 'error' });
		}
		else if( movementIndex >= -1 && movementIndex < path.length ){
			switch( movementDirection ){
				case 'forward':
					if( movementIndex === -1 ) enqueueSnackbar('You are in your starting position.');
					if( path.length && movementIndex === path.length - 1 ) enqueueSnackbar(`You've reached your destination.`);

					setFacing('forward');

					setFlight( false );
					setMovementIndex( movementIndex + 1 );
					break;

				case 'backward':
					if( movementIndex <= 0 ) return;

					setFacing('backward');

					setFlight( false );
					setMovementIndex( movementIndex - 1 );

					if( movementIndex === 0 ) enqueueSnackbar('You are in your starting position.');
					break;

				default:
					return;
			}
		}

		setMovementDirection('idle');

	}, [movementDirection, path, movementIndex]);

	useEffect(() => {
		if( path.length && (movementIndex > -1 && movementIndex < path.length - 1) ){
			const [x, y, z] = path[ movementIndex ];

			const cameraPosition = camera.position;
			const cameraTween = new TWEEN.Tween( cameraPosition )
				.to({
					x: x,
					y: y,
					z: z
				}, 4000)
				.easing( TWEEN.Easing.Quadratic.InOut )
				.onUpdate(() => {
					camera.position.set(
						cameraPosition.x,
						cameraPosition.y + 250,
						cameraPosition.z + 0.01
					);


					if( facing === 'forward' || facing === 'backward' ){
						const pathIndex = facing === 'forward'	
							? movementIndex + 1
							: movementIndex - 1;
							
						camera.lookAt( new THREE.Vector3( ...path[ pathIndex ] ));
					}
					camera.updateProjectionMatrix();
				})
				.start();
			
			// debounce(() => camera.position.lerp( new THREE.Vector3(x, y + 250, z + 0.01), 1 ), 500)(); // No tweening

			setController( 
				isMobile()
					? <OrbitControls target={ new THREE.Vector3( x, y, z ) }/>
					: <PointerLockControls />
			);


			camera.updateProjectionMatrix();
		}
	}, [movementIndex, facing, path]); 

	useEffect(() => {

		if( flight && camera ){
			const cameraPosition = camera.position;
			const cameraFlightMode = new TWEEN.Tween( cameraPosition )
				.to({
					x: MAP.CAMERA.position[ 0 ],
					y: MAP.CAMERA.position[ 1 ],
					z: MAP.CAMERA.position[ 2 ]
				}, 5000)
				.easing( TWEEN.Easing.Quadratic.InOut )
				.onUpdate(() => {
					camera.position.set(
						cameraPosition.x,
						cameraPosition.y,
						cameraPosition.z,
					);

					camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

					camera.updateProjectionMatrix();
				})
				.onComplete(() => {
					setController(() => null);
					setMovementIndex(() => -1);
					setMovementDirection(() => 'idle');

					setFlight(() => false);
				})
				.start();
		}

		if( clear ){
			if( controller ) setFlight(() => true);

			setDisMovement( true );

			setPath(() => []);
			setLine(() => null);
			setDestinationLabel(() => null);

			setClear(() => false);
		}

	}, [flight, clear]);

	useEffect(() => {
		if( scene ){
			scene.traverse( obj => {
				if( obj instanceof THREE.Mesh && obj.name.includes('map_object') ){
					obj.material.transparent = transparent;
					obj.material.opacity = transparent ? 0.4 : 1;
				}
			})
		}

	}, [transparent, scene]);

	const handleMoveForward = async () => {
		setMovementDirection(() => 'forward');
	}

	const handleMoveBackward = async () => {
		setMovementDirection(() => 'backward');
	}

	const handleTransparency = async () => {
		setTransparent( !transparent );
	}

	const handleClear = async () => {
		if( !destinationLabel && !path.length && !line )
			enqueueSnackbar('There is no path to clear', { variant: 'error' });

		setClear(() => true);
	}

	const handleFlight = async () => {
		if( !controller ) return enqueueSnackbar('You are already in flight mode', { variant: 'error' });
		setFlight(() => true);
	}

	return(
		<div className="map p-0 m-0">
	    	<MAP.Messenger message={mapMessage} messenger={setMapMessage} />		
			<Canvas 
				shadowMap
			>
				<Suspense fallback={<MAP.Loader />}>
					<MAP.MapCanvas 
						type="user" 
						update={TWEEN.update}
						setCam={setCamera} 
						setScene={setScene} 
						controller={controller} 
					>
						{ destinationLabel }
						{ objects ?? <MAP.Loader /> }

						<Suspense fallback={<MAP.Loader/>}>
							{ line }
						</Suspense>
					</MAP.MapCanvas>
				</Suspense>
				{ searchForm }
			</Canvas>
			<Controller 
				transparent={handleTransparency}
				backward={handleMoveBackward}
				forward={handleMoveForward} 
				flight={handleFlight}
				clear={handleClear}
				disable={disMovement}
			/>
			<FloatingButton cpPos={cpPos} setSearchForm={setSearchForm} setDestination={setDestination}/>
		</div>
	);
}

const Controller = props => {
	const {
		transparent,
		backward,
		disable,
		forward,
		flight,
		clear
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
				<Stack 
					spacing={3}
					direction={ isMobile() ? 'column' : 'row' }
				>
					<Tooltip title="Transparent" placement={ isMobile() ? "right" : "bottom" } arrow>
						<IconButton sx={{ backgroundColor: '#2f3542' }} onClick={transparent}>
							<OpacityIcon sx={{ color: 'white' }} fontSize="medium"/>
						</IconButton>
					</Tooltip>

					<Tooltip title="Flight mode" placement={ isMobile() ? "right" : "bottom" } arrow>
						<IconButton sx={{ backgroundColor: '#2f3542' }} onClick={flight}>
							<FlightIcon sx={{ color: 'white' }} fontSize="medium"/>
						</IconButton>
					</Tooltip>

					<Tooltip title="Clear path" placement={ isMobile() ? "right" : "bottom" } arrow>
						<IconButton disabled={disable} sx={{ backgroundColor: '#2f3542' }} onClick={clear}>
							<ClearIcon sx={{ color: disable ? 'gray' : 'white' }} fontSize="medium"/>
						</IconButton>
					</Tooltip>
				</Stack>
			</div>
			<div 
				style={{
					position: 'absolute',
					bottom: '3vh',
					left: '4vw',
				}}
			>	
				<Stack spacing={2} divider={<Divider flexItem/>}>
					<Tooltip title="Move forward" placement="right" arrow>
						<IconButton  
							disabled={disable} 
							onClick={forward}
						>
							<ArrowDropUpIcon sx={{ color: disable ? 'gray' : 'black' }} fontSize="large"/>
						</IconButton>
					</Tooltip>
					<Tooltip title="Move backward" placement="right" arrow>
						<IconButton 
							disabled={disable} 
							onClick={backward}
						>
							<ArrowDropDownIcon sx={{ color: disable ? 'gray' : 'black' }} fontSize="large"/>
						</IconButton>
					</Tooltip>
				</Stack>
			</div>
		</>
	)
}

const isMobile = () => /iPhone|iPad|iPod|Android/i.test( navigator.userAgent );

export default MapView;
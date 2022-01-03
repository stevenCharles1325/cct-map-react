// Libraries
import React, { Suspense, useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import TWEEN from '@tweenjs/tween.js';
import debounce from 'lodash.debounce';

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
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import FloatingButton from '../../components/user/button/floating-button';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import OpacityIcon from '@mui/icons-material/Opacity';
import FlightIcon from '@mui/icons-material/Flight';
import ClearIcon from '@mui/icons-material/Clear';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

import Tooltip from '@mui/material/Tooltip';

// Modules
import { pathFind, createNodes } from '../../modules/path-finding';
import * as MAP from '../../modules/cct-map';

// Style
import '../../styles/user/map.css';

import Manual from './manual';

const _TRANSPARENT = 0.4;
const _SOLID = 1;

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

	const [quality, setQuality] = useState('low');	
	const [playerState, setPlayerState] = useState('idle');
	const [facing, setFacing] = useState('forward');
	const [disMovement, setDisMovement] = useState( true );
	const [movementDirection, setMovementDirection] = useState('idle');
	const [movementIndex, setMovementIndex] = useState( -1 );
	const [transparent, setTransparent] = useState( false );
	const [clear, setClear] = useState( false );
	const [flight, setFlight] = useState( true );
	const [manual, setManual] = useState( false );

	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		const qual = Cookie.get('quality');
		const visited = Cookie.get('visited');

		if( qual ) setQuality( qual );
		if( !visited ){
			setManual( true );
			Cookie.set('visited', new Date());
		}
	}, []);

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

				const isEndInSPath = shortestPath
					.map( p => p.toString() )
					.includes( [
						destination.end.position.x,
						destination.end.position.y,
						destination.end.position.z,
					].toString() );

				if( !isEndInSPath ){
					sPath.push([
						destination.end.position.x,
						destination.end.position.y,
						destination.end.position.z,
					]);
				}

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
		if( path.length && movementIndex === path.length - 1 ){
			enqueueSnackbar(`Great! You've reached your destination! 🎉`, { variant: 'success' });
		} 
		else if( path.length && movementIndex === 0 ){
			enqueueSnackbar(`You are in your starting position.`);
		} 

	}, [path, movementIndex]);

	useEffect(() => {
		if( !path.length && movementDirection !== 'idle' ){
			enqueueSnackbar('Movement is not allowed when there is no path', { variant: 'error' });
		}
		else if( movementIndex >= -1 && movementIndex <= path.length ){

			switch( movementDirection ){
				case 'forward':
					if( movementIndex === path.length - 1 ) return;
					
					setFacing('forward');
					setPlayerState('moving');

					setFlight( false );
					setMovementIndex( movementIndex => movementIndex + 1 );
					break;

				case 'backward':
					if( movementIndex <= 0 ) return;
					
					setFacing('backward');
					setPlayerState('moving');

					setFlight( false );
					setMovementIndex( movementIndex => movementIndex - 1 );
					break;

				default:
					return;
			}
		}

		setMovementDirection('idle');

	}, [movementDirection, path, movementIndex]);

	useEffect(() => {
		if( path.length && (movementIndex > -1 && movementIndex < path.length) && playerState === 'moving' ){
			const [x, y, z] = path[ movementIndex ];

			if( quality === 'high' ){
				const cameraPosition = camera.position;
				const cameraTween = new TWEEN.Tween( cameraPosition )
					.to({
						x: x,
						y: y + 250,
						z: z + 0.01
					}, 4000)
					.easing( TWEEN.Easing.Quadratic.InOut )
					.onUpdate(() => {
						camera.position.set(
							cameraPosition.x,
							cameraPosition.y,
							cameraPosition.z
						);

						if( facing === 'forward' || facing === 'backward' ){

							const pathIndex = facing === 'forward'	
								? movementIndex + 1 > path.length - 1
									? movementIndex - 1
									: movementIndex + 1
								: movementIndex === 0 
									? movementIndex + 1
									: movementIndex - 1;

							camera.lookAt( new THREE.Vector3( ...path[ pathIndex ] ));
						}
						camera.updateProjectionMatrix();
					})
					.start();
			}
			else{
				camera.position.lerp( new THREE.Vector3(x, y + 250, z + 0.01), 1 ); // No tweening
				const pathIndex = facing === 'forward'	
								? movementIndex + 1
								: movementIndex - 1;

				camera.lookAt( new THREE.Vector3( ...path[ pathIndex ] ));
				camera.updateProjectionMatrix();
			}

			setController( 
				isMobile()
					? <OrbitControls target={ new THREE.Vector3( x, y, z ) }/>
					: <PointerLockControls />
			);

			setPlayerState('idle');
			camera.updateProjectionMatrix();
		}
	}, [movementIndex, playerState, facing, path]); 

	useEffect(() => {

		if( flight && camera ){
			if( quality === 'high' ){
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
					.start();
			}
			else{
				camera.position.set(
					MAP.CAMERA.position[ 0 ],
					MAP.CAMERA.position[ 1 ],
					MAP.CAMERA.position[ 2 ]
				);

				camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
				camera.updateProjectionMatrix();
			}

			setController(() => null);
			setMovementIndex(() => -1);
			setMovementDirection(() => 'idle');

			setFlight(() => false);
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

					if( quality === 'high' ){
						const materialOpacity = { ...obj.material };

						const opacityTween = new TWEEN.Tween( materialOpacity )
							.to({
								opacity: transparent ? _TRANSPARENT : _SOLID
							}, 2000)
							.easing( TWEEN.Easing.Quadratic.InOut )
							.onUpdate(() => {
								obj.material.opacity = materialOpacity.opacity;
							})
							.start();
					}
					else{
						obj.material.opacity = transparent ? _TRANSPARENT : _SOLID;
					}

				}
			})
		}

	}, [transparent, scene]);

	useEffect(() => {
		Cookie.set('quality', quality);

		scene?.traverse?.( obj => {
			if( obj instanceof THREE.Mesh ){
				const color = obj.material.color;
				const map = obj.material.map;
				const name = obj.name.toLowerCase();

				if( name.includes('map_object') || name.includes('land') || name.includes('cloud') ){
					switch( quality ){
						case 'low':
							if( obj.material.type === 'MeshPhongMaterial' ) return;

							obj.material = new THREE.MeshPhongMaterial({ color, map });
							break;

						case 'high':
							if( obj.material.type === 'MeshStandardMaterial' ) return;

							obj.material = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0.5, map });
							break;

						default:
							if( obj.material.type === 'MeshPhongMaterial' ) return;

							obj.material = new THREE.MeshPhongMaterial({ color, map });
							break;
					}
				}
			}
		});
	}, [quality, scene]);

	const handleQualitySwitch = async () => {
		setQuality( quality => quality === 'low' ? 'high' : 'low' );
		setTransparent( false );
	}

	const handleMoveForward = async () => {
		setMovementDirection(() => 'forward');
	}

	const handleMoveBackward = async () => {
		setMovementDirection(() => 'backward');
	}

	const handleTransparency = async () => {
		if( scene )
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

	const handleManual = () => {
		setManual( true );
	}

	const debouncedQualitySwitch = debounce( handleQualitySwitch, 500 );
	const debouncedMoveForward = debounce( handleMoveForward, 500 );
	const debouncedMoveBackward = debounce( handleMoveBackward, 500 );
	const debouncedTransparency = debounce( handleTransparency, 500 );
	const debouncedClear = debounce( handleClear, 500 );
	const debouncedFlight = debounce( handleFlight, 500 );
	const debouncedManualOpener = debounce( handleManual, 500 );

	return(
		<div className="map p-0 m-0">
			<div
				style={{
					position: 'absolute',
					top: '3vh',
					left: '50%',
					transform: 'translate(-50%, 0%)',
					width: 'fit-content',
					height: 'fit-content',
					zIndex: '50'
				}}
			>
				<Chip 
					icon={<BubbleChartIcon fontSize="small" sx={{ color: 'white' }}/>} 
					label={`Quality: ${ quality }`} 
					variant="outlined"
					sx={{ color: 'white' }}
				/>
			</div>
	    	<MAP.Messenger message={mapMessage} messenger={setMapMessage} />		
			<Canvas 
				mode="concurrent"
				shadowMap
			>
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
				{ searchForm }
			</Canvas>
			{
				scene
					? (
						<>
							<Manual
								open={manual}
								setOpen={setManual}
							/>
							<Controller 
								transparent={debouncedTransparency}
								backward={debouncedMoveBackward}
								forward={debouncedMoveForward} 
								flight={debouncedFlight}
								clear={debouncedClear}
								disable={disMovement}
							/>
							<FloatingButton
								cpPos={cpPos} 
								setQuality={debouncedQualitySwitch}
								setManual={debouncedManualOpener}
								setSearchForm={val => debounce(() => setSearchForm( val ), 100)()} 
								setDestination={val => debounce(() => setDestination( val ), 100)()}
							/>
						</>
						)
					: null
			}
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
					{/*{
						!disable
							? <Tooltip title="Clear path" placement={ isMobile() ? "right" : "bottom" } arrow>
								<IconButton disabled={disable} sx={{ backgroundColor: '#2f3542' }} onClick={clear}>
									<ClearIcon sx={{ color: disable ? 'gray' : 'white' }} fontSize="medium"/>
								</IconButton>
							</Tooltip>
							: <IconButton disabled={disable} sx={{ backgroundColor: '#2f3542' }} onClick={clear}>
								<ClearIcon sx={{ color: disable ? 'gray' : 'white' }} fontSize="medium"/>
							</IconButton>
					}*/}	
					<Tooltip title="Clear path" placement={ isMobile() ? "right" : "bottom" } arrow>
						<span>
							<IconButton disabled={disable} sx={{ backgroundColor: '#2f3542' }} onClick={clear}>
								<ClearIcon sx={{ color: disable ? 'gray' : 'white' }} fontSize="medium"/>
							</IconButton>
						</span>			
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
						<span>
							<IconButton  
								disabled={disable} 
								onClick={forward}
							>
								<ArrowDropUpIcon sx={{ color: disable ? 'gray' : 'black' }} fontSize="large"/>
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Move backward" placement="right" arrow>
						<span>
							<IconButton 
								disabled={disable} 
								onClick={backward}
							>
								<ArrowDropDownIcon sx={{ color: disable ? 'gray' : 'black' }} fontSize="large"/>
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
			</div>
		</>
	)
}

const isMobile = () => /iPhone|iPad|iPod|Android/i.test( navigator.userAgent );

export default MapView;
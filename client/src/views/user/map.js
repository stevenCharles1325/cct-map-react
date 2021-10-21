// Libraries
import React, { Suspense, useEffect, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';

import * as THREE from 'three';

// Components
import FloatingButton from '../../components/user/button/floating-button';


// Modules
import { pathFind, createNodes } from '../../modules/path-finding';
import * as MAP from '../../modules/cct-map';


// Style
import '../../styles/user/map.css';


const MapView = (props) => {
	const [camera, setCamera] = useState( null );
	const [scene, setScene] = useState( null );
	const [objects, setObjects] = useState( null );	
	const [cpPos, setCpPos] = useState( null );
	const [destination, setDestination] = useState( null );
	const [path, setPath] = useState( [] );
	const [line, setLine] = useState( null );
	const [mapMessage, setMapMessage] = useState( [] );
	const [destinationLabel, setDestinationLabel] = useState( null );

	useEffect( () => {
		const sceneLoader = async () => {
			if( props.mapData ){
				setMapMessage((mapMessage) => [...mapMessage, 'Fetched successfully', 'Will now load the scene']);
				
				const params = {
					userType	: 'user',
					data 		: props.mapData.scene,
				}

				const prevScene  = await MAP.loadScene( params );

				setMapMessage((mapMessage) => [...mapMessage, 'Scene has been loaded']);

				setObjects( () => prevScene );
				setCpPos( () => props.mapData.cpPos );
			}
			else{
				setMapMessage((mapMessage) => [...mapMessage, 'Please wait while fetching scene']);
			}
		}
		sceneLoader();

	}, [props.mapData]);

	useEffect(() => {
		if( cpPos ){ 
			setMapMessage((mapMessage) => [...mapMessage, 'Creating nodes.']);
			createNodes( cpPos );
			setMapMessage((mapMessage) => [...mapMessage, 'Nodes have been created.']);
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
						style={{
							fontSize: '10px',
							overflow: 'hidden',
							width: 'fit-content',
							height: '20px',
							pointerEvent: 'none'
						}}
					> 
						{ MAP.getRootName( destination.start.name ) } 
					</Html>

					{
						destination.start.name !== destination.end.name
							? <Html 
								position={Object.values(destination.end.position)}
								className="non-selectable container"
								style={{
									fontSize: '10px',
									overflow: 'hidden',
									width: 'fit-content',
									height: '20px',
									pointerEvent: 'none'
								}}
							> 
								{ MAP.getRootName( destination.end.name ) } 
							</Html> 
							: null
					}
				</>
			));
			
			if( !shortestPath || !shortestPath.length ){
				setMapMessage( mapMessage => [
					...mapMessage,
					'Unable to provide path'
				]);
				setPath(() => []);
			}
			else{
				setMapMessage( mapMessage => [
					...mapMessage,
					'Constructing path'
				]);

				setPath(() => [...shortestPath]);
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

				setPath(() => []);
			}	

			createLine();
		}
		else if( destination && !path.length ){
			setLine(() => null);
		}
		
	}, [destination, path]);

	return(
		<div className="map p-0 m-0">
	    	<MAP.Messenger message={mapMessage} messenger={setMapMessage} />		
			<Canvas mode="concurrent" frameloop="demand" shadows={true}>
				<Suspense fallback={<MAP.Loader />}>
					<MAP.MapCanvas type="user" setCam={setCamera} setScene={setScene}>
						{ destinationLabel }
						{ objects ?? <MAP.Loader /> }

						<Suspense fallback={<MAP.Loader/>}>
							{ line }
						</Suspense>
					</MAP.MapCanvas>
				</Suspense>
			</Canvas>
			<FloatingButton cpPos={cpPos} setDestination={setDestination}/>
		</div>
	);
}



export default MapView;
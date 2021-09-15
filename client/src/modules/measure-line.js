import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Raycaster, Vector3, Vector2 } from 'three';
import { Line, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
    CSS2DRenderer,
    CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer';


const MapMeasureLine = ( props ) => {
	const line = useRef();

	const mouse = new Vector2();
	const raycaster = new Raycaster();

	const [point, setPoint] = useState( new Vector3() );
	const [start, setStart] = useState( new Vector3() );
	const [end, setEnd] = useState( new Vector3() );

	const [lineCenter, setLineCenter] = useState( new Vector3() );
	const [distance, setDistance] = useState( 0 );
	const [label, setLabel] = useState( null );

	let dragging = false;

	const mouseLocation = (e) => {
		mouse.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
	    mouse.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;

	    handleDrag();
	}

	const handleDragStart = (e) => {
		e.stopPropagation();		
		setStart(() => start.copy( point ));

		dragging = true;
	}

	const handleDrag = () => {
		setEnd(() => end.copy( point ));

		if( dragging ){ 
			line?.current?.geometry?.setFromPoints?.([ start, end ]);

			lineCenter.lerpVectors( start, end, 0.5 );

			setTimeout(() => {
				props.label(() => <Html position={Object.values(lineCenter)} >
								{ start.distanceTo( end ) }
							</Html>);
			}, 100);
		}
	}


	const handleDragEnd = () => {
		setStart( () => start.sub( start ));
		setEnd( () => end.sub( end ));

		line?.current?.geometry?.setFromPoints?.([ start, end ]);

		dragging = false;

		props.label(() => null);
	}

	useEffect(() => {
		const runRaycasting = async () => {
			raycaster.setFromCamera( mouse, props.camera );

			const intersects = raycaster.intersectObjects( props.scene.children );

			if( intersects.length ){
				const currentPoint = intersects[0].point;

				point.copy( currentPoint );
			}
		}

		const mainLoop = setInterval(() => runRaycasting(), 500);

		return () => clearInterval( mainLoop );
	}, []);


	useEffect(() => {
		window.addEventListener('mousemove', mouseLocation );		
		window.addEventListener('mousedown', handleDragStart );
		window.addEventListener('mouseup', handleDragEnd );

		return () => {
			window.removeEventListener('mousemove', mouseLocation );		
			window.removeEventListener('mousedown', handleDragStart );
			window.removeEventListener('mouseup', handleDragEnd );
		}
	}, []);


	return(	
		<line ref={ line }>
			<bufferGeometry />
			<lineBasicMaterial color={ 0xffffff } lineWidth={ 5 } />
		</line>
	);
}

// const MapMeasureLine = React.forwardRef(( props, ref ) => {
// 	const mouse = new Vector2();
// 	const raycaster = new Raycaster();

// 	const point = new Vector3();
// 	const start = new Vector3();
// 	const end = new Vector3();

// 	let dragging = false;

// 	const mouseLocation = (e) => {
// 		mouse.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
// 	    mouse.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;

// 	    handleDrag();
// 	}

// 	const handleDragStart = (e) => {
// 		e.stopPropagation();		
// 		start.copy( point );

// 		dragging = true;
// 	}

// 	const handleDrag = () => {
// 		end.copy( point );

// 		if( dragging ) ref?.current?.geometry?.setFromPoints?.([ start, end ])
// 		// props.distance( () => start.distanceTo( end ) );
// 		// props.lineCenter( () => Object.values(start.sub( end )) );

// 	}


// 	const handleDragEnd = () => {
// 		start.sub( start );
// 		end.sub( end );

// 		ref?.current?.geometry?.setFromPoints?.([ start, end ])
// 		// props.distance( () => start.distanceTo( end ) );
// 		// props.lineCenter( () => Object.values(start.sub( end )) );

// 		dragging = false;
// 	}

// 	useFrame(() => {
// 		raycaster.setFromCamera( mouse, props.camera );

// 		const intersects = raycaster.intersectObjects( props.scene.children );

// 		if( intersects.length ){
// 			const currentPoint = intersects[0].point;

// 			point.copy( currentPoint );
// 		}
// 	});


// 	useEffect(() => {
// 		window.addEventListener('mousemove', mouseLocation );		
// 		window.addEventListener('mousedown', handleDragStart );
// 		window.addEventListener('mouseup', handleDragEnd );

// 		return () => {
// 			window.removeEventListener('mousemove', mouseLocation );		
// 			window.removeEventListener('mousedown', handleDragStart );
// 			window.removeEventListener('mouseup', handleDragEnd );
// 		}
// 	}, []);


// 	return(
// 		<line>
// 			<bufferGeometry />
// 			<lineBasicMaterial color={ 0xffffff } lineWidth={ 5 } />
// 		</line>
// 	);
// })

export default MapMeasureLine;
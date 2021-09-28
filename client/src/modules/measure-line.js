import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Raycaster, Vector3, Vector2 } from 'three';
import { Line, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import debounce from 'lodash.debounce';


const MapMeasureLine = ( props ) => {
	const line = useRef();

	const mouse = new Vector2();
	const raycaster = new Raycaster();

	const [point, setPoint] = useState( new Vector3() );
	const [start, setStart] = useState( new Vector3() );
	const [end, setEnd] = useState( new Vector3() );

	const [lineCenter, setLineCenter] = useState( new Vector3() );
	const [label, setLabel] = useState( null );

	let dragging = false;

	const updateLabel = () => {
		 return props.label(() => ([
		 	Object.values(lineCenter), 
		 	start.distanceTo( end ).toFixed( 2 )
		 ]));
	}

	const memoizedUpdateLabel = useCallback(debounce(updateLabel, 50), [start, end]);

	const mouseLocation = (e) => {
		mouse.x = ( e.offsetX / window.innerWidth ) * 2 - 1;
	    mouse.y = - ( e.offsetY / window.innerHeight ) * 2 + 1;

	    if( dragging ) memoizedDrag();
	}

	const handleDragStart = () => {
		setStart(() => start.copy( point ));

		dragging = true;
	}

	const handleDrag = () => {
		setEnd(() => end.copy( point ));

		line?.current?.geometry?.setFromPoints?.([ start, end ]);
		lineCenter.lerpVectors( start, end, 0.5 );

		memoizedUpdateLabel();
	}


	const handleDragEnd = () => {
		setStart( () => start.sub( start ));
		setEnd( () => end.sub( end ));

		line?.current?.geometry?.setFromPoints?.([ start, end ]);

		dragging = false;

		props.label( () => null );	
	}

	const memoizedDrag = useCallback(() => handleDrag(), [start, end]);
	
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

	useFrame(() => {
		const runRaycasting = async () => {
			raycaster.setFromCamera( mouse, props.camera );

			const intersects = raycaster.intersectObjects( props.scene.children, true );

			if( intersects.length ){
				const currentPoint = intersects[0].point;

				setPoint( () => point.copy( currentPoint ));
			}
		}

		runRaycasting();
	});

	return(	
		<line ref={ line }>
			<bufferGeometry />
			<lineBasicMaterial color={ 0xffffff } lineWidth={ 1 } lineCap="round" />
		</line>
	);
}


export default MapMeasureLine;
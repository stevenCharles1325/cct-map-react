import React, { useRef, useState, useEffect } from 'react';
import { Raycaster, Vector3, Vector2 } from 'three';
import { Line } from '@react-three/drei';


const MapMeasureLine = ( props ) => {
	console.log('went here 2');

	const line = useRef();

	const mouse = new Vector2();
	const raycaster = new Raycaster();

	const point = new Vector3();
	const start = new Vector3();
	const end = new Vector3();

	const handleDragStart = (e) => {
		e.stopPropagation();
		
		start.copy( point );
	}

	const handleDrag = () => {
		end.copy( point );
	}


	const handleDragEnd = () => {
		start.sub( start );
		end.sub( end );
	}

	useEffect(() => {
		raycaster.setFromCamera( mouse, props.camera );

		const intersects = raycaster.intersectObjects( props.scene.children );

		if( intersects.length ){
			const currentPoint = intersects[0].point;

			point.copy( currentPoint );
		}
	});


	useEffect(() => {
		window.addEventListener('click', handleDragStart );
		window.addEventListener('drag', handleDrag );
		window.addEventListener('dragend', handleDrag );

		return () => {
			window.removeEventListener('click', handleDragStart );
			window.removeEventListener('drag', handleDrag );
			window.removeEventListener('dragend', handleDrag );
		}
	}, []);

	return(
		<Line 
			points={[
				Object.values(start), 
				Object.values(end) 
			]}
			lineWidth={1}
			color="white"
		/>
	);
}

export default MapMeasureLine;
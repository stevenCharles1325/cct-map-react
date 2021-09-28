import React, {
	useState,
	useEffect,
	useCallback
} from 'react';

import { 
	Raycaster, 
	Vector3, 
	Vector2 
} from 'three';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';


const PositionCursor = ({ camera, scene }) => {
	const [point, setPoint] = useState( new Vector3() );
	const [mouse, setMouse] = useState( new Vector2() );

	const raycaster = new Raycaster();

	const mouseLocation = (e) => {
		e.stopPropagation();

	 	setMouse( () => ( 
	 		new Vector2(
	 				( e.offsetX / window.innerWidth ) * 2 - 1,
	 				- ( e.offsetY / window.innerHeight ) * 2 + 1
	 			) 
	 		));
	}


	useEffect(() => {
		window.addEventListener('mousemove', mouseLocation);

		return () => window.removeEventListener('mousemove', mouseLocation);
	}, []);


	useFrame(() => {
		raycaster.setFromCamera( mouse, camera );

		const intersects = raycaster.intersectObjects( scene.children );

		if( intersects.length ){
			const currentPoint = intersects[0].point;

			setPoint( () => currentPoint );
		}
	});

	return (
		<> 
			<Html 
				position={ point.toArray() } 
				className="non-selectable container"
			>	
				<p>
					{ `${point.toArray().map( elem => elem.toFixed(2) )}` }
				</p>
			</Html> 
		</>
	);
}

export default PositionCursor;





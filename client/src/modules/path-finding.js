import React from 'react';
import { Vector3, Raycaster } from 'three';



async function pathFind( scene, destination ){

	/* ================================================================
 	+
 	+	destination 	- contains the starting point and the ending point.
 	+
 	+	setPath 		- sets the path points.
	+
	+	scene			- contains the visible objects in the screen.
 	+
 	==================================================================*/


	let closestPoints = [] // Accumulates points closest to destination.


	// Raycasters that cast from different directions.
	const leftRaycaster = new Raycaster();
	const rightRaycaster = new Raycaster(); 

	const upRaycaster = new Raycaster(); 	 
	const downRaycaster = new Raycaster(); 

	const frontRaycaster = new Raycaster();
	const backRaycaster = new Raycaster(); 


	// LOCATION AND DESTINATION
	let start = new Vector3( ...Object.values(destination.start) );
	const end = new Vector3( ...Object.values(destination.end) );


	// Gets the initial distance.
	let initDistance = start.distanceTo( end );


	// Speed of movements.
	const SPEED = 10;


	// MOVEMENTS
	const left = new Vector3( SPEED, 0, 0 );
	const right = new Vector3( -SPEED, 0, 0 );

	const up = new Vector3( 0, SPEED, 0 );
	const down = new Vector3( 0, -SPEED, 0 );

	const forward = new Vector3( 0, 0, -SPEED );
	const backward = new Vector3( 0, 0, SPEED );



	// Check if 2 vectors are equals.
	const equalVectors = (vector1, vector2) => {
		return Object.values(vector1).toString() === Object.values(vector2).toString();
	}


	// Only gets objects with name "map_object"
	const filterMapObjects = ( child ) => {
		return child?.name ? child.name.search('map_object') > - 1 ? true : false : false;
	}


	/*==============================================
	+
	+	Tests if a raycaster intersects with any
	+	object in the scene.
	+
	===============================================*/
	
	const testRaycaster = ([raycaster, direction]) => {
		raycaster.set( start, direction );

		const intersections = raycaster.intersectObjects( scene.children.filter( filterMapObjects ), true );

		if( intersections.length ){
			const { distance } = intersections[0];

			return testMovement({ distance, direction });
		}
		else{
			return testMovement({ direction });			
		}
	}



	/*=============================================
	+
	+	Check if movement's distance is greater 
	+	than "10", and also if it lessens the gap
	+	between the starting and ending point.
	+
	===============================================*/
	
	const testMovement = ( movement ) => {
		const falseMovement = start.clone().add( movement.direction );

		if( movement?.distance && movement.distance >= 20 ){

			if( falseMovement.distanceTo( end ) <= initDistance ) return moveTo( movement.direction );
		}
		else if( !movement?.distance ){

			if( falseMovement.distanceTo( end ) <= initDistance ) return moveTo( movement.direction );
		}
	}



	/*=============================================
	+
	+			Take the given direction.
	+
	==============================================*/

	const moveTo = ( direction ) => {
		start.add( direction );
		initDistance = start.distanceTo( end );
		closestPoints.push( Object.values(start) );

		console.log( initDistance );

		return true;
	}



	// Starts locating the Ending point.
	const startPathFinding = () => {

		// Prunes the testing to speed up the flow.
		const pruner = ( request ) => {
			const result = testRaycaster( request ) ?? false;

			if( result ) return;
		}

		// Tests each raycaster paired with a direction.
		[
			[leftRaycaster, left],
			[rightRaycaster, right],

			[upRaycaster, up],
			[downRaycaster, down],

			[frontRaycaster, forward],
			[backRaycaster, backward]

		].forEach( pruner );

	}

	const stopAt = (count, callback) => {
		while( count >= 0 ){
			callback();

			count-=1;
		}
	}


	// The main loop.
	while( true ){
		
		if( equalVectors( start, end ) || (start.distanceTo(end) - SPEED) <= 0 ){
			break;
		}
		else{
			startPathFinding();
		}
		
	}
	
	console.log(' PATH FINDING IS FINISHED ');

	return closestPoints;
}




export default pathFind;
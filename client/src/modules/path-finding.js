import React from 'react';
import { Vector3 } from 'three';
import debounce from 'lodash.debounce';

const DELAY = 100;

class Node{
	constructor( checkpoint ){
		this.name = checkpoint.name;
		this.vector = new Vector3( ...Object.values(checkpoint.position) );
		this.neighbors = [];
		
		this.radius = 1500;
		this.points = 5;
		this.floor = 0;

		this.isTravelled = false;
		this.isConnector = /connector/.test(this.name.toLowerCase());
	}

	addNeighbor( neighbor ){
		if( neighbor.vector.distanceTo(this.vector) <= this.radius ){
			this.neighbors.push( neighbor );
		}
	}

	travelled(){
		this.isTravelled = true;
	}
}


const findLowest = ( numList ) => { 
	let lowest = Infinity;

	numList.forEach( num1 => {
		numList.forEach( num2 => {
			if( num1 <= num2 ){
				if( num1 <= lowest ){
					lowest = num1;
				}
			}
		});
	});

	return lowest;
}


const linkNodes = ( nodes ) => {
	const names = Object.keys( nodes );

	names.forEach( leftName => {
		names.forEach( rightName => {
			if( leftName !== rightName ){
				nodes[leftName].addNeighbor( nodes[rightName] );
			} 
		});		
	});

	return nodes;
}


const traverse = ( node, destination, points = 0, path = [], destinationLocated = false ) => {	
	path.push( node.vector.toArray() );
	points += node.points;
	
	if( (!node.isConnector && !node.vector.equals( destination )) ||destinationLocated ){
		 return [ points, path, destinationLocated ];
	}
	else if((!node.isConnector && node.vector.equals( destination ))) {
		return [ points, path, true ];
	}
	
	node.travelled();	

	node.neighbors.forEach( neighbor => {
		if(neighbor.vector.equals( destination )){
			[ points, path, destinationLocated ] = traverse( neighbor, destination, points, path, true );
			return;
		}
		else if( neighbor.isConnector && !neighbor.isTravelled ){
			[ points, path, destinationLocated ] = traverse( neighbor, destination, points, path );
		}
	});

	return [ points, path, destinationLocated ];
}


async function pathFind( checkpoints, destination ){
	if( !checkpoints || !destination ) return [];

	let highestY = 0;
	
	let shortestPaths = {};
	let nodes = {};

	checkpoints.forEach( cp => {
		if( cp.position.y > highestY ) highestY = cp.position.y;
	});

	checkpoints.forEach( cp => {
		const node = new Node( cp );

		const nodeY = node.vector.y;
		let index = 4;

		for( let floor = highestY; floor >= (highestY / 4); floor -= (highestY / 4)){
			if( nodeY <= floor ) node.floor = index ;

			index--;
		}

		nodes[ cp.name ] = node ;
	});		

	nodes = linkNodes( nodes );
	console.log( nodes );

	const vectDestination = new Vector3( ...Object.values(destination.end.position) );	
	nodes[ destination.start.name ].neighbors.forEach( neighbor => {
		console.log(`NEIGHBOR: ${neighbor.name}`);		
		const [ points, path, destinationLocated ] = traverse( 
			neighbor, 
			vectDestination, 
			nodes[ destination.start.name ].points
		);

		if( !shortestPaths[ points ] && destinationLocated ) shortestPaths[ points ] = path;
	});

	Object.keys( nodes ).forEach( nodeKey => {
		nodes[ nodeKey ].isTravelled = false;
	});

	const lowestKey = findLowest(Object.keys( shortestPaths ));

	console.log( shortestPaths );
	console.log(' PATH FINDING IS FINISHED ');
	return shortestPaths[ lowestKey ];
}


export default pathFind;

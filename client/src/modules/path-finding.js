import React from 'react';
import { Vector3 } from 'three';

let shortestPaths = {};
let nodes = {};

class Node{
	constructor( checkpoint ){
		this.name = checkpoint.name;
		this.vector = new Vector3( ...Object.values(checkpoint.position) );
		this.neighbors = [];

		this.radius = 600;
		this.points = 5;
		this.floor = this.vector.y;

		this.isTravelled = false;
		this.isConnector = /connector/.test( this.name.toLowerCase() );
	}

	travelled(){
		this.isTravelled = true;
	}

	isInRadiusOf( other ){
		return this.vector.distanceTo(other.vector) <= this.radius;
	}

	sameFloorOf( other ){
		return this.floor === other.floor || Math.abs(this.floor - other.floor) <= 50;
	}

	areConnectors( other ){
		return this.isConnector && other.isConnector;
	}

	addNeighbor( neighbor ){
		if( this.neighbors.map( neighbor => neighbor.name ).indexOf	( neighbor.name ) > - 1 ) return;
		if( this.areConnectors( neighbor ) || (this.isInRadiusOf( neighbor ) && this.sameFloorOf( neighbor ))){
			this.neighbors.push( neighbor );
			neighbor.addNeighbor( this );
		}
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


const mergeArrays = (left, right) => {
  const mergedArray = [];

  while (left.length && right.length) {
    mergedArray.push(left[0] > right[0] ? right.shift() : left.shift());
  }

  while (left.length) {
    mergedArray.push( left.shift() );
  }

  while (right.length) {
    mergedArray.push( right.shift() );
  }

  return mergedArray;
}

const mergeSort = (list) => {
  if( list.length < 2 ) return list;

  const middle = Math.floor(list.length / 2);

  const left = list.slice(0, middle);
  const right = list.slice(middle, list.length);

  const sorted_left = mergeSort(left);
  const sorted_right = mergeSort(right);

  return mergeArrays(sorted_left, sorted_right)
}


const linkNodes = ( nodes, memo = [] ) => {
	const names = Object.keys( nodes );

	const numbers = {};

	Object.keys( nodes ).forEach( elem => {
		if( /connector/.test(elem.toLowerCase()) )
			numbers[ Number(elem.split('CONNECTOR')[1]) ] = elem;
	});


	const sortedNumbers = mergeSort(Object.keys( numbers ).map( elem => Number(elem) ));
	sortedNumbers.forEach( (elem, index) => {
		if( index < sortedNumbers.length - 1 ){
			nodes[ numbers[elem] ].addNeighbor( nodes[ numbers[sortedNumbers[index + 1]] ] );
		}
	});

	names.forEach( name1 => {
		names.forEach( name2 => {
			if( name1 != name2 && (nodes[name1].isConnector || nodes[name2].isConnector) ){
				nodes[name1].addNeighbor( nodes[name2] );
			}
		});
	});

	return nodes;
}

const traverse = ( name, destination, points = 0, path = [], isLocated = false ) => {
	if( isLocated || nodes[name].isTravelled ) return [path, points, isLocated];
	console.log( name );

	path.push( nodes[name].vector.toArray() );
	points += nodes[name].points;
	nodes[name].travelled();

	if( nodes[name].isConnector ){
		nodes[name].neighbors.forEach( neighbor => {
			if( neighbor.vector.equals( destination ) ){
				path.push( neighbor.vector.toArray() );
				points += neighbor.points;
				neighbor.travelled();

				[path, points, isLocated] = traverse( 
					neighbor.name, 
					destination, 
					points, 
					path,  
					true 
				);
				return;
			}
		});

		if( !isLocated ){
			nodes[name].neighbors.forEach( neighbor => {
				if( neighbor.isConnector && !neighbor.isTravelled ){
					[path, points, isLocated] = traverse( 
						neighbor.name, 
						destination, 
						points, 
						path,  
						isLocated 
					);
				}
			});			
		}
	}	
	else{
		nodes[name].neighbors.forEach( neighbor => {
			if( neighbor.isConnector && !neighbor.isTravelled ){
				[path, points, isLocated] = traverse( 
					neighbor.name, 
					destination, 
					points, 
					path,  
					isLocated
				);
			}
		});
	}

	return [path, points, isLocated]
}


const createNodes = checkpoints => {
	if( !checkpoints ) return [];

	checkpoints.forEach( cp => {
		const node = new Node( cp );

		nodes[ cp.name ] = node ;
	});		

	nodes = linkNodes( nodes );
}


async function pathFind( destination ){
	if( !destination ) return [];

	shortestPaths = {};
	const vectDestination = new Vector3( ...Object.values(destination.end.position) );

	if( nodes[ destination.start.name ].vector.equals( vectDestination ) ) return [];

	nodes[ destination.start.name ].travelled();
	nodes[ destination.start.name ].neighbors.forEach( neighbor => {
		const [ path, points, isLocated ] = traverse( 
			neighbor.name, 
			vectDestination, 
			nodes[ destination.start.name ].points
		);
 	
		if( !shortestPaths[ points ] && isLocated ) shortestPaths[ points ] = [
			Object.values(destination.start.position),
			...path,
			Object.values(destination.end.position)
		];
	});

	Object.keys( nodes ).forEach( nodeKey => {
		nodes[ nodeKey ].isTravelled = false;
	});

	const lowestKey = findLowest(Object.keys( shortestPaths ));

	console.log( nodes );

	console.log(`${Object.keys(shortestPaths).length} paths: ${lowestKey} points`);
	return shortestPaths[ lowestKey ];
}




export { pathFind, createNodes };



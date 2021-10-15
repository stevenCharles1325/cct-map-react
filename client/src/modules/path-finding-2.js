import { Vector3 } from 'three';
import { Queue } from '@datastructures-js/queue';
import Node from './nodes';
import Paths from './paths';

function resetNodes(){
	Object.keys( NODES ).forEach( name => {
		NODES[ name ].reset();
	});
}

function linkNodes() {
	let nearest = null;

	const nodeNames = Object.keys( NODES );

	// Linking rooms with nearest connector
	nodeNames
	.filter( node => !/connector/.test(node.toLowerCase()) )
	.forEach( name1 => { // Rooms
		
		nodeNames
		.filter( node => /connector/.test(node.toLowerCase()) )
		.forEach( name2 => { // Connectors

			// Linking connector with another connector
			if( NODES[name2].neighborAddress ){
				NODES[name2].neighborAddress.forEach( number => {

					nodeNames.forEach( name => {
						if( name.includes('connector') ){
							let connectorNumber = Number(name.split('connector')[1]);

							if( connectorNumber === number ){
								NODES[name].addNeighbor( NODES[name2] );	
							} 
						}
					});
				});
			}

			if( !nearest ){
				nearest = NODES[name2];
			}

			if( nearest && NODES[name1].distanceTo( nearest ) > NODES[name1].distanceTo( NODES[name2] )){
				nearest = NODES[name2];
			}
		});

		if( nearest ){
			NODES[name1].addNeighbor( NODES[nearest.name] );
			nearest = null;
		}
	});
}


function createNodes( checkpoints ){
	if( !checkpoints || !checkpoints?.length ) return;

	try{
		checkpoints.forEach( cp => {
			const node = new Node( cp );

			NODES[ node.name ] = node;
		});	

		linkNodes();
	}
	catch( err ){
		throw err;		
	}

	console.log( NODES );
}

async function pathFind( destination ){
	if( !destination ) return [];

	const start = destination?.start?.position ? new Vector3( ...Object.values( destination.start.position ) ) : null;
	const end = destination?.end?.position ? new Vector3(...Object.values( destination.end.position )) : null;

	if( !start || !end ) return [];
	if( start.equals( end ) ) return [];

	q.clear();
	q.enqueue( NODES[destination.start.name.toLowerCase()] );

	const shortestPath = bfs(NODES[destination.end.name.toLowerCase()]);

	resetNodes();

	return [...shortestPath, start.toArray()];
}


// =================================================== 
// 
// 				PATH FUCKING FINDING V1! 
// 
// ===================================================
function bfs( end, path = null ){
	if( !q.size() ) return path;

	const currentNode = q.dequeue();
	NODES[ currentNode.name ].travelled();

	for( let i = 0; i < currentNode.neighbors.length; i++ ){
		const neighbor = currentNode.neighbors;

		if( NODES[neighbor[ i ].name].isTravelled ) continue;

		NODES[neighbor[ i ].name].setParent( NODES[currentNode.name] );

		q.enqueue( neighbor[ i ] );

		if(neighbor[ i ].distanceTo( end ) === 0){
			q.clear();
			path = recurseParent( NODES[neighbor[ i ].name] );
		}
	}

	return bfs( end, path );
}

function recurseParent( node, path = [] ){
	if( !node.getParent() ) return path;

	path.push( node.vector.toArray() );
	return recurseParent( node.getParent(), path );
}


const q = new Queue();
const NODES = {};

export { pathFind, createNodes };


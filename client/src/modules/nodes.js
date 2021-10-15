import { Vector3 } from 'three';

export default class Node{
	constructor( checkpoint ){
		this.name = checkpoint.name.toLowerCase();
		this.vector = new Vector3( ...Object.values(checkpoint.position) );
		this.neighbors = [];

		this.parent = null;

		this.neighborAddress = null;

		this.radius = Infinity;

		this.isTravelled = false;
		this.isConnector = /connector/.test( this.name.toLowerCase() );

		this.fixeName();
	}

	reset(){
		this.setParent( null );
		this.isTravelled = false;
	}

	getParent(){
		return this.parent;
	}

	setParent( parent ){
		if( this.parent && parent ) return;

		this.parent = parent;
	}

	fixeName(){
		if( this.isConnector ){
			if( this.name.split('-')[1] ){
				this.neighborAddress = JSON.parse(this.name.split('-')[1]);
				this.name = this.name.split('-')[0];				
			}
		}	
	}

	distanceTo( other ){
		return this.vector.distanceTo( other.vector );
	}

	travelled(){
		this.isTravelled = true;
	}

	isInRadius( other ){
		return this.vector.distanceTo(other.vector) <= this.radius;
	}

	addNeighbor( neighbor ){
		if( this.neighbors.length && 
			this.neighbors.map( neighbor => neighbor.name )
			.indexOf( neighbor.name ) > - 1 ) return;

		if( this.isInRadius( neighbor ) ){
			this.neighbors.push( neighbor );
			neighbor.addNeighbor( this );
		}
	}
}
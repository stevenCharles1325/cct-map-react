import { Vector3 } from 'three';
import Node from './nodes';

export default class Paths{
	#_length = Object.values( this ).length;
	#_keys = [];
	#_locks = [];

	get length(){
		return this.#_length;
	}

	get lastKey(){
		return this.#_keys[ this.#_keys.length - 1 ];
	}

	lock( key ){
		if( this.#_locks.includes( key ) ) return;

		this.#_locks.push( key );
	}
	
	#_updateKeys(){
		this.#_keys = Object.keys( this );
	}

	reset(){
		this.#_locks = [];
		this.#_keys.forEach( key => {
			this.removePath( key );
		});
	}

	addPath( key = this.#_length, paths = [], points = 0 ){
		this[ key ] = { 
			paths: paths, 
			points: points
		};

		this.#_length += 1;
		this.#_updateKeys();		
	}

	copyPath( key ){
		if( key === null || !this[ key ] ) return;

		return [[...this[ key ].paths], this[ key ].points];
	}

	findPathKeyByVector( vector ){
		if( !vector ) return;

		let resultKey = null;

		this.#_keys.forEach( key => {
			try{
				const result = JSON.stringify(this[ key ].paths).includes( JSON.stringify(vector) );

				if( result ){
					resultKey = key;
					return;
				}
			}
			catch (err){
				throw err
			}
		});

		return resultKey;
	}

	addVector( key, node ){
		if( this.#_locks.includes( key ) ) return;
		if( !this[ key ] || key === null || !node ) return;

		node = node instanceof Node
			? node.vector
			: node instanceof Vector3
				? node
				: node instanceof Array
					? new Vector3( ...node )
					: null;

		if( !node ) return;

		if( this[ key ].paths.length ){
			this[ key ].paths.forEach(( _, index ) => {
				if( index <= this[ key ].paths - 2 ){
					this[ key ].points += this.vector3( this[ key ].paths[ index ] ).distanceTo( this[ key ].paths[ index + 1 ] );					
				}
			});

			// this[ key ].points += new Vector3( ...this[ key ].paths[ this[ key ].paths.length - 1 ] ).distanceTo( node );			
		}

		this[ key ].paths.push( node.toArray() );

		this.#_updateKeys();
	}

	vector3( points ){
		return new Vector3( ...points );
	}

	popVector( key ){
		if( !this[ key ] || key === null ) return;

		let poppedPoints = new Vector3( ...this[ key ].paths[ this[ key ].paths.length - 1 ] ).distanceTo( new Vector3( ...this[ key ].paths[ this[ key ].paths.length - 2 ] ) ) 
		this[ key ].points -= poppedPoints;

		return this[ key ].paths.pop();
	}

	removePath( key = this.lastKey ){
		if( !this[ key ] ) return;

		let removedPath = null;

		removedPath = this[ key ];
		delete this[ key ];

		this.#_length -= 1;
		this.#_updateKeys();

		return removedPath;
	}

	getShortest(){
		if( !this.length ) return;
		if( this.#_locks.length === 1 ) return this[ this.#_locks[ 0 ] ].paths; 

		let lowest = { key: null, points: Infinity };

		this.#_locks.forEach( key => {
			if( this[ key ].points <= lowest.points ){
				lowest.points = this[ key ].points;
				lowest.key = key;
			}
		});

		return this[ lowest.key ].paths;
	}
}


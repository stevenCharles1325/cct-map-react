import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import axios from 'axios';
import BSON from 'bson';


export default class Chunker{
	#_offSet = {};
	#_idError = {};
	#_accumulatedChunkLength = {};

	constructor( chunkSize, delayTime ){
		this.chunkSize = chunkSize ?? 1000000;
		this.delayTime = delayTime ?? 70000;
		this.token = Cookies.get('token');
	}

	async send( url, data, callback ){
		if( !url ) console.warn('Chunker send url is undefined');
		if( !data ) console.warn('Chunker send data is undefined');

		if( data instanceof Array && !data.length ) return;
		if( data instanceof Object && JSON.stringify(data) === '{}' ) return;

		const localID = uniqid();
		const BSONData = this.BSONize( data );

		this.#_offSet[ localID ] = 0;
		this.#_idError[ localID ] = null;
		this.#_accumulatedChunkLength[ localID ] = 0;

		this.delayTime = BSONData.length * 0.01;
		
		this.#_send( BSONData, localID, url, callback );
	}

	BSONize( data ){
		return BSON.serialize( data );
	}

	async #_send( data, id, url, callback, chunkId = 0 ){
		if( this.#_offSet[ id ] >= data.length && !this.#_idError[ id ] ) return;

		if( this.chunkSize <= data.length ){
			const chunk = data.slice( this.#_offSet[ id ], this.#_offSet[ id ] + this.chunkSize );

			this.#_accumulatedChunkLength[ id ] += chunk.length;
			callback?.({ error: this.#_idError[ id ], progress: this.#_accumulatedChunkLength[ id ] / data.length * 100 });	
			
			if( chunk ){
				axios.post(url, { data: {
					id: chunkId,
					chunk: chunk,
					isDone: this.#_offSet[ id ] + this.chunkSize >= data.length
				}},
				{
		            headers: {
		                'authentication': `Bearer ${this.token}`
		            }
		        })
		        .then(() => {
		        	this.#_offSet[ id ] += this.chunkSize;
					setTimeout(() => this.#_send( data, id, url, callback, chunkId + 1 ), this.delayTime);
		        })
				.catch( err => {
					this.#_idError[ id ] = err;
					this.#_requestClearServerTemp();
				});
			}
		}
		else{
			const chunk = data.slice( this.#_offSet[ id ], data.length );
			
			this.#_accumulatedChunkLength[ id ] += chunk.length;
			callback?.({ error: this.#_idError[ id ], progress: this.#_accumulatedChunkLength[ id ] / data.length * 100 });	

			if( chunk ){
				axios.post(url, { data: {
					id: chunkId,
					chunk: chunk,
					isDone: true
				}},
				{
		            headers: {
		                'authentication': `Bearer ${this.token}`
		            }
		        })
				.catch( err => {
					this.#_idError[ id ] = err;
					this.#_requestClearServerTemp();
				});
			}
		}	

		return;
	}

	#_requestClearServerTemp(){
		axios.put('https://localhost:4443/admin/clear-temp')
		.catch(err => setTimeout(() => this.#_requestClearServerTemp()), this.delayTime);
	}
}
import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import axios from 'axios';
import BSON from 'bson';


export default class Chunker{
	#_offSet = {};
	#_idError = {};
	#_idMessage = {};
	#_erroredChunks = {} // localID && chunk itself
	#_accumulatedChunkLength = {}; // This is for the progress.

	constructor( chunkSize, event, timeout ){
		this.chunkSize = chunkSize ?? 1000000;
		this.timeout = timeout ?? 1000000;
		this.interval = 100;
		this.Event = event;

		this.token = Cookies.get('token');
		this.rtoken = Cookies.get('rtoken');
	}

	async send( url, data, callback ){
		if( !url ) return console.warn('Chunker send url is undefined');
		if( !data ) return console.warn('Chunker send data is undefined');

		const localID = uniqid();
		const BSONData = this.BSONize( data );

		this.#_offSet[ localID ] = 0;
		this.#_idError[ localID ] = null;
		this.#_idMessage[ localID ] = null;
		this.#_accumulatedChunkLength[ localID ] = 0;

		console.log(`Saving map data with ${this.getMB( BSONData )} MB`);
		
		await this.#_send( BSONData, localID, url, callback );
		await this.#_processErroredChunks( localID, url, callback, BSONData.length );
	}

	addToErroredChunk( localID, chunk ){
		this.#_erroredChunks[ localID ] = chunk;
	}

	BSONize( data ){
		return BSON.serialize( data );
	}

	getMB( data ){
		return data.length * 0.000001;
	}

	async #_processErroredChunks( localID, url, callback, originalDataSize ){
		// Do another requests for those errored chunks
		this.#_idMessage[ localID ] = 'Processing errored chunks';
		let keys = Object.keys( this.#_erroredChunks );

		await this.#_recurseOnErroredChunks( 0, keys, localID, url, callback, originalDataSize );
	}

	async #_recurseOnErroredChunks( index, keys, localID, url, callback, originalDataSize ){
		if( !keys[ index ] || index >= keys.length ) return;

		axios.post( url, { chunk: this.#_erroredChunks[keys[ index ]] },
		{
			timeout: this.timeout,
            headers: {
                'authentication': `Bearer ${ this.token }`
            }
        })
		.then(() => {
			callback?.({ 
				error: this.#_idError[ localID ], 
				progress: this.#_accumulatedChunkLength[ localID ] / originalDataSize * 100 
			});

			// If successful then try the next chunk
			this.#_recurseOnErroredChunks( index + 1, keys, localID, url, callback, originalDataSize );
		})
		.catch( async err => {
			this.#_idError[ localID ] = err;
			this.#_idMessage[ localID ] = 'Error occured. Will now break chunk into two';
			
			// Then try breaking the chunk into two.
			return await this.#_breakChunks( url, keys[ index ], localID, callback, originalDataSize );
		});
	}

	async #_breakChunks( url, key, localID, callback, originalDataSize ){
		let firstChunk = this.#_erroredChunks[ key ].slice( 0, this.#_erroredChunks[ key ].length / 2 );
		let secondChunk = this.#_erroredChunks[ key ].slice( this.#_erroredChunks[ key ].length / 2, this.#_erroredChunks[ key ].length );

		axios.post( url, { firstChunk },
		{
			timeout: this.timeout,
			headers: {
				'authentication': `Bearer ${ this.token }`
			}
		})
		.then(() => {
			axios.post( url, { secondChunk },
			{
				timeout: this.timeout,
	            headers: {
	                'authentication': `Bearer ${ this.token }`
	            }
			})
			.then(() => {
				callback?.({ 
					error: this.#_idError[ localID ], 
					progress: this.#_accumulatedChunkLength[ localID ] / originalDataSize * 100 
				});
			})
			.catch( async err => {
				// Finally return the error
				this.#_idError[ localID ] = err;
				this.#_idMessage[ localID ] = 'Error, please try again later.';

				return await this.#_requestResetData( localID );
			});
		})
		.catch( async err => {
			// Finally return the error
			this.#_idError[ localID ] = err;
			this.#_idMessage[ localID ] = 'Error, please try again later.';

			return await this.#_requestResetData( localID );
		});
	}

	async #_send( data, localID, url, callback, chunkId = 0 ){
		if( this.#_offSet[ localID ] >= data.length && !this.#_idError[ localID ] ) return;

		if( this.chunkSize <= data.length ){
			const chunk = data.slice( this.#_offSet[ localID ], this.#_offSet[ localID ] + this.chunkSize );
			console.log(`Sending chunk with size ${ this.getMB(chunk) } mb`);

			this.#_accumulatedChunkLength[ localID ] += chunk.length;

			if( chunk ){
				axios.post(url, { chunkId, chunk },
				{
					timeout: this.timeout,
		            headers: {
		                'authentication': `Bearer ${this.token}`
		            }
		        })
		        .then(() => {
					callback?.({ 
						error: this.#_idError[ localID ], 
						message: this.#_idMessage[ localID ],
						progress: this.#_accumulatedChunkLength[ localID ] / data.length * 100
					});	

		        	this.#_offSet[ localID ] += this.chunkSize;
					setTimeout(() => this.#_send( data, localID, url, callback, chunkId + 1 ), this.interval);
		        })
				.catch( err => {
					if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
		                return axios.post('https://localhost:4444/auth/refresh-token', { token: this.rtoken })
		                .then( res => {
		                    Cookies.set('token', res.data.accessToken)

		                    setTimeout(() => 
		                    	this.#_send( data, localID, url, callback, chunkId ), 
		                    	this.interval
		                    );
		                })
		                .catch( err => this?.Event?.emit?.('unauthorized'));
		            }

					this.#_idError[ localID ] = err;
					this.addToErroredChunk( chunkId, chunk );
					
					setTimeout(() => 
						this.#_send( data, localID, url, callback, chunkId + 1 ), 
						this.interval
					);
				});
			}
		}
		else{
			const chunk = data.slice( this.#_offSet[ localID ], data.length );
			console.log(`Sending chunk with size ${ this.getMB(chunk) } mb`);
			
			this.#_accumulatedChunkLength[ localID ] += chunk.length;

			if( chunk ){
				axios.post(url, { chunk },
				{	
					timeout: this.timeout,
		            headers: {
		                'authentication': `Bearer ${this.token}`
		            }
		        })
		        .then(() => {
					callback?.({ 
						error: this.#_idError[ localID ], 
						message: this.#_idMessage[ localID ],
						progress: this.#_accumulatedChunkLength[ localID ] / data.length * 100
					});	
		        })
				.catch( err => {
					if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
		                return axios.post('https://localhost:4444/auth/refresh-token', { token: this.rtoken })
		                .then( res => {
		                    Cookies.set('token', res.data.accessToken)

		                    setTimeout(() => 
		                    	this.#_send( data, localID, url, callback, chunkId ), 
		                    	this.interval
		                    );
		                })
		                .catch( err => this?.Event?.emit?.('unauthorized'));
		            }

					this.#_idError[ localID ] = err;
					this.addToErroredChunk( chunkId, chunk );

					setTimeout(() => 
                    	this.#_send( data, localID, url, callback, chunkId ), 
                    	this.interval
                    );
				});
			}
		}	

		return;
	}

	async #_requestResetData( localID ){
		this.#_idMessage[ localID ] = 'Clearing chunks.';

		axios.delete('https://localhost:4443/admin/reset-chunk', {	
			timeout: this.timeout,
            headers: {
                'authentication': `Bearer ${this.token}`
            }
        })
        .catch( err => {
			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post('https://localhost:4444/auth/refresh-token', { token: this.rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)
                })
                .catch( err => this?.Event?.emit?.('unauthorized'));
            }
            else{
            	setTimeout(() => this.#_requestResetData(), 60000);
            }
		});
	}
}
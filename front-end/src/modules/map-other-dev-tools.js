export default class MapDevTools{
	constructor(){

		// -------------------------
		// 
		// 		Log properties
		// 
		// -------------------------
			this.logTerminated = false;
			this.logCount = Infinity;
			this.currentLogCallCount = 0;
		// -------------------------
	}


	log( ...args ){

		if( args[args.length - 1] instanceof Object && args[args.length - 1].logCount ){

			const { logCount } = args[args.length - 1];
			args.pop();
			this.logCount = logCount;			
		}


		if( !this.logTerminated ){
			if( this.currentLogCallCount >= this.logCount ){
				console.warn(`Another Log-call has been made but Log-call has met max call ( ${this.logCount} ), will now terminate.`);
				this.logTerminated = true;
			}
			else{
				console.log( ...args );
				this.currentLogCallCount += 1;
			}	
		}

		return;
	}

	sleep( time, callback ){
		return setTimeout(() => {
			if(callback) callback();
		}, time);
	}
}
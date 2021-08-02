
export default class Validator{


	constructor(){
		this.validTypes = ['username', 'password', 'cPassword', 'email', 'number'];
		this.password = null;
	}


	check( type, data ){
		if( this.isTypeValid( type ) ){
			const result = this.checkType( type, data );

			if( result === null || result === undefined ){
				this.throwError('Something went wrong');
			}
			else{
				return result;
			}

		}
		else{
			this.throwError(`The type ${type} is unknown`);
		}
	}


	isTypeValid( type ){
		if(this.validTypes.indexOf( type ) < 0) return false;

		return true;
	}


	checkType( type, data ){
		switch( type ){
			case 'username':
				return this.nameEval( data );

			case 'password':
				return this.passEval( data );

			case 'cPassword':
				return this.cPassEval( data );

			case 'email':
				return this.emailEval( data );

			case 'number':
				return this.cNumberEval( data );

			default:
				this.throwError('Something went wrong');
				break;
		}
	}


	throwError( msg ){
		throw new Error(`[Error]: Validation failed\n\t${msg}.`);
	}

    isValid( data ){
        const valids = /\w/g
        const filtered = data.replaceAll(valids, '');
        
        return filtered ? false : true;
    }


	nameEval( name ) {
        

        if( !name.length ){
            return {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( !this.isValid( name ) ){
            return {msg: `Oops! Invalid username.`, result: false};   
        }
        else if( name.length > 0 && name.length <= 2 ){
            return {msg:`It must be greater-than 2.`, result: false};   
        }
        else{
        	return { result: true };
        }
    }


    passEval( pass ) {

        if( !pass.length ){
            return {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( pass.length > 1 && pass.length < 7 ){
            return {msg: `It must be greater-than 7.`, result: false};   
        }
        else{
			this.password = pass;
        	return { result: true };
        }
    }


    cPassEval( cpass ) {

        if( !cpass.length ){
            return {msg: `Hey! You left me empty!`, result: false};
        }
        else if( cpass.length > 1 && cpass.length < 7 ){
            return {msg: `It must be greater-than 7.`, result: false};
        }
        else if( cpass !== this.password || !this.password ){
            return {msg: `Didn't match!`, result: false};
        }
        else{
        	this.password = null;
        	return { result: true };
        }
    }


    emailEval( email ) {
        if( !email.length ){
            return {msg: `Hey! You left me empty!`, result: false};
        }
        else{
        	return { result: true };
        }
    }


    cNumberEval( cnum ) {

        const isValidNumber = ( number ) => {
            const isLengthAccepted = number.length === 11 ? true : false;
            const isPhpNumber = number.search('09') === 0 ? true : false;

            return isLengthAccepted && isPhpNumber;
        }

        if( !cnum.length ){
            return {msg: `Hey! You left me empty!`, result: false};   
        }
        else if( !isValidNumber( cnum ) || !this.isValid( cnum ) ){
            return {msg: `Oops! Invalid number`, result: false};   
        }
        else{
        	return { result: true };
        }
    }
}
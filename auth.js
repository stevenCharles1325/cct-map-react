require('dotenv').config();

const express = require('express');
const auth = express();
const helmet = require('helmet');

const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const data_path = path.join(__dirname, '/data/admin.json');
const tokens_path = path.join(__dirname, '/data/tokens.json');

const cors = require('cors');

auth.use(helmet());
auth.use(express.json());
auth.use(cors());

// auth.all('*', async ( req, res, next ) => {
// 	if( req.secure ){
// 		return next();
// 	}
// 	else{
// 		return res.redirect(307, `https://${ req.hostname }:${ auth.get('secPort') }${ req.url }`);
// 	}
// });
	
const requestAccessToken = ( user ) => {
	return jwt.sign( user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' } );
};


auth.post('/auth/sign-up', async ( req, res ) => {
	const { username, password, email, number } = req.body;
	const data = {
		exist: true,
		username : username,
		password : password,
		email : email,
		number : number
	};

	fs.writeFile( data_path, JSON.stringify(data, null, 4), err => {
	    if( err ) return res.status( 503 ).json({
	    	message: `Couldn't fulfill the request to save data`
	    });
	    
	    const user = { name: username };
			const accessToken = requestAccessToken( user );
			const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET ); 

			fs.readFile( tokens_path, ( err, tokens ) => {
				if( err ) return res.sendStatus( 500 );

				const parsedTokens = JSON.parse( tokens ).push( refreshToken );

				fs.writeFile( tokens_path, JSON.stringify( parsedTokens ), ( err ) => {
					if( err ) return res.sendStatus( 500 );

		    	return res.status( 200 ).json({ 
		    		message: 'signed-up', 
		    		accessToken: accessToken,
		    		refreshToken: refreshToken 
		    	});
				});	
			});
  	});
});


auth.post('/auth/sign-in', async ( req, res ) => {
  const { username, password } = req.body;
  const admin_data = JSON.parse(fs.readFileSync( data_path ));
  
  if(  username === admin_data.username ){
    if( password === admin_data.password ){
    	const user = { name: username };
			const accessToken = requestAccessToken( user );
			const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET ); 

    	fs.readFile( tokens_path, ( err, tokens ) => {
				if( err ) return res.sendStatus( 500 );

				const parsedTokens = JSON.parse( tokens );

				parsedTokens.push( refreshToken );

				fs.writeFile( tokens_path, JSON.stringify( parsedTokens, null, 4 ), ( err ) => {
					if( err ) return res.sendStatus( 500 );

		    	return res.status( 200 ).json({ 
		    		message: 'signed-in', 
		    		accessToken: accessToken, 
		    		refreshToken: refreshToken 
		    	});
				});	
			});
    }
    else{
    	return res.status( 403 ).json({ which: 'password' });
    }
  }
  else{
  	return res.status( 403 ).json({ which: 'username' });
  }
});


auth.post('/auth/refresh-token', async ( req, res ) => {
	console.log('hereee', req.body.token);

	fs.readFile( tokens_path, ( err, tokens ) => {
		if( err ) return res.sendStatus( 500 );

		const refreshToken = req.body.token;

		if( !refreshToken ) return res.sendStatus( 401 );
		if( !tokens.includes( refreshToken ) ) return res.sendStatus( 403 );

		jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET, ( err, user ) => {
			if( err ) return res.sendStatus( 403 );

			const accessToken = requestAccessToken({ name: user.name });

			return res.status( 200 ).json({ 
				message: 'token has successfully received', 
				accessToken: accessToken
			});
		});
	});
});



module.exports = auth;













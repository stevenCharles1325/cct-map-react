// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';


// Views
import Signin from './views/sign-in';
import Signup from './views/sign-up';
import Dashboard from './views/dashboard';
import Settings from './views/settings';

import MapView from './views/map';

import PageNotFound from './views/pageNotFound';


// Navigation panel icons
import dashboardIcon from './images/dashboard.png';
import mapIcon from './images/map.png';
import settingsIcon from './images/equalizer.png';

// Loading component
import Loading from './components/load-bar/loading';
import NavPanel from './components/navigator/nav-panel';

// Styles
import './styles/admin.css';



// List of current views that the app has.
const ROOT = '/admin';
const VIEWS = [
		ROOT,
		'/dashboard',
	 	'/settings',
	  	'/map',
	   	'/sign-in',
	    '/sign-up'
	 ];



// Main App function.
export default function App(){
	console.log('Run: App');

	const pathname = window.location.pathname;
	const webUrl = truncateRoot(pathname)

	const [admin, setAdmin] = useState(null);
	const [graphData, setGraphData] = useState(null);
	const [mapData, setMapData] = useState( null );
	const [bundle, setBundle] = useState(null);
	const [view, setView] = useState(null);


	const directories = [
               {url: '/dashboard', icon: dashboardIcon, title:'Dashboard'},
               {url: '/map', icon: mapIcon, title:'Map'},
               {url: '/settings', icon: settingsIcon, title:'Settings'}
            ]


    // ----------------------------------------------------------
    //
    // 		Sets admin data from client-side to server-side
	//
	//						[UPDATION REQUESTS]
	//
	// ----------------------------------------------------------
		const requestSetAdmin = ( data ) => { 
			setAdmin( data );
			requestServerSideSetAdmin( data ); 
		}
		
		const requestServerSideSetAdmin = async ( data ) => { 
			await axios.put('http://localhost:7000/admin/set-admin', data)
			.then( res => {
				console.log( res.data.message );
			})
			.catch( err => {
		      	errorHandler( err );
			});
		}

	// -----------------------------------------------------------


	// ===========================================================


	// -----------------------------------------------------------
	//
	// Sets admin activity status from client-side to server-side
	// 
	//						[SIGN-IN REQUESTS]
	//
	// -----------------------------------------------------------
		const requestSetAdminSignIn = ( data ) => {
			setAdmin( data );
			requestServerSideSetAdminSignIn( data );
		}

		const requestServerSideSetAdminSignIn = async ( data ) => { 
			await axios.put('http://localhost:7000/admin/sign-in', data)
			.then( res => {
				console.log( res.data.message );
			})
			.catch( err => {
		      	errorHandler( err );
			});
		}
	// -----------------------------------------------------------


	// ===========================================================


	// -----------------------------------------------------------
	// 
	// 					Set admin to signed out
	//
	//					   [SIGN-OUT REQUEST]
	//
	// -----------------------------------------------------------
		const requestSignOut = ( data ) => {
			setAdmin( data );
			requestServerSignOut( data.status );
		}

		const requestServerSignOut = async ( data ) => {
			await axios.put('http://localhost:7000/admin/log-status', data)
			.then( res => {
				console.log( res.data.message );
			})
			.catch( err => {
		      	errorHandler( err );
			});
		}
	// -----------------------------------------------------------


	// ===========================================================


	// -----------------------------------------------------------
	// 
	// 		Create admin data from client-side to server-side
	// 
	// 						[CREATION REQUEST]
	// 
	// -----------------------------------------------------------
		const requestSignUp = ( data ) => {
			setAdmin( data );
			requestServerSignUp( data );
		}

		const requestServerSignUp = async ( data ) => {
			await axios.post('http://localhost:7000/admin/sign-up', data)
			.then( res => {
				console.log( res.data.message );
			})
			.catch( err => {
				errorHandler( err );
			})
		}
	// -----------------------------------------------------------


	// ===========================================================


	// Fetches the data from the server and sets the admin.
	const requestAdminData = async () => {
		await axios.get('http://localhost:7000/admin')
	    .then( res => {
	      	setAdmin( res.data );
	    })
	    .catch( err => {
	      	errorHandler( err );
	    });
	}


	// Fetches the data from the server and sets the admin.
	const requestGraphData = async () => {
		await axios.get('http://localhost:7000/admin/graph-data')
	    .then( res => {
	      	setGraphData( res.data );
	    })
	    .catch( err => {
	      	errorHandler( err );
	    });
	}	


	const requestMapData = async () => {
		await axios.get('http://localhost:7000/admin/map-data')
		.then( res => {
			setMapData( res.data );
		})
		.catch( err => {
			errorHandler( err );
		});
	}



	const requestServerSaveMapData = async (scene) => {	
		if( !scene ) return;

		await axios.post('http://localhost:7000/admin/update-map', scene)
		.then( res => {
			console.log( res.data.message );
		})
		.catch( err => {
			errorHandler( err );
		});
	}


	const requestSaveMapData = async ( map ) => {	
		if( !map ){ 
			return { message : 'Scene is empty' };
		}
		else{
			setMapData( map.scene );
			requestServerSaveMapData( map );

			return { message : 'Map has been saved' };
		} 
	}



	// Fetch data on component mount.
	useEffect( () => {
		console.log('[Fetching Data]');

		if( !admin ) requestAdminData(); // Fetch admin data.
		if( !graphData ) requestGraphData(); // Fetch graph data.
		if( !mapData ) requestMapData(); // Fetch map data.
	
	}, [admin, graphData, mapData]);



	// Set the View whenever either the url or the admin state changes.		
	useEffect(() => {
		console.log('[Inspecting url]');

		if( urlExist( webUrl ) ){ // check if url exist
			admin ? setView( adminStatusCheck( admin, webUrl ) ) : setView( <Loading /> ) 
		}
		else{
			setView( <PageNotFound /> );
		}
	}, [admin]);



	// Update the bundle if admin or graph data changes
	useEffect( () => {
		console.log('[Updating bundle]');
		if( admin && graphData ){
			setBundle({ 
				admin: admin, 
				graphData: graphData, 
				mapData: mapData,
				reqSaveMapData: requestSaveMapData,
				reqSetAdmin: requestSetAdmin, 
				reqSetAdminSignIn: requestSetAdminSignIn,
				reqSignOut: requestSignOut,
				reqSignUp: requestSignUp,
				dirs: directories
			});
		}		
	}, [admin, graphData, mapData]);


	return (
		<div className="admin">
			{ bundle ? admin.status.exist && admin.status.loggedIn ? <NavPanel {...bundle}/> : null : null }
			{ bundle ? requestRouteHandler( bundle ) : null }
			{ bundle ? view : <Loading /> }
		</div>
	);
}



/////////////////////// REQUEST HANDLERS //////////////////////

// Returns routes in the app
function requestRouteHandler( bundle ){
	console.log('Run: RequestRouteHandler function. This checks which route should be rendered')
	return(
		<Switch>

			<Route exact path="/sign-in">
				<Signin {...bundle}/>
			</Route>

			<Route exact path="/sign-up">
				<Signup {...bundle}/>
			</Route>

			<Route exact path="/dashboard">
				<Dashboard {...bundle}/>
			</Route>

			<Route exact path="/settings">
				<Settings {...bundle}/>
			</Route>

			<Route exact path="/map">
				<MapView {...bundle}/>
			</Route>
		</Switch>
	);	
}


/*

	Checks wether the admin exists and if on-line, will then
	return the view accordingly.

*/
function adminStatusCheck( admin, url ){
	console.log(`Run: AdminStatusCheck function\n\tThis checks which gate the admin should be going.`);
	console.log('AdminStatusCheck Result: ');

	if( !admin.status.exist ){
		console.log('Gate 1: Sign-up');
		return <Redirect to="/sign-up" />
	}
	else if( admin.status.exist && !admin.status.loggedIn ){
		console.log('Gate 2: Sign-in');
		return <Redirect to="/sign-in" />
	}
	else{
		console.log('Gate 3: Final gate. Will now hand request to UrlHandler function');
		return urlHandler( url );
	}	
}


/*
	Checks and returns the view by the request url.

*/
function urlHandler( url ){
	console.log(`Run: UrlHandler function\n[URL]: ${url}\n\tThis redirects pathname to the desired view.`);
	return url === ROOT || url === '/sign-in' || url === '/sign-up' ? <Redirect to="/dashboard" /> : <Redirect to={url} />;
}






/////////////////////// OTHER LOGICS //////////////////////

//	Checks if the url does exist.
function urlExist( url ){
	console.log('[Checking url existence]');
	return VIEWS.indexOf( url ) >= 0 ? true : false;
}


/*
	Truncates the root which is the '/admin' for shorter checking,
	and throws an error if the root is not found in the pathname
	of the url.
*/
function truncateRoot( pathname ){
	console.log('[Root truncating]');
	if( pathname.indexOf('/admin') >= 0 ){
		const newPath = pathname.replace('/admin', '');
		return newPath ? newPath : '/admin';
	}
	else{
		console.error(`
			[Error]: Unable to truncate root for path ${pathname}\n 
			\t-> There is no /admin in the pathname you have passed to truncateRoot function
		`);
		return pathname;
	}
}




////////////////////// ERROR HANDLER ///////////////////////

function errorHandler( err ){

	if( !err || !err.response || !err.response.status ) return;
	console.log( err );
	
	switch( err.response.status ){
		case 404:
			console.log(`[Error]: Page Not found \n\t${err.response.message}`);
			break;

		case 405:
			console.log(`[Error]: Bad request \n\t${err.response.message}`);
			break;

		case 500:
			console.log(`[Error]: Internal Server Error \n\t${err.response.message}`);
			break;

		case 503:
			console.log(`[Error]: Service unavailable \n\t${err.response.message}`);
			break;

		default:
			console.log( err );
			break;
	}
}

// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';


// Views
import Signin from './views/admin/sign-in';
import Signup from './views/admin/sign-up';
import Dashboard from './views/admin/dashboard';
import Settings from './views/admin/settings';

import MapView from './views/admin/map';

import PageNotFound from './views/admin/pageNotFound';


// Navigation panel icons
import dashboardIcon from './images/admin/dashboard.png';
import mapIcon from './images/admin/map.png';
import settingsIcon from './images/admin/equalizer.png';

// Loading component
import Loading from './components/admin/load-bar/loading';
import NavPanel from './components/admin/navigator/nav-panel';

// Styles
import './styles/admin/admin.css';


// List of current views that the app has.
const ROOT = '/admin';
const VIEWS = [
		ROOT,
		`${ROOT}/dashboard`,
	 	`${ROOT}/settings`,
	  	`${ROOT}/map`,
	   	`${ROOT}/sign-in`,
	    `${ROOT}/sign-up`
	 ];



// Main App function.
export default function Admin(){
	// console.log('Run: App');

	const webUrl = window.location.pathname;

	const [admin, setAdmin] = useState(null);
	const [graphData, setGraphData] = useState(null);
	const [mapData, setMapData] = useState( null );
	const [bundle, setBundle] = useState(null);
	const [view, setView] = useState(null);


	const directories = [
               {url: VIEWS[1], icon: dashboardIcon, title:'Dashboard'},
               {url: VIEWS[3], icon: mapIcon, title:'Map'},
               {url: VIEWS[2], icon: settingsIcon, title:'Settings'}
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
			await axios.put('/admin/set-admin', data)
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
			await axios.put('/admin/sign-in', data)
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
			await axios.put('/admin/log-status', data)
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
			await axios.post('/admin/sign-up', data)
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
		await axios.get('/admin')
	    .then( res => {
	      	setAdmin( res.data );
	    })
	    .catch( err => {
	      	errorHandler( err );
	    });
	}


	// Fetches the data from the server and sets the admin.
	const requestGraphData = async () => {
		await axios.get('/admin/graph-data')
	    .then( res => {
	      	setGraphData( res.data );
	    })
	    .catch( err => {
	      	errorHandler( err );
	    });
	}	


	const requestMapData = async () => {
		await axios.get('/admin/map-data')
		.then( res => {
			setMapData( res.data );
		})
		.catch( err => {
			errorHandler( err );
		});
	}



	const requestServerSaveMapData = async (scene) => {	
		if( !scene ) return;

		await axios.post('/admin/update-map', scene)
		.then( res => {
			console.log( res.data.message );
			return true;
		})
		.catch( err => {
			errorHandler( err );
			return false;
		});
	}


	const requestSaveMapData = async ( map ) => {	
		if( !map ){ 
			return { message : 'Scene is empty' };
		}
		else{
			setMapData( map.scene );
			const res = requestServerSaveMapData( map );

			return { message : res ? 'Map has been saved successfully' : 'Please try again!' };
		} 
	}


	useEffect( () => document.title = "CCT-MAP ADMIN", []);


	// Fetch data on component mount.
	useEffect( () => {
		// console.log('[Fetching Data]');

		if( !admin ) requestAdminData(); // Fetch admin data.
		if( !graphData ) requestGraphData(); // Fetch graph data.
		if( !mapData ) requestMapData(); // Fetch map data.
	
	}, [admin, graphData, mapData]);



	// Set the View whenever either the url or the admin state changes.		
	useEffect(() => {
		// console.log('[Inspecting url]');

		if( urlExist( webUrl ) ){ // check if url exist
			admin ? setView( adminStatusCheck( admin, webUrl ) ) : setView( <Loading /> ) 
		}
		else{
			setView( <PageNotFound /> );
		}
	}, [admin]);



	// Update the bundle if admin or graph data changes
	useEffect( () => {
		// console.log('[Updating bundle]');
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
			{ bundle ? admin.status.exist && admin.status.loggedIn && urlExist(webUrl) ? <NavPanel {...bundle}/> : null : null }
			{ bundle ? requestRouteHandler( bundle ) : null }
			{ bundle ? view : <Loading /> }
		</div>
	);
}


/////////////////////// REQUEST HANDLERS //////////////////////

// Returns routes in the app
function requestRouteHandler( bundle ){
	// console.log('Run: RequestRouteHandler function. This checks which route should be rendered');
	return(
		<Switch>
			<Route exact path={VIEWS[1]}>
				<Dashboard {...bundle}/>
			</Route>

			<Route exact path={VIEWS[2]}>
				<Settings {...bundle}/>
			</Route>

			<Route exact path={VIEWS[3]}>
				<MapView {...bundle}/>
			</Route>

			<Route exact path={VIEWS[4]}>
				<Signin {...bundle}/>
			</Route>

			<Route exact path={VIEWS[5]}>
				<Signup {...bundle}/>
			</Route>
		</Switch>
	);	
}


/*

	Checks wether the admin exists and if on-line, will then
	return the view accordingly.

*/
function adminStatusCheck( admin, url ){
	// console.log(`Run: AdminStatusCheck function\n\tThis checks which gate the admin should be going.`);
	// console.log('AdminStatusCheck Result: ');

	if( !admin.status.exist ){
		// console.log('Gate 1: Sign-up');
		return <Redirect to={VIEWS[5]} />
	}
	else if( admin.status.exist && !admin.status.loggedIn ){
		// console.log('Gate 2: Sign-in');
		return <Redirect to={VIEWS[4]} />
	}
	else{
		// console.log('Gate 3: Final gate. Will now hand request to UrlHandler function');
		return urlHandler( url );
	}	
}


/*
	Checks and returns the view by the request url.

*/
function urlHandler( url ){
	// console.log(`Run: UrlHandler function\n[URL]: ${url}\n\tThis redirects pathname to the desired view.`);
	return url === ROOT || url === VIEWS[4] || url === VIEWS[5] ? <Redirect to={VIEWS[1]} /> : <Redirect to={url} />;
}






/////////////////////// OTHER LOGICS //////////////////////

//	Checks if the url does exist.
function urlExist( url ){
	// console.log('[Checking url existence]');
	return VIEWS.indexOf( url ) >= 0 ? true : false;
}




////////////////////// ERROR HANDLER ///////////////////////

function errorHandler( err ){

	if( !err?.response?.status ) return;
	// console.log( err );
	
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

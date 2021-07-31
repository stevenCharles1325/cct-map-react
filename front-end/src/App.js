// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';


// Views
import Signin from './views/sign-in';
import Signup from './views/sign-up';
import Dashboard from './views/dashboard';
import Settings from './views/settings';
import Map from './views/map';
import PageNotFound from './views/pageNotFound';

// Loading component
import Loading from './components/load-bar/loading';


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

	const [admin, setAdmin] = useState(null);
	const [graphData, setGraphData] = useState(null);
	const [bundle, setBundle] = useState(null);
	const [view, setView] = useState(null);
	const [webUrl, setWebUrl] = useState( truncateRoot(pathname) );


	// Fetches the data from the server and sets the admin.
	const requestAdminData = async () => {
		await axios.get('http://localhost:7000/admin')
	    .then( res => {
	      	setAdmin( res.data );
	    })
	    .catch( err => {
	      	console.log(err);
	    });
	}


	// Fetches the data from the server and sets the admin.
	const requestGraphData = async () => {
		await axios.get('http://localhost:7000/admin/graph-data')
	    .then( res => {
	    	console.log( res );
	      	setGraphData( res.data );
	    })
	    .catch( err => {
	      	console.log(err);
	    });
	}	

	// useEffect( () => {
	// 	window.addEventListener('hashchange', () => {
	// 		console.log('hash change');
	// 		setWebUrl( window.location.pathname );
	// 	});

	// 	return () => {
	// 		window.removeEventListener('hashchange', null);
	// 	}
	// }, []);



	// Fetch data on component mount.
	useEffect( () => {
		requestAdminData(); // Fetch admin data.
	}, []);



	useEffect( () => {
		requestGraphData(); // Fetch graph data.
	}, [view, webUrl]);



	// Set the View whenever either the url or the admin state changes.
	useEffect( () => {
		
		if( urlExist( webUrl ) ){ // check if url exist
			if( admin ) { setView( adminStatusCheck( admin, webUrl ) ); }
			else{ setView( <Loading /> ); }
		}
		else{
			setView( <PageNotFound /> );
		}
	}, [admin, webUrl]);



	// Update the bundle if admin or graph data changes
	useEffect( () => {
		if( admin && graphData ) setBundle({ admin: admin, graphData: graphData});			

	}, [admin, graphData]);


	return (
		<div className="admin">
			{ bundle ? console.log( bundle ) : null}
			{ bundle ? requestRouteHandler( bundle ) : <Loading /> }
			{ bundle ? view : <Loading /> }
		</div>
	);
}







/////////////////////// REQUEST HANDLERS //////////////////////

// Returns routes in the app
function requestRouteHandler( bundle ){
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
				<Map {...bundle}/>
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
	console.log(`Run: UrlHandler function\n\tThis redirects pathname to the desired view.`);
	return url === ROOT ? <Redirect to="/dashboard" /> : <Redirect to={url} />;
}






/////////////////////// OTHER LOGICS //////////////////////

//	Checks if the url does exist.
function urlExist( url ){
	return VIEWS.indexOf( url ) >= 0 ? true : false;
}


/*
	Truncates the root which is the '/admin' for shorter checking,
	and throws an error if the root is not found in the pathname
	of the url.
*/
function truncateRoot( pathname ){

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

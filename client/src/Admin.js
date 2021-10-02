// Libs
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { Redirect, Route, Switch, Link } from 'react-router-dom';

import axios from 'axios';
import Cookies from 'js-cookie';


// Navigation panel icons
import mapIcon from './images/admin/map.png';
import settingsIcon from './images/admin/equalizer.png';
import dashboardIcon from './images/admin/dashboard.png';


// Other component
import Loading from './components/admin/load-bar/loading';
import NavPanel from './components/admin/navigator/nav-panel';


// Styles
import './styles/admin/admin.css';


// Modules
import EventEmitter from './modules/custom-event-emitter';
import CustomErrorHandler from './modules/customErrorHandler';

const ErrorHandler = new CustomErrorHandler( 5, 5000 );
const Event = new EventEmitter();
const ROOT = '/admin';
const VIEWS = [
	ROOT,
	`${ROOT}/map`,
	`${ROOT}/sign-in`,
	`${ROOT}/sign-up`,
	`${ROOT}/settings`,
	`${ROOT}/dashboard`
];

const Signin = React.lazy(() => import('./views/admin/sign-in'));
const Signup = React.lazy(() => import('./views/admin/sign-up'));
const MapView = React.lazy(() => import('./views/admin/map'));
const Settings = React.lazy(() => import('./views/admin/settings'));
const Dashboard = React.lazy(() => import('./views/admin/dashboard'));
const ErrorPage = React.lazy(() => import('./views/admin/error'));
const PageNotFound = React.lazy(() => import('./views/admin/pageNotFound'));


export default function Admin(){
	const [bundle, setBundle] = useState( null );
	const [view, setView] = useState( null );

	const path = new Path( window.location.pathname );
	
	const directories = [
		{ url: VIEWS[ 5 ], icon: dashboardIcon, title:'Dashboard' },
    	{ url: VIEWS[ 1 ], icon: mapIcon, title:'Map' },
    	{ url: VIEWS[ 4 ], icon: settingsIcon, title:'Settings' }
	];


	

	const emitEvents = () => {
		Event.on('enter', () => setView( () => <Redirect to={ path.home() }/> ));
		Event.on('exit', () => setView( () => {
			console.log('logging out');
			return <Redirect to={ path.exit() }/>
		}));

		Event.on('unauthorized', () => setView( () => {
			console.log('You are unauthorized');
			return <Redirect to={ path.exit() }/>
		}));

		Event.on('forbidden', () => setView( () => {
			console.log('You are forbidden');
			return <Redirect to={ path.kick() }/>
		}));
	}

	const load = async () => {
		path.exist()
			? path.isRoot()
				? setView( <Redirect to={ path.home() }/>  )
				: <Redirect to={ path.pathname }/>
			: setView( path.notFound() );	
	}

	useEffect(() => {				
		load();
		emitEvents();

		setBundle({ 
				dirs: directories,
				Event: Event,
				ErrorHandler: ErrorHandler
			});
	}, []);


	return(
		<div className="admin">
			<Suspense fallback={<Loading />}>	
				{ bundle ? routeHandler( bundle ) : null }
				{ view }
				{  }
			</Suspense>
		</div>
	);
}


function routeHandler( bundle ){
	return(
		<Switch>
			<Route exact path={ VIEWS[ 5 ] }>
				<NavPanel {...bundle} />
				<Dashboard {...bundle}/>
			</Route>

			<Route exact path={ VIEWS[ 4 ] }>
				<NavPanel {...bundle} />
				<Settings {...bundle}/>
			</Route>

			<Route exact path={ VIEWS[ 1 ] }>
				<NavPanel {...bundle} />
				<MapView {...bundle}/>
			</Route>

			<Route exact path={ VIEWS[ 2 ] }>
				<Signin {...bundle}/>
			</Route>

			<Route exact path={ VIEWS[ 3 ] }>
				<Signup {...bundle}/>
			</Route>
		</Switch>
	);	
}


function Path( pathname ){
	if( !pathname ) 
		console.warn('[Line 45 - Admin]: No given pathname');

	this.pathname = pathname;

	this.home = () => {
		this.pathname = VIEWS[ 5 ];

		return this.pathname;
	}

	this.exit = () => {
		this.pathname = VIEWS[ 2 ];

		return this.pathname;
	}

	this.kick = () => {
		this.pathname = VIEWS[ 3 ];

		return this.pathname;
	}
	
	this.exist = () => {
		return ( VIEWS.indexOf( this.pathname ) > -1 
			? true 
			: false 
		);
	};

	this.isRoot = () => {
		return ( VIEWS.indexOf( this.pathname ) === 0 
			? true 
			: false 
		);	
	}

	this.notFound = () => <PageNotFound />;

	this.isSignUpPath = () => {
		return ( VIEWS.indexOf( this.pathname ) === 3
			? true
			: false
		);
	};

	this.isSignInPath = () => {
		return ( VIEWS.indexOf( this.pathname ) === 2
			? true
			: false
		);
	};
} 

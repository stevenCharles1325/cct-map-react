// Libs
import React, { useState, useEffect, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';


// Navigation panel icons
import mapIcon from './images/admin/map.png';
import settingsIcon from './images/admin/equalizer.png';
import dashboardIcon from './images/admin/dashboard.png';


// Other component
import Loading from './components/admin/load-bar/loading';
import NavPanel from './components/admin/navigator/nav-panel';


// Styles
import './styles/admin/admin.css';
import 'bootstrap/dist/css/bootstrap.min.css';


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
// const ErrorPage = React.lazy(() => import('./views/admin/error'));
const PageNotFound = React.lazy(() => import('./views/admin/pageNotFound'));


export default function Admin( props ){
	const [bundle, setBundle] = useState( null );
	const [view, setView] = useState( null );
	const [screenWidth, setScreenWidth] = useState( window.innerWidth );

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

	const resize = (e) => {
		setScreenWidth(() => e.currentTarget.innerWidth);
	}

	const MainApp = () => {
		return(
			<Suspense fallback={<Loading />}>	
				{ bundle ? routeHandler( bundle ) : null }
				{ view }
			</Suspense>
		);
	}

	useEffect(() => {				
		load();
		emitEvents();

		setBundle({ 
			dirs: directories,
			Event: Event,
			ErrorHandler: ErrorHandler,
		});
	}, []);

	useEffect(() => {
		window.addEventListener('resize', resize);

		return () => window.removeEventListener('resize', resize);
	}, []);

	const handleScreen = () => {
		return screenWidth <= 950
			? <Unavailable/>
			: <MainApp/>
	}

	return(
		<div className="admin">
			{ handleScreen() }
		</div>
	);
}


function Unavailable(){
	return(
		<div 
			style={{
				width: '100%', 
				height: '100%', 
				backgroundColor: 'black',
				color: 'rgba(255, 255, 255, 0.6)',
				overflowY: 'auto',
				textAlign: 'center'
			}}

			className="px-5 d-flex flex-column justify-content-center align-items-center"
		>	
			<h1>WE'RE REALLY SORRY</h1>
			<br/>
			<h5>NOT AVAILABLE ON THIS SIZE</h5>
			<br/>
			<br/>
			<p className="px-5">
				This happens when you minimize the size of the app.
				Try maximizing the app, or if you are using your tablet
				or mobile phone please switch to your laptop or PC. 
			</p>
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

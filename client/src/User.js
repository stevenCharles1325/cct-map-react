import React, { Suspense, useState, useEffect } from 'react';
import axios from 'axios';
import { Switch, Route, Redirect, Link } from 'react-router-dom';

// Module
import CustomErrorHandler from './modules/customErrorHandler';

// Loader
import MainLoader from './components/user/loader/main-loader';


// Style
import './styles/user/user.css';

// Views
const MapView = React.lazy(() => import('./views/user/map'));
const AboutView = React.lazy(() => import('./views/user/about'));


const ErrorHandler = new CustomErrorHandler( 5, 5000 );
const ROOT = '/';
const VIEWS = [
	`${ROOT}map`,
	`${ROOT}about`
];


function User( props ){
	const [mapData, setMapData] = useState( null );

	const requestUpdateRecords = async () => {
		await axios.get('https://localhost:4443/update-records')
		.catch( err => {
			ErrorHandler.handle( err, requestMapData, 1 );
		});
	}

	const requestMapData = async () => {
		await axios.get('https://localhost:4443/map-data')
		.then( res => {
			setMapData( res.data.data );
			console.log( res.data.message );
			setTimeout(() => requestUpdateRecords(), 5000)
		})
		.catch( err => {
			ErrorHandler.handle( err, requestMapData, 1 );
		});
	}

	useEffect(() => requestMapData(), []);

	return (
		<div className="user">
			<Switch>
				<Route exact path={ROOT}>
					<Redirect to={VIEWS[0]} />
				</Route>

				<Route exact path={VIEWS[0]}>
					<Suspense fallback={<MainLoader/>}>
						<MapView mapData={mapData}/>
					</Suspense>
				</Route>

				<Route exact path={VIEWS[1]}>
					<Suspense fallback={<MainLoader/>}>
						<AboutView/>
					</Suspense>
				</Route>

				<Route path={window.location.pathname}>
					<div style={{width: '100%', height: '100%'}} className="d-flex flex-column justify-content-center align-items-center">
						<h1>PAGE NOT FOUND</h1>
						<p>Sorry but the page that you are trying to access does not exist</p>
						<Link to='/map'>
							<h5>Wanna go to map?</h5>
						</Link>
					</div>
				</Route>
			</Switch>
		</div>
	);
}


export default User;
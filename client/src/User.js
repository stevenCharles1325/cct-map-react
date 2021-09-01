import React, { Suspense, useState, useEffect } from 'react';
import axios from 'axios';
import { Switch, Route, Redirect } from 'react-router-dom';


// Loader
import MainLoader from './components/user/loader/main-loader';


// Style
import './styles/user/user.css';

// Views
const MapView = React.lazy(() => import('./views/user/map'));


const ROOT = '/';
const VIEWS = [
	`${ROOT}map`,
	`${ROOT}about`
];


function User( props ){
	const [mapData, setMapData] = useState( null );

	const requestMapData = async () => {
		await axios.get('/map-data')
		.then( res => {
			setMapData( res.data.data );
			console.log( res.data.message );
		})
		.catch( err => {
			errorHandler( err );
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
					<div>About</div>

				</Route>

				<Route path={window.location.pathname}>
					<div>page not found</div>
				</Route>
			</Switch>
		</div>
	);
}


const errorHandler = ( err ) => {
	console.log( err );
}


export default User;
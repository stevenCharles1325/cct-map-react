import React from 'react';
import { Link } from 'react-router-dom';


export default function PageNotFound(){
	return (
		<>
			<div 
				style={{width: '100vw', height: '100vh'}}
				className="bg-secondary d-flex flex-column align-items-center justify-content-center"
			>

				<div style={{width: '20%', height: '25%',border: '5px solid black'}} className="p-3 mb-3">
					<h1>404</h1>
				</div>
				<h1>"PAGE NOT FOUND"</h1>
				<br/>
				<br/>
				<div className="text-center">
					<h2>Was not able to find the page you were looking for.</h2>
				</div>
				<br/>
				<br/>
				<h5>
					Wanna go to the <Link to="/admin/dashboard">Dashboard</Link>, <Link to="/admin/Settings">Settings</Link>, or <Link to="/admin/Map">Map</Link> instead?					
				</h5>
			</div>
		</>
	);
}
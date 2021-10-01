import React from 'react';
import { Link } from 'react-router-dom';

export default function About(){
	const h5Style = {
		lineHeight: '2'
	}

	return(
		<div style={{width: '100%', height: '100%', color: 'white'}}>
			<div 
				style={{
					overflowY: 'auto',
					width: '100%', 
					height: '100%',
					textAlign: 'justify',
					lineHeight: '2'
				}}

				className="p-5"
			>	
				<h1 style={{color: 'rgba(0, 0, 0, 0.4)'}} className="mb-4">About us</h1>
				<div className="d-flex flex-column justify-content-center align-items-center">
					<h5 style={h5Style}>	
						We, the developers of this application, had been thinking
						about this frequent problem in every school. 
						<i> "3D Virtual Locator for City College of Tagaytay"</i> is 
						a web application that allows users to view the new 
						CCT building in 3D. The goal of this web app is to 
						provide users with the quickest and most accurate 
						path possible. If you wish to go to a facility in 
						CCT's new building without getting lost or having to 
						ask people, this app will help you. This web app also 
						allows you to view and explore the new CCT building. 
						As a result, you will be able to appreciate the 
						beauty of the CCT school. 	
					</h5>
					<br/>
					<h5 style={h5Style}>
						We have used <b>ReactJS, NodeJS, Express, ThreeJS, CSS, and
						Bootstrap</b> to create this single page application. These 
						are the creators of this application:

						Steven Charles Palabyab
						Al Jhon Elizalde
						April Mae Aguan
						Alfred Vicente
						Mike Vicente
					</h5>

					<Link to="/map">
						<p>GO BACK?</p>
					</Link>
				</div>		
			</div>
		</div>
	);
}
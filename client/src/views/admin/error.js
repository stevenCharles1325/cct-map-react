import React from 'react';


export default function Error() {
	return(
		<div 
			style={{width: '100vw', height: '100vh'}}
			className="d-flex justify-content-center align-items-center"
		>
			<div className="d-flex flex-column justify-content-around align-items-center">
				<h1>ERROR</h1>
				<p>There must be an error in either the client or the server side.</p>
				<p>Please try again!</p>
			</div>
		</div>
	);
}
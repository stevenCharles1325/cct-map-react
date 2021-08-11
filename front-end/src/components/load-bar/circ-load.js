import React from 'react';

import circGif from '../../images/loading-9.gif';

export default function CircStyleLoad () {
	return (
		<div style={{width: '100%', height: '100%'}} className="d-flex justify-content-center align-items-center">
			<img width="50px" height="50px" src={circGif} alt=""/>
		</div>
	);
}
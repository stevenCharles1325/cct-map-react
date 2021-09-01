import React from 'react';

import infGif from '../../../images/admin/loading-5.gif';

export default function InfiniteStyleLoad () {
	return (
		<div style={{width: '100%', height: '100%'}} className="d-flex justify-content-center align-items-center">
			<img width="50px" height="50px" src={infGif} alt=""/>
		</div>
	);
}
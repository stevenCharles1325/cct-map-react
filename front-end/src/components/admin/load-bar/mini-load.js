import React from 'react';

import loadingGIF from '../../../images/admin/ajax-loader.gif';


export default function MiniLoad() {

	return(
		<>
			<div style={{width: '100%', height: '100%', backgroundColor: 'transparent'}} className="d-flex justify-content-center align-items-center">
				<img src={loadingGIF} style={{width: '50px', height: '10px'}} />
			</div>
		</>
	);

}
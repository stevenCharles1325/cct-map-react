import React from 'react';


import cctLogo from '../../../images/user/cctLogo_new.png';
import loadingGIF from '../../../images/user/ajax-loader.gif';


const MainLoader = () => {
	return (
		<div style={{width: '100%', height: '100%'}} className="d-flex justify-content-center align-items-center">
			<div style={{width: '200px', height: '200px'}} className="d-flex flex-column justify-content-center align-items-center">
				<img width="100%" height="100%" src={cctLogo} alt="Loading" className="mb-5"/>
				<img width="50px" height="10px" src={loadingGIF} alt="" />
			</div>
		</div>
	);
}

export default MainLoader;
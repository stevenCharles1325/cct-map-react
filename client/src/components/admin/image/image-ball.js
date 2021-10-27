import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

import '../../../styles/admin/image-ball.css';
import defaultImg from '../../../images/admin/default-profile.png';

import CustomErrorHandler from '../../../modules/customErrorHandler';

const ErrorHandler = new CustomErrorHandler( 5, 5000 );

const ImageBall = ( props ) => {
	const [isVisible, setIsVisible] = useState( false );
	const [newImage, setNewImage] = useState( null );

	const handleMouseOver = () => setIsVisible( true );
	const handleMouseLeave = () => setIsVisible( false );

	const handleChangePhoto = async (e) => {
		const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
        	return props?.Event?.emit?.('unauthorized');
        }

		const image = e.target.files[0];
		const formData = new FormData();

		formData.append('adminImg', image );

		await axios.put(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin/upload-picture`, formData, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			setNewImage( () => res.data.path );

			props?.Event?.emit?.('changePhoto');
		})
		.catch( err => {
			ErrorHandler.handle( err, handleChangePhoto, 9, e );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => handleChangePhoto(e), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
		});
	}

	const getPhoto = async () => {
		const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

		await axios.get(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin/picture`, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			setNewImage( () => res.data.path );			
			console.log( res.data.message );
		})
		.catch( err => {
			ErrorHandler.handle( err, getPhoto, 10 );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => getPhoto(), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
		});
	}

	useEffect(() => {
		getPhoto();
		props?.Event?.on?.('changePhoto', () => getPhoto());

		return () => {
			props?.Event?.on?.('changePhoto', () => getPhoto());
		}
	}, []);


	return(
		<div 
			onMouseOver={handleMouseOver}
			onMouseLeave={handleMouseLeave}
			className="image-ball d-flex justify-content-center align-items-center"
		>
			<img className="image-ball-img loading" width="100%" height="100%" src={ newImage }/>
			{ 
				props?.active 
					? (() => (
						<div className="admin-img-l1 d-flex justify-content-center align-items-center">
							<div className="admin-img-l2 d-flex justify-content-center align-items-center">
								<input onChange={handleChangePhoto} className="admin-img-inp" name="adminImg" type="file" accept="image/*"/>
								<h5 style={{opacity: isVisible ? '1' : '0'}} className="p-2 m-0 bg-dark rounded">Change photo</h5>
							</div>
						</div>
					))() 
					: null
			}
		</div>
	);
}


export default ImageBall;
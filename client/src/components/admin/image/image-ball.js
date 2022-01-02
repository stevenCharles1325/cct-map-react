import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import uniqid from 'uniqid';

import '../../../styles/admin/image-ball.css';
import defaultImg from '../../../images/admin/default-profile.png';

import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';

import CustomErrorHandler from '../../../modules/customErrorHandler';

const ErrorHandler = new CustomErrorHandler( 5, 5000 );

const ImageBall = ( props ) => {
	const [isVisible, setIsVisible] = useState( false );
	const [newImage, setNewImage] = useState( null );
	const [state, setState] = useState('idle');
	const [image, setImage] = useState( null );

	const handleMouseOver = () => setIsVisible( true );
	const handleMouseLeave = () => setIsVisible( false );

	const handleChangePhoto = async (e) => {
		const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
        	return props?.Event?.emit?.('unauthorized');
        }

		const image = e?.target?.files?.[0];

		if( !image ) return;

		const formData = new FormData();

		formData.append('adminImg', image );
		setState('loading');
		setNewImage( null );

		await axios.put(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/upload-picture`, formData, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			setNewImage( res.data.path );
			setState('idle');
			props?.Event?.emit?.('changePhoto');
		})
		.catch( err => {
			ErrorHandler.handle( err, handleChangePhoto, 9, e );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
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

        setState('loading');

		await axios.get(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/admin/picture`, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
		.then( res => {
			setNewImage( () => res.data.path );			
			console.log( res.data.message );
			setState('idle');
		})
		.catch( err => {
			ErrorHandler.handle( err, getPhoto, 10 );

			if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
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

	useEffect(() => {
		setImage(() => <Avatar id={uniqid()} sx={{ width: '100%', height: '100%' }} src={newImage}/>);
	}, [newImage]);

	return(
		<div 
			onMouseOver={handleMouseOver}
			onMouseLeave={handleMouseLeave}
			className="image-ball d-flex justify-content-center align-items-center"
		>		
			{ image }
			{
				state === 'loading'
					? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
						<CircularProgress/>
					  </div>
					: null
			}
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
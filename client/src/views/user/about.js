import React from 'react';
import { Redirect } from 'react-router-dom';
import uniqid from 'uniqid';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Divider from '@mui/material/Divider';
import { teal, indigo, blueGrey, green } from '@mui/material/colors';

import DoorBackOutlinedIcon from '@mui/icons-material/DoorBackOutlined';

import CctImage from '../../images/user/cct-picture.jpg';

const contributorsName = [
	'Steven Charles Palabyab',
	'Al Jhon Elizalde',
	'April Mae Aguan',
	'Alfred Vicente',
	'Mike Vicente',
];

export default function About(){
	const [redirect, setRedirect] = React.useState( null );
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
					lineHeight: '2'
				}}

				className="p-5"
			>	
				<div className="col-12 d-flex justify-content-start align-items-center mb-3">
					<Tooltip placement="bottom" title="Door Exit" arrow>
						<IconButton onClick={() => setRedirect(<Redirect to="/map"/>)}>
							<DoorBackOutlinedIcon />
						</IconButton>
					</Tooltip>
					<h1 style={{ color: 'white' }} className="p-0 m-0">About us</h1>
				</div>
				<div className="row">
					<div className="col-md-7 my-3">
						<Paper sx={{ width: '100%', height: '100%', padding: '50px', textAlign: 'justify' }} elevation={10}>
							<b className="my-3"><h3 style={{ color: 'black' }}>WHAT'S OUR PURPOSE?</h3></b>
							<p style={{ color: 'rgba(0, 0, 0, 0.7)', lineHeight: '30px' }}>	
								We, the developers of this application, had been thinking
								about this frequent problem in every school, especially in 
								City College of Tagatay. The "<u>3D Virtual Locator for City College of Tagaytay</u>" is 
								a web application that is designed, and allows users to view the new 
								CCT building in 3D. The goal of this web app is to 
								provide users with the quickest and most accurate 
								path possible. If you wish to go to a facility in 
								CCT's new building without getting lost or having to 
								ask people, this app will help you. This web app also 
								allows you to view and explore the new CCT building. 
								As a result, you will be able to appreciate the 
								beauty of the City College of Tagaytay. 	
							</p>
						</Paper>
					</div>
					<div className="col-md-5 my-3">
						<Paper elevation={3}>
							<Card>
								{
									!CctImage
										? <Skeleton variant="rectangular" width="100%" height={300}/>
										: <CardMedia
											component="img"
									        height="300"
									        image={CctImage}
									        alt="City College of Tagaytay"
										/> 
								}
								
								<CardContent>
							        <Typography gutterBottom variant="b" component="div">
							          City College of Tagaytay
							        </Typography>
							        <Typography variant="body2" color="text.secondary">
							          City College of Tagaytay or what we called CCT is 
							          an institution of higher learning, a Local College, 
							          which was established by virtue of City Ordinance 2002-229.
							        </Typography>
							    </CardContent>
							</Card>
						</Paper>
					</div>
					<div className="col-md-12 my-3">
						<Paper sx={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '20px'}} elevation={5}>
							<div className="col-12">
								<h1><b>CONTRIBUTORS</b></h1>
							</div>
							<div className="p-3" style={{ width: 'fit-content' }}>
								<AvatarGroup>
									{
										contributorsName.map( name => {
											const initials = name.split(' ').map( word => word[0] );
											const colorNumber = Math.floor((Math.random() * 9) + 1);
											const colors = [teal, indigo, blueGrey, green];
											const indexColor = Math.floor((Math.random() * colors.length));

											return (
												<Tooltip title={name} placement="bottom" arrow>
													<Avatar
														id={uniqid()}
														sx={{
															bgcolor: colors[ indexColor ][ Number(colorNumber + '00') ]
														}}
													> 
														{ 
															initials.length >= 3 
																? (() => {
																	initials.pop();
																	return initials.join('');
																})()
																: initials.join('')
														} 
													</Avatar>
												</Tooltip>
											)
										})
									}
								</AvatarGroup>
							</div>
							<Divider/>
							<br/>
							<div className="col-12 text-center p-2">
								<p style={{ textAlign: 'justify' }}>
									The developers of this web application used React, Node, Express, and ThreeJS, which are
									the four main technologies we used, to create everything that you see inside this application. 
									React is a library for creating user interfaces, but we were not really satisfied with just
									React itself, so we had used MUI (Material UI), which is a library of reusable components for
									building, and designing UI (user interface) faster. On the server, we used Node and Express.
									NodeJS is a runtime environment for Javascript, while ExpressJS is a framework that makes things
									much easier.
								</p>
								<br/>
								<p style={{ textAlign: 'justify' }}>
									Utilizing webgl by itself is pretty hard, so why waste time when you can use a library. For rendering 3D 
									objects we used a library called ThreeJS. Thanks to ThreeJS, everthing becomes much easier! ThreeJS,
									as what we've said, is a Javascript 3D library that displays 3D or 2D objects on the web brower.
								</p>
								<br/>
								<p>
									And that's it! We are really greatful that you are using our web-application. Enjoy!
								</p>
								<h1 className="p-0 my-3">THANK YOU SO MUCH!</h1>
								<button 
									className="btn" 
									style={{ color: 'rgba(255, 255, 255, 0.5)'}}
									onClick={() => setRedirect(<Redirect to="/map"/>)}
								>
									GO BACK HOME?
								</button>
							</div>
						</Paper>
					</div>
				</div>	
			</div>
			{ redirect }
		</div>
	);
}

// <div className="d-flex flex-column justify-content-center align-items-center">
// 					<h5 style={h5Style}>	
// 						We, the developers of this application, had been thinking
// 						about this frequent problem in every school. 
// 						<i> "3D Virtual Locator for City College of Tagaytay"</i> is 
// 						a web application that allows users to view the new 
// 						CCT building in 3D. The goal of this web app is to 
// 						provide users with the quickest and most accurate 
// 						path possible. If you wish to go to a facility in 
// 						CCT's new building without getting lost or having to 
// 						ask people, this app will help you. This web app also 
// 						allows you to view and explore the new CCT building. 
// 						As a result, you will be able to appreciate the 
// 						beauty of the CCT school. 	
// 					</h5>
// 					<br/>
// 					<h5 style={h5Style}>
// 						We have used <b>ReactJS, NodeJS, Express, ThreeJS, CSS, and
// 						Bootstrap</b> to create this single page application. These 
// 						are the creators of this application:

// 						Steven Charles Palabyab
// 						Al Jhon Elizalde
// 						April Mae Aguan
// 						Alfred Vicente
// 						Mike Vicente
// 					</h5>

// 					<Link to="/map">
// 						<p>GO BACK?</p>
// 					</Link>
// 				</div>	
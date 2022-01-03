import React, { useState, useReducer, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { Html } from '@react-three/drei';

import debounce from 'lodash.debounce';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';

// Style
import '../../../styles/user/floating-btn.css';

// Icon
import CubeIcon from '../../../images/user/cube.png';

import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Manual

const actions = [
	{ icon: <SearchIcon/>, name: 'Search your destination' },
	{ icon: <BubbleChartIcon/>, name: 'Quality switch' },
	{ icon: <InfoIcon/>, name: 'Go to About' },
	{ icon: <MenuBookIcon/>, name: 'Open Manual' },

];

const FloatingButton = (props) => {
	const [searchForm, setSearchForm] = useState( false );

	// const initState = {
	// 	menuState: false,
	// 	searchFormState: false
	// }

	// const opener = (state, action) => {
	// 	switch( action.type ){
	// 		case "menu":
	// 			return { 
	// 				menuState: !state.menuState, 
	// 				searchFormState: state.searchFormState 
	// 			};

	// 		case "search":
	// 			return { 
	// 				menuState: state.menuState, 
	// 				searchFormState: !state.searchFormState 
	// 			};

	// 		default:
	// 			throw new Error(`${action.type} is unknown`);	
	// 	}
	// }

	// const [state, dispatch] = useReducer( opener, initState );
	// const [searchForm, setSearchForm] = useState( null );

	// const escapeListener = (e) => {
	// 	if( e.key === 'Escape' ){
	// 		return dispatch({type: 'menu'});
	// 	}
	// }

	const [redirect, setRedirect] = useState( null );

	useEffect(() => {
		if( searchForm ){
			debounce(() => 
				props.setSearchForm( 
					<SearchForm 
						isOpen={searchForm} 
						setOpen={() => setSearchForm( false )}
						{...props}
					/>
				)
			, 1000)();
		}
		else {
			debounce(() => props.setSearchForm( null ), 1000)();
		}
	}, [searchForm]);

	// useEffect(() => {
	// 	if( !state.menuState && state.searchFormState ) dispatch({type: 'search'});
	// }, [state.menuState, state.searchFormState]);

	// useEffect(() => {
	// 	window.addEventListener('keydown', escapeListener);

	// 	return () => window.removeEventListener('keydown', escapeListener);
	// }, []);

	return (
		<>
			<SpeedDial
		        ariaLabel="speed dial"
		        sx={{ position: 'absolute', bottom: 16, right: 30 }}
		        icon={<CheckBoxOutlineBlankIcon />}
		     >
		        {
		        	actions.map((action, index) => (
			          <SpeedDialAction
			            key={action.name}
			            icon={action.icon}
			            tooltipTitle={action.name}
			            onClick={[
			            	debounce(() => setSearchForm( true ), 100), 
			            	props.setQuality,
			            	() => setRedirect(<Redirect to="/about"/>),
			            	props.setManual,
			            ][ index ]}
			          />
			        ))
			    }
		  	</SpeedDial>
			{ redirect }
		</>
	);
}


// <div 
// 	className="floating-container d-flex flex-column justify-content-center align-items-center"
// >
// 	<div 
// 		style={{height: state.menuState ? '200px' : '0px'}} 
// 		className="floating-opt d-flex flex-column justify-content-around align-items-center"
// 	>
// 		<button className="floating-btn-opt-btn" onClick={() => dispatch({type: 'search'})}>
// 			<p style={{ fontSize: '13px'}}>
// 				SEARCH
// 			</p>
// 		</button>
// 		<Link to="/about">
// 			<button className="floating-btn-opt-btn">About</button>
// 		</Link>
// 	</div>
// 	<div 
// 		style={{width: state.menuState ? '70px' : '75px', height: state.menuState ? '70px' : '75px'}} 
// 		className="floating-btn p-3 d-flex justify-content-center align-items-center" 
// 		onClick={() => dispatch({type: 'menu'})}
// 	>
// 		<img width="100%" height="100%" src={CubeIcon}/>
// 	</div>
// </div>
const SearchForm = (props) => {
	const [loading, setLoading] = useState( false );
	const { cpPos } = props;
	
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const getRootName = (name) => name?.replace?.(/checkpoint_([0-9]+)_/, '');

	let newSet = cpPos.filter( elem => !/connector/.test(elem.name.toLowerCase()) )
	let labels = cpPos
		.filter( elem => !/connector/.test(elem.name.toLowerCase()) )
		.map(elem => getRootName(elem.name));

    const [destination, setDestination] = useState({
	    start: null, 
	    end: null 
 	});

 	const [isRunAlgo, setIsRunAlgo] = useState( false );
 	const [btnReady, setBtnReady] = useState( false );

 	const handleLoading = () => {
 		setLoading( true );
 	}

 	const locatePosition = ( val ) => {
 		if( !val?.length || !val ) return null;

 		let position = null;
 		let name = null;

 		newSet.forEach( cp => {
 			if( cp.name.includes(val) ){
 				name = cp.name;
 				position = cp.position;
 			}
 		});

 		return name && position ? [name, position] : null;
 	}

    const reqSetLocation = (e, value) => {
    	setDestination({ 
    		start: value 
    			? {
	    			name: locatePosition( value )?.[0],
	    			position: locatePosition( value )?.[1] 			
	    		}
	    		: null, 
    		end: destination.end
		});
    }

	const reqSetDestination = (e, value) => {
    	setDestination({ 
    		start: destination.start, 
    		end: value 
    			? {
	    			name: locatePosition( value )?.[0],
	    			position: locatePosition( value )?.[1] 			
	    		}
	    		: null
    	});
    }

    const reqRunP2PAlgo = async () => {
		props.setDestination( destination );
		props.setOpen(); // Closes search form
    }

    useEffect(() => {
    	if( isRunAlgo ){
    		if( destination.start && destination.end ){
    			reqRunP2PAlgo();
    		}
			setIsRunAlgo(() => false);
    	}
    	else{
			setIsRunAlgo(() => false);
    	}
    }, [isRunAlgo, destination]);

    useEffect(() => {
		if( destination.start && destination.end ){
			setBtnReady(() => true);
		}
    	else{
			setBtnReady(() => false);
    	}
    }, [destination, btnReady]);
    
    useEffect(() => {
    	if( loading ) setIsRunAlgo( true );
    }, [loading]);

	return (
		<Html zIndexRange={[100, 100]}>
			<Dialog
				maxWidth="sm"
				open={props.isOpen}
				fullScreen={fullScreen}
				onClose={props.setOpen}
				sx={{ backgroundColor: 'transparent', padding: '0px' }}
			>
				<DialogTitle id="responsive-dialog-title">
		          <b>{"Search your desired destination"}</b>
		        </DialogTitle>
				<Divider/>
				<DialogContent>
					<DialogContentText>
						By giving your point-A and point-B we can draw a line
						that connects them.
					</DialogContentText>
					<br/>
					<Divider/>
					<div style={{ height: '200px' }} className="p-3 d-flex flex-column justify-content-between align-items-center">
						<Autocomplete
							disabled={loading}
							sx={{ width: '10cm' }}
							options={labels}
							onChange={reqSetLocation}
							onInputChange={reqSetLocation}
							renderInput={(params) => (
								<TextField 
									{...params} 
									autoFocus
									variant="standard" 
									helperText="This can be Starting or Ending point"
									label="Choose point A"
								/>
							)}
						/>
						<Autocomplete
							disabled={loading}
							sx={{ width: '10cm' }}
							options={labels}
							onChange={reqSetDestination}
							onInputChange={reqSetDestination}
							renderInput={(params) => (
								<TextField 
									{...params} 
									helperText="This can be Starting or Ending point"
									variant="standard" 
									label="Choose point B"
								/>
							)}
						/>
					</div>
					{/*<div className="search-frame col-12">
						<div className="col-12 search-frame-title text-center pt-2 d-flex justify-content-center align-items-center">
							<h5>Point to Point</h5>
						</div>
						<div className="search-frame-form row">
							<div className="col-md-12">
								<Autocomplete
									disabled={loading}
									sx={{ width: '10cm' }}
									options={labels}
									onChange={reqSetLocation}
									onInputChange={reqSetLocation}
									renderInput={(params) => (
										<TextField 
											{...params} 
											autoFocus
											variant="filled" 
											label="Choose point A"
										/>
									)}
								/>
							</div>
							
							<div className="col-md-12">
								<Autocomplete
									disabled={loading}
									sx={{ width: '10cm' }}
									options={labels}
									onChange={reqSetDestination}
									onInputChange={reqSetDestination}
									renderInput={(params) => (
										<TextField 
											{...params} 
											variant="filled" 
											label="Choose point B"
										/>
									)}
								/>
							</div>
							<div className="col-12 d-flex justify-content-around align-items-center">
								<button 
									style={{
										color: 'white', 
										background: btnReady 
											? 'rgba(0, 0, 0, 0.8)' 
											: 'rgba(200, 10, 10, 0.7)',
										transition: '.2s ease-in-out'
									}} 
									className="btn" 
									onClick={() => setIsRunAlgo(true)}
								>
									locate
								</button>
								<LoadingButton
									disabled={!btnReady}
				                    color={btnReady ? "success" : "error"}
				                    onClick={handleLoading}
				                    loading={loading}
				                    loadingIndicator="Loading"
				                    variant="outlined"
								>
									Locate
								</LoadingButton>
								<Button onClick={props.setOpen}>
									disregard
								</Button>
							</div>
						</div>
					</div>*/}
				</DialogContent>
				<Divider/>
				<DialogActions>
			        <LoadingButton
						disabled={!btnReady}
	                    color={btnReady ? "success" : "error"}
	                    onClick={handleLoading}
	                    loading={loading}
	                    loadingIndicator="Loading"
	                    variant="outlined"
					>
						Locate
					</LoadingButton>
					<Button onClick={props.setOpen}>
						disregard
					</Button>
		        </DialogActions>
			</Dialog>
		</Html>
	);
}



export default FloatingButton;
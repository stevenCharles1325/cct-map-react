import React, { useState, useReducer, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Html } from '@react-three/drei';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Style
import '../../../styles/user/floating-btn.css';

// Icon
import CubeIcon from '../../../images/user/cube.png';

const FloatingButton = (props) => {
	const initState = {
		menuState: false,
		searchFormState: false
	}

	const opener = (state, action) => {
		switch( action.type ){
			case "menu":
				return { 
					menuState: !state.menuState, 
					searchFormState: state.searchFormState 
				};

			case "search":
				return { 
					menuState: state.menuState, 
					searchFormState: !state.searchFormState 
				};

			default:
				throw new Error(`${action.type} is unknown`);	
		}
	}

	const [state, dispatch] = useReducer( opener, initState );
	// const [searchForm, setSearchForm] = useState( null );

	const escapeListener = (e) => {
		if( e.key === 'Escape' ){
			return dispatch({type: 'menu'});
		}
	}

	useEffect(() => {
		if( state.searchFormState && props?.cpPos ){
			props.setSearchForm( () => <SearchForm dispatch={dispatch} {...props}/> );
		}
		else {
			props.setSearchForm( () => null );
		}
	}, [state.searchFormState, props?.cpPos]);

	// useEffect(() => {
	// 	if( !state.menuState && state.searchFormState ) dispatch({type: 'search'});
	// }, [state.menuState, state.searchFormState]);

	useEffect(() => {
		window.addEventListener('keydown', escapeListener);

		return () => window.removeEventListener('keydown', escapeListener);
	}, []);

	return (
		<>
			<div 
				className="floating-container d-flex flex-column justify-content-center align-items-center"
			>
				<div 
					style={{height: state.menuState ? '200px' : '0px'}} 
					className="floating-opt d-flex flex-column justify-content-around align-items-center"
				>
					<button className="floating-btn-opt-btn" onClick={() => dispatch({type: 'search'})}>
						<p style={{ fontSize: '13px'}}>
							SEARCH
						</p>
					</button>
					<Link to="/about">
						<button className="floating-btn-opt-btn">About</button>
					</Link>
				</div>
				<div 
					style={{width: state.menuState ? '70px' : '75px', height: state.menuState ? '70px' : '75px'}} 
					className="floating-btn p-3 d-flex justify-content-center align-items-center" 
					onClick={() => dispatch({type: 'menu'})}
				>
					<img width="100%" height="100%" src={CubeIcon}/>
				</div>
			</div>
		</>
	);
}


const SearchForm = (props) => {
	const { cpPos } = props;

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

    const reqRunP2PAlgo = () => {
		props.setDestination( destination );
		props.dispatch({type: 'search'}); // Closes search form
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
    
	return (
		<Html zIndexRange={[100, 100]}>
			<div className="search-frame d-flex flex-column justify-content-center align-items-center">
				<div className="search-frame-title text-center pt-2">
					<h5>Point to Point</h5>
				</div>
				<div className="search-frame-form d-flex flex-column justify-content-around align-items-center">
					<div className="search-inp d-flex justify-content-between align-items-center">
						<label htmlFor="point-a">Point A: </label>
						<Autocomplete
							sx={{width: 150}}
							options={labels}
							onChange={reqSetLocation}
							onInputChange={reqSetLocation}
							renderInput={(params) => (
								<TextField 
									{...params} 
									variant="filled" 
									label="Choose point A"
								/>
							)}
						/>
					</div>
					
					<div className="search-inp d-flex justify-content-between align-items-center">
						<label htmlFor="point-b">Point B: </label>
						<Autocomplete
							sx={{width: 150}}
							disablePortal
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
				</div>
			</div>
		</Html>
	);
}



export default FloatingButton;
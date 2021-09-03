import React, { useState, useReducer, useEffect } from 'react';
import { Link } from 'react-router-dom';


// Style
import '../../../styles/user/floating-btn.css';

// Icon
import CubeIcon from '../../../images/user/cube.png';

const FloatingButton = (props) => {
	const initState = {
		menuState: false,
		p2pFormState: false
	}

	const opener = (state, action) => {
		switch( action.type ){
			case "menu":
				return { menuState: !state.menuState, p2pFormState: state.p2pFormState };

			case "p2p":
				return { menuState: state.menuState, p2pFormState: !state.p2pFormState };

			default:
				throw new Error(`${action.type} is unknown`);	
		}
	}

	const [state, dispatch] = useReducer( opener, initState );
	const [p2pForm, setP2pForm] = useState( null );

	useEffect(() => {
		if( state.p2pFormState ){
			setP2pForm( <P2pForm dispatch={dispatch} {...props}/> );
		}
		else{
			setP2pForm( null );
		}
	}, [state.p2pFormState]);

	return (
		<>
			<div className="floating-container d-flex flex-column justify-content-center align-items-center">
				<div style={{height: state.menuState ? '200px' : '0px'}} className="floating-opt d-flex flex-column justify-content-around align-items-center">
					<button className="floating-btn-opt-btn" onClick={() => dispatch({type: 'p2p'})}>P2P</button>
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
			{ p2pForm }
		</>
	);
}


const P2pForm = (props) => {

	const { cpPos } = props;

    const getRootName = (name) => name?.replace?.(/checkpoint_([0-9]+)_/, ''); // Example: Checkpoint_room123 becomes -> room123
    const options = cpPos?.map?.( item => (<option key={item.name} value={item.name}> {getRootName(item.name)} </option>) )

    const [destination, setDestination] = useState({ start: cpPos?.[0]?.name, end: cpPos?.[0]?.name });

    const reqSetLocation = (e) => {
    	setDestination({ start: e.target.value, end: destination.end });
    }

	const reqSetDestination = (e) => {
    	setDestination({ start: destination.start, end: e.target.value });
    }

    const reqRunP2PAlgo = () => {
    	const filterElem = ( elem ) => {
    		if( elem.name === destination.start || elem.name === destination.end ) return true;
    	}

    	const positions = cpPos.filter( filterElem ).map( elem => elem.position );
		props.setDestination({start: positions?.[0], end: positions?.[1] ? positions[1] : positions[0] });
		props.dispatch({type: 'p2p'}); // Closes p2p form
    }
    
	return (
		<div className="p2p-frame d-flex flex-column justify-content-center align-items-center">
			<div className="p2p-frame-title text-center pt-2">
				<h5>Point to Point</h5>
			</div>
			<div className="p2p-frame-form d-flex flex-column justify-content-around align-items-center">
				<div className="p2p-inp d-flex justify-content-center align-items-center">
					<label htmlFor="point-a">Point A: </label>
					<select className="p2p-select" name="point-a" onChange={reqSetLocation}>
						{ options }
					</select>
				</div>
				
				<div className="p2p-inp d-flex justify-content-center align-items-center">
					<label htmlFor="point-b">Point B: </label>
					<select className="p2p-select" name="point-b" onChange={reqSetDestination}>
						{ options }
					</select>
				</div>

				<button style={{color: 'black'}} className="btn btn-dark" onClick={reqRunP2PAlgo}>locate</button>
			</div>
		</div>
	);
}



export default FloatingButton;
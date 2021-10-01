import React from 'react';

import FormCard from '../components/admin/cards/form-card';
import { Input } from '../components/admin/inputs/input';
import Button from '../components/admin/buttons/button';

import '../styles/admin/checkpoint-generator.css';

const CheckpointGenerator = ( props ) => {
	const { dispatch } = props;

	const fallBackToZero = ( e ) => {
		return e?.target?.value
				? e.target.value
				: 0
	}

	return (
		<div className="checkpoint-gen-box py-5">
			<div style={{height: '10%'}} className="mb-3">
				<h3 className="checkpoint-gen-title">Checkpoint Generator</h3>
			</div>

			<div style={{height: '80%'}} className="checkpoint-inp-box">
				<ComboBox 
					title="Starting position"
					option={[
						{
							type: 'number',
							name: 'start-x',
							autofocus: true,
							placeholder: 'Enter X position',
							onChange: (e) => dispatch({type: 'initPosition', index: 0, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'start-y',
							placeholder: 'Enter Y position',
							onChange: (e) => dispatch({type: 'initPosition', index: 1, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'start-z',
							placeholder: 'Enter Z position',
							onChange: (e) => dispatch({type: 'initPosition', index: 2, data: fallBackToZero(e) }),
						},
					]}
				/>

				<ComboBox 
					title="Generator area size"
					option={[
						{
							type: 'number',
							name: 'gen-width',
							placeholder: 'Enter generator width (X)',
							onChange: (e) => dispatch({type: 'areaSize', index: 0, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'gen-height',
							placeholder: 'Enter generator height (Y)',
							onChange: (e) => dispatch({type: 'areaSize', index: 1, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'gen-depth',
							placeholder: 'Enter generator depth (Z)',
							onChange: (e) => dispatch({type: 'areaSize', index: 2, data: fallBackToZero(e) }),
						},
					]}
				/>

				<ComboBox 
					title="Distance"
					option={[
						{
							type: 'number',
							name: 'dis-x',
							placeholder: 'Enter X distance',
							onChange: (e) => dispatch({type: 'distance', index: 0, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'dis-y',
							placeholder: 'Enter Y distance',
							onChange: (e) => dispatch({type: 'distance', index: 1, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'dis-z',
							placeholder: 'Enter Z distance',
							onChange: (e) => dispatch({type: 'distance', index: 2, data: fallBackToZero(e) }),
						},
					]}
				/>

				<ComboBox 
					title="Starting Name"
					option={[
						{
							type: 'text',
							name: 'room-base-name',
							placeholder: 'Enter room base name',
							onChange: (e) => dispatch({type: 'roomName', index: 0, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'name-num-range-start',
							placeholder: 'Enter room range start',
							onChange: (e) => dispatch({type: 'roomName', index: 1, data: fallBackToZero(e) }),
						},
						{
							type: 'number',
							name: 'name-num-range-end',
							placeholder: 'Enter room range end',
							onChange: (e) => dispatch({type: 'roomName', index: 2, data: fallBackToZero(e) }),
						}
					]}
				/>
			</div>
			<div style={{height: '60px'}} className="d-flex flex-row justify-content-around align-items-center">
				<Button 
					name="start"
					listenTo="Enter"
					style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}
					click={ () => dispatch({type: 'start'})}
				/>

				<Button
					name="close"
					listenTo="Escape"
					style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}
					click={ () => dispatch({type: 'reset'})}
				/>
			</div>
		</div>
	);
}


const ComboBox = ( props ) => {
	return (
		<div className="combo-box">
			<p className="combo-box-title">{ props.title }</p>
			<div className="combo-box-inp-box d-flex flex-column align-items-center">
				{ inputGenerator( props.option ) }
			</div>
		</div>
	);
}


const inputGenerator = ( optionList ) => {
	return optionList.map( (option, index) => (
			<Input 
				key={ index }
				id={ option.name }
				type={ option.type }
				name={ option.name }
				className="m-0 my-3 combo-box-inp"
				autoFocus={ option?.autofocus }
				placeholder={ option.placeholder }
				handleChange={ option.onChange }
				value={ option?.value }
			/>
		));
}

export default CheckpointGenerator;
import React from 'react';

import FormCard from '../components/admin/cards/form-card';
import { Input } from '../components/admin/inputs/input';
import Button from '../components/admin/buttons/button';

import '../styles/admin/checkpoint-generator.css';

const CheckpointGenerator = ( props ) => {

	return (
		<div className="checkpoint-gen-box py-5">
			<div style={{height: '10%'}} className="mb-5">
				<h3 className="checkpoint-gen-title">Checkpoint Generator</h3>
			</div>

			<div style={{height: '85%'}} className="checkpoint-inp-box">
				<ComboBox 
					title="Starting position"
					option={[
						{
							type: 'number',
							name: 'start-x',
							autofocus: true,
							placeholder: 'Enter X position',
							onChange: () => console.log('Changing start-X position'),
						},
						{
							type: 'number',
							name: 'start-y',
							placeholder: 'Enter Y position',
							onChange: () => console.log('Changing start-Y position'),
						},
						{
							type: 'number',
							name: 'start-z',
							placeholder: 'Enter Z position',
							onChange: () => console.log('Changing start-Z position'),
						},
					]}
				/>

				<ComboBox 
					title="Generator size"
					option={[
						{
							type: 'number',
							name: 'gen-width',
							placeholder: 'Enter generator width',
							onChange: () => console.log('Changing start-X position'),
						},
						{
							type: 'number',
							name: 'gen-height',
							placeholder: 'Enter generator height',
							onChange: () => console.log('Changing start-Y position'),
						},
						{
							type: 'number',
							name: 'gen-depth',
							placeholder: 'Enter generator depth',
							onChange: () => console.log('Changing start-Z position'),
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
							onChange: () => console.log('Changing start-X position'),
						},
						{
							type: 'number',
							name: 'dis-y',
							placeholder: 'Enter Y distance',
							onChange: () => console.log('Changing start-Y position'),
						},
						{
							type: 'number',
							name: 'dis-z',
							placeholder: 'Enter Z distance',
							onChange: () => console.log('Changing start-Z position'),
						},
					]}
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
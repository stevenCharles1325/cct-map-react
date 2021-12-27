/*
	- This context tells if there is an update in the MAP.
	- Returns a boolean value.
*/

import React from 'react';

const isUpdateOccured = false; 
const MapUpdate = React.createContext( isUpdateOccured );

export default MapUpdate;
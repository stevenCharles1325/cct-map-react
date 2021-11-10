import React, { useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls as PLC } from './PointerLockControl-mobile';

const PointerLockControls = React.forwardRef((props, ref) => {
	const invalidate = useThree(({ invalidate }) => invalidate );
	const camera = useThree(({ camera }) => camera );
	const gl = useThree(({ gl }) => gl );
	const [controls] = useState(() => new PLC(camera, gl.domElement));

	useEffect(() => {
		controls?.addEventListener?.('change', invalidate);

		return () => controls?.removeEventListener?.('change', invalidate);
	
	}, [controls, invalidate]);

	useFrame((_, delta) => controls?.update?.(delta));

	return controls ? <primitive ref={ref} dispose={undefined} object={controls} {...props} /> : null;
});


export default PointerLockControls;
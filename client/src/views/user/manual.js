import React from 'react';
import uniqid from 'uniqid';

import OpacityIcon from '@mui/icons-material/Opacity';
import FlightIcon from '@mui/icons-material/Flight';
import CloseIcon from '@mui/icons-material/Close';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import MenuBookIcon from '@mui/icons-material/MenuBook'; // Manual
import InfoIcon from '@mui/icons-material/Info'; // About
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // Quality switch
import SearchIcon from '@mui/icons-material/Search'; // Search

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'; // Speed dial button

import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Pagination from '@mui/material/Pagination';

const Manual = props => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const handleClickOpen = () => {
		props.setOpen( true );
	};

	const handleClose = () => {
		props.setOpen( false );
	};

	const [page, setPage] = React.useState( 1 );
	const [contents, setContents] = React.useState([
			[
				<IconPurpose
					key={uniqid()}
	          		icon={<OpacityIcon/>}
	          		purpose={
	          			<>
		          			<u>Opacity Button:</u>
	          				<p>This changes the opacity of the 3D building.</p>
	          			</>
	          		}
	          	/>,
	          	<IconPurpose
	          		key={uniqid()}
	          		icon={<CloseIcon/>}
	          		purpose={
	          			<>
		          			<u>Flight Mode Button:</u>
	          				<p>This resets your controller and if controller gets reset then the position either.</p>
	          			</>
	          		}
	          	/>,
				<IconPurpose
					key={uniqid()}
	          		icon={<FlightIcon/>}
	          		purpose={
	          			<>
		          			<u>Clear Path Button:</u>
	          				<p>This clears the created path.</p>
	          			</>
	          		}
	          	/>
			],
			[
				<IconPurpose
					key={uniqid()}
	          		icon={
	          			<>
		          			<ArrowDropUpIcon/>
		          			<ArrowDropDownIcon/>
	          			</>
	          		}
	          		purpose={
	          			<>
		          			<u>Movement Buttons:</u>
	          				<p>These move you forward or backward.</p>
	          			</>
	          		}
	          	/>,
	          	<IconPurpose
	          		key={uniqid()}
	          		icon={<MenuBookIcon/>}
	          		purpose={
	          			<>
		          			<u>Manual Button:</u>
	          				<p>This shows you this dialog box which teaches you things about each icon in this application.</p>
	          			</>
	          		}
	          	/>,
	          	<IconPurpose
	          		key={uniqid()}
	          		icon={<InfoIcon/>}
	          		purpose={
	          			<>
		          			<u>About Button:</u>
	          				<p>This takes you to the About page.</p>
	          			</>
	          		}
	          	/>
			],
			[
				<IconPurpose
					key={uniqid()}
	          		icon={<BubbleChartIcon/>}
	          		purpose={
	          			<>
		          			<u>Quality Switch:</u>
	          				<p>This changes the current Quality to either "low" or "high".</p>
	          			</>
	          		}
	          	/>,
	          	<IconPurpose
	          		key={uniqid()}
	          		icon={<SearchIcon/>}
	          		purpose={
	          			<>
		          			<u>Search Button:</u>
	          				<p>
	          					This shows you another dialog box which allows you enter your starting and ending point, 
	          					and draws a path for you using the algorithm we used.
	          				</p>
	          			</>
	          		}
	          	/>,
	          	<IconPurpose
	          		key={uniqid()}
	          		icon={<CheckBoxOutlineBlankIcon/>}
	          		purpose={
	          			<>
		          			<u>Speed dial Button:</u>
	          				<p>
	          					This displays four more buttons when hovers over it. The buttons it shows are the Search Button, 
	          					Quality Switch, About Button, and the Manual Button.
	          				</p>
	          			</>
	          		}
	          	/>
			]
		]);

	// const checkIfUserAlreadyVisitedApplication = () => {
	// 	const visitToken = Cookies.get('visitToken');

	// 	if( visitToken ) 
	// }

	return(
		<Dialog
			fullScreen={fullScreen}
	        open={props.open}
	        onClose={handleClose}
		>
			<DialogTitle id="responsive-dialog-title">
	          <b>{"CCT VIRTUAL LOCATOR MANUAL"}</b>
	        </DialogTitle>
	        <DialogContent>
				<DialogContentText>
					These are the icons that you will see inside the app, and so 
					here's their purpose.
				</DialogContentText>
				<br/>
				<Divider/>
				<div className="p-3 d-flex flex-column justify-content-center align-items-center">
					{ contents[ page - 1 ] }
				</div>
				<Divider/>
				<div className="col-12 mt-3 d-flex justify-content-center align-items-center">
					<Pagination 
						size="large" 
						variant="outlined" 
						shape="rounded"
						count={3} 
						page={page} 
						onChange={(_, value) => setPage( value )}
					/>
				</div>
	        </DialogContent>
	        <DialogActions>
	          <Button autoFocus onClick={handleClose}>
	            close
	          </Button>
	        </DialogActions>
		</Dialog>
	);
}

const IconPurpose = props => {
	return(
		<div className="row col-12">
			<div className="col-2 d-flex flex-column justify-content-center align-items-center">
				{ props.icon }
			</div>
			<div className="col-10">
				{ props.purpose }
			</div>
	  	</div>
	);
}

export default Manual;
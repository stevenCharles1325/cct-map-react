import React, { useState, useEffect, useRef } from 'react';

import saveImg from '../../images/download.png';
import updateImg from '../../images/update-arrows.png';
import importImg from '../../images/import.png';
import prevImg from '../../images/preview.png';

import '../../styles/map-menu.css';


function MapMenu( props ){
    const menu = useRef( null );
    const [isOpen, setIsOpen ] = useState( false );


    console.log( menu );

    useEffect(() => {
    })

    return (
        <div ref={menu} style={{opacity: isOpen ? '1' : '0'}} className="map-menu d-flex flex-column align-items-center justify-content-center">
            <div className="mm-icon-box mb-3 d-flex justify-content-center">
                <div className="mm-icon-cont pb-2">
                    <img src={props.icon || null}/>
                </div>
            </div>

            <div className="mm-btns-box d-flex flex-column align-items-center">
                {[
                    this.createButton('mm-save-btn', saveImg, this.save),
                    this.createButton('mm-update-btn', updateImg, this.update),
                    this.createButton('mm-import-btn', importImg, this.import),
                    this.createButton('mm-preview-btn', prevImg, this.preview)
                ]}
            </div>
        </div>
    );
}

// export default class MapMenu extends React.Component{

//     constructor( props ){
//         super( props );

//         this.icon = props.icon;

//         this.save= props.save;
//         this.update = props.update;
//         this.import = props.import;
//         this.preview = props.preview;

//         this.state = {
//             isOpen: true
//         }
//     }

//     createButton( id, icon, callback ){
//         return(
//             <div key={id} id={id} className="mm-btn-cont p-3 my-3 d-flex justify-content-center align-items-center">
//                 <div width="150px" height="50px" className="d-flex justify-content-center align-items-center">
//                     <img className="mm-btn-icon" width="70%" height="70%" src={icon} onClick={() => {
//                         callback()
//                     }}/>
//                 </div>
//             </div>
//         );
//     }

//     render() {
//         return (
//             <div style={{opacity: this.state.isOpen ? '1' : '0'}} className="map-menu d-flex flex-column align-items-center justify-content-center">
//                 <div className="mm-icon-box mb-3 d-flex justify-content-center">
//                     <div className="mm-icon-cont pb-2">
//                         <img src={this.icon || null}/>
//                     </div>
//                 </div>

//                 <div className="mm-btns-box d-flex flex-column align-items-center">
//                     {[
//                         this.createButton('mm-save-btn', saveImg, this.save),
//                         this.createButton('mm-update-btn', updateImg, this.update),
//                         this.createButton('mm-import-btn', importImg, this.import),
//                         this.createButton('mm-preview-btn', prevImg, this.preview)
//                     ]}
//                 </div>
//             </div>
//         );
//     }

// }

export default MapMenu;
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import Cookies from 'js-cookie';
import axios from 'axios';


import ImageBall from '../../components/admin/image/image-ball';

import userFace from '../../images/admin/happy.png';

import '../../styles/admin/dashboard.css';



// Main function
export default function Dashboard( props ) {
    const { ErrorHandler } = props;
    const [graphData, setGraphData] = useState( null );

    // Fetches the data from the server and sets the admin.
    const requestGraphData = async () => {
        const token = Cookies.get('token');
        const rtoken = Cookies.get('rtoken');

        if( !token ){
            return props?.Event?.emit?.('unauthorized');
        }

        await axios.get(`http://${window.SERVER_HOST}:${window.SERVER_PORT}/admin/graph-data`, {
            headers: {
                'authentication': `Bearer ${token}`
            }
        })
        .then( res => {
            setGraphData( res.data );
        })
        .catch( err => {
            ErrorHandler.handle( err, requestGraphData, 2 );

            if( err?.response?.status && (err?.response?.status === 403 || err?.response?.status === 401)){
                return axios.post(`http://${window.SERVER_HOST}:${window.AUTH_SERVER_PORT}/auth/refresh-token`, { token: rtoken })
                .then( res => {
                    Cookies.set('token', res.data.accessToken)

                    setTimeout(() => requestGraphData(), 1000);
                })
                .catch( err => props?.Event?.emit?.('unauthorized'));
            }
        });
    }  


    useEffect(() => requestGraphData(), []);


    const scales = {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    }
                }
            ]
        }

    const legend = {
            labels: {
                font:{
                    family: 'Poppins'
                }
            }
        } 

    const topGraphOption = {
        color: 'rgb(255, 255, 255)',
        scales: scales,
        legend: legend
    }


    scales.x = { max: convertBytesToMegaBytes(window.performance.memory.totalJSHeapSize) };
    legend.position = 'right';

    const bottomGraphOption = {
            color: 'black',
            maintainAspectRatio: true,
            scales: scales,
            indexAxis: 'y',
            elements: {
                bar: {
                    borderWidth: 2,
                },
            },
            responsive: true,
            plugins: {
                legend: legend
            }
        }


    return(
        <div className="dashboard">
            <DashboardHeader title="Dashboard"/>
            <div className="dash-chart-box d-flex flex-column">
                <div className="top-chart-box d-flex justify-content-between">

                    {
                        graphData
                            ? (() => (
                                    <>
                                        <Graph 
                                            id="top-left-graph"
                                            type="Line"
                                            classList={{
                                                outer: "left-graph-box d-flex flex-column align-items-center",
                                                inner: "left-graph"
                                            }}
                                            dataLabels={['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 AM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM']}
                                            data={ Object.values( graphData?.currRate ) }
                                            backgroundColor="transparent"
                                            title="Current Viewers Rate" 
                                            options={ topGraphOption } 
                                        />     
                                        <Graph 
                                            id="top-right-graph"
                                            type="Bar"
                                            classList={{
                                                outer: "right-graph-box d-flex flex-column align-items-center", 
                                                inner: "right-graph"
                                            }}
                                            dataLabels={ Object.keys( graphData?.annRate ) }
                                            data={ Object.values( graphData?.annRate ) } 
                                            backgroundColor={[ 
                                                'rgb(255, 255, 255)', 
                                                'rgb(196, 196, 196)', 
                                                'rgb(221, 221, 221)'
                                            ]}
                                            title="Monthly Viewers Rate" 
                                            options={ topGraphOption } 
                                        />
                                    </>
                                ))()
                            : null
                    }

                </div>
                
                <div className="bot-chart-box"> 
                    {/* BOTTOM-RIGHT-GRAPH: Memory Consumption Graph*/}
                    <Graph 
                        type="Bar"
                        width="100%"
                        height="14%"
                        classList={{
                            outer: "bot-graph-box d-flex flex-column align-items-center", 
                            inner: "bot-graph"
                        }}
                        dataLabels={ ["JS Objects (MB)"] }
                        data={ [convertBytesToMegaBytes(window.performance.memory.usedJSHeapSize)] }
                        backgroundColor={ ['rgb(255, 255, 255)', 'rgb(196, 196, 196)'] }
                        title="Memory Consumption" 
                        options={ bottomGraphOption }
                    />
                </div>
                
            </div>            
        </div>
    );

}




function DashboardHeader( props ){
    return (
        <div className="dash-header d-flex flex-row">
           <div className="dash-header-title-box col-3 d-flex align-items-end justify-content-center">
             <h1>{ props.title }</h1>
           </div>

           <div className="col-8 d-flex justify-content-end align-items-center">
             <div className="dash-profile-container d-flex justify-content-center align-items-center">
                <ImageBall />
             </div>    
           </div>
       </div>
    );
}




function Graph( props ){
    let graph = null;

    const newProps = {
        width: props.width || null,
        height: props.height || null,
        className: props.classList.inner,
        data: {
            labels: props.dataLabels,
            datasets: [
                {
                    label: props.title,
                    data: props.data,
                    fill: false,
                    backgroundColor: props.backgroundColor,
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                }
            ] 
        },
        options: props.options
    }

    switch( props.type ){
        case 'Line':
            graph = <Line {...newProps}/>
            break;
        case 'Bar':
            graph = <Bar {...newProps}/>
            break;
        default:
            return;
    }

    return(
        <div key={props.id} className={ props.classList.outer }>
            <h5 className="p-0 m-0 mt-1">{ props.title }</h5>
            { graph }
        </div>
    );
}



//////////////////////// OTHER LOGIC(S) /////////////////////////////

function convertBytesToMegaBytes( bytes ){
    return (bytes / 1048576).toFixed( 2 );
}









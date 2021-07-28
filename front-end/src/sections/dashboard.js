import React from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import { Redirect } from 'react-router-dom';

import Loading from '../components/load-bar/loading';
import NavPanel from '../components/navigator/nav-panel'

import userFace from '../images/happy.png';

import '../styles/dashboard.css';


export default class Dashboard extends React.Component{

    constructor( props ){
        super( props );

        this.statusKey = props.statusKey;
        this.admin = props.admin;
        this.navPanel = props.navPanel;
        this.state = {
            graph_data: null
        };

        this.graph_data_url = 'http://localhost:7000/admin/graph-data';
    }

    componentDidMount() {
        console.log('[Display dashboard]');

        axios.get(this.graph_data_url)
        .then( res => {
            this.setState({
                graph_data:{
                    annRate: res.data.annRate,
                    currRate: res.data.currRate
                }
            });
        })
        .catch( err => {
            console.log( err )
        })
    }

    render() {
        if( this.admin ){
            if( this.admin.status.loggedIn ){
              return (
                  <div className="dashboard">

                      {/* Dashboard Header */}
                      <div className="dash-header d-flex flex-row">
                          <div className="dash-header-title-box col-3 d-flex align-items-end justify-content-center">
                            <h1>Dashboard</h1>
                          </div>

                          <div className="col-8 d-flex justify-content-end align-items-center">
                            <div className="dash-profile-container d-flex justify-content-center align-items-center">
                                <img width="85%" height="85%" src={userFace} alt="userface"/>
                            </div>    
                          </div>
                      </div>

                    <div className="dash-chart-box d-flex flex-column">
                        <div className="top-chart-box d-flex justify-content-between">
                            <div className="left-graph-box d-flex flex-column align-items-center">
                                <h5 className="p-0 m-0 mt-1">Current Viewers Rate</h5>
                                <Line
                                className="left-graph"
                                data={
                                    this.state.graph_data ? {
                                        labels: ['1', '2', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                                        datasets: [
                                            {
                                                label: 'Current viewers rate',
                                                data: Object.values(this.state.graph_data.currRate),
                                                fill: false,
                                                backgroundColor: 'transparent',
                                                borderColor: 'rgba(255, 255, 255, 0.5)'
                                            }
                                        ]
                                    } : {
                                        labels: [],
                                        datasets: []
                                    }
                                }
                            
                                options={
                                    {
                                        color: 'rgb(255, 255, 255)',
                                        scales: {
                                            yAxes: [
                                                {
                                                    ticks: {
                                                        beginAtZero: true,
                                                    }
                                                }
                                            ]
                                        },
                                        legend:{
                                            labels: {
                                                font:{
                                                    family: 'Poppins'
                                                }
                                            }
                                        }
                                    }
                                }
                            />
                            </div>
                            
                            <div className="right-graph-box d-flex flex-column align-items-center">
                                <h5 className="p-0 m-0 mt-1">Annual Viewers Rate</h5>
                                <Bar
                                className="right-graph"
                                data={
                                    this.state.graph_data ? {
                                        labels: Object.keys( this.state.graph_data.annRate ),
                                        datasets: [
                                            {
                                                label: 'Annual viewers rate',
                                                data: Object.values(this.state.graph_data.annRate),
                                                fill: false,
                                                backgroundColor: [
                                                    'rgb(255, 255, 255)',
                                                    'rgb(196, 196, 196)',
                                                    'rgb(221, 221, 221)'
                                                ],
                                                borderColor: 'rgba(255, 255, 255, 0.5)'
                                            }
                                        ]
                                    } : {
                                        labels: [],
                                        datasets: []
                                    }
                                }
                            
                                options={
                                    {
                                        color: 'rgb(255, 255, 255)',
                                        scales: {
                                            yAxes: [
                                                {
                                                    ticks: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            ]
                                        },
                                        legend: {
                                            labels: {
                                                font:{
                                                    family: 'Poppins'
                                                }
                                            }
                                        }
                                    }
                                }
                                />
                            </div>
                        </div>
                        <div className="bot-chart-box">
                            <Bar
                                className="bot-graph"
                                data={
                                    {
                                        labels: ['Used space'],
                                        datasets: [
                                            {
                                                label: 'Memory data in bytes',
                                                data: [window.performance.memory.usedJSHeapSize],
                                                fill: false,
                                                backgroundColor: [
                                                    'rgb(255, 255, 255)',
                                                    'rgb(196, 196, 196)'
                                                ],
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                borderWidth: 1
                                            }
                                        ]
                                    }
                                }
                                
                                width='100%'
                                height='15%'

                                options={
                                    {
                                        color: 'black',
                                        maintainAspectRatio: true,
                                        scales: {
                                            yAxes: [
                                                {
                                                    ticks: {
                                                        beginAtZero: true,
                                                    }
                                                }
                                            ],
                                            x:{
                                                max: window.performance.memory.totalJSHeapSize
                                            }

                                        },
                                        indexAxis: 'y',
                                        elements: {
                                            bar: {
                                                borderWidth: 2,
                                            },
                                        },
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    font:{
                                                        family: 'Poppins'
                                                    }
                                                },
                                                position: 'right',
                                            },
                                        }
                                    }
                                }
                            />
                        </div>
                    </div>
                  </div>
              );
            } 
            else if( !this.admin.status.loggedIn ){
              return (
                  <div className="dashboard">
                    <Redirect to="/admin" />         
                  </div>
              );
            }
          }
          else{
            return (
              <div className="dashboard"> 
                <Loading />
              </div>
            );
        }
    }
}
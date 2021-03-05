import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { SteppedLineTo } from 'react-lineto';
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem } from "react-contextmenu";
import WorkstreamDetailsModalDefineWs from '../DefineWorkstreamModals/WorkstreamDetailsModalDefineWs';

import '../DefineWorkstream/AllWsGanttChart.css';
import ConnectorHelper from '../DefineWsTimeline/ConnectorHelper';
import mileStoneIcon from '../../assets/project_DWS/milestone-icon.svg';
import mileStoneTrashIcon from '../../assets/project_DWS/trash-icon-milestone.svg';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ActivityDetailsModalDefineWs from '../DefineWorkstreamModals/ActivityDetailsModalDefineWs';
import DeliverableDetailsModalDefineWs from '../DefineWorkstreamModals/DeliverableDetailsModalDefineWs';
import MilestoneDetailsModalDefineWs from '../DefineWorkstreamModals/MilestoneDetailsModalDefineWs';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import Moment from 'moment';

@inject('workstreamStore')
class DefineWsFilterGanttCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allWsChildDataArray: '',
            
           
        };

        this.isDefined = this.isDefined.bind(this);
        

    }

    componentDidMount() {
        
        let { allWsDataArray } = this.props;
        let copyDataArray = [...allWsDataArray];
        this.setState({
            allWsChildDataArray: copyDataArray,
            showContextMenu: false,
            menuOptions: []
        });


    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selectedFilterType !== this.props.selectedFilterType) {
            this.refreshTheState()
        }
    }

    refreshTheState() {
        let { allWsDataArray } = this.props;
        let copyDataArray = [...allWsDataArray];
        copyDataArray.map(wsObj => {
            wsObj.activities.map(actObj => {
                actObj.deliverables.map(delObj => {
                    delObj.addedMilestones.map(milObj => {
                        let left = delObj['chartLeft'].split('px');
                        milObj['milestoneLeft'] = Number(left[0] - 6);
                    })
                })
            })
        })
        this.setState({
            allWsChildDataArray: copyDataArray
        });
    }

    // START of connector related functions

    renderCreateLink = () => {
        if (true) {
            let { allWsChildDataArray } = this.state;
            const { allDelArray, selectedFilterType} = this.props;
            let allConnectorsCache = [];

            if (allDelArray && allDelArray.length > 0 && selectedFilterType === 'del-filter') {

                allDelArray.map(delObj => {
                    
                        if (this.isDefined(delObj.dependentDeliverables) && delObj.chartWidth !== '100%') {
                            let eachDelConnectorsArray = [];
                            eachDelConnectorsArray = this.calculateEachDelConnectors(delObj);
                            allConnectorsCache = [...allConnectorsCache, ...eachDelConnectorsArray];
                        }
                    
                });

                return allConnectorsCache;
            }
        }
    }

    calculateEachDelConnectors = (depDelObj) => {

        let connectorsCache = [];
        let depDelArray = Object.values(depDelObj.dependentDeliverables);
        depDelArray.map((eachRel, relInd) => {
            eachRel.map((conObj, conInd) => {
                let ele = this.mapConnectorToRelation(depDelObj, conObj);
                connectorsCache.push(ele);
            })
        })
        return connectorsCache;
    }

    mapConnectorToRelation = (depDelObj, conObj) => {
        const { allWsChildDataArray } = this.state;
        let delX, delY, depDelX, depDelY = 0;

        let delObj = this.props.allDelIdObj[conObj.delId]; // get the delObj by id from the props

        if (delObj[0].chartLeft !== 0) {  // check for any deliverable with no dates given
            let delLeftSplit = delObj[0].chartLeft.split('px');
            let depDelLeftSplit = depDelObj.chartLeft.split('px');
            switch (conObj.depType) {
                case 'FINISH_TO_START':
                    // get the del obj by id


                    delX = delObj[0].chartRight;
                    delY = Number(delObj[0].chartTop) + 10;

                    // set the x and y of dep del

                    depDelX = Number(depDelLeftSplit[0]);
                    depDelY = Number(depDelObj.chartTop) + 10;

                    let ele = (
                        <Fragment>
                            <ConnectorHelper relationType={conObj.depType} uniqueId={`${conObj.depDelId}_F_S_${conObj.delId}`}
                                start={{ x: delX, y: delY }} end={{ x: depDelX, y: depDelY }} />
                        </Fragment>
                    );

                    return ele;
                    break;

                case 'FINISH_TO_FINISH':
                    // get the del obj by id

                    delX = delObj[0].chartRight;
                    delY = Number(delObj[0].chartTop) + 10;

                    // set the x and y of dep del
                    depDelX = depDelObj.chartRight;
                    depDelY = Number(depDelObj.chartTop) + 10;

                    let ele2 = (
                        <Fragment>
                            <ConnectorHelper relationType={conObj.depType} uniqueId={`${conObj.depDelId}_F_F_${conObj.delId}`}
                                start={{ x: delX, y: delY }} end={{ x: depDelX, y: depDelY }} />
                        </Fragment>
                    );

                    return ele2;
                    break;

                case 'START_TO_START':
                    // get the del obj by id                    

                    delX = Number(delLeftSplit[0]);
                    delY = Number(delObj[0].chartTop) + 10;

                    // set the x and y of dep del
                    depDelX = Number(depDelLeftSplit[0]);
                    depDelY = Number(depDelObj.chartTop) + 10;

                    let ele3 = (
                        <Fragment>
                            <ConnectorHelper relationType={conObj.depType} uniqueId={`${conObj.depDelId}_S_S_${conObj.delId}`}
                                start={{ x: delX, y: delY }} end={{ x: depDelX, y: depDelY }} />
                        </Fragment>
                    );

                    return ele3;
                    break;
                case 'START_TO_FINISH':
                    // get the del obj by id               

                    delX = Number(delLeftSplit[0])
                    delY = Number(delObj[0].chartTop) + 10;

                    // set the x and y of dep del

                    depDelX = depDelObj.chartRight;
                    depDelY = Number(depDelObj.chartTop) + 10;

                    let ele4 = (
                        <Fragment>
                            <ConnectorHelper relationType={conObj.depType} uniqueId={`${conObj.depDelId}_F_S_${conObj.delId}`}
                                start={{ x: delX, y: delY }} end={{ x: depDelX, y: depDelY }} />
                        </Fragment>
                    );

                    return ele4;
                    break;

                default:
                    break;
            }
        } else {

        }
    }

    // END of connector related functions
    

    // ----- START of Utility functions -------
    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    showErrorNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }
    // ----- END of Utility functions -------


    render() {
        const { allWsArray, allActArray, allDelArray, allMileArray, selectedFilterType } = this.props;
        const { allWsChildDataArray } = this.state;


        return (
            <div id="ws_gantt_main" className="ws-gantt-chart-wrapper">
                <div className="connector-ref">

                    {/* below div holds  all the connector component divs, toggle this for show/hide connectors */}
                    {this.props.hideConnectors ?
                        '' :
                        <div className="connector-svg-binder" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                            {
                                 this.renderCreateLink()  // un comment this line for seeing connectors
                            }
                        </div>
                    }

                    <div className="saved-ws-chart-row">
                    { selectedFilterType && selectedFilterType === 'ws-filter' ?
                        <div className="all-ws-filtered-charts">
                            {allWsArray && allWsArray.map((wsObj, wsInd) => (
                            <div key={`ws _${wsInd}`} className="each-ws-encloser">
                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                    <div id={`ws_chart_${wsInd}`}
                                        data-tip
                                        data-for={`ws_chart_hovertxt_${wsInd}`}
                                        data-place="top"
                                        style={{ left: wsObj.chartLeft, width: wsObj.chartWidth }}
                                        // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                        className={`custom-gantt-chart
                                        ${wsObj.startDate && wsObj.startDate !== '' ? 'ws-chart-color' : 'default-chart-color'}`}>
                                    </div>
                                    <ReactTooltip id={`ws_chart_hovertxt_${wsInd}`}>
                                        <div>
                                            <div style={{ padding: "0px 0px 4px 0px" }}>{wsObj.name}</div>
                                            <div>Owner : {wsObj.owner}</div>
                                            <div>Department : {wsObj.department}</div>
                                            <div>Start Date : {(wsObj.startDate === null || wsObj.startDate === "") ? "" : Moment(new Date(wsObj.startDate)).format('DD-MMM-YYYY')}</div>
                                            <div>End Date : {(wsObj.endDate === null || wsObj.endDate === "") ? "" : Moment(new Date(wsObj.endDate)).format('DD-MMM-YYYY')}</div>
                                        </div>
                                    </ReactTooltip>
                                </div>    
                            </div>
                        ))
                        }
                        </div> :
                        selectedFilterType === 'act-filter' ?
                        <div className="all-act-filtered-charts">
                            {allActArray && allActArray.map((actObj, actInd) => (
                                    <div key={`act_chart_${actInd}`} className="each-act-encloser">
                                        <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            <div id={`act_chart_${actInd}`}
                                                data-tip
                                                data-for={`act_chart_hovertxt_${actInd}`}
                                                data-place="top"
                                                style={{ left: actObj.chartLeft, width: actObj.chartWidth }}
                                                className={`custom-gantt-chart
                                        ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}`}
                                                // onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                >
                                            </div>
                                            <ReactTooltip id={`act_chart_hovertxt_${actInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                    <div>Owner : {actObj.owner}</div>
                                                    <div>Department : {actObj.department}</div>
                                                    <div>Start Date : {(actObj.startDate === null || actObj.startDate === "") ? "" : Moment(new Date(actObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                    <div>End Date : {(actObj.endDate === null || actObj.endDate === "") ? "" : Moment(new Date(actObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                </div>
                                            </ReactTooltip>
                                        </div>    
                                    </div>
                                ))
                                }
                        </div> :
                        selectedFilterType === 'del-filter' ?
                                    <div className="all-del-filtered-charts">
                                        {allDelArray && allDelArray.map((delObj, delInd) => (

                                            <div key={`del_${delInd}`} className="each-del-encloser">

                                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                    
                                                    <ContextMenuTrigger id={`del_context`}>
                                                        <div id={`del_chart_${delInd}`}
                                                            data-menu-type={`del_context`}
                                                            
                                                            // onClick={(e) => { this.openDeliverableModalHandler(e, delObj) }}
                                                            // onContextMenu={(e) => { this.showContextMenuHandler(e, delInd) }}
                                                            style={{ left: delObj.chartLeft, width: delObj.chartWidth }}
                                                            // style={{ left: `${(delInd * 50) + 20}px`, width: `${(delInd + 1) * 100}px` }}
                                                            className={`custom-gantt-chart 
${delObj.startDate && delObj.startDate !== '' ? 'del-chart-color' : 'default-chart-color'}`}
                                                            data-tip
                                                            data-for={`del_chart_hovertxt_${delInd}`}
                                                            data-place="top"
                                                        >

                                                        </div>
                                                        <ReactTooltip id={`del_chart_hovertxt_${delInd}`}>
                                                            <div>
                                                                <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                <div>Owner : {delObj.owner}</div>
                                                                <div>Department : {delObj.department}</div>
                                                                <div>Start Date : {(delObj.startDate === null || delObj.startDate === "") ? "" : Moment(new Date(delObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                                <div>End Date : {(delObj.endDate === null || delObj.endDate === "") ? "" : Moment(new Date(delObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                            </div>
                                                        </ReactTooltip>
                                                    </ContextMenuTrigger>
                                                </div>
                                                {/* <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_tt_${delInd}`}>test</ReactTooltip> */}
                                            </div>
                                        ))
                                        }

                                    </div> :
                        selectedFilterType === 'mile-filter' ?
                        <div className="all-mile-filtered-charts">
                                            {allMileArray && allMileArray.length === 0 ?
                                                <div style={{display: 'flex', marginLeft: '30%'}}>There are No Milestones Added</div>
                                                : allMileArray && allMileArray.map((mileObj, mileInd) => (

                                                    <div key={`mile_filter_${mileInd}`} className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                        <div className="del-ms-div"
                                                            style={{ left: mileObj.milestoneLeft, top: '0' }}>
                                                            <ContextMenuTrigger id={`mile_${mileInd}_context_menu`}>
                                                                <img className="mile-icon-img" id={`mile_icon_${mileInd}`}
                                                                    data-tip
                                                                    data-for={`del_chart_hovertxt_mile_${mileInd}`}
                                                                    src={mileStoneIcon} alt="ms_icon"
                                                                // onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}
                                                                ></img>
                                                               
                                                            </ContextMenuTrigger>
                                                        </div>
                                                        <ReactTooltip id={`del_chart_hovertxt_mile_${mileInd}`}>
                                                                    <div>
                                                                        <div style={{ padding: "0px 0px 4px 0px" }}>{mileObj.milestone}</div>
                                                                        <div>Milestone Date : {(mileObj.milestoneDate === null || mileObj.milestoneDate === "") ? "" : Moment(new Date(mileObj.milestoneDate)).format('DD-MMM-YYYY')}
                                                                        </div>
                                                                    </div>
                                                                </ReactTooltip>

                                                    </div>
                                                ))
                                            }

                                        </div>
                                        : ''

                        }
                            

                        


                                
                        
                        
                    </div>
                </div>
                {/* context menu and menu items for deliverable charts */}

                

                {/* <SteppedLineTo from="ws_1_act_0_del_left_class_0" to="ws_1_act_0_del_left_class_1" orientation="h"
                            borderColor="#fff"
                            // style={{ borderStyle: 'dashed'}}
                            borderWidth={1.5}
                            borderStyle="dashed"
                            fromAnchor="left"
                            toAnchor="left" /> */}
                

            </div>
        )
    }
}

export default withRouter(DefineWsFilterGanttCharts);
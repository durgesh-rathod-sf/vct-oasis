import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem } from "react-contextmenu";

import '../DefineWorkstream/AllWsGanttChart.css';  
import ConnectorHelper from '../DefineWsTimeline/ConnectorHelper'; 
import mileStoneIcon from '../../assets/project_DWS/milestone-icon.svg';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import Moment from 'moment';

@inject('workstreamStore')
class AllWsGanttChart extends Component {
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
        if (prevProps.allWsDataArray !== this.props.allWsDataArray) {
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
            let allConnectorsCache = [];

            if (allWsChildDataArray.length > 0) {
                
                allWsChildDataArray.map(wsObj => {
                    wsObj.activities.map(actObj => {
                        actObj.deliverables.map(delObj => {
                            if (this.isDefined(delObj.dependentDeliverables) && delObj.chartWidth !== '100%') {
                                let eachDelConnectorsArray = [];
                                eachDelConnectorsArray = this.calculateEachDelConnectors(delObj);
                                allConnectorsCache = [...allConnectorsCache, ...eachDelConnectorsArray];
                            }
                        })
                    })
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
        const {addedNewWsArray, sortable} = this.props;
        const {allWsChildDataArray, showContextMenu, selectedDelObj} = this.state;
        


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
                        {allWsChildDataArray && allWsChildDataArray.map((wsObj, wsInd) => (
                            <div key={`ws _${wsInd}`} className="each-ws-encloser">
                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                    <div id={`ws_chart_${wsInd}`}
                                        data-tip
                                        data-for={`ws_chart_hovertxt_${wsInd}`}
                                        data-place="top"
                                        style={{ left: wsObj.chartLeft, width: wsObj.chartWidth }}
                                        /*onClick={sortable ? (e) => { this.openWsModal(e, wsObj) } : () => {}}*/
                                        className={`custom-gantt-chart
                                        ${sortable ? '' : 'sortable-cursor'}
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
                                {wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                    <div key={`ws_${wsInd}_act_${actInd}`} className="each-act-encloser">
                                        <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            <div id={`ws_${wsInd}_act_chart_${actInd}`}
                                                data-tip
                                                data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}`}
                                                data-place="top"
                                                style={{ left: actObj.chartLeft, width: actObj.chartWidth }}
                                                className={`custom-gantt-chart
                                        ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}
                                        ${sortable ? '' : 'sortable-cursor'}`}
                                                /*onClick={sortable ? (e) => { this.openActivityModalHandler(e, actObj) } : () => {}}*/>
                                            </div>
                                            <ReactTooltip id={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                    <div>Owner : {actObj.owner}</div>
                                                    <div>Department : {actObj.department}</div>
                                                    <div>Start Date : {(actObj.startDate === null || actObj.startDate === "") ? "" : Moment(new Date(actObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                    <div>End Date : {(actObj.endDate === null || actObj.endDate === "") ? "" : Moment(new Date(actObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                </div>
                                            </ReactTooltip>
                                        </div>
                                        {actObj.addedDeliverables && actObj.addedDeliverables.map((delObj, delInd) => (
                                            <div key={`ws_${wsInd}_act_${actInd}_add_del_${delInd}`} className="each-add-del-encloser">
                                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                    <ContextMenuTrigger id="add_del_context">
                                                        <div id={`ws_${wsInd}_act_${actInd}_add_del_chart_${delInd}`}
                                                            className="custom-gantt-chart default-chart-color"
                                                            data-menu-type="add_del_context"
                                                            data-ws-index={wsInd}
                                                            data-act-index={actInd}
                                                            /*onContextMenu={sortable ? (e) => { this.showContextMenuHandler(e, delInd) }: () => {}}*/
                                                        >
                                                        </div>
                                                    </ContextMenuTrigger>
                                                </div>
                                            </div>
                                        ))}

                                        {actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (

                                            <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="each-del-encloser">

                                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                    
                                                    {/*  start of saved milestones on deliverable */}
                                                   
                                                    {delObj.milestonesGroup && Object.values(delObj.milestonesGroup).length > 0 &&
                                                        Object.values(delObj.milestonesGroup).map((groupObj, groupInd) => (
                                                            <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}_mile_group_${groupInd}`} className="">
                                                                {/* milestones with no common date */}
                                                                {groupObj.length === 1 && groupObj.map((mileObj, mileInd) => (
                                                                    <Fragment key={`mile_${mileInd}`}>
                                                                        <div className="del-ms-div"
                                                                            style={{ left: mileObj.milestoneLeft }}>
                                                                            <ContextMenuTrigger id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_${mileInd}_context_menu`}>
                                                                                <img className="mile-icon-img" id={`mile_icon_${mileInd}`}
                                                                                    data-tip
                                                                                    data-for={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_chart_hovertxt_${mileInd}`}
                                                                                    src={mileStoneIcon} alt="ms_icon" 
                                                                                    // onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}
                                                                                    ></img>
                                                                                
                                                                            </ContextMenuTrigger>
                                                                        </div>
                                                                        <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_chart_hovertxt_${mileInd}`}>
                                                                                    <div>
                                                                                        <div style={{ padding: "0px 0px 4px 0px" }}>{mileObj.milestone}</div>
                                                                                        <div>Milestone Date : {(mileObj.milestoneDate === null || mileObj.milestoneDate === "") ? "" : Moment(new Date(mileObj.milestoneDate)).format('DD-MMM-YYYY')}
                                                                                        </div>
                                                                                    </div>
                                                                                </ReactTooltip>
                                                                    </Fragment>
                                                                ))
                                                                }
                                                                
                                                                {/* for all milestones with same date */}
                                                                {groupObj.length > 1 ?
                                                                    <Fragment>
                                                                        <div key={`group_${groupInd}`} className="del-ms-div multi-miles"
                                                                            style={{ left: groupObj[0].milestoneLeft }}>
                                                                            <div className="each-multi-miles-binder">
                                                                                <img className="mile-icon-img" id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_icon`}
                                                                                    data-tip                                                                                    
                                                                                    data-for={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_chart_hovertxt_${groupInd}`}
                                                                                    src={mileStoneIcon} alt="ms_icon"
                                                                                    // onClick={(event) => { this.openMultiMilestoneHandler(event, groupObj) }}
                                                                                    >
                                                                                </img>
                                                                                <span className="mile__badge">{groupObj.length}</span>
                                                                                
                                                                            </div>                                                                            
                                                                        </div>
                                                                        <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_chart_hovertxt_${groupInd}`}>
                                                                                    <div>
                                                                <div style={{ padding: "0px 0px 4px 0px" }}>Milestone Count : {groupObj.length}</div>
                                                                                        <div>Milestone Date : {(groupObj[0].milestoneDate === null || groupObj[0].milestoneDate === "") ? "" : Moment(new Date(groupObj[0].milestoneDate)).format('DD-MMM-YYYY')}
                                                                                        </div>
                                                                                    </div>
                                                                                </ReactTooltip>                                                                        
                                                                    </Fragment>
                                                                : ''
                                                                }                                                                
                                                            </div>
                                                        ))
                                                    }

                                                    {/*  End of saved milestones on deliverable */}

                                                    <ContextMenuTrigger id={`del_context`}>
                                                        <div id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                            data-menu-type={`del_context`}
                                                            data-ws-index={wsInd}
                                                            data-act-index={actInd}
                                                            /*onClick={sortable ? (e) => { this.openDeliverableModalHandler(e, delObj) } : () => {}}
                                                            onContextMenu={sortable ? (e) => { this.showContextMenuHandler(e, delInd) } : () => {}}*/
                                                            style={{ left: delObj.chartLeft, width: delObj.chartWidth }}
                                                            // style={{ left: `${(delInd * 50) + 20}px`, width: `${(delInd + 1) * 100}px` }}
                                                            className={`custom-gantt-chart ws_${wsInd}_act_${actInd}_del_class_${delInd}
                                                            ${delObj.startDate && delObj.startDate !== '' ? 'del-chart-color' : 'default-chart-color'}
                                                            ${sortable ? '' : 'sortable-cursor'}`}
                                                            data-tip
                                                            data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}
                                                            data-place="top"
                                                        >
                                                            <span className="whole-width-replica">
                                                                <span className={`left-span ws_${wsInd}_act_${actInd}_del_left_class_${delInd}`}></span>
                                                                <span className={`middle-span`}></span>
                                                                <span className={`right-span ws_${wsInd}_act_${actInd}_del_right_class_${delInd}`}></span>

                                                            </span>
                                                        </div>
                                                        <ReactTooltip id={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}>
                                                            <div>
                                                                <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                <div>Owner : {delObj.owner}</div>
                                                                <div>Department : {actObj.department}</div>
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
                                    </div>
                                ))
                                }
                            </div>
                        ))
                        }
                    </div>
                </div>

            </div>
        )
    }
}

export default withRouter(AllWsGanttChart);
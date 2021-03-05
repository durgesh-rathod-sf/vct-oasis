import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem } from "react-contextmenu";
import ReactTooltip from 'react-tooltip';
import './AllWsActualsGanttChart.css';
import mileStoneIcon from '../../assets/project_DWS/actuals-milestone-icon.svg';
import mileStoneIconRed from '../../assets/project_DWS/actuals-milestone-icon-red.svg';
import mileStoneIconLGreen from '../../assets/project_DWS/actuals-milestone-icon-lightgreen.svg';
import mileStoneIconDarkGreen from '../../assets/project_DWS/actuals-milestone-icon-darkgreen.svg';
import mileStoneTrashIcon from '../../assets/project_DWS/trash-icon-milestone.svg';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ConnectorHelper from '../DefineWsTimeline/ConnectorHelper';
import Moment from 'moment';


@inject('workstreamStore')
class DefineWSActualsFilterGanttCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allWsChildDataArray: '',

            selectedMileGroup: [],
            showMileGroup: false,

            selectedWsIndex: '',
            selectedActIndex: '',
            selectedDelIndex: '',
            selectedDelObj: '',
            
        };

        this.isDefined = this.isDefined.bind(this);  
        this.chartRightRef = React.createRef();            
        

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
            this.refreshTheState();
            this.setTodayScrollbarLeft();
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


    //  function to set the scroll bar left , so that view centered to today date
    setTodayScrollbarLeft = () => {
        if (this.chartRightRef && this.chartRightRef.current) {
            let clientWidth = this.chartRightRef.current.clientWidth;
            let todayPix = this.props.todayLeftPixels;
            if (todayPix > clientWidth /2 ) {
                todayPix = todayPix - (clientWidth /2);
            } else {
               //  todayPix = (clientWidth /2) - todayPix;
               todayPix = 0;
            }
            this.chartRightRef.current.scrollLeft = todayPix;
            // console.log('this.props.todayLeftPixels ' + this.props.todayLeftPixels);
            // console.log('this.chartRightRef.current.scrollWidth = ' + this.chartRightRef.current.scrollWidth);
            // console.log('this.chartRightRef.current.scrollLeft = ' + this.chartRightRef.current.scrollLeft);
        }
    }
    

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
    decodeStatus = (status) => {
        let value = "";
        switch (status) {
            case "CMP_WITHIN_DUE_DT":
                value = "Completed within due date";
                break;
            case "CMP_AFTER_DUE_DT":
                value = "Completed after due date"
                break;
            case "DELAYED":
                value = "Delayed"
                break;
            case "INPROGRESS":
                value = "In Progress"
                break;
            case "NOT_STARTED":
                value = "Not started"
                break;
            default:
                break;
        }
        return value;
    }
    // ----- END of Utility functions -------

    // new ws design functions

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
            let delLeftSplit = delObj[0].barLeft.split('px') !== "" && delObj[0].barLeft.split('px') !== undefined ? delObj[0].barLeft.split('px') : delObj[0].chartLeft.split('px');
            let depDelLeftSplit = depDelObj.barLeft.split('px') !== "" && depDelObj.barLeft.split('px') !== undefined ? depDelObj.barLeft.split('px') : depDelObj.chartLeft.split('px');
            switch (conObj.depType) {
                case 'FINISH_TO_START':
                    // get the del obj by id


                    delX = delObj[0].barRight !== undefined ? delObj[0].barRight : delObj[0].chartRight;
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

                    delX = delObj[0].barRight !== undefined? delObj[0].barRight : delObj[0].chartRight;
                    delY = Number(delObj[0].chartTop) + 10;

                    // set the x and y of dep del
                    depDelX = depDelObj.barRight !== undefined ? depDelObj.barRight : depDelObj.chartRight;
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

                    depDelX = depDelObj.barRight !== undefined ? depDelObj.barRight : depDelObj.chartRight;
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


    
    getmileStoneIcon=(status)=>{
        let result="";
        switch (status) {
            case "CMP_WITHIN_DUE_DT":
                result = mileStoneIconDarkGreen /*darg green*/
                break;
            case "CMP_AFTER_DUE_DT":
                result = mileStoneIconLGreen /*light green*/
                break;
            case "DELAYED":
                result = mileStoneIconRed /*red*/
                break;
            
            default:
                result = mileStoneIcon /*grey*/
                break;
        }
        return result;

    }

    render() {

        const todayDate = Moment(new Date());
        const { allWsArray, allActArray, allDelArray, selectedFilterType } = this.props;
        const { allWsChildDataArray, showContextMenu, selectedDelObj, selectedMileGroup } = this.state;


        return (
            <div id="ws_gantt_main" ref={this.chartRightRef} className="ws-actuals-gantt-chart-wrapper">
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

                    {/* todays view  vertical line */}
                    {this.props.todayLeftPixels && this.props.todayLeftPixels !== 0 ?
                    <div>
                    <div  data-tip="" data-for={`today_date_tt`} data-type="dark"
                     className="ws-today-div-main" style={{left: (this.props.todayLeftPixels)}}>
                        </div>
                        <ReactTooltip id={`today_date_tt`} ><span>Today : {todayDate.format('D-MMM-YYYY')}</span></ReactTooltip>
                        </div> : ''

                    }

                    <div className="saved-ws-chart-row">
                        {  selectedFilterType && selectedFilterType === 'ws-filter' ?
                        <div className="all-ws-filtered-charts">
                            {allWsArray && allWsArray.map((wsObj, wsInd) => (
                            <div key={`ws _${wsInd}`} className="each-ws-encloser">
                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                    {wsObj.chartWidth !== '100%' ?
                                        <>
                                            <div 
                                                data-tip
                                                data-for={`ws_chart_plan_startdate_hovertxt_${wsInd}`}
                                                data-place="top"
                                                id={`ws_chart_${wsInd}`}
                                                style={{ left: wsObj.chartLeft, width: '8px', top: '2px' }}
                                                // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                                className={"custom-gantt-chart-slider"}>
                                            </div>
                                            <ReactTooltip id={`ws_chart_plan_startdate_hovertxt_${wsInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{wsObj.name}</div>
                                                    <div>Planned Start Date : {(wsObj.startDate === null || wsObj.startDate === "") ? "" : Moment(new Date(wsObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                </div>
                                            </ReactTooltip>
                                        </> 
                                             : ''
                                    }

                                    <div id={`ws_chart_${wsInd}`}
                                        data-tip
                                        data-for={`ws_chart_hovertxt_${wsInd}`}
                                        data-place="top"
                                        style={{ left: wsObj.barLeft, width: wsObj.barWidth }}
                                        // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                        // className={`custom-gantt-chart
                                        // ${wsObj.startDate && wsObj.startDate !== '' ? 'ws-chart-color' : 'default-chart-color'}`}>
                                        className={`custom-gantt-chart ${'default-chart-color'}`}>

                                        {/* completed perc */}
                                        {wsObj.completionPercent === null || wsObj.completionPercent === "" ? "" :
                                            <div className="custom-gantt-chart-bar-coloured row" style={{

                                                // backgroundImage: `repeating-linear-gradient(to left, #ffffff 0%, #ffffff 50%, ${wsObj.chartColor} 64%`
                                                backgroundImage: `repeating-linear-gradient(
                                                    to right,
                                                    ${wsObj.chartColor},
                                                    #D0D0D0  2px,
                                                    #D0D0D0  4px,
                                                    ${wsObj.chartColor}  0px,
                                                    #D0D0D0 5px,
                                                   
                                                     #D0D0D0 110px
                                                  )`
                                            }}>

                                                <div className="coloured-solid" style={{ backgroundColor: wsObj.chartColor, left: wsObj.barLeft, width: (wsObj.completionPercent === 0 ? '100%' : `${wsObj.completionPercent}%`) }}>
                                                    {`${wsObj.completionPercent}%`}
                                                </div>
                                                <div className="coloured-striped" style={{ width: `calc( 100% - ${wsObj.completionPercent}% )` }} />
                                            </div>
                                        }
                                        {/* completed perc */}

                                    </div>
                                    <ReactTooltip id={`ws_chart_hovertxt_${wsInd}`}>
                                        <div>
                                            <div style={{ padding: "0px 0px 4px 0px" }}>{wsObj.name}</div>
                                            <div>Owner : {wsObj.owner}</div>
                                            <div>Status : {this.decodeStatus(wsObj.status)}</div>
                                            <div>Completion Percent : {(wsObj.completionPercent=== null || wsObj.completionPercent=== "")?"":`${wsObj.completionPercent}%`}</div>
                                            {wsObj.timelineStartDate && wsObj.timelineStartDate.length > 0 ?
                                                <div>{wsObj.timelineStartDate[0]} : {(wsObj.timelineStartDate[1] === null || wsObj.timelineStartDate[1] === "") ? "" : Moment(new Date(wsObj.timelineStartDate[1])).format('DD-MMM-YYYY')}</div>
                                                : ""}
                                            {wsObj.timelineEndDate && wsObj.timelineEndDate.length > 0 ?
                                                <div>{wsObj.timelineEndDate[0]} : {(wsObj.timelineEndDate[1] === null || wsObj.timelineEndDate[1] === "") ? "" : Moment(new Date(wsObj.timelineEndDate[1])).format('DD-MMM-YYYY')}</div>
                                                : ""}
                                        </div>
                                    </ReactTooltip>
                                    {wsObj.chartWidth !== '100%' ?
                                        <>
                                            <div
                                                data-tip
                                                data-for={`ws_chart_plan_enddate_hovertxt_${wsInd}`}
                                                data-place="top"
                                                id={`ws_chart_${wsInd}`}
                                                style={{ left: parseInt(wsObj.chartWidth) + parseInt(wsObj.chartLeft) - 8, width: '8px', top: '2px' }}
                                                // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                                className={"custom-gantt-chart-slider slider-end"}>
                                            </div>
                                            <ReactTooltip id={`ws_chart_plan_enddate_hovertxt_${wsInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{wsObj.name}</div>
                                                    <div>Planned End Date : {(wsObj.endDate === null || wsObj.endDate === "") ? "" : Moment(new Date(wsObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                </div>
                                            </ReactTooltip>
                                        </>: ''}
                                </div>

                            </div>
                            ))}
                            </div>
                            : selectedFilterType === 'act-filter' ?
                            <div className="all-act-filtered-charts">
                                {allActArray && allActArray.map((actObj, actInd) => (
                                    <div key={`ws_act_${actInd}`} className="each-act-encloser">
                                        <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            {actObj.chartWidth !== '100%' ?
                                                <>
                                                    <div 
                                                        data-tip
                                                        data-for={`ws_act_chart_startdate_${actInd}`}
                                                        data-place="top"  
                                                        id={`ws_act_chart_${actInd}`}
                                                        style={{ left: actObj.chartLeft, width: '8px', top: '2px' }}
                                                        className={"custom-gantt-chart-slider"}
                                                        // onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                        >
                                                    </div> 
                                                    <ReactTooltip id={`ws_act_chart_startdate_${actInd}`}>
                                                        <div>
                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                            <div>Planned Start Date : {(actObj.startDate === null || actObj.startDate === "") ? "" : Moment(new Date(actObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                        </div>
                                                    </ReactTooltip>
                                                </>:''}
                                            <div id={`act_chart_${actInd}`}
                                                style={{ left: actObj.barLeft, width: actObj.barWidth }}
                                                data-tip
                                                data-for={`ws_chart_hovertxt_act_chart_hovertxt_${actInd}`}
                                                data-place="top"
                                                //         className={`custom-gantt-chart
                                                // ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}`}
                                                className={`custom-gantt-chart ${'default-chart-color'}`}
                                                // onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                >
                                                {/* completed perc */}
                                                {actObj.complPercent === null || actObj.complPercent === "" ? "" :
                                                    <div className="custom-gantt-chart-bar-coloured row" style={{
                                                        // backgroundImage: `repeating-linear-gradient(to left, #ffffff 0%, #ffffff 50%, ${actObj.chartColor} 64%`
                                                        backgroundImage: `repeating-linear-gradient(
                                                            to right,
                                                            ${actObj.chartColor},
                                                            #D0D0D0  2px,
                                                            #D0D0D0  4px,
                                                            ${actObj.chartColor}  0px,
                                                            #D0D0D0 5px,
                                                           
                                                             #D0D0D0 110px
                                                          )`
                                                    }}>

                                                        <div className="coloured-solid" style={{ backgroundColor: actObj.chartColor, left: actObj.barLeft, width: (actObj.complPercent === 0 ? "100%" : `${actObj.complPercent}%`) }}>
                                                            {`${actObj.complPercent}%`}
                                                        </div>
                                                        <div className="coloured-striped" style={{ width: `calc( 100% - ${actObj.complPercent}% )` }} />
                                                    </div>
                                                }
                                                {/* completed perc */}
                                            </div>
                                            <ReactTooltip id={`ws_chart_hovertxt_act_chart_hovertxt_${actInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                    <div>Owner : {actObj.owner}</div>
                                                    <div>Status : {this.decodeStatus(actObj.status)}</div>
                                                    <div>Completion Percent : {(actObj.complPercent=== null || actObj.complPercent=== "")?"":`${actObj.complPercent}%`}</div>
                                                    {actObj.timelineStartDate && actObj.timelineStartDate.length > 0 ?
                                                        <div>{actObj.timelineStartDate[0]} : {(actObj.timelineStartDate[1] === null || actObj.timelineStartDate[1] === "") ? "" : Moment(new Date(actObj.timelineStartDate[1])).format('DD-MMM-YYYY')}</div>
                                                        : ""}
                                                    {actObj.timelineEndDate && actObj.timelineEndDate.length > 0 ?
                                                        <div>{actObj.timelineEndDate[0]} : {(actObj.timelineEndDate[1] === null || actObj.timelineEndDate[1] === "") ? "" : Moment(new Date(actObj.timelineEndDate[1])).format('DD-MMM-YYYY')}</div>
                                                        : ""}
                                                </div>
                                            </ReactTooltip>
                                            {actObj.chartWidth !== '100%' ?
                                                <>
                                                    <div 
                                                        data-tip
                                                        data-for={`ws_act_chart_enddate_${actInd}`}
                                                        data-place="top" 
                                                        id={`ws_act_chart_${actInd}`}
                                                        style={{ left: parseInt(actObj.chartWidth) + parseInt(actObj.chartLeft) - 8, width: '8px', top: '2px' }}
                                                        className={"custom-gantt-chart-slider slider-end"}
                                                        // onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                        >
                                                    </div> 
                                                    <ReactTooltip id={`ws_act_chart_enddate_${actInd}`}>
                                                        <div>
                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                            <div>Planned End Date : {(actObj.endDate === null || actObj.endDate === "") ? "" : Moment(new Date(actObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                        </div>
                                                    </ReactTooltip>

                                                </>: ''}
                                        </div>
                                    </div>
                                ))} 
                                </div>
                                : selectedFilterType === 'del-filter' ?
                                    <div className="all-del-filtered-charts">
                                        {allDelArray && allDelArray.map((delObj, delInd) => (
                                            <div key={`ws_act_del_${delInd}`} className="each-del-encloser">
                                                 <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>                                                    

                                                    <ContextMenuTrigger id={`del_context`}>
                                                        {
                                                            delObj.chartWidth !== '100%' ?
                                                                <>
                                                                    <div 
                                                                        data-tip
                                                                        data-for={`ws_act_del_chart_startdate_${delInd}`}
                                                                        data-place="top" 
                                                                        id={`ws_act_del_chart_${delInd}`}
                                                                        style={{ left: delObj.chartLeft, width: '8px', top: '2px' }}
                                                                        className={`custom-gantt-chart-slider ws_act_del_class_${delInd}`}
                                                                    >
                                                                    </div> 
                                                                    <ReactTooltip id={`ws_act_del_chart_startdate_${delInd}`}>
                                                                        <div>
                                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                            <div>Planned Start Date : {(delObj.startDate === null || delObj.startDate === "") ? "" : Moment(new Date(delObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                                        </div>
                                                                    </ReactTooltip>
                                                                </>
                                                                : ''
                                                        }
                                                        <div id={`ws_act_del_chart_${delInd}`}
                                                            data-menu-type={`del_context`}
                                                            
                                                            data-tip
                                                            data-for={`ws_chart_hovertxt_act_chart_hovertxt_del_chart_hovertxt_${delInd}`}
                                                            data-place="top"
                                                            
                                                            style={{ left: delObj.barLeft, width: delObj.barWidth }}
                                                            className={`custom-gantt-chart ws_act_del_class_${delInd}
                                                            ${ 'default-chart-color'}`}
                                                        >
                                                            {/* completed perc */}
                                                            {delObj.complPercent === null || delObj.complPercent === "" ? "" :
                                                                <div className="custom-gantt-chart-bar-coloured row" style={{
                                                                    //  backgroundImage: `repeating-linear-gradient(to left, #ffffff 0%, #ffffff 50%, ${delObj.chartColor} 64%` 
                                                                    backgroundImage: `repeating-linear-gradient(
                                                                    to right,
                                                                    ${delObj.chartColor},
                                                                    #D0D0D0  2px,
                                                                    #D0D0D0  4px,
                                                                    ${delObj.chartColor}  0px,
                                                                    #D0D0D0 5px,                                                                   
                                                                     #D0D0D0 110px
                                                                  )`}}>

                                                                    <div className="coloured-solid" style={{ backgroundColor: delObj.chartColor, left: delObj.barLeft, width: (delObj.complPercent === 0 ? '100%' : `${delObj.complPercent}%`) }}>
                                                                        {`${delObj.complPercent}%`}
                                                                    </div>
                                                                    <div className="coloured-striped" style={{ width: `calc( 100% - ${delObj.complPercent}% )` }} />
                                                                </div>
                                                            }
                                                            {/* completed perc */}
                                                            {/* <span className="whole-width-replica">
                                                                <span className={`left-span ws_${wsInd}_act_${actInd}_del_left_class_${delInd}`}></span>
                                                                <span className={`middle-span`}></span>
                                                                <span className={`right-span ws_${wsInd}_act_${actInd}_del_right_class_${delInd}`}></span>

                                                            </span> */}
                                                        </div>
                                                        <ReactTooltip id={`ws_chart_hovertxt_act_chart_hovertxt_del_chart_hovertxt_${delInd}`}>
                                                            <div>
                                                                <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                <div>Owner : {delObj.owner}</div>
                                                                <div>Status : {this.decodeStatus(delObj.status)}</div>
                                                                <div>Completion Percent : {(delObj.complPercent=== null || delObj.complPercent=== "")?"":`${delObj.complPercent}%`}</div>
                                                                {delObj.timelineStartDate && delObj.timelineStartDate.length > 0 ?
                                                                    <div>{delObj.timelineStartDate[0]} : {(delObj.timelineStartDate[1] === null || delObj.timelineStartDate[1] === "") ? "" : Moment(new Date(delObj.timelineStartDate[1])).format('DD-MMM-YYYY')}</div>
                                                                    : ""}
                                                                {delObj.timelineEndDate && delObj.timelineEndDate.length > 0 ?
                                                                    <div>{delObj.timelineEndDate[0]} : {(delObj.timelineEndDate[1] === null || delObj.timelineEndDate[1] === "") ? "" : Moment(new Date(delObj.timelineEndDate[1])).format('DD-MMM-YYYY')}</div>
                                                                    : ""}
                                                            </div>
                                                        </ReactTooltip>
                                                        {
                                                            delObj.chartWidth !== '100%' ?
                                                                <>
                                                                    <div 
                                                                        data-tip
                                                                        data-for={`ws_act_del_chart_enddate_${delInd}`}
                                                                        data-place="top" 
                                                                        id={`ws_act_del_chart_${delInd}`}
                                                                        style={{ left: parseInt(delObj.chartLeft) + parseInt(delObj.chartWidth) - 8, width: '8px', top: '2px' }}
                                                                        className={`custom-gantt-chart-slider slider-end ws_act_del_class_${delInd}`}
                                                                    >
                                                                    </div> 
                                                                    <ReactTooltip id={`ws_act_del_chart_enddate_${delInd}`}>
                                                                        <div>
                                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                            <div>Planned End Date : {(delObj.endDate === null || delObj.endDate === "") ? "" : Moment(new Date(delObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                                        </div>
                                                                    </ReactTooltip>

                                                                </>: ''}
                                                    </ContextMenuTrigger>
                                                </div>
                                            </div>
                                        ))}
                                    </div> 
                                    : ''
                        }

                    </div>
                </div>               
               
            </div>
        )
    }
}

export default withRouter(DefineWSActualsFilterGanttCharts);
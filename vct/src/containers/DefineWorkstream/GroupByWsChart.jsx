import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import Moment from 'moment';

import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
// import ActivityDetailsModal from '../ActivityModal/ActivityDetailsModal'
import './AllWsInfoAndCharts.css';
import DefineWSGroupByChart from '../DefineWorkstream/DefineWSGroupByChart';
import WsTimelineHeader from '../DefineWsTimeline/WsTimelineHeader'
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from '../DefineWsTimeline/DateConstants';
import { DAY_MONTH_MODE, DAY_DAY_MODE, DAY_YEAR_MODE } from '../DefineWsTimeline/DateConstants';
import DateHelper from '../DefineWsTimeline/DateHelper';
import rightIndIcon from '../../assets/project/workstream/right-ind.svg';
import downIndIcon from '../../assets/project/workstream/down-ind.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import './AllWsInfoAndCharts.css';

@inject('workstreamStore')
class GroupByWsChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // timeline change variables
            numOfDiffDays: 1,
            singleDayWidth: 3,
            bufferDays: 30,

            // connectors and all deliverables variables
            allDelIdObj: {},

            //  delete confirm box state variables for Workstream
            deleteWsModalVisible: "",
            deleteWsModalTitle: "",

            //  delete confirm box state variables for activity
            deleteActModalVisible: '',
            deleteActModalTitle: '',
            deleteActWsIndex: '',
            deleteActIndex: '',
            //  delete confirm box state variables for deliverable
            deleteDelModalVisible: '',
            deleteDelModalTitle: '',
            deleteDelActIndex: '',
            deleteDelWsIndex: '',
            deleteDelIndex: '',
            // new ws design state variables
            showLoadingInd: true,
            showEllipsisMenu: false,
            openMenuType: '',
            addedNewWsArray: [],
            overAllStartDate: '',
            overAllEndDate: '',
            allWsDataArray: [],
        };
        this.chartContainerRef = React.createRef();

        this.isDefined = this.isDefined.bind(this);

        // new vpmo designs changes
        this.assignDateMode = this.assignDateMode.bind(this);


    }

    componentDidMount() {

        this.fetchGroupByDetails();

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.groupBy !== this.props.groupBy || prevProps.group !== this.props.group) {
            this.fetchGroupByDetails();
        }
        if (prevProps.selectedDateMode !== this.props.selectedDateMode) {
            this.assignDateMode();
        }
    }

    getDayWidth = (mode) => {
        switch (mode) {
            case VIEW_MODE_DAY:
                return DAY_DAY_MODE;
            case VIEW_MODE_MONTH:
                return DAY_MONTH_MODE;
            case VIEW_MODE_YEAR:
                return DAY_YEAR_MODE;
            default:
                return DAY_MONTH_MODE;
        }
    }

    // Accepts the array and key
    groupBy = (array, key) => {
        // Return the end result
        return array.reduce((result, currentValue) => {
            // If an array already present for key, push it to the array. Else create an array and push the object
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue
            );
            // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
            return result;
        }, {}); // empty object is the initial value for result object
    };

    getBufferDays = (mode, diffDays, dayWidth) => {
        let buffer = 30;
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = overAllStartDate;
        let startday = '';
        let temp = '';
        let originalStart = '';

        if (this.chartContainerRef && this.chartContainerRef.current) {
            let chart_viewport = this.chartContainerRef.current.clientWidth;
            buffer = Number(diffDays) - Math.ceil(chart_viewport / dayWidth);
            if (buffer > 0) {

                if (mode === 'month') {
                    buffer = 0;
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    if (originalStart < 10) {
                        buffer = originalStart + startdateWithBuffer.subtract(1, 'months').daysInMonth()
                    } else {
                        buffer = originalStart;
                    }

                } else if (mode === 'year') {
                    buffer = 0;
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    if (originalStart < 150) {
                        buffer = originalStart + startdateWithBuffer.subtract(1, 'years').daysInMonth()
                    } else {
                        buffer = originalStart;
                    }

                } else {
                    buffer = 1;
                }
            } else {
                buffer = Math.ceil((buffer * -1) / 2);
                if (mode === 'month') {
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    buffer = buffer + originalStart;
                }

            }
        }
        return buffer;
       

    }

    setPixesForAllDates = (dayWidth, buffer_days) => {
        const { allWsDataArray } = this.state;
        let testTop = 0;
        let allDeliverablesArray = [];

        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(allWsDataArray));
        allWsDataArrayView.map((depObj, depInd) => {

            let chartObj = this.eachChartToPixels(depObj, dayWidth, buffer_days);
            depObj.chartLeft = chartObj.chartLeft;
            depObj.chartWidth = chartObj.chartWidth;

            testTop = testTop + 8; // 8 = chart top paddingg
            depObj.chartTop = testTop;
            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

            this.props.group === 'Workstream' && depObj.listWsDtos.map((wsObj, wsInd) => {
                let chartObj = this.eachChartToPixels(wsObj, dayWidth, buffer_days);
                wsObj.chartLeft = chartObj.chartLeft;
                wsObj.chartWidth = chartObj.chartWidth;
                testTop = testTop + 8; // 8 = chart top paddingg
                wsObj.chartTop = testTop;
                testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)
            });
            // loop over all activities
            this.props.group === 'Activity' && depObj.listActivityDtos.map((actObj, actInd) => {
                let chartObj = this.eachChartToPixels(actObj, dayWidth, buffer_days);
                actObj.chartLeft = chartObj.chartLeft;
                actObj.chartWidth = chartObj.chartWidth;
                testTop = testTop + 8; // 8 = chart top paddingg
                actObj.chartTop = testTop;
                testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)
            });
            // loop over all deliverables
            this.props.group === 'Deliverable' && depObj.listDeliverables.map((delObj, delInd) => {
                let chartObj = this.eachChartToPixels(delObj, dayWidth, buffer_days);
                delObj.chartLeft = chartObj.chartLeft;
                delObj.chartWidth = chartObj.chartWidth;
                testTop = testTop + 8; // 8 = chart top paddingg
                delObj.chartTop = testTop;
                testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)
                // loop over all milestones
                delObj.milestones !== null && delObj.milestones.map((milestoneObj, mileInd) => {
                    this.eachMilestoneToPixels(milestoneObj, dayWidth, buffer_days);
                })


            });

            if (this.props.group === 'Deliverable') {
                // add del array
                allDeliverablesArray = [...allDeliverablesArray, ...depObj.listDeliverables];
            }

            this.props.group === 'Milestone' && depObj.listMilestoneDTOs.map((milestoneObj, mileInd) => {
                this.eachMilestoneToPixels(milestoneObj, dayWidth, buffer_days);
            });
        });

        const tempObj = this.groupBy(allDeliverablesArray, 'deliverableId'); // group by deli ids, use it in dependent deliverables

        // return the both wsdata array and all del array grouped by id
        let obj = {
            'allWsDataArrayView': allWsDataArrayView,
            'allDelIdObj': tempObj
        }
        return obj;
    }
    eachChartToPixels = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) {
            let leftPixels = DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer);
            let rightPixels = DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = (widthPixels + dayWidth) + 'px';
        } else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
        }

        return chartObj;
    }

    eachMilestoneToPixels = (mileObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(mileObj.milestoneDate) && this.isNonEmpty(mileObj.milestoneDate)) {
            let leftPixels = DateHelper.dateToPixel(mileObj.milestoneDate, dayWidth, startdateWithBuffer);

            // remove 6 px (half of icon width) to make icon to point to start of a milestone date
            leftPixels = Number(leftPixels) - 6;

            // add half of the day-width to make icon visible at the centre of milestone date
            leftPixels = leftPixels + (dayWidth / 2);

            mileObj['milestoneLeft'] = leftPixels + 'px';
            // chartObj['chartWidth']= (widthPixels + dayWidth)+ 'px';
        } else {
            mileObj['milestoneLeft'] = 0;
            // chartObj['chartWidth']= '100%';
        }

        return mileObj;
    }

    assignDateMode = () => {
        const { selectedDateMode, workstreamStore } = this.props;
        const { overAllStartDate, overAllEndDate } = this.state;
        if (overAllStartDate && overAllStartDate !== '') {
            let daysDiff = Moment(overAllEndDate).diff(Moment(overAllStartDate), 'days');
            let dayWidth = this.getDayWidth(selectedDateMode);
            let buffer_days = this.getBufferDays(selectedDateMode, daysDiff, dayWidth);
            let alteredObj = this.setPixesForAllDates(dayWidth, buffer_days);
            this.setState({
                numOfDiffDays: daysDiff,
                singleDayWidth: dayWidth,
                bufferDays: buffer_days,
                allWsDataArray: alteredObj.allWsDataArrayView,
                allDelIdObj: alteredObj.allDelIdObj
            }, () => { console.log(""); });
        } else {
            workstreamStore.sumOfBoxesWidth = '100%'
        }
    }

    buildAllServiceDataToState = (serviceData) => {

        let startDate = serviceData.overAllStartDate;
        let endDate = serviceData.overAllEndDate;
     
        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(this.props.groupBy === 'Department' ? serviceData.allDepartments : serviceData.allOwners));
        allWsDataArrayView && allWsDataArrayView.map((depObj, depInd) => {
            depObj['chartLeft'] = 0;
            depObj['chartRight'] = 0;
            depObj['chartTop'] = 0;
            depObj['chartWidth'] = '100%';
            this.props.group === 'Workstream' &&
                depObj.listWsDtos.map((wsObj, wsInd) => {
                    wsObj['chartLeft'] = 0;
                    wsObj['chartRight'] = 0;
                    wsObj['chartTop'] = 0;
                    wsObj['chartWidth'] = '100%';
                });
            this.props.group === 'Activity' && depObj.listActivityDtos.map((actObj, actInd) => {
                actObj['chartLeft'] = 0;
                actObj['chartRight'] = 0;
                actObj['chartTop'] = 0;
                actObj['chartWidth'] = '100%';
            });
            this.props.group === 'Deliverable' && depObj.listDeliverables.map((delObj, delInd) => {
                delObj['chartLeft'] = 0;
                delObj['chartRight'] = 0;
                delObj['chartTop'] = 0;
                delObj['chartWidth'] = '100%';
                delObj.milestones !== null && delObj.milestones.map(mileObj => {
                    mileObj['milestoneLeft'] = 0;
                })
            });
            this.props.group === 'Milestones' && depObj.listMilestoneDTOs.map((milestoneObj, mileInd) => {
                milestoneObj['milestoneLeft'] = 0;
            });
        });
        this.setState({
            allWsDataArray: allWsDataArrayView,
            overAllStartDate: startDate,
            overAllEndDate: endDate,
            showLoadingInd: false
        }, () => {
            this.assignDateMode();
        });
    }

    fetchGroupByDetails() {
        const { workstreamStore } = this.props;
        this.setState({
            showLoadingInd: true
        });
        workstreamStore.fetchGroupByDetails(this.props.keyPath)
            .then(response => {
                if (response && !response.error && response.data) {
                    if (response.data.resultCode === "OK") {
                        const resultObj = response.data.resultObj;
                        this.setState({
                            showLoadingInd: false
                        });
                        this.buildAllServiceDataToState(resultObj);
                       

                    } else if(response.data.resultCode === "KO"){
                        this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                    }
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    
                }

            });

    }


    // ----- START of Utility functions -------
    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    isNonEmpty = (value) => {
        return value !== '';
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

        const { addedNewWsArray, allWsDataArray, showLoadingInd } = this.state;
        const { groupBy, group } = this.props;
       
        return (
            <div className="dws-tab-content-wrapper">
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                    </div> :
                    ((allWsDataArray && allWsDataArray.length === 0) && group === "Milestone") ?
                        <div className="no-ws-msg row" style={{ marginTop: "0px", fontSize: "14px" }}>There are No Milestones Added</div>
                        :
                        <Fragment>

                            <div className="all-wda-info-main row group-by-view-main">
                                <div className="all-ws-tree-main">
                                    {this.state.overAllStartDate && this.state.overAllStartDate !== '' ?
                                        <div className="no-content-div">
                                        </div> : ''
                                    }
                                    <div className="ws-tree-wrapper">
                                        {/* saved and existing workstream data and its activities and deliverables */}
                                        {allWsDataArray && allWsDataArray.map((depObj, depInd) => (
                                            <div key={`dep_${depInd}`} className="row each-ws-row">
                                                {/* workstreams of departments */}
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${depObj.isWsInputEnabled ? 'name-input' : 'name-label'}`} style={{ background: "none" }}>
                                                        {/* <div className="ws-indicator">
                                                            {depObj.listWsDtos && depObj.listWsDtos.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            }
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            <label
                                                                // onDoubleClick={() => { this.makeInputHandlerWs('ws', wsInd) }}
                                                                className="ws-name-label">
                                                                {(groupBy === "Department" ? depObj.departmentName && depObj.departmentName.length > 0 : depObj.ownerName && depObj.ownerName.length > 0) ?
                                                                    <Fragment>
                                                                        {(groupBy === "Department" ? depObj.departmentName.length > 16 : depObj.ownerName.length > 16) ?
                                                                            <Fragment><span data-tip="" data-for={`dep_name_tt_${depInd}`} data-type="dark" data-place="right" className="ws-name-display">{groupBy === "Department" ? depObj.departmentName.substr(0, 16) : depObj.ownerName.substr(0, 16)}...</span>
                                                                                <ReactTooltip id={`dep_name_tt_${depInd}`}>{groupBy === "Department" ? depObj.departmentName : depObj.ownerName}</ReactTooltip>
                                                                            </Fragment>
                                                                            : <span className="ws-name-display">{groupBy === "Department" ? depObj.departmentName : depObj.ownerName}</span>
                                                                        }
                                                                    </Fragment>

                                                                    : <span className="ws-name-placeholder">Department Name not added</span>
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* end of dep */}
                                                {/* existing or saved workstream only row */}
                                                {this.props.group === "Workstream" && depObj && depObj.listWsDtos && depObj.listWsDtos.map((wsObj, wsInd) => (
                                                    <div key={`dep_${depInd}_ws_${wsInd}`} className="act-and-del-binder" style={{ width: "100%" }}>
                                                        <div className="col-sm-12">
                                                            <div className={`ws-name-row ${wsObj.isWsInputEnabled ? 'name-input' : 'name-label'}`} style={{ background: "none", marginLeft: "20px" }}>
                                                                {/* <div className="ws-indicator">
                                                                    {/* {wsObj.tvroWsActivityDtos && wsObj.tvroWsActivityDtos.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            } */}
                                                                {/* </div>  */}
                                                                <div className="ws-name-div">
                                                                    <label
                                                                        // onDoubleClick={() => { this.makeInputHandlerWs('ws', wsInd) }}
                                                                        className="ws-name-label">
                                                                        {wsObj.name.length > 0 ?
                                                                            <Fragment>
                                                                                {wsObj.name.length > 16 ?
                                                                                    <Fragment><span data-tip="" data-for={`dep_${depInd}_ws_name_tt_${wsInd}`} data-type="dark" data-place="right" className="ws-name-display">{wsObj.name.substr(0, 16)}...</span>
                                                                                        <ReactTooltip id={`dep_${depInd}_ws_name_tt_${wsInd}`}>{wsObj.name}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-display">{wsObj.name}</span>
                                                                                }
                                                                            </Fragment>

                                                                            : <span className="ws-name-placeholder">Add Workstream</span>
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div></div>))}
                                                {this.props.group === "Activity" && depObj && depObj.listActivityDtos && depObj.listActivityDtos.map((actObj, actInd) => (
                                                    <div key={`dep_${depInd}_act_${actInd}`} className="act-and-del-binder" style={{ width: "100%" }}>
                                                        <div className="col-sm-12">
                                                            <div className={`act-name-row ${actObj.isWsInputEnabled ? 'name-input' : 'name-label'}`} style={{ background: "none" }}>
                                                                {/* <div className="ws-indicator"> */}
                                                                    {/* {wsObj.tvroWsActivityDtos && wsObj.tvroWsActivityDtos.length > 0 ?
                                                            <img src={downIndIcon} alt="open"></img>
                                                            : <img src={rightIndIcon} alt="close"></img>
                                                        } */}
                                                                {/* </div> */}
                                                                <div className="ws-name-div">
                                                                    <label
                                                                        // onDoubleClick={() => { this.makeInputHandlerWs('ws', wsInd) }}
                                                                        className="ws-name-label">
                                                                        {actObj.name.length > 0 ?
                                                                            <Fragment>
                                                                                {actObj.name.length > 16 ?
                                                                                    <Fragment><span data-tip="" data-for={`dep_${depInd}_act_name_tt_${actInd}`} data-type="dark" data-place="right" className="ws-name-display">{actObj.name.substr(0, 16)}...</span>
                                                                                        <ReactTooltip id={`dep_${depInd}_act_name_tt_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-display">{actObj.name}</span>
                                                                                }
                                                                            </Fragment>

                                                                            : <span className="ws-name-placeholder">Add Workstream</span>
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div></div>))}
                                                {this.props.group === "Deliverable" && depObj && depObj.listDeliverables && depObj.listDeliverables.map((delObj, delInd) => (
                                                    <div key={`dep_${depInd}_del_${delInd}`} className="act-and-del-binder" style={{ width: "100%" }}>
                                                        <div className="col-sm-12">
                                                            <div className={`del-name-row ${delObj.isWsInputEnabled ? 'name-input' : 'name-label'}`} style={{ background: "none" }}>
                                                                {/* <div className="ws-indicator">
                                                                </div> */}
                                                                <div className="ws-name-div">
                                                                    <label
                                                                        // onDoubleClick={() => { this.makeInputHandlerWs('ws', wsInd) }}
                                                                        className="ws-name-label">
                                                                        {delObj.name.length > 0 ?
                                                                            <Fragment>
                                                                                {delObj.name.length > 16 ?
                                                                                    <Fragment><span data-tip="" data-for={`dep_${depInd}_del_name_tt_${delInd}`} data-type="dark" data-place="right" className="ws-name-display">{delObj.name.substr(0, 16)}...</span>
                                                                                        <ReactTooltip id={`dep_${depInd}_del_name_tt_${delInd}`}>{delObj.name}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-display">{delObj.name}</span>
                                                                                }
                                                                            </Fragment>

                                                                            : <span className="ws-name-placeholder">Add Workstream</span>
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>))}
                                                {this.props.group === "Milestone" && depObj && depObj.listMilestoneDTOs && depObj.listMilestoneDTOs.map((milObj, milInd) => (
                                                    <div key={`dep_${depInd}_mil_${milInd}`} className="act-and-del-binder" style={{ width: "100%" }}>
                                                        <div className="col-sm-12">
                                                            <div className={`del-name-row ${milObj.isWsInputEnabled ? 'name-input' : 'name-label'}`} style={{ background: "none" }}>
                                                                {/* <div className="ws-indicator"> */}
                                                                    {/* {wsObj.tvroWsActivityDtos && wsObj.tvroWsActivityDtos.length > 0 ?
                                                            <img src={downIndIcon} alt="open"></img>
                                                            : <img src={rightIndIcon} alt="close"></img>
                                                        } */}
                                                                {/* </div> */}
                                                                <div className="ws-name-div">
                                                                    <label
                                                                        className="ws-name-label">
                                                                        {milObj.milestone.length > 0 ?
                                                                            <Fragment>
                                                                                {milObj.milestone.length > 16 ?
                                                                                    <Fragment><span data-tip="" data-for={`dep_${depInd}_mile_name_tt_${milInd}`} data-type="dark" data-place="right" className="ws-name-display">{milObj.milestone.substr(0, 16)}...</span>
                                                                                        <ReactTooltip id={`dep_${depInd}_mile_name_tt_${milInd}`}>{milObj.milestone}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-display">{milObj.milestone}</span>
                                                                                }
                                                                            </Fragment>

                                                                            : <span className="ws-name-placeholder">Milestone name not added</span>
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div></div>))}
                                            </div>
                                        ))
                                        }
                                    </div>
                                </div>
                                <ScrollSync>
                                    <div className="all-ws-chart-main" id="all_ws_chart_main">
                                        {this.state.overAllStartDate && this.state.overAllStartDate !== '' ?
                                            <ScrollSyncPane>
                                                <div ref={this.chartContainerRef} className="ws-timeline-header-main">
                                                    <WsTimelineHeader
                                                        numVisibleDays={this.state.numOfDiffDays}
                                                        currentday={0}
                                                        nowposition={0}
                                                        overAllStartDate={this.state.overAllStartDate}
                                                        bufferDays={this.state.bufferDays}
                                                        dayWidth={this.state.singleDayWidth}
                                                        mode={this.props.selectedDateMode}
                                                    >
                                                    </WsTimelineHeader>
                                                </div>
                                            </ScrollSyncPane>
                                            : ''}
                                        <ScrollSyncPane>
                                            <DefineWSGroupByChart
                                                addedNewWsArray={addedNewWsArray}
                                                allWsDataArray={allWsDataArray}
                                                allDelIdObj={this.state.allDelIdObj}
                                                hideConnectors={this.props.hideConnectors}
                                                fetchGroupByDetails={this.fetchGroupByDetails}
                                                deleteDeliverableHandler={this.deleteDeliverableHandler}
                                                selectedDateMode={this.props.selectedDateMode}
                                                keyPath={this.props.keyPath}
                                                group={this.props.group}
                                                groupBy={this.props.groupBy}
                                            ></DefineWSGroupByChart>
                                        </ScrollSyncPane>
                                    </div>
                                </ScrollSync>
                            </div>
                        </Fragment>
                }
            </div>
        )
    }
}

export default withRouter(GroupByWsChart);
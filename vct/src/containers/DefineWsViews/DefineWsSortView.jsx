import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import Moment from 'moment';

import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import DefineWsSortGanttCharts from '../DefineWsViews/DefineWsSortGanttCharts';
import '../DefineWorkstream/AllWsInfoAndCharts.css';
import WsTimelineHeader from '../DefineWsTimeline/WsTimelineHeader'
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from '../DefineWsTimeline/DateConstants';
import { DAY_MONTH_MODE, DAY_DAY_MODE, DAY_YEAR_MODE } from '../DefineWsTimeline/DateConstants';
import DateHelper from '../DefineWsTimeline/DateHelper';

import rightIndIcon from '../../assets/project/workstream/right-ind.svg';
import downIndIcon from '../../assets/project/workstream/down-ind.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

@inject('workstreamStore')
class AllWsInfoAndCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // timeline change variables
            numOfDiffDays: 1,
            singleDayWidth: 3,
            bufferDays: 30,

            // connectors and all deliverables variables
            allDelIdObj: {},

            // new ws design state variables
            showLoadingInd: true,
            showEllipsisMenu: false,
            openMenuType: '',
            addedNewWsArray: [],
            overAllStartDate: '',
            overAllEndDate: '',
            allWsDataArray: []
        };
        this.chartContainerRef = React.createRef();

        this.isDefined = this.isDefined.bind(this);
        this.assignDateMode = this.assignDateMode.bind(this);
        this.fetchAllWsTreeDetailsSort = this.fetchAllWsTreeDetailsSort.bind(this);
    }

    componentDidMount() {
        this.fetchAllWsTreeDetailsSort();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selectedDateMode !== this.props.selectedDateMode) {
            this.assignDateMode();
        }
        if (this.props.selectedSortKeys.length !== 0 && prevProps.selectedSortKeys[0] !== this.props.selectedSortKeys[0]) {
            this.setState({
                showLoadingInd: true,
            })
            this.fetchAllWsTreeDetailsSort();
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
        // switch (mode) {
        //     case VIEW_MODE_DAY:
        //       return 0;         
        //     case VIEW_MODE_MONTH:
        //       return 30;
        //     case VIEW_MODE_YEAR:
        //       return 30;
        //     default:
        //       return 30;
        //   }

    }

    setPixesForAllDates = (dayWidth, buffer_days) => {
        const { allWsDataArray } = this.state;

        let allDeliverablesArray = [];
        let testTop = 0;

        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(allWsDataArray));
        allWsDataArrayView.map((wsObj, wsInd) => {

            let chartObj = this.eachChartToPixels(wsObj, dayWidth, buffer_days);
            wsObj.chartLeft = chartObj.chartLeft;
            wsObj.chartWidth = chartObj.chartWidth;

            testTop = testTop + 8; // 8 = chart top paddingg
            wsObj.chartTop = testTop;
            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

            // loop over all activities
            wsObj.activities.map((actObj, actInd) => {
                let chartObj = this.eachChartToPixels(actObj, dayWidth, buffer_days);
                actObj.chartLeft = chartObj.chartLeft;
                actObj.chartWidth = chartObj.chartWidth;

                testTop = testTop + 8;
                actObj.chartTop = testTop;
                testTop = testTop + 36;

                // loop over all deliverables
                actObj.deliverables.map((delObj, delInd) => {
                    let chartObj = this.eachChartToPixels(delObj, dayWidth, buffer_days);
                    delObj.chartLeft = chartObj.chartLeft;
                    delObj.chartWidth = chartObj.chartWidth;

                    testTop = testTop + 8;
                    delObj.chartTop = testTop;
                    testTop = testTop + 36;

                    // loop over all milestones
                    delObj.milestones.map((mileObj, mileInd) => {
                        let mileIconObj = this.eachMilestoneToPixels(mileObj, dayWidth, buffer_days);
                    });

                    const milestonesGroupedByDate = this.groupBy(delObj.milestones, 'milestoneDate');
                    // console.log('group by: ' + milestonesGroupedByDate);

                    delObj['milestonesGroup'] = milestonesGroupedByDate;

                });
                // add del array
                allDeliverablesArray = [...allDeliverablesArray, ...actObj.deliverables];
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
        const { overAllStartDate, overAllEndDate } = this.state;
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
            });
        } else {
            workstreamStore.sumOfBoxesWidth = '100%'
        }
    }

    buildAllServiceDataToState = (serviceData) => {

        let startDate = serviceData.overAllStartDate;
        let endDate = serviceData.overAllEndDate;
        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(serviceData.allWsDetailsDtoList));
        allWsDataArrayView.map((wsObj, wsInd) => {

            wsObj['isWsInputEnabled'] = false;
            wsObj['isWsMenuClicked'] = false;
            wsObj['addedActivities'] = [];
            wsObj['chartLeft'] = 0;
            wsObj['chartRight'] = 0;
            wsObj['chartTop'] = 0;
            wsObj['chartWidth'] = '100%';
            wsObj.activities.map((actObj, actInd) => {
                actObj['isActInputEnabled'] = false;
                actObj['isActMenuClicked'] = false;
                actObj['chartLeft'] = 0;
                actObj['chartRight'] = 0;
                actObj['chartTop'] = 0;
                actObj['chartWidth'] = '100%';
                actObj['addedDeliverables'] = [];
                actObj.deliverables.map((delObj, delInd) => {
                    delObj['addedMilestones'] = [];
                    delObj['isDelInputEnabled'] = false;
                    delObj['chartLeft'] = 0;
                    delObj['chartRight'] = 0;
                    delObj['chartTop'] = 0;
                    delObj['chartWidth'] = '100%';
                    delObj['milestonesGroup'] = {};
                    delObj.milestones.map(mileObj => {
                        mileObj['milestoneLeft'] = 0;
                    })
                });
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
    // -- Sorting -- //
    fetchAllWsTreeDetailsSort() {
        const { selectedSortKeys, workstreamStore } = this.props;
        if (selectedSortKeys.length !== 0) {
            workstreamStore.fetchAllWsTreeDetailsSort(this.props.sortBy, this.props.sortType)
                .then(response => {

                    if (response && !response.error && response.data) {
                        if (response.data.resultCode === "OK") {
                            const resultObj = response.data.resultObj;
                            const resultArray = response.data.resultObj.allWsDetailsDtoList;
                            this.setState({
                                showLoadingInd: false
                            });
                            this.buildAllServiceDataToState(resultObj);

                            this.props.wsListArray(resultArray.length > 0);

                        } else {
                           
                        }
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        
                    }

                });
        }
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

    // ------------ END of all common handlers for save,input,keydown,doubleclick -----------

    render() {

        const { addedNewWsArray, allWsDataArray, showLoadingInd } = this.state;
        const sortable = this.props.selectedSortKeys.length === 0;

        return (
            <div className="dws-tab-content-wrapper">
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                    </div>
                    : ((addedNewWsArray && addedNewWsArray.length === 0) && (allWsDataArray && allWsDataArray.length === 0)) ?
                        <div className="no-ws-msg row">To begin, add&nbsp; <span className="clickable-span" id="add_ws_on_empty" onClick={() => { this.addNewWsName() }}>Workstreams</span></div>
                        :
                        <Fragment>

                            <div className="all-wda-info-main row sorted-view-main">
                                <div className="all-ws-tree-main">
                                    {this.state.overAllStartDate && this.state.overAllStartDate !== '' ?
                                        <div className="no-content-div">
                                        </div> : ''
                                    }
                                    <div className="ws-tree-wrapper">
                                        {/* saved and existing workstream data and its activities and deliverables */}
                                        {allWsDataArray && allWsDataArray.map((wsObj, wsInd) => (
                                            <div key={`ws_${wsInd}`} className="row each-ws-row">
                                                {/* existing or saved workstream only row */}
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${wsObj.isWsInputEnabled && sortable ? 'name-input' : 'name-label'}`}>
                                                        {/* <div className="ws-indicator">
                                                            {wsObj.activities && wsObj.activities.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            }
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            <label className="ws-name-label">
                                                                {wsObj.name.length > 0 ?
                                                                    <Fragment>
                                                                        {wsObj.name.length > 16 ?
                                                                            <Fragment><span data-tip="" data-for={`ws_name_tt_${wsInd}`} data-type="dark" data-place="right" className="ws-name-display">{wsObj.name.substr(0, 16)}...</span>
                                                                                <ReactTooltip id={`ws_name_tt_${wsInd}`}>{wsObj.name}</ReactTooltip>
                                                                            </Fragment>
                                                                            : <span className="ws-name-display">{wsObj.name}</span>
                                                                        }
                                                                    </Fragment>

                                                                    : <span className="ws-name-placeholder">Add Workstream</span>
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* all saved  and new activities rows */}
                                                <div className="all-act-in-ws">
                                                    {/* existing or saved activities rows only */}
                                                    {wsObj && wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                                        <div key={`ws_${wsInd}_act_${actInd}`} className="act-and-del-binder">
                                                            <div className="col-sm-12">
                                                                <div className={`act-name-row ${actObj.isActInputEnabled && sortable ? 'name-input' : 'name-label'}`}>
                                                                    {/* <div className="ws-indicator">
                                                                        {actObj.deliverables && actObj.deliverables.length > 0 ?
                                                                            <img src={downIndIcon} alt="open"></img>
                                                                            : <img src={rightIndIcon} alt="close"></img>
                                                                        }
                                                                    </div> */}
                                                                    <div className="ws-name-div">
                                                                        <label className="ws-name-label">
                                                                            {actObj.name.length > 0 ?
                                                                                <Fragment>
                                                                                    {actObj && actObj.name.length > 15 ?
                                                                                        <Fragment>
                                                                                            <span data-tip="" data-for={`ws_${wsInd}_act_name_tt_${actInd}`} data-place="right" data-type="dark" className="ws-name-display">{actObj.name.substr(0, 15)}...</span>
                                                                                            <ReactTooltip id={`ws_${wsInd}_act_name_tt_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                                        </Fragment>
                                                                                        : <span className="ws-name-display">{actObj.name}</span>
                                                                                    }
                                                                                </Fragment>
                                                                                : <span className="ws-name-placeholder">Add Activity</span>
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* del rows of a single activity */}
                                                            {/* all saved  and new activities rows */}
                                                            <div className="all-del-in-act">
                                                                {/* existing or saved deliverables rows only */}
                                                                {actObj && actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (
                                                                    <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="col-sm-12">
                                                                        <div className={`del-name-row ${delObj.isDelInputEnabled && sortable ? 'name-input' : 'name-label'}`}>

                                                                            <div className="ws-name-div">
                                                                                <label onDoubleClick={sortable ? () => { this.makeInputHandlerDel('del', wsInd, actInd, delInd) } : () => { }} className="ws-name-label">
                                                                                    {delObj.name.length > 0 ?
                                                                                        <Fragment>
                                                                                            {delObj.name.length > 20 ?
                                                                                                <Fragment>
                                                                                                    <span data-tip="" data-for={`ws_${wsInd}_act_${actInd}_del_name_tt_${delInd}`} data-place="right" data-type="dark" className="ws-name-display">{delObj.name.substr(0, 20)}...</span>
                                                                                                    <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_name_tt_${delInd}`}>{delObj.name}</ReactTooltip>
                                                                                                </Fragment>
                                                                                                : <span className="ws-name-display">{delObj.name}</span>
                                                                                            }


                                                                                        </Fragment>
                                                                                        : <span className="ws-name-placeholder">Add Deliverable</span>
                                                                                    }
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                    }
                                                </div>
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
                                            : ''
                                        }
                                        <ScrollSyncPane>
                                            <DefineWsSortGanttCharts
                                                allDelIdObj={this.state.allDelIdObj}
                                                hideConnectors={this.props.hideConnectors}
                                                sortable={sortable}
                                                addedNewWsArray={addedNewWsArray}
                                                allWsDataArray={allWsDataArray}
                                                fetchAllWsTreeDetails={this.fetchAllWsTreeDetails}
                                                deleteDeliverableHandler={this.deleteDeliverableHandler}
                                                selectedDateMode={this.props.selectedDateMode}
                                            ></DefineWsSortGanttCharts>
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

export default withRouter(AllWsInfoAndCharts);
import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import Moment from 'moment';

import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
// import ActivityDetailsModal from '../ActivityModal/ActivityDetailsModal'
// import './AllWsInfoAndCharts.css';
import AllWsActualsGanttChart from '../WorkstreamActuals/AllWsActualsGanttChart';
import WsTimelineHeader from '../DefineWsTimeline/WsTimelineHeader'
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from '../DefineWsTimeline/DateConstants';
import { DAY_MONTH_MODE, DAY_DAY_MODE, DAY_YEAR_MODE } from '../DefineWsTimeline/DateConstants';
import DateHelper from '../DefineWsTimeline/DateHelper';
import rightIndIcon from '../../assets/project/workstream/right-ind.svg';
import downIndIcon from '../../assets/project/workstream/down-ind.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');
@inject('workstreamStore')
class AllWsActualsInfoAndCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // timeline change variables
            numOfDiffDays: 1,
            singleDayWidth: 3,
            bufferDays: 30,

            // connectors and all deliverables variables
            allDelIdObj: {},

            //today view
            todayLeftPixels: 0,

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
            allWsDataArray: []
        };
        this.chartContainerRef = React.createRef();

        this.isDefined = this.isDefined.bind(this);

        // new vpmo designs changes
        this.closeWsMenu = this.closeWsMenu.bind(this);
        this.assignDateMode = this.assignDateMode.bind(this);

        this.fetchAllWsTreeDetails = this.fetchAllWsTreeDetails.bind(this);


        this.saveActivityNameHandler = this.saveActivityNameHandler.bind(this);
        this.deleteActivityHandler = this.deleteActivityHandler.bind(this);
        this.deleteWsHandler = this.deleteWsHandler.bind(this);
    }

    componentDidMount() {
        this.fetchAllWsTreeDetails();
    }

    componentDidUpdate(prevProps, prevState) {
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
        console.log(originalStart);
        return buffer;
    }

    setTodayPixels = (selectedDateMode, dayWidth, buffer_days) => {
        const { overAllStartDate, overAllEndDate } = this.state;
        let leftPixels = 0
        let tempToday = DateHelper.getToday();
        if (this.isDefined(overAllStartDate) && this.isNonEmpty(overAllStartDate) &&
            this.isDefined(overAllEndDate) && this.isNonEmpty(overAllEndDate)) {
            let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
            let enddateWithBuffer = Moment(overAllEndDate).add(buffer_days, 'days');
            let goFor = Moment(tempToday).isBetween(startdateWithBuffer, enddateWithBuffer);
            if (goFor) {

                leftPixels = DateHelper.dateToPixel(tempToday, dayWidth, startdateWithBuffer);
                if (selectedDateMode && selectedDateMode === 'day') {
                    leftPixels = leftPixels + 22
                }

            }
        }
        return leftPixels;

    }

    setPixesForAllDates = (dayWidth, buffer_days) => {
        const { allWsDataArray } = this.state;
        let allWsDataArrayView = [];
        let allDeliverablesArray = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(allWsDataArray));

        let testTop = 0; // this variable used to calculate top pixels in addition

        allWsDataArrayView.map((wsObj, wsInd) => {

            let chartObj = this.eachChartToPixelsWs(wsObj, dayWidth, buffer_days);
            wsObj.chartLeft = chartObj.chartLeft;
            wsObj.chartWidth = chartObj.chartWidth;

            testTop = testTop + 8; // 8 = chart top paddingg
            wsObj.chartTop = testTop;
            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

            // loop over all activities
            wsObj.activities.map((actObj, actInd) => {
                let chartObj = this.eachChartToPixelsAct(actObj, dayWidth, buffer_days);
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
                    const milestonesGroupedByDate = this.groupBy(delObj.milestones, 'timeLineDate');
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
    eachChartToPixelsWs = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate, overAllEndDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(chartObj.overAllWsStartType) && this.isDefined(chartObj.overAllWsEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllWsStartType)} Start Date`, chartObj.overAllWsStartDate]
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllWsEndType)} End Date`, chartObj.overAllWsEndDate]
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if (!this.isDefined(chartObj.overAllWsStartType) && this.isDefined(chartObj.overAllWsEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllWsEndType)} End Date`, chartObj.overAllWsEndDate]
            let barLeftPixels = (this.setNewStartDate(chartObj) !== "" ? DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer) : 0);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if (this.isDefined(chartObj.overAllWsStartType) && !this.isDefined(chartObj.overAllWsEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");

            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllWsStartType)} Start Date`, chartObj.overAllWsStartDate]
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixelsMinusleft = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels
            let barWidthPixels = this.setNewEndDate(chartObj) === "" ? `calc(100% - ${barLeftPixels + dayWidth}px)` : ((barWidthPixelsMinusleft + dayWidth) + 'px');
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = barWidthPixels;
        }
        else if (!this.isDefined(chartObj.overAllWsStartType) && !this.isDefined(chartObj.overAllWsEndType) &&
            (this.setNewStartDate(chartObj) !== "" && this.setNewEndDate(chartObj) !== "")) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");

            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";

        }
        return chartObj;
    }
    eachChartToPixelsAct = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate, overAllEndDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(chartObj.overAllActivityStartType) && this.isDefined(chartObj.overAllActivityEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllActivityStartType)} Start Date`, chartObj.overAllActivityStartDate]
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllActivityEndType)} End Date`, chartObj.overAllActivityEndDate]
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if (!this.isDefined(chartObj.overAllActivityStartType) && this.isDefined(chartObj.overAllActivityEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllActivityEndType)} End Date`, chartObj.overAllActivityEndDate]
            let barLeftPixels = (this.setNewStartDate(chartObj) !== "" ? DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer) : 0);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if (this.isDefined(chartObj.overAllActivityStartType) && !this.isDefined(chartObj.overAllActivityEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");

            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllActivityStartType)} Start Date`, chartObj.overAllActivityStartDate]
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixelsMinusleft = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels
            let barWidthPixels = this.setNewEndDate(chartObj) === "" ? `calc(100% - ${barLeftPixels + dayWidth}px)` : ((barWidthPixelsMinusleft + dayWidth) + 'px');
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels);
        }
        else if (!this.isDefined(chartObj.overAllActivityStartType) && !this.isDefined(chartObj.overAllActivityEndType) &&
            (this.setNewStartDate(chartObj) !== "" && this.setNewEndDate(chartObj) !== "")) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) : 0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");

            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";
        }
        return chartObj;
    }

    eachChartToPixels = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate, overAllEndDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        //planned dates are present
        if (this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) {
            let leftPixels = DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer);
            let rightPixels = DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer);
            let widthPixels = rightPixels - leftPixels;

            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = (widthPixels + dayWidth) + 'px';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate, dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate, dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;

        }
        //planned dates not present
        // start date and end date are present irrespective of actual and expected
        else if (((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && ((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {

            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;
        }
        // only end date is present irrespective of actual and expected
        else if (!((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && ((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = ""
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = 0;
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;
        }
        // only start date is present irrespective of actual and expected
        else if (((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && !((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = ""
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = `calc(100% - ${barLeftPixels + dayWidth}px)`;
            let barRightPixels = `calc(100% - ${dayWidth})`;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = barWidthPixels;
            chartObj['barRight'] = barRightPixels;
        }
        // none of planned,actual,expecetd dates are present
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";

        }

        return chartObj;
    }
    capitalize = (word) => {
        let result = (word[0].toUpperCase()).concat(word.substring(1, word.length));
        return result;
    }
    setNewStartDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.actualStartDate !== "" && chartObj.actualStartDate !== null) {
            tempDate = ["Actual Start Date", chartObj.actualStartDate];

        }
        else if (chartObj.expStartDate !== "" && chartObj.expStartDate !== null) {
            tempDate = ["Expected Start Date", chartObj.expStartDate];
        }
        else if (chartObj.startDate !== "" && chartObj.startDate !== null) {
            tempDate = ["Planned Start Date", chartObj.startDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }
    setNewEndDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.actualEndDate !== "" && chartObj.actualEndDate !== null) {
            tempDate = ["Actual End Date", chartObj.actualEndDate];

        }
        else if (chartObj.expEndDate !== "" && chartObj.expEndDate !== null) {
            tempDate = ["Expected End Date", chartObj.expEndDate];
        }
        else if (chartObj.endDate !== "" && chartObj.endDate !== null) {
            tempDate = ["Planned End Date", chartObj.endDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }
    // setBarLeftPixels = (chartObj, dayWidth, startdateWithBuffer) => {
    //     let barLeftPixels = ""
    //     if (chartObj.actualStartDate !== "" && chartObj.actualStartDate !== null) {
    //         barLeftPixels = DateHelper.dateToPixel(chartObj.actualStartDate, dayWidth, startdateWithBuffer);

    //     }
    //     else if (chartObj.expStartDate !== "" && chartObj.expStartDate !== null) {
    //         barLeftPixels = DateHelper.dateToPixel(chartObj.expStartDate, dayWidth, startdateWithBuffer);
    //     }
    //     else {
    //         barLeftPixels = DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer);
    //     }
    //     return barLeftPixels;
    // }

    eachMilestoneToPixels = (mileObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');

        let mileDate = '';

        if (this.isDefined(mileObj.milestoneDate) && this.isNonEmpty(mileObj.milestoneDate)) {

            if (this.isDefined(mileObj.expDate) && this.isNonEmpty(mileObj.expDate)) {

                /*
                if (new Date(mileObj.milestoneDate) > new Date(mileObj.expDate)){
                    mileDate = mileObj.milestoneDate;
                }
                else{
                */
                mileDate = mileObj.expDate;
                //}
            }
            else if (this.isDefined(mileObj.actualDate) && this.isNonEmpty(mileObj.actualDate)) {

                /*
                if (new Date(mileObj.milestoneDate) > new Date(mileObj.actualDate)){
                    mileDate = mileObj.milestoneDate;
                }
                else{
                */
                mileDate = mileObj.actualDate;
                //}
            }
            else {
                mileDate = mileObj.milestoneDate;
            }
        }

        mileObj.timeLineDate = mileDate;


        if ((this.isDefined(mileObj.milestoneDate) && this.isNonEmpty(mileObj.milestoneDate))
            || (this.isDefined(mileObj.actualDate) && this.isNonEmpty(mileObj.actualDate))
            || (this.isDefined(mileObj.expDate) && this.isNonEmpty(mileObj.expDate))
        ) {
            let leftPixels = DateHelper.dateToPixel(mileDate, dayWidth, startdateWithBuffer);

            // remove 10 px (half of icon width) to make icon to point to start of a milestone date
            leftPixels = Number(leftPixels) - 10;

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
        if ((overAllStartDate && overAllStartDate !== '') && (overAllEndDate && overAllEndDate !== '') ) {
            let daysDiff = Moment(overAllEndDate).diff(Moment(overAllStartDate), 'days');
            let dayWidth = this.getDayWidth(selectedDateMode);
            let buffer_days = this.getBufferDays(selectedDateMode, daysDiff, dayWidth);
            let alteredObj = this.setPixesForAllDates(dayWidth, buffer_days);
            let todayLeftPixels = this.setTodayPixels(selectedDateMode, dayWidth, buffer_days);
            this.setState({
                numOfDiffDays: daysDiff,
                singleDayWidth: dayWidth,
                bufferDays: buffer_days,
                allWsDataArray: alteredObj.allWsDataArrayView,
                allDelIdObj: alteredObj.allDelIdObj,
                todayLeftPixels: todayLeftPixels
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
            wsObj['chartColor'] = this.setColour(wsObj.status)
            wsObj.activities.map((actObj, actInd) => {
                actObj['isActInputEnabled'] = false;
                actObj['isActMenuClicked'] = false;
                actObj['chartLeft'] = 0;
                actObj['chartRight'] = 0;
                actObj['chartTop'] = 0;
                actObj['chartWidth'] = '100%';
                actObj['chartColor'] = this.setColour(actObj.status)
                actObj['addedDeliverables'] = [];
                actObj.deliverables.map((delObj, delInd) => {
                    delObj['addedMilestones'] = [];
                    delObj['isDelInputEnabled'] = false;
                    delObj['chartLeft'] = 0;
                    delObj['chartRight'] = 0;
                    delObj['chartTop'] = 0;
                    delObj['chartWidth'] = '100%';
                    delObj['chartColor'] = this.setColour(delObj.status)
                    delObj.milestones.map(mileObj => {
                        mileObj['milestoneLeft'] = 0;
                        mileObj['isMenuClicked'] = false;
                    });

                    delObj['milestonesGroup'] = {};
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
    setColour = (status) => {
        let value = "";
        switch (status) {
            case "CMP_WITHIN_DUE_DT":
                value = "#339933";
                break;
            case "CMP_AFTER_DUE_DT":
                value = "#59A14F"
                break;
            case "DELAYED":
                value = "#E15759"
                break;
            case "INPROGRESS":
                value = "#4E79A7"
                break;
            case "NOT_STARTED":
                value = "#A5A4A4"
                break;

            default:
                break;
        }
        return value
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

    fetchAllWsTreeDetails() {
        const { workstreamStore } = this.props;
        workstreamStore.fetchAllWsTreeDetails('ws_actuals')
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
                        console.log('response.data.errorDescription');
                    }
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }

            });

    }
    // ----------- START of deleting all Workstreams related functions ----------    
    deleteWsHandler = (wsIndex) => {

        const { allWsDataArray } = this.state;

        const mockWsDataArray = [...allWsDataArray];
        const wsId = mockWsDataArray[wsIndex].wsId;
        const confirmMsg = 'Do you want to delete the ' + mockWsDataArray[wsIndex].name + '?br_br_brAll the associated Activities and Deliverables will be lost';
        console.log(confirmMsg);
        if (this.isDefined(wsId)) {
            this.openDeleteWsConfirmModal(confirmMsg, wsIndex);
        }

    }

    openDeleteWsConfirmModal = (title, wsInd) => {
        this.setState({
            deleteWsModalVisible: true,
            deleteWsModalTitle: title,
            deleteWsIndex: wsInd,
        });

    }

    closeDeleteWsConfirmModal = (isYesClicked) => {
        this.setState({
            deleteWsModalVisible: false,
            deleteWsModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteWSonConfirm();
        } else {
            this.setState({
                deleteWsIndex: '',
            });
        }
    }



    deleteWSonConfirm = () => {
        const { workstreamStore } = this.props;
        const { allWsDataArray, deleteWsIndex } = this.state;
        const wsIndex = deleteWsIndex;
        const mockWsDataArray = [...allWsDataArray];
        const wsId = mockWsDataArray[deleteWsIndex].wsId;

        workstreamStore.deleteWorkstream(wsId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    mockWsDataArray.splice(wsIndex, 1);
                    this.fetchAllWsTreeDetails();
                    this.setState({
                        allWsDataArray: mockWsDataArray
                    });
                    this.showErrorNotification("Workstream Deleted successfully", "Success", "success");

                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.errorDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }
    // ----------- END of deleting all Workstreams related functions ---------- 

    // ----------- START of deleting all activities related functions ----------    

    openDeleteActConfirmModal = (title, wsInd, actInd) => {
        this.setState({
            deleteActModalVisible: true,
            deleteActModalTitle: title,
            deleteActWsIndex: wsInd,
            deleteActIndex: actInd
        });

    }

    closeDeleteActConfirmModal = (isYesClicked) => {
        this.setState({
            deleteActModalVisible: false,
            deleteActModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteActivityonConfirm();
        } else {
            this.setState({
                deleteActIndex: '',
                deleteActWsIndex: '',
            });
        }
    }

    deleteActivityHandler = (wsIndex, actIndex) => {

        const { allWsDataArray } = this.state;

        const mockWsDataArray = [...allWsDataArray];
        const actId = mockWsDataArray[wsIndex].activities[actIndex].activityId;
        const confirmMsg = 'Do you want to delete the ' + mockWsDataArray[wsIndex].activities[actIndex].name + ' ?br_br_brAll the associated Deliverables will be lost';
        if (this.isDefined(actId)) {
            this.openDeleteActConfirmModal(confirmMsg, wsIndex, actIndex);
        }

    }

    deleteActivityonConfirm = () => {
        const { workstreamStore } = this.props;
        const { allWsDataArray, deleteActWsIndex, deleteActIndex } = this.state;
        const actIndex = deleteActIndex;
        const mockWsDataArray = [...allWsDataArray];
        const actId = mockWsDataArray[deleteActWsIndex].activities[actIndex].activityId;

        workstreamStore.deleteActivity(actId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    mockWsDataArray[deleteActWsIndex].activities.splice(actIndex, 1);
                    this.fetchAllWsTreeDetails();
                    this.setState({
                        allWsDataArray: mockWsDataArray
                    });
                    this.showErrorNotification("Activity Deleted successfully", "Success", "success");

                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.errorDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }
    // ----------- END of deleting all activities related functions ----------  

    // ------ START of deleting all Deliverables Functions --------//

    // below function is getting called from deliverable gantt chart as prop
    deleteDeliverableHandler = (type, selectedObj) => {

        const { allWsDataArray } = this.state;
        const mockWsDataArray = [...allWsDataArray];
        const { wsIndex, actIndex, delIndex } = selectedObj;
        if (type === 'add_del') {
            mockWsDataArray[wsIndex].activities[actIndex].addedDeliverables.splice(delIndex, 1);
            this.setState({
                allWsDataArr: mockWsDataArray
            })
        } else {
            const delId = mockWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex].deliverableId;

            const confirmMsg = 'Deletion of ' + mockWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex].name + ' will delete all links to its dependents. Click Yes to proceed';

            if (this.isDefined(delId)) {
                // uncomment below function to call deliverable delete service
                this.openDeleteDelConfirmModal(confirmMsg, wsIndex, actIndex, delIndex);
            }
        }

    }

    openDeleteDelConfirmModal = (title, wsInd, actInd, delInd) => {
        this.setState({
            deleteDelModalVisible: true,
            deleteDelModalTitle: title,
            deleteDelWsIndex: wsInd,
            deleteDelActIndex: actInd,
            deleteDelIndex: delInd
        });
    }

    closeDeleteDelConfirmModal = (isYesClicked) => {
        this.setState({
            deleteDelModalVisible: false,
            deleteDelModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteDeleverableOnConfirm();
        } else {
            this.setState({
                deleteDelIndex: '',
                deleteDelActIndex: '',
                deleteDelWsIndex: ''
            });
        }
    }

    deleteDeleverableOnConfirm = () => {
        const { workstreamStore } = this.props;
        const { allWsDataArray, deleteDelIndex, deleteDelActIndex, deleteDelWsIndex } = this.state;
        const delIndex = deleteDelIndex;
        const actIndex = deleteDelActIndex;
        const wsIndex = deleteDelWsIndex;
        const mockWsDataArray = [...allWsDataArray];
        const delId = mockWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex].deliverableId;
        workstreamStore.deleteDeliverable(delId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    mockWsDataArray[wsIndex].activities[actIndex].deliverables.splice(delIndex, 1);
                    this.fetchAllWsTreeDetails();
                    this.setState({
                        allWsDataArray: mockWsDataArray
                    })
                    this.showErrorNotification("Deliverable Deleted successfully", "Success", "success");

                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.errorDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });

    }

    // ------ END of deleting all Deliverables Functions --------//


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

    // new ws design functions ------------------

    // start of add new ws array functions
    addNewWsName = () => {
        const { addedNewWsArray } = this.state;
        let tempObj = {
            'isWsInputEnabled': false,
            'isWsMenuClicked': false,
            'workstreamName': ''
        }
        addedNewWsArray.push(tempObj);
        this.setState({
            addedNewWsArray: addedNewWsArray
        });
    }

    makeInputHandlerAddWs = (e, ind) => {
        let { addedNewWsArray } = this.state;
        addedNewWsArray[ind].isWsInputEnabled = true;
        this.setState({
            addedNewWsArray: [...addedNewWsArray]
        })
    }

    updateAddWsNamevalue = (event, ind) => {
        let { addedNewWsArray } = this.state;
        const wsName = event.target.value;
        const errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid name. Special characters [ < ! \' " > ] are invalid';
        addedNewWsArray[ind].workstreamName = wsName;
        this.setState({
            addedNewWsArray: [...addedNewWsArray],
            addWsError: errors
        })
    }

    handleKeyDownAddWs = (e, ind) => {
        if (e.key === 'Enter') {
            this.saveNewWsName(e, ind);
        }
    }

    deleteAddWorkstream = (event) => {
        let { addedNewWsArray } = this.state;
        const wsInd = event.target.dataset.wsIndex;
        addedNewWsArray.splice(wsInd, 1);
        this.setState({
            addedNewWsArray: [...addedNewWsArray]
        });
    }

    saveNewWsName = (event, ind) => {
        const { workstreamStore } = this.props;
        let { addedNewWsArray } = this.state;

        if (addedNewWsArray[ind].workstreamName.length > 0 && !RegExp(/[<>!'"[\]]/).test(event.target.value)) {
            const payloadObj = {
                'mapId': SessionStorage.read('mapId'),
                'name': addedNewWsArray[ind].workstreamName.trim()
            }
            workstreamStore.saveWorkstreamDetails(payloadObj)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        addedNewWsArray.splice(ind, 1);
                        workstreamStore.addWorkstreamArray.splice(ind, 1);
                        this.fetchAllWsTreeDetails();
                        this.setState({
                            addedNewWsArray: [...addedNewWsArray]
                        });
                        this.showErrorNotification("Workstream saved successfully", "Success", "success");

                    } else if (!response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {

                    }
                });
        } else {
            this.showErrorNotification("Please enter valid value and try again", "Error", "error");
            console.log('error: ws name should not be empty');
        }


    }

    // end of add new ws array functions


    // common ellipsis click handler for ws and act
    ellipsisMenuHandler = (event) => {
        event.preventDefault();
        let { addedNewWsArray, allWsDataArray } = this.state;
        const menuType = event.target.dataset.menuType;
        let wsInd, actInd, delInd = '';
        switch (menuType) {
            case 'add_ws_menu':
                const addWsInd = event.target.dataset.wsIndex;
                addedNewWsArray[addWsInd].isWsMenuClicked = true;
                this.setState({
                    addedNewWsArray: [...addedNewWsArray]
                }, () => {
                    document.addEventListener('click', this.closeWsMenu);
                });
                break;
            case 'ws_menu':
                wsInd = event.target.dataset.wsIndex;
                allWsDataArray[wsInd].isWsMenuClicked = true;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                }, () => {
                    document.addEventListener('click', this.closeWsMenu);
                });
                break;
            case 'add_act_menu':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                allWsDataArray[wsInd].addedActivities[actInd].isActMenuClicked = true;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                }, () => {
                    document.addEventListener('click', this.closeWsMenu);
                });
                break;
            case 'act_menu':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                allWsDataArray[wsInd].activities[actInd].isActMenuClicked = true;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                }, () => {
                    document.addEventListener('click', this.closeWsMenu);
                });
                break;

            default:
                break;
        }
    }

    // below function to close all menus on outside click
    closeWsMenu = (event) => {
        let { addedNewWsArray, allWsDataArray } = this.state;
        addedNewWsArray.map(ws => {
            ws.isWsMenuClicked = false;
        });
        allWsDataArray.map(ws => {
            if (ws.isWsMenuClicked) {
                ws.isWsMenuClicked = false;
            }
            ws.addedActivities && ws.addedActivities.map(act => {
                if (act && act.isActMenuClicked) {
                    act.isActMenuClicked = false;
                }
            });
            ws.activities.map(act => {
                if (act.isActMenuClicked) {
                    act.isActMenuClicked = false;
                }

            })
        })

        this.setState({
            addedNewWsArray: [...addedNewWsArray],
            allWsDataArray: [...allWsDataArray]
        }, () => {
            document.removeEventListener('click', this.closeWsMenu);
        });
    }

    // added activities array and added deliverables functions
    addNewActname = (event) => {
        let { allWsDataArray } = this.state;
        const wsInd = event.target.dataset.wsIndex;
        let tempObj = {
            'name': '',
            'isActInputEnabled': false,
            'isActMenuClicked': false
        }
        allWsDataArray[wsInd].addedActivities.push(tempObj);
        this.setState({
            allWsDataArray: [...allWsDataArray]
        });
    }

    addNewDeliverableName = (event) => {
        let { allWsDataArray } = this.state;
        const wsInd = event.target.dataset.wsIndex;
        const actInd = event.target.dataset.actIndex;
        let tempObj = {
            'name': '',
            'isDelInputEnabled': false
        }
        allWsDataArray[wsInd].activities[actInd].addedDeliverables.push(tempObj);
        this.setState({
            allWsDataArray: [...allWsDataArray]
        });
    }

    // ------------ start of all common handlers for save,input,keydown,doubleclick -----------
    makeInputHandlerWs = (event, wsInd) => {
        let { allWsDataArray } = this.state;
        allWsDataArray[wsInd].isWsInputEnabled = true;
        this.setState({
            allWsDataArray: [...allWsDataArray]
        });
    }

    makeInputHandlerAct = (type, wsInd, actInd) => {
        let { allWsDataArray } = this.state;
        if (type === 'add_act') {
            allWsDataArray[wsInd].addedActivities[actInd].isActInputEnabled = true;
        } else {
            allWsDataArray[wsInd].activities[actInd].isActInputEnabled = true;
        }
        this.setState({
            allWsDataArray: [...allWsDataArray]
        });
    }

    makeInputHandlerDel = (type, wsInd, actInd, delInd) => {
        let { allWsDataArray } = this.state;
        if (type === 'add_del') {
            allWsDataArray[wsInd].activities[actInd].addedDeliverables[delInd].isDelInputEnabled = true;
        } else {
            allWsDataArray[wsInd].activities[actInd].deliverables[delInd].isDelInputEnabled = true;
        }
        this.setState({
            allWsDataArray: [...allWsDataArray]
        });

    }

    updateNameValue = (event) => {
        const inputType = event.target.dataset.inputType;
        const newValue = event.target.value;
        let { allWsDataArray } = this.state;
        let wsInd, actInd, delInd = '';
        switch (inputType) {
            case 'ws_input':
                wsInd = event.target.dataset.wsIndex;
                allWsDataArray[wsInd].name = newValue;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            case 'add_act_input':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                allWsDataArray[wsInd].addedActivities[actInd].name = newValue;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            case 'act_input':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                allWsDataArray[wsInd].activities[actInd].name = newValue;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            case 'add_del_input':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                delInd = event.target.dataset.delIndex;
                allWsDataArray[wsInd].activities[actInd].addedDeliverables[delInd].name = newValue;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            case 'del_input':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                delInd = event.target.dataset.delIndex;
                allWsDataArray[wsInd].activities[actInd].deliverables[delInd].name = newValue;
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            default:
                break;
        }

    }

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.saveNamevalue(event);
        }
    }

    saveNamevalue = (event) => {
        const inputType = event.target.dataset.inputType;
        let { allWsDataArray } = this.state;
        let wsInd, actInd, delInd, name = '';
        switch (inputType) {
            case 'ws_input':
                wsInd = event.target.dataset.wsIndex;
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveWorkstreamNameHandler(event, wsInd);
                } else {
                    this.showErrorNotification("Please enter the valid non-empty workstream name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                    console.log('error: ws name is either empty/invalid');
                }

                break;
            case 'add_act_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveActivityNameHandler(event, 'add_act');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                    console.log('error: Activity name should not be empty');
                }

                break;
            case 'act_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveActivityNameHandler(event, 'act');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                    console.log('error: Activity name should not be empty');
                }

                break;
            case 'add_del_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveDeliverableNameHandler(event, 'add_del');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                    console.log('error: deliverable name should not be empty');
                }

                break;
            case 'del_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveDeliverableNameHandler(event, 'del');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                    console.log('error: deliverable name should not be empty');
                }

                break;
            default:
                break;
        }
    }

    saveWorkstreamNameHandler = (event, wsIndex) => {
        let { allWsDataArray } = this.state;
        const { workstreamStore } = this.props;
        const wsName = event.target.value;

        const payloadObj = {
            'mapId': SessionStorage.read('mapId'),
            'wsId': allWsDataArray[wsIndex].wsId,
            'name': wsName.trim(),
            'label': 'Y'
        }
        workstreamStore.saveWorkstreamDetails(payloadObj)
            .then((response) => {
                if (!response.error && response.data.resultCode === 'OK') {

                    // need to fetch the tree api after save
                    this.fetchAllWsTreeDetails();
                    this.showErrorNotification("Workstream Name saved successfully", "Success", "success");

                } else if (!response.error && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    console.log('error in SAVE: ' + response.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }

    saveActivityNameHandler = (event, type) => {
        const { allWsDataArray } = this.state;
        const { workstreamStore } = this.props;
        const wsInd = event.target.dataset.wsIndex;
        const actIndex = event.target.dataset.actIndex;
        const ActName = event.target.value;
        const allWsDataArr = [...allWsDataArray];

        const payloadObj = {
            "mapId": SessionStorage.read('mapId'),
            "wsId": '' + allWsDataArr[wsInd].wsId,
            "activityName": ActName.trim(),
            "label": 'Y'
        }
        if (type === 'act') {
            payloadObj['activityId'] = '' + allWsDataArr[wsInd].activities[actIndex].activityId;
        }
        workstreamStore.saveActivityDetails(payloadObj)
            .then(response => {
                if (!response.error && response && response.data.resultCode === 'OK') {
                    // need to call fetch all ws info tree api
                    this.fetchAllWsTreeDetails();

                    this.showErrorNotification("Activity saved successfully", "Success", "success");

                } else if (!response.error && response && response.data.resultCode === 'KO') {
                    console.log(response.data.errorDescription);
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }

    saveDeliverableNameHandler = (e, type) => {
        const { workstreamStore } = this.props;
        const { allWsDataArray } = this.state;
        const delivName = e.target.value;
        const wsIndex = e.target.dataset.wsIndex;
        const actIndex = e.target.dataset.actIndex;
        const delIndex = e.target.dataset.delIndex;
        const payloadObj = {
            "mapId": SessionStorage.read('mapId'),
            "activityId": '' + allWsDataArray[wsIndex].activities[actIndex].activityId,
            "name": delivName.trim(),
            "label": 'Y'
        }
        if (type === 'del') {
            payloadObj['deliverableId'] = '' + allWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex].deliverableId;
        }
        workstreamStore.saveDeliverableDetails(payloadObj)
            .then(response => {
                if (!response.error && response && response.data.resultCode === 'OK') {
                    // need to call the tree api fetch                 
                    this.fetchAllWsTreeDetails();
                    this.showErrorNotification("Deliverable saved successfully", "Success", "success");

                } else if (!response.error && response && response.data.resultCode === 'KO') {
                    console.log(response.data.errorDescription);
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }

    deleteNameHandler = (event) => {
        const deleteType = event.target.dataset.deleteType;
        let { allWsDataArray } = this.state;
        let wsInd, actInd, delInd = '';
        switch (deleteType) {
            case 'ws_delete':
                wsInd = event.target.dataset.wsIndex;
                this.deleteWsHandler(wsInd);
                // check for any act and del and after confirm modal, make service call
                // allWsDataArray[wsInd].splice(wsInd, 1);
                // this.setState({
                //     allWsDataArray: [...allWsDataArray]
                // });
                break;
            case 'add_act_delete':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                allWsDataArray[wsInd].addedActivities.splice(actInd, 1);
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
                break;
            case 'act_delete':
                wsInd = event.target.dataset.wsIndex;
                actInd = event.target.dataset.actIndex;
                // uncomment below function to call activity delete service
                this.deleteActivityHandler(wsInd, actInd);
                break;

            default:
                break;
        }

    }

    // ------------ END of all common handlers for save,input,keydown,doubleclick -----------

    render() {

        const todayDate = Moment(DateHelper.getToday());

        const { addedNewWsArray, allWsDataArray, showLoadingInd } = this.state;

        return (
            <div className="dws-tab-content-wrapper">
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                    </div>
                    : ((addedNewWsArray && addedNewWsArray.length === 0) && (allWsDataArray && allWsDataArray.length === 0)) ?
                        <div className="no-ws-msg row">No Workstream added</div>
                        :
                        <Fragment>
                            <div className="all-wda-info-main row">
                                <div className="all-ws-tree-main">
                                    {((this.state.overAllStartDate && this.state.overAllStartDate !== '' ) && (this.state.overAllEndDate && this.state.overAllEndDate !== '' ))?
                                        <div className="no-content-div">
                                        </div> : ''
                                    }
                                    <div className="ws-tree-wrapper">
                                        {/* saved and existing workstream data and its activities and deliverables */}
                                        {allWsDataArray && allWsDataArray.map((wsObj, wsInd) => (
                                            <div key={`ws_${wsInd}`} className="row each-ws-row">
                                                {/* existing or saved workstream only row */}
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${wsObj.isWsInputEnabled ? 'name-input' : 'name-label'}`}>
                                                        {/* <div className="ws-indicator">
                                                            {wsObj.activities && wsObj.activities.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            }
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            <label className="ws-name-label">
                                                                <Fragment>
                                                                    {wsObj.name.length > 16 ?
                                                                        <Fragment><span data-tip="" data-for={`ws_name_tt_${wsInd}`} data-type="dark" data-place="right" className="ws-name-display">{wsObj.name.substr(0, 16)}...</span>
                                                                            <ReactTooltip id={`ws_name_tt_${wsInd}`}>{wsObj.name}</ReactTooltip>
                                                                        </Fragment>
                                                                        : <span className="ws-name-display">{wsObj.name}</span>
                                                                    }
                                                                </Fragment>
                                                            </label>

                                                        </div>
                                                        {/* <div className="add-ws-ell">
                                                            <div className="ell-v-img">
                                                                <img src={ellipsisVIcon} alt="options"
                                                                    id={`open_ws_menu_${wsInd}`}
                                                                    data-menu-type="ws_menu"
                                                                    data-ws-index={wsInd}
                                                                ></img>
                                                                <ReactTooltip html={true} />
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </div>
                                                {/* all saved  and new activities rows */}
                                                <div className="all-act-in-ws">
                                                    {/* existing or saved activities rows only */}
                                                    {wsObj && wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                                        <div key={`ws_${wsInd}_act_${actInd}`} className="act-and-del-binder">
                                                            <div className="col-sm-12">
                                                                <div className={`act-name-row ${actObj.isActInputEnabled ? 'name-input' : 'name-label'}`}>
                                                                    {/* <div className="ws-indicator">
                                                                        {actObj.deliverables && actObj.deliverables.length > 0 ?
                                                                            <img src={downIndIcon} alt="open"></img>
                                                                            : <img src={rightIndIcon} alt="close"></img>
                                                                        }
                                                                    </div> */}
                                                                    <div className="ws-name-div">
                                                                        <label >
                                                                            <Fragment>
                                                                                {actObj && actObj.name.length > 15 ?
                                                                                    <Fragment>
                                                                                        <span data-tip="" data-for={`ws_name_tt_${wsInd}_act_name_tt_${actInd}`} data-place="right" data-type="dark" className="ws-name-display">{actObj.name.substr(0, 15)}...</span>
                                                                                        <ReactTooltip id={`ws_name_tt_${wsInd}_act_name_tt_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-display">{actObj.name}</span>
                                                                                }
                                                                            </Fragment>
                                                                        </label>

                                                                    </div>
                                                                    {/* <div className="add-ws-ell">
                                                                        <div className="ell-v-img">
                                                                            <img src={ellipsisVIcon} alt="options"
                                                                                id={`open_act_menu_${wsInd}_${actInd}`}
                                                                                data-menu-type="act_menu"
                                                                                data-ws-index={wsInd}
                                                                                data-act-index={actInd}
                                                                            ></img>
                                                                            <ReactTooltip html={true} />
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                            </div>
                                                            {/* del rows of a single activity */}
                                                            {/* all saved  and new activities rows */}
                                                            <div className="all-del-in-act">
                                                                {/* newly added activity rows only  */}
                                                                {actObj && actObj.addedDeliverables && actObj.addedDeliverables.map((delObj, delInd) => (
                                                                    <div key={`ws_${wsInd}_act_${actInd}_add_del_${delInd}`} className="col-sm-12">
                                                                        <div className={`del-name-row ${delObj.isDelInputEnabled ? 'name-input' : 'name-label'}`}>
                                                                            <div className="ws-name-div">
                                                                                <label onDoubleClick={() => { this.makeInputHandlerDel('add_del', wsInd, actInd, delInd) }} className="ws-name-label">
                                                                                    {delObj.name.length > 0 ?
                                                                                        <span className="ws-name-display">{delObj.name}</span>
                                                                                        : <span className="ws-name-placeholder">Add Deliverable</span>
                                                                                    }
                                                                                </label>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                ))
                                                                }
                                                                {/* existing or saved deliverables rows only */}
                                                                {actObj && actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (
                                                                    <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="col-sm-12">
                                                                        <div className={`del-name-row ${delObj.isDelInputEnabled ? 'name-input' : 'name-label'}`}>
                                                                            <div className="ws-name-div">
                                                                                <label onDoubleClick={() => { this.makeInputHandlerDel('del', wsInd, actInd, delInd) }} className="ws-name-label">
                                                                                    <Fragment>
                                                                                        {delObj.name.length > 20 ?
                                                                                            <Fragment>
                                                                                                <span data-tip="" data-for={`ws_name_tt_${wsInd}_act_name_tt_${actInd}_del_name_tt_${delInd}`} data-place="right" data-type="dark" className="ws-name-display">{delObj.name.substr(0, 20)}...</span>
                                                                                                <ReactTooltip id={`ws_name_tt_${wsInd}_act_name_tt_${actInd}_del_name_tt_${delInd}`}>{delObj.name}</ReactTooltip>
                                                                                            </Fragment>
                                                                                            : <span className="ws-name-display">{delObj.name}</span>
                                                                                        }
                                                                                    </Fragment>
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
                                        {(this.state.overAllStartDate && this.state.overAllStartDate !== '' && this.state.overAllEndDate && this.state.overAllEndDate !== '') ?
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
                                                    {this.state.todayLeftPixels && this.state.todayLeftPixels !== 0 ?
                                                        <div className="today-header" style={{ left: (this.state.todayLeftPixels - 4), position: 'absolute' }}>
                                                            <div data-tip="" data-for={`today_date_tt`} data-type="dark" className="caret-triangle"></div>
                                                            <ReactTooltip id={`today_date_tt`} ><span>Today : {todayDate.format('D-MMM-YYYY')}</span></ReactTooltip>
                                                        </div>
                                                        : ''
                                                    }
                                                </div>
                                            </ScrollSyncPane>
                                            : ''
                                        }
                                        <ScrollSyncPane>
                                            <AllWsActualsGanttChart
                                                addedNewWsArray={addedNewWsArray}
                                                allDelIdObj={this.state.allDelIdObj}
                                                hideConnectors={this.props.hideConnectors}
                                                allWsDataArray={allWsDataArray}
                                                fetchAllWsTreeDetails={this.fetchAllWsTreeDetails}
                                                deleteDeliverableHandler={this.deleteDeliverableHandler}
                                                selectedDateMode={this.props.selectedDateMode}
                                                todayLeftPixels={this.state.todayLeftPixels}
                                            ></AllWsActualsGanttChart>
                                        </ScrollSyncPane>
                                    </div>
                                </ScrollSync>
                            </div>
                        </Fragment>
                }

                {/* custom confirm box */}
                <CustomConfirmModal
                    ownClassName={'ws-delete-modal'}
                    isModalVisible={this.state.deleteWsModalVisible}
                    modalTitle={this.state.deleteWsModalTitle}
                    closeConfirmModal={this.closeDeleteWsConfirmModal}
                />
                <CustomConfirmModal
                    ownClassName={'ws-act-delete-modal'}
                    isModalVisible={this.state.deleteActModalVisible}
                    modalTitle={this.state.deleteActModalTitle}
                    closeConfirmModal={this.closeDeleteActConfirmModal}
                />
                <CustomConfirmModal
                    ownClassName={'ws-del-delete-modal'}
                    isModalVisible={this.state.deleteDelModalVisible}
                    modalTitle={this.state.deleteDelModalTitle}
                    closeConfirmModal={this.closeDeleteDelConfirmModal}
                />
            </div>
        )
    }
}

export default withRouter(AllWsActualsInfoAndCharts);
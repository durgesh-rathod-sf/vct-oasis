import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import Moment from 'moment';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import './AllWsInfoAndCharts.css';
import AllWsGanttChart from '../DefineWorkstream/AllWsGanttChart';
import WsTimelineHeader from '../DefineWsTimeline/WsTimelineHeader'
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from '../DefineWsTimeline/DateConstants';
import { DAY_MONTH_MODE, DAY_DAY_MODE, DAY_YEAR_MODE } from '../DefineWsTimeline/DateConstants';
import DateHelper from '../DefineWsTimeline/DateHelper';
import ellipsisVIcon from '../../assets/project/workstream/ellipsis-v.svg';
import rightIndIcon from '../../assets/project/workstream/right-ind.svg';
import downIndIcon from '../../assets/project/workstream/down-ind.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';

var SessionStorage = require('store/storages/sessionStorage');

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

            // drag and drop feature  related variables
            saveOrderInProgress: false,
            disableAllTooltips: false,

            //edit del dates variables
            delUpdateConfirmModalVisible: false,
            delUpdateConfirmModalTitle: '',
            
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
        this.mockResultObjArray = [];
    }

    componentDidMount() {

        this.fetchAllWsTreeDetails();

        // this.buildAllServiceDataToState(this.mockResultObjArray);  
        // this.props.workstreamStore.allWorkstreamsList = this.mockResultObjArray;
        // this.assignDateMode();
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
        const { allWsDataArray, addedNewWsArray } = this.state;

        let allDeliverablesArray = [];
        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(allWsDataArray));

        let testTop = 0;

        
        const lastWsIndex = allWsDataArrayView.length - 1;
        const lastActIndex = allWsDataArrayView[lastWsIndex].activities.length - 1;
        if (lastActIndex >= 0) {
            const lastDelIndex = allWsDataArrayView[lastWsIndex].activities[lastActIndex].deliverables.length - 1;
            if (lastDelIndex >= 0) {
                let delObj = allWsDataArrayView[lastWsIndex].activities[lastActIndex].deliverables[lastDelIndex];
                delObj['isLastDel'] = true;
            }            
        }
        

        // adding below loop for calculating top of the added ws charts
        addedNewWsArray && addedNewWsArray.map(addWS => {
            testTop = testTop + 8; // 8 = chart top paddingg

            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)
        })

        allWsDataArrayView.map((wsObj, wsInd) => {

            let chartObj = this.eachChartToPixels(wsObj, dayWidth, buffer_days);
            wsObj.chartLeft = chartObj.chartLeft;
            wsObj.chartWidth = chartObj.chartWidth;

            testTop = testTop + 8; // 8 = chart top paddingg
            wsObj.chartTop = testTop;
            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

            //loop over all unsaved added activities to calculate chart top
            wsObj.addedActivities && wsObj.addedActivities.map(addActObj => {
                testTop = testTop + 8;
                testTop = testTop + 36;
            });

            // loop over all activities
            wsObj.activities.map((actObj, actInd) => {
                let chartObj = this.eachChartToPixels(actObj, dayWidth, buffer_days);
                actObj.chartLeft = chartObj.chartLeft;
                actObj.chartWidth = chartObj.chartWidth;
                testTop = testTop + 8;
                actObj.chartTop = testTop;
                testTop = testTop + 36;

                // loop over all unsaved added deliverables to calculate chart top
                actObj.addedDeliverables && actObj.addedDeliverables.map(addDelObj => {
                    testTop = testTop + 8;
                    testTop = testTop + 36;
                });

                // loop over all deliverables
                actObj.deliverables.map((delObj, delInd) => {
                    let chartObj = this.eachChartToPixels(delObj, dayWidth, buffer_days);
                    delObj.chartLeft = chartObj.chartLeft;
                    delObj.chartWidth = chartObj.chartWidth;
                    testTop = testTop + 8;
                    delObj.chartTop = testTop;
                    testTop = testTop + 36;

                    //set the last deliverable
                    

                    // loop over all milestones
                    delObj.milestones.map((mileObj, mileInd) => {
                        this.eachMilestoneToPixels(mileObj, dayWidth, buffer_days);
                    });
                    const milestonesGroupedByDate = this.groupBy(delObj.milestones, 'milestoneDate');
                    delObj['milestonesGroup'] = milestonesGroupedByDate;

                });

                // add del array
                allDeliverablesArray = [...allDeliverablesArray, ...actObj.deliverables];
            });
        });
        const tempObj = this.groupBy(allDeliverablesArray, 'deliverableId'); // group by deli ids, use it in dependent deliverables

        // return the both wsdata array and all del array grouped by id
        let obj = {
            'addedNewWsArray': addedNewWsArray,
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
                allDelIdObj: alteredObj.allDelIdObj,
                addedNewWsArray: alteredObj.addedNewWsArray,
                disableAllTooltips: false
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
            wsObj['anyWsCommonDragEnabled'] = false;
            wsObj['anyDragEnabled'] = false; // used to know any of its child activities are drag enabled
            wsObj['isDragEnabled'] = false;
            wsObj['ownOrderId'] = wsInd + 1;
            wsObj['parentMapId'] = SessionStorage.read('mapId');
            wsObj.activities.map((actObj, actInd) => {
                actObj['isActInputEnabled'] = false;
                actObj['isActMenuClicked'] = false;
                actObj['chartLeft'] = 0;
                actObj['chartRight'] = 0;
                actObj['chartTop'] = 0;
                actObj['chartWidth'] = '100%';
                actObj['addedDeliverables'] = [];
                actObj['anyDragEnabled'] = false; // used to know any of its child deliverables are drag enabled
                actObj['isDragEnabled'] = false;
                actObj['ownOrderId'] = actInd + 1;
                actObj['parentWsId'] = actObj.wsId;
                actObj.deliverables.map((delObj, delInd) => {
                    delObj['addedMilestones'] = [];
                    delObj['isDelInputEnabled'] = false;
                    delObj['chartLeft']= 0;
                    delObj['chartRight']= 0;
                    delObj['chartTop']= 0;
                    delObj['chartWidth']= '100%';
                    delObj['isDragEnabled'] = false;
                    delObj['ownOrderId'] = delInd + 1;
                    delObj['parentActId'] = delObj.activityId;
                    
                    delObj['isStartOpened'] = false;
                    delObj['isEndOpened'] = false;
                    delObj['editStartDate'] = delObj.startDate;
                    delObj['editEndDate'] = delObj.endDate;
                    delObj['isLastDel'] = false;
                    
                   
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
        workstreamStore.fetchAllWsTreeDetails()
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
    // ----------- START of deleting all Workstreams related functions ----------    
    deleteWsHandler = (wsIndex) => {

        const { allWsDataArray } = this.state;

        const mockWsDataArray = [...allWsDataArray];
        const wsId = mockWsDataArray[wsIndex].wsId;
        const confirmMsg = 'Do you want to delete the ' + mockWsDataArray[wsIndex].name + '?br_br_brAll the associated Activities and Deliverables will be lost';
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
        const mapId =  SessionStorage.read('mapId');
        const wsOrderId = mockWsDataArray[deleteWsIndex].orderId;

        workstreamStore.deleteWorkstream(wsId,mapId,wsOrderId)
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
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
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
        const wsId = mockWsDataArray[deleteActWsIndex].wsId;
        const actOrderId = mockWsDataArray[deleteActWsIndex].activities[actIndex].orderId;
        workstreamStore.deleteActivity(actId,wsId,actOrderId)
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
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
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
            if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

                let newTopPixelObj = this.setAllChartsTopPixels();
                this.setState({
                    addedNewWsArray: newTopPixelObj.addedNewWsArray,
                    allWsDataArray: newTopPixelObj.allWsDataArray
                });
            } else {
                this.setState({
                    allWsDataArray: mockWsDataArray
                })
            }

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
        const actId = mockWsDataArray[wsIndex].activities[actIndex].activityId;
        const delOrderId = mockWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex].orderId;
        
        workstreamStore.deleteDeliverable(delId,actId,delOrderId)
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
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
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

    // set the top of every chart on every addition of unsaved ws/act/del
    setAllChartsTopPixels = () => {
        const { allWsDataArray, addedNewWsArray } = this.state;
        let testTop = 0;

        if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

            addedNewWsArray.map(ws => {
                testTop = testTop + 8; // 8 = chart top paddingg
                // wsObj.chartTop = testTop;
                testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)
            });

            allWsDataArray.map(wsObj => {

                testTop = testTop + 8; // 8 = chart top paddingg
                wsObj.chartTop = testTop;
                testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

                wsObj.addedActivities && wsObj.addedActivities.map(addActObj => {
                    testTop = testTop + 8;
                    // addActObj.chartTop = testTop;
                    testTop = testTop + 36;
                });
                wsObj.activities.map(actObj => {
                    testTop = testTop + 8;
                    actObj.chartTop = testTop;
                    testTop = testTop + 36;

                    actObj.addedDeliverables && actObj.addedDeliverables.map(addDelObj => {
                        testTop = testTop + 8;
                        // addDelObj.chartTop = testTop;
                        testTop = testTop + 36;
                    });

                    actObj.deliverables.map(delObj => {
                        testTop = testTop + 8;
                        delObj.chartTop = testTop;
                        testTop = testTop + 36;
                    })

                })
            })
        }
        let obj = {
            'addedNewWsArray': addedNewWsArray,
            'allWsDataArray': allWsDataArray
        }
        return obj;
    }

    // start of add new ws array functions
    addNewWsName = () => {
        const { addedNewWsArray, allWsDataArray } = this.state;

        let unsavedCountObj = this.checkForUnsavedActDel(allWsDataArray);

        if (unsavedCountObj.wsCount > 0) {
            this.showErrorNotification("Please name the unsaved workstream and add more.", "Warning", "error");
        } else if (unsavedCountObj.actCount > 0) {
            this.showErrorNotification("Please name the unsaved activity and add more.", "Warning", "error");
        } else if (unsavedCountObj.delCount > 0) {
            this.showErrorNotification("Please name the unsaved deliverable and add more.", "Warning", "error");
        } else {
            let tempObj = {
                'isWsInputEnabled': false,
                'isWsMenuClicked': false,
                'workstreamName': ''
            }
            addedNewWsArray.push(tempObj);

            if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

                let newTopPixelObj = this.setAllChartsTopPixels();
                this.setState({
                    addedNewWsArray: newTopPixelObj.addedNewWsArray,
                    allWsDataArray: newTopPixelObj.allWsDataArray
                });
            } else {
                this.setState({
                    addedNewWsArray: addedNewWsArray
                });
            }
        }


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

        if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

            let newTopPixelObj = this.setAllChartsTopPixels();
            this.setState({
                addedNewWsArray: newTopPixelObj.addedNewWsArray,
                allWsDataArray: newTopPixelObj.allWsDataArray
            });
        } else {
            this.setState({
                addedNewWsArray: [...addedNewWsArray]
            });
        }
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
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {

                    }
                });
        } else {
            this.showErrorNotification("Please enter valid value and try again", "Error", "error");
        }


    }

    // end of add new ws array functions


    // common ellipsis click handler for ws and act
    ellipsisMenuHandler = (event) => {
        event.preventDefault();
        let { addedNewWsArray, allWsDataArray } = this.state;
        const menuType = event.target.dataset.menuType;
        let wsInd, actInd = '';
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

    // function to check if unsaved act/del exists in the project
    checkForUnsavedActDel = (allWsStateData) => {
        let wsCount = 0, actCount = 0, delCount = 0;

        const { addedNewWsArray } = this.state;

        if (addedNewWsArray && addedNewWsArray.length > 0) {
            wsCount = wsCount + 1;
        }

        for (let i = 0; i < allWsStateData.length; i++) {

            if (allWsStateData[i].addedActivities && allWsStateData[i].addedActivities.length > 0) {
                actCount = actCount + 1;
                break;
            }

            for (let j = 0; j < allWsStateData[i].activities.length; j++) {
                if (allWsStateData[i].activities[j].addedDeliverables && allWsStateData[i].activities[j].addedDeliverables.length > 0) {
                    delCount = delCount + 1;
                    break;
                }
            }

        }

        return {
            'wsCount': wsCount,
            'actCount': actCount,
            'delCount': delCount
        }


    }

    addNewActname = (event) => {
        let { allWsDataArray } = this.state;

        let unsavedCountObj = this.checkForUnsavedActDel(allWsDataArray);

        if (unsavedCountObj.wsCount > 0) {
            this.showErrorNotification("Please name the unsaved workstream and add more.", "Warning", "error");
        } else if (unsavedCountObj.actCount > 0) {
            this.showErrorNotification("Please name the unsaved activity and add more.", "Warning", "error");
        } else if (unsavedCountObj.delCount > 0) {
            this.showErrorNotification("Please name the unsaved deliverable and add more.", "Warning", "error");
        } else {
            const wsInd = event.target.dataset.wsIndex;
            let tempObj = {
                'name': '',
                'isActInputEnabled': false,
                'isActMenuClicked': false
            }
            allWsDataArray[wsInd].addedActivities.push(tempObj);
            if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

                let newTopPixelObj = this.setAllChartsTopPixels();
                this.setState({
                    addedNewWsArray: newTopPixelObj.addedNewWsArray,
                    allWsDataArray: newTopPixelObj.allWsDataArray
                });
            } else {
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
            }
        }


    }

    addNewDeliverableName = (event) => {
        let { allWsDataArray } = this.state;
        let unsavedCountObj = this.checkForUnsavedActDel(allWsDataArray);

        if (unsavedCountObj.wsCount > 0) {
            this.showErrorNotification("Please name the unsaved workstream and add more.", "Warning", "error");
        } else if (unsavedCountObj.actCount > 0) {
            this.showErrorNotification("Please name the unsaved activity and add more.", "Warning", "error");
        } else if (unsavedCountObj.delCount > 0) {
            this.showErrorNotification("Please name the unsaved deliverable and add more.", "Warning", "error");
        } else {
            const wsInd = event.target.dataset.wsIndex;
            const actInd = event.target.dataset.actIndex;
            let tempObj = {
                'name': '',
                'isDelInputEnabled': false
            }
            allWsDataArray[wsInd].activities[actInd].addedDeliverables.push(tempObj);

            if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

                let newTopPixelObj = this.setAllChartsTopPixels();
                this.setState({
                    addedNewWsArray: newTopPixelObj.addedNewWsArray,
                    allWsDataArray: newTopPixelObj.allWsDataArray
                });
            } else {
                this.setState({
                    allWsDataArray: [...allWsDataArray]
                });
            }
        }

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
        let wsInd, name = '';
        switch (inputType) {
            case 'ws_input':
                wsInd = event.target.dataset.wsIndex;
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveWorkstreamNameHandler(event, wsInd);
                } else {
                    this.showErrorNotification("Please enter the valid non-empty workstream name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                }

                break;
            case 'add_act_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveActivityNameHandler(event, 'add_act');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                }

                break;
            case 'act_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveActivityNameHandler(event, 'act');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                }

                break;
            case 'add_del_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveDeliverableNameHandler(event, 'add_del');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
                }

                break;
            case 'del_input':
                name = event.target.value;
                if ((name.trim() !== '') && (!RegExp(/[<>!'"[\]]/).test(name))) {
                    this.saveDeliverableNameHandler(event, 'del');
                } else {
                    this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
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
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
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
                if (response && !response.error && response.data.resultCode === 'OK') {
                    // need to call fetch all ws info tree api
                    this.fetchAllWsTreeDetails();

                    this.showErrorNotification("Activity saved successfully", "Success", "success");

                } else if (response && !response.error && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
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
                if (response && !response.error && response.data.resultCode === 'OK') {
                    // need to call the tree api fetch                 
                    this.fetchAllWsTreeDetails();
                    this.showErrorNotification("Deliverable saved successfully", "Success", "success");

                } else if (response && !response.error && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                }
            });
    }

    deleteNameHandler = (event) => {
        const deleteType = event.target.dataset.deleteType;
        let { allWsDataArray } = this.state;
        let wsInd, actInd = '';
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
                if (this.isDefined(this.props.workstreamStore.allWorkstreamsStartDate) && this.props.workstreamStore.allWorkstreamsStartDate !== '') {

                    let newTopPixelObj = this.setAllChartsTopPixels();
                    this.setState({
                        addedNewWsArray: newTopPixelObj.addedNewWsArray,
                        allWsDataArray: newTopPixelObj.allWsDataArray
                    });
                } else {
                    this.setState({
                        allWsDataArray: [...allWsDataArray]
                    });
                }
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

    // common handler for ws/act/del enableDrag
    enableWsActDelDrag = (event, delObj) => {

        // logic is to enable the drag for recently double clicked ws/act/del and
        // disable the drag of others based on drop type
        let { wsIndex, actIndex, delIndex, dropType } = event.currentTarget.dataset;
        const {allWsDataArray} = this.state;

        // make all the 'isDragEnabled' and 'anyDragEnabled' key values as false with below loop
        allWsDataArray.map(wObj => {
            wObj.anyWsCommonDragEnabled = false;
            wObj.anyDragEnabled = false; //used for knowing any activity is double clicked and made drag enabled
            wObj.isDragEnabled = false;
            wObj.activities.map(aObj => {
                aObj.anyDragEnabled = false; // used for any deliverable drag is enabled
                aObj.isDragEnabled = false;
                aObj.deliverables.map(dObj => {
                    dObj.isDragEnabled = false;
                });
            });
        });

        // make the required ws/act/del 'isDragEnabled' and 'anyDragEnabled' values to true based on drop type
        if (dropType === 'deliverable') {
            allWsDataArray[wsIndex].activities[actIndex].anyDragEnabled = true;
            let obj = allWsDataArray[wsIndex].activities[actIndex].deliverables[delIndex];
            obj.isDragEnabled = true;
        } else if (dropType === 'activity') {
            allWsDataArray[wsIndex].anyDragEnabled = true;
            let obj = allWsDataArray[wsIndex].activities[actIndex];
            obj.isDragEnabled = true;

        } else if (dropType === 'workstream') {
            allWsDataArray.map(objWs => {
                objWs.anyWsCommonDragEnabled = true;
            });
            allWsDataArray[wsIndex].isDragEnabled = true;
        }
        
        this.setState({
            allWsDataArray: [...allWsDataArray],
            disableAllTooltips: true
        });
    }

    delOnDrop = (event, draggedObj) => {
        let {allWsDataArray} = this.state;
        let {workstreamStore} = this.props;
        const allWsData = [...allWsDataArray];
        if (this.isDefined(event.target) && event.target.dataset) {
            let { wsIndex, actIndex, delIndex, dropType } = event.target.dataset;
            if (dropType === 'deliverable' && draggedObj.deliverableId !== allWsData[wsIndex].activities[actIndex].deliverables[delIndex].deliverableId) {
                let dropObj = allWsData[wsIndex].activities[actIndex].deliverables[delIndex];
                if (dropObj.parentActId === draggedObj.parentActId) {
                    // form the payload
/* below code is for reordering whole array while drag-drop*/
                    let TempDelArray = allWsData[wsIndex].activities[actIndex].deliverables
                    let draggedObjIndex = (draggedObj.ownOrderId - 1)
                    TempDelArray.splice(draggedObjIndex, 1);
                    draggedObj.ownOrderId = dropObj.ownOrderId
                    
                    TempDelArray.splice(delIndex, 0, draggedObj)
                    TempDelArray.map((eachDel,eachDelInd) => {
                        eachDel.ownOrderId = (eachDelInd + 1 )
                    });
 /* for reordering whole array while drag-drop ends*/
                   
                    let idOrderObj = {};
 /* uncomment below code for swapping only 2 objs while drag-drop*/
                    // let tempOrderId = dropObj.ownOrderId;
                    // dropObj.ownOrderId = draggedObj.ownOrderId;
                    // allWsData[wsIndex].activities[actIndex].deliverables.map(eachDel => {
                    //     if (eachDel.deliverableId === draggedObj.deliverableId) {
                    //         eachDel.ownOrderId = tempOrderId
                    //     }
                    // });
                    TempDelArray.map(eachDel => {
                        let id = eachDel.deliverableId + '';
                        idOrderObj[id] = eachDel.ownOrderId + '';
                    });
                    let payload = {
                        'parentId': draggedObj.parentActId,
                        'type': dropType,
                        'orderDetails': idOrderObj
                    }
                    this.setState({
                        saveOrderInProgress: true
                    });
                    workstreamStore.saveDragDropOrderIds(payload)
                    .then((response) => {
                        if (!response.error && response.data.resultCode === 'OK') {
        
                            this.setState({
                                saveOrderInProgress: false
                            });

                            // need to fetch the tree api after save
                            this.fetchAllWsTreeDetails();
                            this.showErrorNotification("Reordering saved successfully", "Success", "success");
                            // this.showErrorNotification("Workstream Name saved successfully", "Success", "success");
        
                        } else if (!response.error && response.data.resultCode === 'KO') {
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                            this.resetWsActDelDragOrder(draggedObj);
                            
                        } else {
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        }
                       
                    });

                } else {
                    // dropped obj is also a deliverable type, but parent id does not match
                    this.resetWsActDelDragOrder(draggedObj);
                }
            } else {
                // dropped obj is not of deliverable type
                this.resetWsActDelDragOrder(draggedObj);
            }
        } else {
            // dropped obj does not have any target or out of scope
            this.resetWsActDelDragOrder(draggedObj);
        }       
    }

    actOnDrop = (event, draggedObj) => {
        let {allWsDataArray} = this.state;
        let {workstreamStore} = this.props;
        const allWsData = [...allWsDataArray];
        if (this.isDefined(event.target) && event.target.dataset) {
            let { wsIndex, actIndex, dropType } = event.target.dataset;
            if (dropType === 'activity' && draggedObj.activityId !== allWsData[wsIndex].activities[actIndex].activityId) {
                let dropObj = allWsData[wsIndex].activities[actIndex];
                if (dropObj.parentWsId === draggedObj.parentWsId) {
                    // form the payload
                    /* below code is for reordering whole array while drag-drop*/
                    let TempDelArray = allWsData[wsIndex].activities
                    let draggedObjIndex = (draggedObj.ownOrderId - 1)
                    TempDelArray.splice(draggedObjIndex, 1);
                    draggedObj.ownOrderId = dropObj.ownOrderId
                    
                    TempDelArray.splice(actIndex, 0, draggedObj)
                    TempDelArray.map((eachAct,eachActInd) => {
                        eachAct.ownOrderId = (eachActInd + 1 )
                    });
 /* for reordering whole array while drag-drop ends*/
                    let idOrderObj = {};
                    // let tempOrderId = dropObj.ownOrderId;
                    // dropObj.ownOrderId = draggedObj.ownOrderId;
                    // allWsData[wsIndex].activities.map(eachAct => {
                    //     if (eachAct.activityId === draggedObj.activityId) {
                    //         eachAct.ownOrderId = tempOrderId
                    //     }
                    // });
                    // const allChildDel = this.groupBy(allWsData[wsIndex].activities[actIndex].deliverables, 'deliverableId'); 
                    allWsData[wsIndex].activities.map(eachAct => {
                        let id = eachAct.activityId + '';
                        idOrderObj[id] = eachAct.ownOrderId + '';
                    });
                    let payload = {
                        'parentId': draggedObj.parentWsId,
                        'type': dropType,
                        'orderDetails': idOrderObj
                    }
                    this.setState({
                        saveOrderInProgress: true
                    });
                    workstreamStore.saveDragDropOrderIds(payload)
                    .then((response) => {
                        if (!response.error && response.data.resultCode === 'OK') {
        
                            this.setState({
                                saveOrderInProgress: false
                            });

                            // need to fetch the tree api after save
                            this.fetchAllWsTreeDetails();
                            this.showErrorNotification("Reordering saved successfully", "Success", "success");
                            // this.showErrorNotification("Workstream Name saved successfully", "Success", "success");
        
                        } else if (!response.error && response.data.resultCode === 'KO') {
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                            this.resetWsActDelDragOrder(draggedObj);
                            
                        } else {
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        }
                       
                    });

                } else {
                    // dropped obj is also a deliverable type, but parent id does not match
                    this.resetWsActDelDragOrder(draggedObj);
                }
            } else {
                // dropped obj is not of deliverable type
                this.resetWsActDelDragOrder(draggedObj);
            }
        } else {
            // dropped obj does not have any target or out of scope
            this.resetWsActDelDragOrder(draggedObj);
        }       
    }

    wsOnDrop = (event, draggedObj) => {
        let {allWsDataArray} = this.state;
        let {workstreamStore} = this.props;
        const allWsData = [...allWsDataArray];
        if (this.isDefined(event.target) && event.target.dataset) {
            let { wsIndex, dropType } = event.target.dataset;
            if (dropType === 'workstream' && draggedObj.wsId !== allWsData[wsIndex].wsId) {
                let dropObj = allWsData[wsIndex];
                if (dropObj.parentMapId === draggedObj.parentMapId) {
                    // form the payload
                       /* below code is for reordering whole array while drag-drop*/
                       let TempDelArray = allWsData
                       let draggedObjIndex = (draggedObj.ownOrderId - 1)
                       TempDelArray.splice(draggedObjIndex, 1);
                       draggedObj.ownOrderId = dropObj.ownOrderId
                       
                       TempDelArray.splice(wsIndex, 0, draggedObj)
                       TempDelArray.map((eachWs,eachWsInd) => {
                        eachWs.ownOrderId = (eachWsInd + 1 )
                       });
    /* for reordering whole array while drag-drop ends*/
                    let idOrderObj = {};
                    // let tempOrderId = dropObj.ownOrderId;
                    // dropObj.ownOrderId = draggedObj.ownOrderId;
                    // allWsData.map(eachWs => {
                    //     if (eachWs.wsId === draggedObj.wsId) {
                    //         eachWs.ownOrderId = tempOrderId
                    //     }
                    // });
                    // const allChildDel = this.groupBy(allWsData[wsIndex].activities[actIndex].deliverables, 'deliverableId'); 
                    allWsData.map(eachWs => {
                        let id = eachWs.wsId + '';
                        idOrderObj[id] = eachWs.ownOrderId + '';
                    });
                    let payload = {
                        'parentId': draggedObj.parentMapId,
                        'type': dropType,
                        'orderDetails': idOrderObj
                    }
                    this.setState({
                        saveOrderInProgress: true
                    });
                    workstreamStore.saveDragDropOrderIds(payload)
                    .then((response) => {
                        if (!response.error && response.data.resultCode === 'OK') {
        
                            this.setState({
                                saveOrderInProgress: false
                            });

                            // need to fetch the tree api after save
                            this.fetchAllWsTreeDetails();
                            this.showErrorNotification("Reordering saved successfully", "Success", "success");
                            // this.showErrorNotification("Workstream Name saved successfully", "Success", "success");
        
                        } else if (!response.error && response.data.resultCode === 'KO') {
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                            this.resetWsActDelDragOrder(draggedObj);
                            
                        } else {
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        }
                       
                    });

                } else {
                    // dropped obj is also a deliverable type, but parent id does not match
                    this.resetWsActDelDragOrder(draggedObj);
                }
            } else {
                // dropped obj is not of deliverable type
                this.resetWsActDelDragOrder(draggedObj);
            }
        } else {
            // dropped obj does not have any target or out of scope
            this.resetWsActDelDragOrder(draggedObj);
        }       
    }

    resetWsActDelDragOrder = (draggedObj) => {
         // below code is used to reset all ws/act/del to its back position 
         const {allWsDataArray} = this.state;

          // make all the 'isDragEnabled' and 'anyDragEnabled' key values as false with below loop
        allWsDataArray.map(wObj => {
            wObj.anyWsCommonDragEnabled = false;
            wObj.anyDragEnabled = false; //used for knowing any activity is double clicked and made drag enabled
            wObj.isDragEnabled = false;
            wObj.activities.map(aObj => {
                aObj.anyDragEnabled = false; // used for any deliverable is double clicked and made drag enabled
                aObj.isDragEnabled = false;
                aObj.deliverables.map(dObj => {
                    dObj.isDragEnabled = false;
                });
            });
        });
        this.setState({
            allWsDataArray: [...allWsDataArray],
            saveOrderInProgress: false,
            disableAllTooltips: false
        });
    }   

    
    

    render() {

        const { addedNewWsArray, allWsDataArray, showLoadingInd } = this.state;
        return (
            <div className="dws-tab-content-wrapper">
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                    </div>
                    : ((addedNewWsArray && addedNewWsArray.length === 0) && (allWsDataArray && allWsDataArray.length === 0)) ?
                        <div className="no-ws-msg row">To begin, add&nbsp; <span className="clickable-span" id="add_ws_on_empty" onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : () => { this.addNewWsName() }}
                            style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer' }}>Workstreams</span></div>
                        :
                        <Fragment>
                            <div id="dws_tree_chart_main" className="all-wda-info-main row">
                                <div className="all-ws-tree-main">
                                    {this.state.overAllStartDate && this.state.overAllStartDate !== '' ?
                                        <div className="no-content-div">
                                        </div> : ''
                                    }
                                    <div className="ws-tree-wrapper">
                                        {/* newly added workstream rows*/}
                                        {addedNewWsArray && addedNewWsArray.map((addws, ind) => (
                                            <div key={`add_ws_${ind}`} className="row each-ws-row">
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${addws.isWsInputEnabled ? 'name-input' : 'name-label'}`}>
                                                        {/* <div className="ws-indicator">
                                                            <img src={rightIndIcon} alt="close"></img>
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            {addws.isWsInputEnabled ?
                                                                <input type="text" className="ws-name-input"
                                                                    value={addws.workstreamName}
                                                                    maxLength="50"
                                                                    autoFocus={true}
                                                                    placeholder={'Add Workstream'}
                                                                    onChange={(e) => { this.updateAddWsNamevalue(e, ind) }}
                                                                    onKeyDown={(e) => { this.handleKeyDownAddWs(e, ind) }}
                                                                    onBlur={(e) => { this.saveNewWsName(e, ind) }}
                                                                ></input>
                                                                :
                                                                <label onDoubleClick={(e) => { this.makeInputHandlerAddWs(e, ind) }} className="ws-name-label">
                                                                    {addws.workstreamName.length > 0 ?
                                                                        <span className="ws-name-display">{addws.workstreamName}</span>
                                                                        : <span className="ws-name-placeholder">Add Workstream</span>
                                                                    }
                                                                </label>
                                                            }
                                                        </div>
                                                        <div className="add-ws-ell">
                                                            <div className="ell-v-img">
                                                                <img src={ellipsisVIcon} alt="options"
                                                                    id={`open_add_ws_menu_${ind}`}
                                                                    data-menu-type="add_ws_menu"
                                                                    data-ws-index={ind}
                                                                    data-tip="Menu" data-type="dark"
                                                                    style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                                    onClick={(e) => { this.ellipsisMenuHandler(e) }}></img>
                                                                <ReactTooltip html={true} />
                                                                {addws.isWsMenuClicked ? (
                                                                    <div className="ws-menu-wrapper">
                                                                        <div className="menu-vertical" id={`added_ws_menu_${ind}`}>
                                                                            <div className="menu-item" onClick={() => { this.addNewWsName() }}> Add Workstream </div>
                                                                            <div className="menu-item disabled-item"> Add Activity</div>
                                                                            <div className="menu-item" data-ws-index={ind} onClick={(e) => { this.deleteAddWorkstream(e) }} > Delete Workstream </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                        }
                                        {/* saved and existing workstream data and its activities and deliverables */}
                                        {allWsDataArray && allWsDataArray.map((wsObj, wsInd) => (
                                            <div key={`ws_${wsInd}`} className="row each-ws-row">
                                                {/* existing or saved workstream only row */}
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${wsObj.isWsInputEnabled || !(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'name-input' : 'name-label'}`}>
                                                        {/* <div className="ws-indicator">
                                                            {wsObj.activities && wsObj.activities.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            }
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            {wsObj.isWsInputEnabled ?
                                                                <input type="text" className="ws-name-input"
                                                                    value={wsObj.name}
                                                                    maxLength="50"
                                                                    data-input-type="ws_input"
                                                                    data-ws-index={wsInd}
                                                                    autoFocus={true}
                                                                    placeholder={'Add Workstream'}
                                                                    onChange={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.updateNameValue(e) }}
                                                                    onKeyDown={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.handleKeyDown(e) }}
                                                                    onBlur={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.saveNamevalue(e) }}
                                                                ></input>
                                                                :
                                                                <label onDoubleClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : () => { this.makeInputHandlerWs('ws', wsInd) }} className="ws-name-label">
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
                                                            }
                                                        </div>
                                                        <div className="add-ws-ell">
                                                            <div className="ell-v-img">
                                                                <img src={ellipsisVIcon} alt="options"
                                                                    id={`open_ws_menu_${wsInd}`}
                                                                    data-menu-type="ws_menu"
                                                                    data-ws-index={wsInd}
                                                                    data-tip="Menu" data-type="dark"
                                                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : 'pointer' }}
                                                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.ellipsisMenuHandler(e) }}></img>
                                                                <ReactTooltip html={true} />
                                                                {wsObj.isWsMenuClicked ? (
                                                                    <div className="ws-menu-wrapper">
                                                                        <div className="menu-vertical" id={`saved_ws_menu_${wsInd}`}>
                                                                            <div className="menu-item" onClick={() => { this.addNewWsName() }}> Add Workstream </div>
                                                                            <div className="menu-item"
                                                                                data-ws-index={wsInd} onClick={(e) => { this.addNewActname(e) }}> Add Activity</div>
                                                                            <div className="menu-item" data-delete-type="ws_delete" data-ws-index={wsInd}
                                                                                onClick={(e) => { this.deleteNameHandler(e) }}> Delete Workstream </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* all saved  and new activities rows */}
                                                <div className="all-act-in-ws">
                                                    {/* newly added activity rows only  */}
                                                    {wsObj && wsObj.addedActivities && wsObj.addedActivities.map((actObj, actInd) => (
                                                        <div key={`ws_${wsInd}_add_act_${actInd}`} className="col-sm-12">
                                                            <div className={`act-name-row ${actObj.isActInputEnabled ? 'name-input' : 'name-label'}`}>
                                                                {/* <div className="ws-indicator">
                                                                    <img src={rightIndIcon} alt="close"></img>
                                                                </div> */}
                                                                <div className="ws-name-div">
                                                                    {actObj.isActInputEnabled ?
                                                                        <input type="text" className="act-name-input"
                                                                            value={actObj.name}
                                                                            maxLength="50"
                                                                            data-input-type="add_act_input"
                                                                            data-ws-index={wsInd}
                                                                            data-act-index={actInd}
                                                                            autoFocus={true}
                                                                            placeholder={'Add Activity'}
                                                                            onChange={(e) => { this.updateNameValue(e) }}
                                                                            onKeyDown={(e) => { this.handleKeyDown(e) }}
                                                                            onBlur={(e) => { this.saveNamevalue(e) }}
                                                                        ></input>
                                                                        :
                                                                        <label onDoubleClick={() => { this.makeInputHandlerAct('add_act', wsInd, actInd) }} className="ws-name-label">
                                                                            {actObj.name.length > 0 ?
                                                                                <span className="ws-name-display">{actObj.name}</span>
                                                                                : <span className="ws-name-placeholder">Add Activity</span>
                                                                            }
                                                                        </label>
                                                                    }
                                                                </div>
                                                                <div className="add-ws-ell">
                                                                    <div className="ell-v-img">
                                                                        <img src={ellipsisVIcon} alt="options"
                                                                            id={`open_add_act_menu_${wsInd}_${actInd}`}
                                                                            data-menu-type="add_act_menu"
                                                                            data-ws-index={wsInd}
                                                                            data-act-index={actInd}
                                                                            data-tip="Menu" data-type="dark"
                                                                            style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                                            onClick={(e) => { this.ellipsisMenuHandler(e) }}></img>
                                                                        <ReactTooltip html={true} />
                                                                        {actObj.isActMenuClicked ? (
                                                                            <div className="ws-menu-wrapper">
                                                                                <div className="menu-vertical" id={`added_ws_${wsInd}_act_menu_${actInd}`}>
                                                                                    <div className="menu-item disabled-item"> Add Deliverable </div>
                                                                                    <div className="menu-item" data-ws-index={wsInd} data-delete-type="add_act_delete"
                                                                                        data-act-index={actInd} onClick={(e) => { this.deleteNameHandler(e) }} > Delete Activity </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                    }
                                                    {/* existing or saved activities rows only */}
                                                    {wsObj && wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                                        <div key={`ws_${wsInd}_act_${actInd}`} className="act-and-del-binder">
                                                            <div className="col-sm-12">
                                                                <div className={`act-name-row ${actObj.isActInputEnabled || !(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'name-input' : 'name-label'}`}>
                                                                    {/* <div className="ws-indicator">
                                                                        {actObj.deliverables && actObj.deliverables.length > 0 ?
                                                                            <img src={downIndIcon} alt="open"></img>
                                                                            : <img src={rightIndIcon} alt="close"></img>
                                                                        }
                                                                    </div> */}
                                                                    <div className="ws-name-div">
                                                                        {actObj.isActInputEnabled ?
                                                                            <input type="text" className="act-name-input"
                                                                                value={actObj.name}
                                                                                maxLength="50"
                                                                                data-input-type="act_input"
                                                                                data-ws-index={wsInd}
                                                                                data-act-index={actInd}
                                                                                autoFocus={true}
                                                                                placeholder={'Add Activity'}
                                                                                onChange={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.updateNameValue(e) }}
                                                                                onKeyDown={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.handleKeyDown(e) }}
                                                                                onBlur={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.saveNamevalue(e) }}
                                                                            ></input>
                                                                            :
                                                                            <label onDoubleClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : () => { this.makeInputHandlerAct('act', wsInd, actInd) }} className="ws-name-label">
                                                                                {actObj.name.length > 0 ?
                                                                                    <Fragment>
                                                                                        {actObj && actObj.name.length > 15 ?
                                                                                            <Fragment>
                                                                                                <span data-tip="" data-for={`ws_name_tt_${wsInd}_act_name_tt_${actInd}`} data-place="right" data-type="dark" className="ws-name-display">{actObj.name.substr(0, 15)}...</span>
                                                                                                <ReactTooltip id={`ws_name_tt_${wsInd}_act_name_tt_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                                            </Fragment>
                                                                                            : <span className="ws-name-display">{actObj.name}</span>
                                                                                        }
                                                                                    </Fragment>
                                                                                    : <span className="ws-name-placeholder">Add Activity</span>
                                                                                }
                                                                            </label>
                                                                        }
                                                                    </div>
                                                                    <div className="add-ws-ell">
                                                                        <div className="ell-v-img">
                                                                            <img src={ellipsisVIcon} alt="options"
                                                                                id={`open_act_menu_${wsInd}_${actInd}`}
                                                                                data-menu-type="act_menu"
                                                                                data-ws-index={wsInd}
                                                                                data-act-index={actInd}
                                                                                data-tip="Menu" data-type="dark"
                                                                                style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : 'pointer' }}
                                                                                onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.ellipsisMenuHandler(e) }}></img>
                                                                            <ReactTooltip html={true} />
                                                                            {actObj.isActMenuClicked ? (
                                                                                <div className="ws-menu-wrapper">
                                                                                    <div className="menu-vertical" id={`saved_ws_${wsInd}_act_menu_${actInd}`}>
                                                                                        <div className="menu-item" data-ws-index={wsInd} data-act-index={actInd}
                                                                                            onClick={(e) => { this.addNewDeliverableName(e) }}> Add Deliverable </div>
                                                                                        <div className="menu-item" data-delete-type="act_delete"
                                                                                            data-ws-index={wsInd} data-act-index={actInd} onClick={(e) => { this.deleteNameHandler(e) }} > Delete Activity </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : null
                                                                            }
                                                                        </div>
                                                                    </div>
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
                                                                                {delObj.isDelInputEnabled ?
                                                                                    <input type="text" className="del-name-input"
                                                                                        value={delObj.name}
                                                                                        maxLength="50"
                                                                                        data-input-type="add_del_input"
                                                                                        data-ws-index={wsInd}
                                                                                        data-act-index={actInd}
                                                                                        data-del-index={delInd}
                                                                                        autoFocus={true}
                                                                                        placeholder={'Add Deliverable'}
                                                                                        onChange={(e) => { this.updateNameValue(e) }}
                                                                                        onKeyDown={(e) => { this.handleKeyDown(e) }}
                                                                                        onBlur={(e) => { this.saveNamevalue(e) }}
                                                                                    ></input>
                                                                                    :
                                                                                    <label onDoubleClick={() => { this.makeInputHandlerDel('add_del', wsInd, actInd, delInd) }} className="ws-name-label">
                                                                                        {delObj.name.length > 0 ?
                                                                                            <span className="ws-name-display">{delObj.name}</span>
                                                                                            : <span className="ws-name-placeholder">Add Deliverable</span>
                                                                                        }
                                                                                    </label>
                                                                                }
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                ))
                                                                }
                                                                {/* existing or saved deliverables rows only */}
                                                                {actObj && actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (
                                                                    <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="col-sm-12">
                                                                        <div className={`del-name-row ${delObj.isDelInputEnabled || !(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'name-input' : 'name-label'}`}>

                                                                            <div className="ws-name-div">
                                                                                {delObj.isDelInputEnabled ?
                                                                                    <input type="text" className="del-name-input"
                                                                                        value={delObj.name}
                                                                                        maxLength="50"
                                                                                        data-input-type="del_input"
                                                                                        data-ws-index={wsInd}
                                                                                        data-act-index={actInd}
                                                                                        data-del-index={delInd}
                                                                                        autoFocus={true}
                                                                                        placeholder={'Add Delivery'}
                                                                                        onChange={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.updateNameValue(e) }}
                                                                                        onKeyDown={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.handleKeyDown(e) }}
                                                                                        onBlur={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.saveNamevalue(e) }}
                                                                                    ></input>
                                                                                    :
                                                                                    <label onDoubleClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : () => { this.makeInputHandlerDel('del', wsInd, actInd, delInd) }} className="ws-name-label">
                                                                                        {delObj.name.length > 0 ?
                                                                                            <Fragment>
                                                                                                {delObj.name.length > 20 ?
                                                                                                    <Fragment>
                                                                                                        <span data-tip="" data-for={`ws_name_tt_${wsInd}_act_name_tt_${actInd}_del_name_tt_${delInd}`} data-place="right" data-type="dark" className="ws-name-display">{delObj.name.substr(0, 20)}...</span>
                                                                                                        <ReactTooltip id={`ws_name_tt_${wsInd}_act_name_tt_${actInd}_del_name_tt_${delInd}`}>{delObj.name}</ReactTooltip>
                                                                                                    </Fragment>
                                                                                                    : <span className="ws-name-display">{delObj.name}</span>
                                                                                                }


                                                                                            </Fragment>
                                                                                            : <span className="ws-name-placeholder">Add Deliverable</span>
                                                                                        }
                                                                                    </label>
                                                                                }
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
                                            <AllWsGanttChart
                                                addedNewWsArray={addedNewWsArray}
                                                allDelIdObj={this.state.allDelIdObj}
                                                hideConnectors={this.props.hideConnectors}
                                                allWsDataArray={allWsDataArray}
                                                fetchAllWsTreeDetails={this.fetchAllWsTreeDetails}
                                                deleteDeliverableHandler={this.deleteDeliverableHandler}
                                                selectedDateMode={this.props.selectedDateMode}

                                                enableWsActDelDrag={this.enableWsActDelDrag}
                                                delOnDrop={this.delOnDrop}
                                                actOnDrop={this.actOnDrop}
                                                wsOnDrop={this.wsOnDrop}
                                                saveOrderInProgress={this.state.saveOrderInProgress}
                                                disableAllTooltips={this.state.disableAllTooltips}
                                                
                                            ></AllWsGanttChart>
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

export default withRouter(AllWsInfoAndCharts);
import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem } from "react-contextmenu";
import WorkstreamDetailsModalDefineWs from '../DefineWorkstreamModals/WorkstreamDetailsModalDefineWs';
import ReactTooltip from 'react-tooltip';
import './AllWsActualsGanttChart.css';
import mileStoneIcon from '../../assets/project_DWS/actuals-milestone-icon.svg';
import mileStoneIconRed from '../../assets/project_DWS/actuals-milestone-icon-red.svg';
import mileStoneIconLGreen from '../../assets/project_DWS/actuals-milestone-icon-lightgreen.svg';
import mileStoneIconDarkGreen from '../../assets/project_DWS/actuals-milestone-icon-darkgreen.svg';
import mileStoneTrashIcon from '../../assets/project_DWS/trash-icon-milestone.svg';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ActivityDetailsModalWA from '../WorkstreamActualModals/ActivityDetailsModalWA';
import DeliverableDetailsModalDefineWs from '../DefineWorkstreamModals/DeliverableDetailsModalDefineWs';
import MilestoneDetailsModalWsActuals from '../WorkstreamActualModals/MilestoneDetailsModalWsActuals';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import WorkstreamDetailsModalWsActuals from '../WorkstreamActualModals/WorkstreamDetailsModalWsActuals';
import DeliverableDetailsModalWsActuals from '../WorkstreamActualModals/DeliverableDetailsModalWsActuals';
import ConnectorHelper from '../DefineWsTimeline/ConnectorHelper';
import Moment from 'moment';


@inject('workstreamStore')
class AllWsActualsGanttChart extends Component {
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

            isWsModalVisible: false,

            isActModalVisible: false,
            selectedActName: '',
            selectedActId: '',


            isDelModalVisible: false,
            selectedDelName: '',
            selectedDelId: '',

            isMileModalVisible: false,
            selectedMileObj: '',
            isAddedMilestone: false,

            deleteMileModalVisible: false,
            deleteMileModalTitle: '',
            deleteMileIndexesObj: ''


        };

        this.chartRightRef = React.createRef();

        this.isDefined = this.isDefined.bind(this);
        this.showContextMenuHandler = this.showContextMenuHandler.bind(this);
        this.openDeliverableModal = this.openDeliverableModal.bind(this);
        this.closeDelModal = this.closeDelModal.bind(this);
        this.openWsModal = this.openWsModal.bind(this);
        this.closeWsModal = this.closeWsModal.bind(this);

    }

    componentDidMount() {

        let { allWsDataArray } = this.props;
        let copyDataArray = [...allWsDataArray];
        this.setState({
            allWsChildDataArray: copyDataArray,
            showContextMenu: false,
            menuOptions: []
        }, () => {
            this.setTodayScrollbarLeft();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allWsDataArray !== this.props.allWsDataArray) {
            this.refreshTheState()
        }
        if ((prevProps.todayLeftPixels !== this.props.todayLeftPixels)) {
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
        }
    }

    // deliverables context menu functions
    showContextMenuHandler = (event, delIndex) => {
        event.preventDefault();
        let { allWsChildDataArray, selectedDelIndex, selectedDelObj } = this.state;
        let { wsIndex, actIndex, menuType } = event.currentTarget.dataset;
        if (menuType === 'add_del_context') {
            let selDelObj = allWsChildDataArray[wsIndex].activities[actIndex].addedDeliverables[delIndex];

            this.setState({
                selectedDelObj: selDelObj,
                selectedWsIndex: wsIndex,
                selectedActIndex: actIndex,
                selectedDelIndex: delIndex
            }, () => {
                this.setState({
                    showContextMenu: menuType
                })
            })
        } else {
            let selDelObj = allWsChildDataArray[wsIndex].activities[actIndex].deliverables[delIndex];

            this.setState({
                selectedDelObj: selDelObj,
                selectedWsIndex: wsIndex,
                selectedActIndex: actIndex,
                selectedDelIndex: delIndex
            }, () => {
                this.setState({
                    showContextMenu: menuType
                });
            });
        }

    }

    addNewMilestone = () => {
        let { selectedWsIndex, selectedActIndex, selectedDelIndex, selectedDelObj, allWsChildDataArray } = this.state;
        let addMileArr = allWsChildDataArray[selectedWsIndex].activities[selectedActIndex].deliverables[selectedDelIndex].addedMilestones;
        if (addMileArr.length === 0) {
            let left = selectedDelObj['chartLeft'].split('px');
            addMileArr.push({
                "milestoneId": null,
                "deliverableId": selectedDelObj.deliverableId,
                "deliverableName": selectedDelObj.name,
                "delStartDate": selectedDelObj.startDate,
                "delEndDate": selectedDelObj.endDate,
                "milestone": '',
                "milestoneDate": '',
                "milestoneLeft": (Number(left[0]) - 6)
            });
            this.setState({
                allWsChildDataArray: allWsChildDataArray
            });
        }
    }

    openMultiMilestoneHandler = (event, groupObj) => {
        let { wsIndex, actIndex, delIndex, groupIndex, mileIndex } = event.currentTarget.dataset;
        const { allWsChildDataArray } = this.state;
        let dateString = groupObj[0].timeLineDate;
        let groupObjstate = allWsChildDataArray[wsIndex].activities[actIndex].deliverables[delIndex].milestonesGroup[dateString];
        groupObjstate[0].isMenuClicked = true;
        groupObj[0].isMenuClicked = true;
        this.setState({
            selectedMileGroup: groupObj,
            showMileGroup: true,
            allWsChildDataArray: allWsChildDataArray
        }, () => {
            document.addEventListener('click', this.closeMilestoneMenu);
        })
    }

    closeMilestoneMenu = () => {
        const { selectedMileGroup, allWsChildDataArray } = this.state;
        selectedMileGroup.map((mileObj) => {
            mileObj.isMenuClicked = false;
        });
        allWsChildDataArray.map(ws => {
            ws.activities.map(act => {
                act.deliverables.map(del => {
                    Object.values(del.milestonesGroup).map(gr => {
                        gr[0].isMenuClicked = false;
                    })
                })
            })
        })
        this.setState({
            selectedMileGroup: selectedMileGroup,
            allWsChildDataArray: allWsChildDataArray
        }, () => {
            document.removeEventListener('click', this.closeMilestoneMenu);
        })
    }

    openMilestoneHandler = (type, mileObj, mileInd) => {
        // let {selectedWsIndex,selectedActIndex, selectedDelIndex, selectedDelObj, allWsChildDataArray} = this.state;
        // let addMileArr = allWsChildDataArray[selectedWsIndex].activities[selectedActIndex].deliverables[selectedDelIndex].addedMilestones;
        if (this.isDefined(mileObj)) {
            let isAddedMile = false
            if (type === 'add_mile') {
                isAddedMile = true
            } else {
                isAddedMile = false
            }
            this.setState({
                isMileModalVisible: true,
                selectedMileObj: mileObj,
                isAddedMilestone: isAddedMile
            });
        }
    }

    closeMileModalHandler = (type) => {
        this.setState({
            isMileModalVisible: false,
            selectedMileObj: '',
            isAddedMilestone: false
        });
    }

    deleteMilestone = (event, mileObj, mileInd) => {
        let { wsIndex, actIndex, delIndex, menuType } = event.currentTarget.dataset;

        if (menuType === 'mile_context') {
            const confirmMsg = `Are you sure you want tobr_br_brdelete the Milestone?`;
            let indexobj = {
                'wsIndex': wsIndex,
                'actIndex': actIndex,
                'delIndex': delIndex,
                'menuType': menuType,
                'mileObj': mileObj,
                'mileInd': mileInd
            }
            this.openDeleteMileConfirmModal(confirmMsg, indexobj);
        } else {
            const { allWsChildDataArray } = this.state;
            let delObj = allWsChildDataArray[wsIndex].activities[actIndex].deliverables[delIndex];
            delObj.addedMilestones.splice(mileInd, 1);
            this.setState({
                allWsChildDataArray: allWsChildDataArray
            })
        }


    }

    deleteMilestoneHandler = () => {
        const { allWsChildDataArray, deleteMileIndexesObj } = this.state;
        const { workstreamStore } = this.props;
        let { wsIndex, actIndex, delIndex, menuType, mileObj, mileInd } = deleteMileIndexesObj;

        let delObj = allWsChildDataArray[wsIndex].activities[actIndex].deliverables[delIndex];
        const MileStoneId = mileObj.milestoneId;
        if (this.isDefined(MileStoneId)) {
            workstreamStore.deleteMilestone(MileStoneId)
                .then((res) => {
                    if (!res.error && res.data.resultCode === 'OK') {
                        delObj.milestones.splice(mileInd, 1);
                        this.props.fetchAllWsTreeDetails();
                        this.setState({
                            allWsChildDataArray: allWsChildDataArray
                        });
                        // this.fetchWSDeliverableDetails(deliverableId); //this call will erase user entered data fields like owner,dates..                    
                        this.showErrorNotification("Milestone Deleted Successfully", "Success", "success");
                    } else if (!res.error && res.data.resultCode === 'KO') {
                        this.showErrorNotification(res.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    }
                });

        }
    }

    openDeleteMileConfirmModal = (title, indexesObj) => {
        this.setState({
            deleteMileModalVisible: true,
            deleteMileModalTitle: title,
            deleteMileIndexesObj: indexesObj
        });
    }

    closeDeleteMileConfirmModal = (isYesClicked) => {
        this.setState({
            deleteMileModalVisible: false,
            deleteMileModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteMilestoneHandler();
        } else {
            this.setState({
                deleteMileIndexesObj: ''
            });
        }
    }

    resetMenuHandler = () => {

        this.setState({
            selectedWsIndex: '',
            selectedActIndex: '',
            selectedDelIndex: '',
            selectedDelObj: ''
        });
    }

    deleteDeliverable = (type) => {
        let { selectedWsIndex, selectedActIndex, selectedDelIndex } = this.state;
        const selectObj = {
            'wsIndex': selectedWsIndex,
            'actIndex': selectedActIndex,
            'delIndex': selectedDelIndex
        }
        if (type === 'add_del') {
            this.props.deleteDeliverableHandler(type, selectObj);
        } else {
            // service call, on success will call tree fetch api
            this.props.deleteDeliverableHandler(type, selectObj);

        }
    }
    openWsModal = (e, wsObj) => {
        if (this.isDefined(wsObj.wsId)) {
            this.setState({
                isWsModalVisible: true,
                selectedWsName: wsObj.name,
                selectedWsId: wsObj.wsId
            });
        }

    }

    closeWsModal = (type) => {
        const { workstreamStore } = this.props;
        // if (workstreamStore.status === "" || workstreamStore.completionPerc === "" || workstreamStore.status === null || workstreamStore.completionPerc === null) {
        //     if (type === "save") {
        //         this.setState({
        //             isWsModalVisible: false,
        //             selectedWsId: '',
        //             selectedWsName: ''
        //         });
        //     }
        //     else {
        //         this.showErrorNotification("Please save the mandatory fields", "error", "error")
        //     }
        // }
        // else {
        this.setState({
            isWsModalVisible: false,
            selectedWsId: '',
            selectedWsName: ''
        });
        // }

        // this.fetchWsOverviewDetails();
    }
    openDeliverableModal = (e, delObj) => {
        if (this.isDefined(delObj.deliverableId)) {
            this.setState({
                isDelModalVisible: true,
                selectedDelName: delObj.name,
                selectedDelId: delObj.deliverableId
            });
        }

    }

    closeDelModal = (param) => {
        this.setState({
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: ''
        });
        // this.fetchWsOverviewDetails();
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
            let allConnectorsCache = [];

            if (allWsChildDataArray.length > 0) {

                // get the all del grouped by IDs object calculated in parent
                let allDelIdObj = { ...allWsChildDataArray.allDelIdObj };
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


    //Open/Close ActivityDetailsModal
    openActivityModalHandler = (e, act) => {
        this.setState({
            isActModalVisible: true,
            selectedActName: act.name,
            selectedActId: act.activityId
        });
    }

    closeActModalHandler = (type) => {
        if (type === "save") {
            this.props.fetchAllWsTreeDetails();
            this.setState({
                isActModalVisible: false,
                selectedActName: '',
                selectedActId: ''
            });
        }
        else {
            this.setState({
                isActModalVisible: false,
                selectedActName: '',
                selectedActId: ''
            });
        }
    }

    //Open/Close DeliverableDetailsModal
    openDeliverableModalHandler = (e, delObj) => {
        if (this.isDefined(delObj.deliverableId)) {
            this.setState({
                isDelModalVisible: true,
                selectedDelName: delObj.name,
                selectedDelId: delObj.deliverableId
            });
        }
    }

    closeDelModalHandler = (type) => {
        if (type === "save") {
            this.props.fetchAllWsTreeDetails();
            this.setState({
                isDelModalVisible: false,
                selectedDelId: '',
                selectedDelName: ''
            });
        }
        else {
            this.setState({
                isDelModalVisible: false,
                selectedDelId: '',
                selectedDelName: ''
            });
        }

    }
    getmileStoneIcon = (status) => {
        let result = "";
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

        const { addedNewWsArray } = this.props;
        const { allWsChildDataArray, showContextMenu, selectedDelObj, selectedMileGroup } = this.state;


        return (
            <div id="ws_gantt_main" ref={this.chartRightRef}  className="ws-actuals-gantt-chart-wrapper">
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
                        {allWsChildDataArray && allWsChildDataArray.map((wsObj, wsInd) => (
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
                                                onClick={(e) => { this.openWsModal(e, wsObj) }}
                                                className={"custom-gantt-chart-slider"}>
                                            </div>
                                            <ReactTooltip id={`ws_chart_plan_startdate_hovertxt_${wsInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{wsObj.name}</div>
                                                    <div>Planned Start Date : {(wsObj.startDate === null || wsObj.startDate === "") ? "" : Moment(new Date(wsObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                </div>
                                            </ReactTooltip>

                                        </> : ''
                                    }

                                    <div id={`ws_chart_${wsInd}`}
                                        data-tip
                                        data-for={`ws_chart_hovertxt_${wsInd}`}
                                        data-place="top"
                                        style={{ left: wsObj.barLeft, width: wsObj.barWidth }}
                                        onClick={(e) => { this.openWsModal(e, wsObj) }}
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
                                            <div>Completion Percent : {(wsObj.completionPercent === null || wsObj.completionPercent === "") ? "" : `${wsObj.completionPercent}%`}</div>
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
                                                onClick={(e) => { this.openWsModal(e, wsObj) }}
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
                                {wsObj.addedActivities && wsObj.addedActivities.map((actObj, actInd) => (
                                    <div key={`ws_${wsInd}_add_act_${actInd}`} className="each-add-act-encloser">
                                        <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            <div id={`ws_${wsInd}_add_act_chart_${actInd}`}
                                                className="custom-gantt-chart default-chart-color">
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                    <div key={`ws_${wsInd}_act_${actInd}`} className="each-act-encloser">
                                        <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            {actObj.chartWidth !== '100%' ?
                                                <>
                                                    <div 
                                                        data-tip
                                                        data-for={`ws_${wsInd}_act_chart_startdate_${actInd}`}
                                                        data-place="top" 
                                                        id={`ws_${wsInd}_act_chart_${actInd}`}
                                                        style={{ left: actObj.chartLeft, width: '8px', top: '2px' }}
                                                        className={"custom-gantt-chart-slider"}
                                                        onClick={(e) => { this.openActivityModalHandler(e, actObj) }}>
                                                    </div>
                                                    <ReactTooltip id={`ws_${wsInd}_act_chart_startdate_${actInd}`}>
                                                        <div>
                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                            <div>Planned Start Date : {(actObj.startDate === null || actObj.startDate === "") ? "" : Moment(new Date(actObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                        </div>
                                                    </ReactTooltip>
                                                </> : ''}
                                            <div id={`ws_${wsInd}_act_chart_${actInd}`}
                                                style={{ left: actObj.barLeft, width: actObj.barWidth }}
                                                data-tip
                                                data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}`}
                                                data-place="top"
                                                //         className={`custom-gantt-chart
                                                // ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}`}
                                                className={`custom-gantt-chart ${'default-chart-color'}`}
                                                onClick={(e) => { this.openActivityModalHandler(e, actObj) }}>
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
                                            <ReactTooltip id={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}`}>
                                                <div>
                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                    <div>Owner : {actObj.owner}</div>
                                                    <div>Status : {this.decodeStatus(actObj.status)}</div>
                                                    <div>Completion Percent : {(actObj.complPercent === null || actObj.complPercent === "") ? "" : `${actObj.complPercent}%`}</div>
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
                                                        data-for={`ws_${wsInd}_act_chart_enddate_${actInd}`}
                                                        data-place="top" 
                                                        id={`ws_${wsInd}_act_chart_${actInd}`}
                                                        style={{ left: parseInt(actObj.chartWidth) + parseInt(actObj.chartLeft) - 8, width: '8px', top: '2px' }}
                                                        className={"custom-gantt-chart-slider slider-end"}
                                                        onClick={(e) => { this.openActivityModalHandler(e, actObj) }}>
                                                    </div> 
                                                    <ReactTooltip id={`ws_${wsInd}_act_chart_enddate_${actInd}`}>
                                                        <div>
                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{actObj.name}</div>
                                                            <div>Planned End Date : {(actObj.endDate === null || actObj.endDate === "") ? "" : Moment(new Date(actObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                        </div>
                                                    </ReactTooltip>
                                                </>: ''}
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
                                                            onContextMenu={(e) => { this.showContextMenuHandler(e, delInd) }}
                                                        >
                                                        </div>
                                                    </ContextMenuTrigger>
                                                </div>
                                            </div>
                                        ))}

                                        {actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (

                                            <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="each-del-encloser">

                                                <div className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                    {/* added milestone of a deliverable */}
                                                    {delObj.addedMilestones && delObj.addedMilestones.map((mileObj, mileInd) => (
                                                        <div key={`added_mile_${mileInd}`} className="add-mile-div del-ms-div"
                                                            style={{ left: mileObj.milestoneLeft }}>
                                                            <ContextMenuTrigger id={`ws_${wsInd}_act_${actInd}_del_${delInd}_add_mile_${mileInd}_context_menu`}>
                                                                <img className="mile-icon-img" id={`add_mile_icon`} src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('add_mile', mileObj, mileInd) }}></img>
                                                            </ContextMenuTrigger>

                                                        </div>
                                                    ))
                                                    }

                                                    {/* saved milestones of deliverable 
                                                    {delObj.milestones && delObj.milestones.map((mileObj, mileInd) => (
                                                        <Fragment>

                                                            <div key={`mile_${mileInd}`} className="del-ms-div"
                                                                style={{ left: mileObj.milestoneLeft }}>
                                                                <ContextMenuTrigger id={`ws_${wsInd}_act_${actInd}_del_${delInd}_mile_${mileInd}_context_menu`}>
                                                                    <img className="mile-icon-img" id={`mile_icon_${mileInd}`} src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}></img>
                                                                </ContextMenuTrigger>
                                                            </div>

                                                            <ContextMenu id={`ws_${wsInd}_act_${actInd}_del_${delInd}_mile_${mileInd}_context_menu`} className="mile-context-menu" >
                                                                <MenuItem className="menu-item">
                                                                    <div
                                                                        data-menu-type={`mile_context`}
                                                                        data-ws-index={wsInd} data-del-index={delInd}
                                                                        data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                    ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"></img>Delete</div>
                                                                </MenuItem>
                                                            </ContextMenu>

                                                        </Fragment>

                                                    ))

                                                    }
                                                    */}

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
                                                                                    src={this.getmileStoneIcon(mileObj.status)} alt="ms_icon" onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}></img>

                                                                            </ContextMenuTrigger>
                                                                        </div>
                                                                        <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_chart_hovertxt_${mileInd}`}>
                                                                            <div>
                                                                                <div style={{ padding: "0px 0px 4px 0px" }}>{mileObj.milestone}</div>
                                                                                <div>Status : {this.decodeStatus(mileObj.status)}</div>
                                                                                <div>Planned Date : {(mileObj.milestoneDate === null || mileObj.milestoneDate === "") ? "" : Moment(new Date(mileObj.milestoneDate)).format('DD-MMM-YYYY')}</div>
                                                                                {(mileObj.actualDate !== null && mileObj.actualDate !== "") ?
                                                                                    <div>Actual Date : {(mileObj.actualDate === null || mileObj.actualDate === "") ? "" : Moment(new Date(mileObj.actualDate)).format('DD-MMM-YYYY')}</div>
                                                                                    :
                                                                                    (
                                                                                        (mileObj.expDate !== null && mileObj.expDate !== "") ?
                                                                                            <div>Expected Date : {(mileObj.expDate === null || mileObj.expDate === "") ? "" : Moment(new Date(mileObj.expDate)).format('DD-MMM-YYYY')}</div>
                                                                                            : ""
                                                                                    )
                                                                                }
                                                                            </div>
                                                                        </ReactTooltip>


                                                                    </Fragment>
                                                                ))
                                                                }
                                                                {/* milestone menu for common dated milestones */}
                                                                {selectedMileGroup.length > 0 && groupObj[0].isMenuClicked ?
                                                                    <div className="mile-group-menu ws-menu-wrapper"
                                                                        style={{ left: parseInt(selectedMileGroup[0].milestoneLeft) + 24 }}
                                                                    >
                                                                        <div className="menu-vertical">
                                                                            {selectedMileGroup && selectedMileGroup.map((mileObj, mileInd) => (
                                                                                <div key={`group_milestone_menu_${mileInd}`} className="menu-item">
                                                                                    <Fragment>
                                                                                        <span className="group-mile-name" onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}>
                                                                                            {mileObj.milestone === '' ?
                                                                                                <Fragment>
                                                                                                    <span data-tip="" data-type="dark" data-for="name_not_tt">{`Milestone name...`}</span>
                                                                                                    <ReactTooltip id={`name_not_tt`}>{'Milestone name not added'}</ReactTooltip>
                                                                                                </Fragment> :
                                                                                                mileObj.milestone.length > 12 ?
                                                                                                    <Fragment><span data-tip="" data-for={`mile_name_tt_${mileInd}`} data-type="dark" >{mileObj.milestone.substr(0, 12)}...</span>
                                                                                                        <ReactTooltip id={`mile_name_tt_${mileInd}`}>{mileObj.milestone}</ReactTooltip>
                                                                                                    </Fragment>
                                                                                                    : <span>{mileObj.milestone}</span>
                                                                                            }
                                                                                        </span>
                                                                                        {/* <span className="mile-delete-div"
                                                                                            data-menu-type={`mile_context`}
                                                                                            data-ws-index={wsInd} data-del-index={delInd}
                                                                                            data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                        ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"
                                                                                            data-tip="" data-for={`mile_delete_tt_${mileInd}`} data-type="dark"
                                                                                        ></img></span>
                                                                                        <ReactTooltip id={`mile_delete_tt_${mileInd}`}>Delete</ReactTooltip> */}
                                                                                    </Fragment>

                                                                                </div>
                                                                            ))
                                                                            }

                                                                        </div>
                                                                    </div>
                                                                    : ''
                                                                }
                                                                {/* for all milestones with same date */}
                                                                {groupObj.length > 1 ?
                                                                    <Fragment>
                                                                        <div key={`group_${groupInd}`} className="del-ms-div multi-miles"
                                                                            style={{ left: groupObj[0].milestoneLeft }}>
                                                                            <div className="each-multi-miles-binder">
                                                                                <img className="mile-icon-img" id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_icon`}
                                                                                    data-tip
                                                                                    data-ws-index={wsInd} data-del-index={delInd}
                                                                                    data-act-index={actInd}
                                                                                    data-group-index={groupInd}
                                                                                    data-for={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_chart_hovertxt_${groupInd}`}
                                                                                    src={mileStoneIcon} alt="ms_icon"
                                                                                    onClick={(event) => { this.openMultiMilestoneHandler(event, groupObj) }}>
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
                                                        {
                                                            delObj.chartWidth !== '100%' ?
                                                                <>
                                                                    <div
                                                                        data-tip
                                                                        data-for={`ws_${wsInd}_act_${actInd}_del_chart_startdate_${delInd}`}
                                                                        data-place="top"  
                                                                        id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                                        style={{ left: delObj.chartLeft, width: '8px', top: '2px' }}
                                                                        className={`custom-gantt-chart-slider ws_${wsInd}_act_${actInd}_del_class_${delInd}`}
                                                                    >
                                                                    </div> 
                                                                    <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_chart_startdate_${delInd}`}>
                                                                        <div>
                                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                            <div>Planned Start Date : {(delObj.startDate === null || delObj.startDate === "") ? "" : Moment(new Date(delObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                                        </div>
                                                                    </ReactTooltip>
                                                                </>: ''
                                                        }
                                                        <div id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                            data-menu-type={`del_context`}
                                                            data-ws-index={wsInd}
                                                            data-act-index={actInd}
                                                            data-tip
                                                            data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}
                                                            data-place="top"
                                                            onClick={(e) => { this.openDeliverableModalHandler(e, delObj) }}
                                                            onContextMenu={(e) => { this.showContextMenuHandler(e, delInd) }}
                                                            style={{ left: delObj.barLeft, width: delObj.barWidth }}
                                                            className={`custom-gantt-chart ws_${wsInd}_act_${actInd}_del_class_${delInd}
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
                                                        <ReactTooltip id={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}>
                                                            <div>
                                                                <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                <div>Owner : {delObj.owner}</div>
                                                                <div>Status : {this.decodeStatus(delObj.status)}</div>
                                                                <div>Completion Percent : {(delObj.complPercent === null || delObj.complPercent === "") ? "" : `${delObj.complPercent}%`}</div>
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
                                                                        data-for={`ws_${wsInd}_act_${actInd}_del_chart_enddate_${delInd}`}
                                                                        data-place="top" 
                                                                        id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                                        style={{ left: parseInt(delObj.chartLeft) + parseInt(delObj.chartWidth) - 8, width: '8px', top: '2px' }}
                                                                        className={`custom-gantt-chart-slider slider-end ws_${wsInd}_act_${actInd}_del_class_${delInd}`}
                                                                    >
                                                                    </div>
                                                                    <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_chart_enddate_${delInd}`}>
                                                                        <div>
                                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                            <div>Planned End Date : {(delObj.endDate === null || delObj.endDate === "") ? "" : Moment(new Date(delObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                                        </div>
                                                                    </ReactTooltip>

                                                                </>
                                                                 : ''}
                                                    </ContextMenuTrigger>
                                                </div>
                                                <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_tt_${delInd}`}>test</ReactTooltip>
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
                {/* context menu and menu items for deliverable charts */}

                {/* <div className="del-context-menu-wrapper">
                    <ContextMenu id="add_del_context" className="del-context-menu" onHide={() => { this.resetMenuHandler() }}>
                        <MenuItem className="menu-item disabled-item">Add Milestone</MenuItem>
                        <MenuItem className="menu-item disabled-item" >Dependent Deliverables</MenuItem>
                        <MenuItem className="menu-item" onClick={() => { this.deleteDeliverable('add_del') }}>Delete Deliverable</MenuItem>
                    </ContextMenu>

                    <ContextMenu id={`del_context`} className="del-context-menu" onHide={() => { this.resetMenuHandler() }}>
                        <MenuItem className={`menu-item ${selectedDelObj && selectedDelObj.startDate && selectedDelObj.startDate !== '' ? '' : 'disabled-item'}`}
                            onClick={() => { this.addNewMilestone() }} >Add Milestone</MenuItem>
                        <MenuItem className="menu-item">Dependent Deliverables</MenuItem>
                        <MenuItem className="menu-item" onClick={() => { this.deleteDeliverable('del') }}>Delete Deliverable</MenuItem>
                    </ContextMenu>
                </div> */}

                {/* <SteppedLineTo from="ws_1_act_0_del_left_class_0" to="ws_1_act_0_del_left_class_1" orientation="h"
                            borderColor="#fff"
                            // style={{ borderStyle: 'dashed'}}
                            borderWidth={1.5}
                            borderStyle="dashed"
                            fromAnchor="left"
                            toAnchor="left" /> */}
                {this.state.isWsModalVisible ?
                    <div className="del-modal-enclose">
                        <WorkstreamDetailsModalWsActuals
                            modalCloseHandler={this.closeWsModal}
                            visible={this.state.isWsModalVisible}
                            wsName={this.state.selectedWsName}
                            wsId={this.state.selectedWsId}
                            onSaveSuccess={this.props.fetchAllWsTreeDetails}
                        /></div> : ''
                }

                {this.state.isActModalVisible ?
                    <ActivityDetailsModalWA
                        modalCloseHandler={this.closeActModalHandler}
                        title={this.state.selectedActName}
                        visible={this.state.isActModalVisible}
                        activityId={this.state.selectedActId}
                    />
                    : ''

                }

                {
                    this.state.isDelModalVisible ?
                        <DeliverableDetailsModalWsActuals
                            deliverableName={this.state.selectedDelName}
                            deliverableId={this.state.selectedDelId}
                            isDelModalVisible={this.state.isDelModalVisible}
                            modalCloseHandler={this.closeDelModalHandler}
                            onSaveSuccess={this.props.fetchAllWsTreeDetails}
                        />
                        : ''

                }

                {this.state.isMileModalVisible ?
                    <MilestoneDetailsModalWsActuals
                        selectedMileObj={this.state.selectedMileObj}
                        isAddedMilestone={this.state.isAddedMilestone}
                        isMileModalVisible={this.state.isMileModalVisible}
                        modalCloseHandler={this.closeMileModalHandler}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''
                }

                {/* {this.state.isDelModalVisible ?
                    <DeliverableDetailsModalDefineWs
                        deliverableName={this.state.selectedDelName}
                        deliverableId={this.state.selectedDelId}
                        isDelModalVisible={this.state.isDelModalVisible}
                        modalCloseHandler={this.closeDelModalHandler}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''
                } */}

                {/* {this.state.isMileModalVisible ?
                    <MilestoneDetailsModalDefineWs
                        selectedMileObj={this.state.selectedMileObj}
                        isAddedMilestone={this.state.isAddedMilestone}
                        isMileModalVisible={this.state.isMileModalVisible}
                        modalCloseHandler={this.closeMileModalHandler}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''
                } */}

                {/* custom confirm box */}
                <CustomConfirmModal
                    ownClassName={'ws-mile-delete'}
                    isModalVisible={this.state.deleteMileModalVisible}
                    modalTitle={this.state.deleteMileModalTitle}
                    closeConfirmModal={this.closeDeleteMileConfirmModal}
                />

            </div>
        )
    }
}

export default withRouter(AllWsActualsGanttChart);
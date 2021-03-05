import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem, SubMenu } from "react-contextmenu";
import WorkstreamDetailsModalDefineWs from '../DefineWorkstreamModals/WorkstreamDetailsModalDefineWs';
import ConnectorHelper from '../DefineWsTimeline/ConnectorHelper';
import Draggable from "react-draggable";
import DatePicker from "react-datepicker";
import { createPortal } from 'react-dom';

import './AllWsGanttChart.css';
import mileStoneIcon from '../../assets/project_DWS/milestone-icon.svg';
import mileStoneTrashIcon from '../../assets/project_DWS/trash-icon-milestone.svg';
import calIcon from '../../assets/project_DWS/small-calender.svg';
import smallSave from '../../assets/project_DWS/small-save.svg';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ActivityDetailsModalDefineWs from '../DefineWorkstreamModals/ActivityDetailsModalDefineWs';
import DeliverableDetailsModalDefineWs from '../DefineWorkstreamModals/DeliverableDetailsModalDefineWs';
import MilestoneDetailsModalDefineWs from '../DefineWorkstreamModals/MilestoneDetailsModalDefineWs';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import Moment from 'moment';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class AllWsGanttChart extends Component {
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
            deleteMileIndexesObj: '',

            depDelUpdateConfirmModalVisible: false,
            depDelUpdateConfirmModalTitle: '',
            isLoading: false,

            // variables for deliverable drag

            editDelDatesConfirmModalVisible: false,
            editDelDatesConfirmModalTitle: '',
            isEditDelDatesLoading: false

        };

        this.allConnectorsCache = [];

        this.unSavedDelPayload = {};

        this.delClickCount = 0;
        this.singleClickDelTimer = '';

        this.actClickCount = 0;
        this.singleClickActTimer = '';

        this.wsClickCount = 0;
        this.singleClickWsTimer = '';

        this.isDefined = this.isDefined.bind(this);
        this.showContextMenuHandler = this.showContextMenuHandler.bind(this);
        this.openDeliverableModal = this.openDeliverableModal.bind(this);
        this.closeDelModal = this.closeDelModal.bind(this);
        this.openWsModal = this.openWsModal.bind(this);
        this.closeWsModal = this.closeWsModal.bind(this);
        this.closeDelDateMenus = this.closeDelDateMenus.bind(this);


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
        if ((prevProps.allWsDataArray !== this.props.allWsDataArray) ||
            (prevProps.disableAllTooltips !== this.props.disableAllTooltips)) {
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
                        return true
                    })
                    return true
                })
                return true
            })
            return true
        })
        this.setState({
            allWsChildDataArray: copyDataArray
        }, () => {
            ReactTooltip.rebuild();
        });
    }


    // deliverables context menu functions
    showContextMenuHandler = (event, delIndex) => {
        event.preventDefault();
        let { allWsChildDataArray } = this.state;
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
        let { wsIndex, actIndex, delIndex } = event.currentTarget.dataset;
        const { allWsChildDataArray } = this.state;
        let dateString = groupObj[0].milestoneDate;
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
            return true
        });
        allWsChildDataArray.map(ws => {
            ws.activities.map(act => {
                act.deliverables.map(del => {
                    Object.values(del.milestonesGroup).map(gr => {
                        gr[0].isMenuClicked = false;
                        return true
                    })
                    return true
                })
                return true
            })
            return true
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
        let { wsIndex, actIndex, delIndex, mileObj, mileInd } = deleteMileIndexesObj;

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

                        this.showErrorNotification("Milestone Deleted Successfully", "Success", "success");
                    } else if (res.data.resultCode === 'KO') {
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
        // const { workstreamStore } = this.props;
        // if (workstreamStore.wsOwner === "" || workstreamStore.wsEmail === "" || workstreamStore.wsOwner === null || workstreamStore.wsEmail === null) {
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
    // ----- END of Utility functions -------

    // new ws design functions


    //Open/Close ActivityDetailsModal
    openActivityModalHandler = (e, act) => {

        this.setState({
            isActModalVisible: true,
            selectedActName: act.name,
            selectedActId: act.activityId
        });
    }

    closeActModalHandler = (type) => {
        // const { workstreamStore } = this.props;
        // if (workstreamStore.actOwner === "" || workstreamStore.actEmail === "" || workstreamStore.actOwner === null || workstreamStore.actEmail === null) {
        //     if (type === "save") {
        //         this.setState({
        //             isActModalVisible: false,
        //             selectedActName: '',
        //             selectedActId: ''
        //         });
        //     }
        //     else {
        //         this.showErrorNotification("Please save the mandatory fields", "error", "error")
        //     }
        // }
        // else {
        this.setState({
            isActModalVisible: false,
            selectedActName: '',
            selectedActId: ''
        });
        // this.props.fetchAllWsTreeDetails();
        // }
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
        // const { workstreamStore } = this.props;
        // if (workstreamStore.delOwner === "" || workstreamStore.delEmail === "" || workstreamStore.delOwner === null || workstreamStore.delEmail === null || workstreamStore.delStartDate === "" || workstreamStore.delEndDate === "") {
        //     if (type === "save") {
        //         this.setState({
        //             isDelModalVisible: false,
        //             selectedDelId: '',
        //             selectedDelName: ''
        //         });
        //     }
        //     else {
        //         this.showErrorNotification("Please save the mandatory fields", "error", "error")
        //     }

        // }
        // else {
        this.setState({
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: ''
        });
        // }

    }
    onCheckDepDels = (event, typeIndex, selectedDelObj, delObj, wsInd, actInd, delInd) => {
        const { allWsChildDataArray } = this.state;
        let depDelType = ""
        switch (typeIndex) {
            case 0:
                depDelType = "FINISH_TO_START"
                break;
            case 1:
                depDelType = "FINISH_TO_FINISH"
                break;
            case 2:
                depDelType = "START_TO_START"
                break;
            case 3:
                depDelType = "START_TO_FINISH"
                break;
            default:
                break;
        }
        let payload = {
            "delId": allWsChildDataArray[wsInd].activities[actInd].deliverables[delInd].deliverableId,
            "depType": depDelType,
            "depDelId": selectedDelObj.deliverableId,
            "mapId": SessionStorage.read('mapId'),
            "add": event.target.checked,
            "forceUpdate": false
        }


        this.setState({
            depDelPayload: payload,
            isLoading: true
        })
        this.call_add_updateDependentDeliverables(payload, wsInd, actInd, delInd, delObj, selectedDelObj)



    }
    call_add_updateDependentDeliverables = (payload, wsInd, actInd, delInd, delObj) => {
        const { selectedDelObj } = this.state;
        let tempSelectedDelObj = selectedDelObj;
        const { workstreamStore } = this.props;
        workstreamStore.add_updateDependentDeliverables(payload)
            .then((res) => {
                if (res.error) {
                    return {
                        error: true
                    }
                } else if (res.resultCode === "KO") {
                    if (res.errorDescription === "WS100-Rule conflicted") {
                        let confirmMsg = `Are you sure you want to link to ${delObj.name}?br_br_brThe Dates of ${selectedDelObj.name} will be adjusted accordingly`
                        this.depDelUpdateConfirmModalOpen(confirmMsg, wsInd, actInd, delInd)
                        // tempWsDataArray[wsInd].activities[actInd].deliverables[delInd].isChecked = payload.add
                        this.setState({
                            // allWsChildDataArray:tempWsDataArray,
                            isLoading: false
                        })
                    }
                    else {
                        this.showErrorNotification(res.errorDescription, "Error", "error");
                        this.setState({
                            isLoading: false,
                        })
                    }
                }
                else {
                    /*check or uncheck the dels*/
                    if (tempSelectedDelObj) {
                        let depDelType = payload.depType;
                        if (payload.add) {

                            if (tempSelectedDelObj.dependentDeliverables === null) {
                                tempSelectedDelObj.dependentDeliverables = {
                                    "FINISH_TO_START": [],
                                    "FINISH_TO_FINISH": [],
                                    "START_TO_START": [],
                                    "START_TO_FINISH": []
                                }
                                tempSelectedDelObj.dependentDeliverables[depDelType].push(payload)

                            }
                            else {
                                tempSelectedDelObj.dependentDeliverables[depDelType].push(payload)
                            }

                        }
                        else {
                            let selectedDepTypeArr = selectedDelObj.dependentDeliverables[depDelType]
                            for (let i = 0; i < selectedDepTypeArr.length; i++) {
                                if (selectedDepTypeArr[i].delId === delObj.deliverableId) {
                                    tempSelectedDelObj.dependentDeliverables[depDelType].splice(i, 1)
                                }
                            }
                        }
                    }
                    this.setState({
                        isLoading: false,
                        selectedDelObj: tempSelectedDelObj
                    })
                    this.props.fetchAllWsTreeDetails();
                }
            })
    }
    depDelUpdateConfirmModalOpen = (title, wsInd, actInd, delInd) => {

        this.setState({
            depDelUpdateConfirmModalVisible: true,
            depDelUpdateConfirmModalTitle: title,
            depDel_wsInd: wsInd,
            depDel_actInd: actInd,
            depDel_delInd: delInd

        });
    }
    depDelUpdateConfirmModalClose = (isYesClicked) => {
        this.setState({
            depDelUpdateConfirmModalVisible: false,
            depDelUpdateConfirmModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.forceUpdateDepDel();
        }
    }
    forceUpdateDepDel = () => {
        const { depDelPayload, depDel_wsInd, depDel_actInd, depDel_delInd } = this.state;
        let tempPayload = depDelPayload;
        tempPayload.forceUpdate = true
        this.call_add_updateDependentDeliverables(tempPayload, depDel_wsInd, depDel_actInd, depDel_delInd)
    }
    isChecked = (typeIndex, wsInd, actInd, delInd, deliverableId, selectedDelObj) => {
        let depDelType = ""
        switch (typeIndex) {
            case 0:
                depDelType = "FINISH_TO_START"
                break;
            case 1:
                depDelType = "FINISH_TO_FINISH"
                break;
            case 2:
                depDelType = "START_TO_START"
                break;
            case 3:
                depDelType = "START_TO_FINISH"
                break;
            default:
                break;
        }
        let depDelArr = (selectedDelObj && selectedDelObj.dependentDeliverables);
        if (selectedDelObj && (depDelArr !== null && depDelArr[depDelType].length > 0)) {
            let count = 0;
            for (let i = 0; i < depDelArr[depDelType].length; i++) {
                if (depDelArr[depDelType][i].delId === deliverableId) {
                    count++
                }
            }
            if (count > 0) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }


    // START of connector related functions

    renderCreateLink = () => {
        if (true) {
            let { allWsChildDataArray } = this.state;
            let allConnectorsCache = [];

            if (allWsChildDataArray.length > 0) {

                // get the all del grouped by IDs object calculated in parent
                allWsChildDataArray.map(wsObj => {
                    wsObj.activities.map(actObj => {
                        actObj.deliverables.map(delObj => {
                            if (this.isDefined(delObj.dependentDeliverables) && delObj.chartWidth !== '100%') {
                                let eachDelConnectorsArray = [];
                                eachDelConnectorsArray = this.calculateEachDelConnectors(delObj);
                                allConnectorsCache = [...allConnectorsCache, ...eachDelConnectorsArray];
                            }
                            return true
                        })
                        return true
                    })
                    return true
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
                return true
            })
            return true
        })
        return connectorsCache;
    }

    mapConnectorToRelation = (depDelObj, conObj) => {
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

                default:
                    break;
            }
        } else {

        }
    }

    // END of connector related functions

    // differ the onclick and double click events
    handleDelClicks = (e, delObj) => {
        if (SessionStorage && (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) {
            this.openDeliverableModalHandler(e, delObj);
        } else {
            this.delClickCount++;
            if (this.delClickCount === 1) {
                this.singleClickDelTimer = setTimeout(function () {
                    this.delClickCount = 0;
                    this.openDeliverableModalHandler(e, delObj);
                }.bind(this), 300);

            } else if (this.delClickCount === 2) {
                clearTimeout(this.singleClickDelTimer);
                this.delClickCount = 0;
                this.props.enableWsActDelDrag(e, delObj);
            }
        }
    }

    handleActClicks = (e, actObj) => {
        if (SessionStorage && (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) {
            this.openActivityModalHandler(e, actObj);
        } else {
            this.actClickCount++;
            if (this.actClickCount === 1) {
                this.singleClickActTimer = setTimeout(function () {
                    this.actClickCount = 0;
                    this.openActivityModalHandler(e, actObj);
                }.bind(this), 300);

            } else if (this.actClickCount === 2) {
                clearTimeout(this.singleClickActTimer);
                this.actClickCount = 0;
                this.props.enableWsActDelDrag(e, actObj);
            }
        }
    }

    handleWsClicks = (e, wsObj) => {
        if (SessionStorage && (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) {
            this.openWsModal(e, wsObj);
        } else {
            this.wsClickCount++;
            if (this.wsClickCount === 1) {
                this.singleClickWsTimer = setTimeout(function () {
                    this.wsClickCount = 0;
                    this.openWsModal(e, wsObj);
                }.bind(this), 300);

            } else if (this.wsClickCount === 2) {
                clearTimeout(this.singleClickWsTimer);
                this.wsClickCount = 0;
                this.props.enableWsActDelDrag(e, wsObj);
            }
        }
    }

    //  drag drop functions
    onDelStart = (event, delObj) => {
        // this.setState({activeDrags: ++this.state.activeDrags});
       
    };

    onDelStop = (event, delObj) => {
        // this.setState({activeDrags: --this.state.activeDrags});
        
        this.props.delOnDrop(event, delObj);
    };

    onActStart = (event, actObj) => {
        // this.setState({activeDrags: ++this.state.activeDrags});
      
    };

    onActStop = (event, actObj) => {
        // this.setState({activeDrags: --this.state.activeDrags});
      
        this.props.actOnDrop(event, actObj);
    };
    onWsStop = (event, wsObj) => {
        // this.setState({activeDrags: --this.state.activeDrags});
       
        this.props.wsOnDrop(event, wsObj);
    };

    // edit deliverable dates, enable it based on min-width of 30px
    checkDelWidth = (delObj) => {
        let widthD = 0;
        if (delObj.chartWidth && delObj.chartWidth !== '100%') {
            let wid = delObj[`chartWidth`].toString();
            widthD = wid.substr(0, wid.length - 2);
            widthD = parseFloat(widthD);
        }
        return widthD;
    }

    openDelStartMenu = (event, delObj) => {
        let { wsIndex, actIndex, delIndex } = event.target.dataset;
        let { allWsChildDataArray } = this.state;
        let tempAllWsData = [...allWsChildDataArray];

        let delO = tempAllWsData[wsIndex].activities[actIndex].deliverables[delIndex];
        delO['isStartOpened'] = true;
        delO['editStartDate'] = delO.startDate;


        this.setState({
            allWsChildDataArray: [...tempAllWsData]
        }, () => {
            document.addEventListener('click', this.closeDelDateMenus);
        });
    }

    openDelEndMenu = (event, delObj) => {
        let { wsIndex, actIndex, delIndex } = event.target.dataset;
        let { allWsChildDataArray } = this.state;
        let tempAllWsData = [...allWsChildDataArray];

        let delO = tempAllWsData[wsIndex].activities[actIndex].deliverables[delIndex];
        delO['isEndOpened'] = true;
        delO['editEndDate'] = delO.endDate;

        this.setState({
            allWsChildDataArray: [...tempAllWsData]
        }, () => {
            document.addEventListener('click', this.closeDelDateMenus);
        });
    }

    closeDelDateMenus = (event) => {
        let { allWsChildDataArray } = this.state;
        let target = event.target;
        let class_name = '';
        if (target && target.className) {
            class_name = target.className
        }
        if (target && (target.id === 'del_edit_start_picker' || target.id === 'del_edit_end_picker' || target.id === 'edit_del_save' || target.id === 'del_edit_cal'
            || class_name.substr(0, 10) === 'react-date')) {

        } else {
            allWsChildDataArray.map(ws => {
                ws.activities.map(act => {
                    act.deliverables.map(del => {
                        del.isStartOpened = false;
                        del.isEndOpened = false;
                        return true
                    });
                    return true
                });
                return true
            });

            this.setState({
                allWsChildDataArray: [...allWsChildDataArray]
            }, () => {
                document.removeEventListener('click', this.closeDelDateMenus);
            });
        }

    }

    // handle edit del dates onchange functions
    editStartDateHandler = (date, wsInd, actInd, delInd) => {
        let { allWsChildDataArray } = this.state;
        let delObj = allWsChildDataArray[wsInd].activities[actInd].deliverables[delInd];
        if (this.isDefined(date) && date !== '') {
            // let endDateObj = new Date(delObj.editEndDate);
            // if (endDateObj < date) {
            //     deliverableDetails.endDate = null;
            // }
            delObj.editStartDate = Moment(date).format('YYYY-MM-DD');

        } else {
            delObj.editStartDate = delObj.startDate;
        }
        this.setState({
            allWsChildDataArray: [...allWsChildDataArray]
        });
    }

    editEndDateHandler = (date, wsInd, actInd, delInd) => {
        let { allWsChildDataArray } = this.state;
        let delObj = allWsChildDataArray[wsInd].activities[actInd].deliverables[delInd];
        if (this.isDefined(date) && date !== '') {
            // let endDateObj = new Date(delObj.editEndDate);
            // if (endDateObj < date) {
            //     deliverableDetails.endDate = null;
            // }
            delObj.editEndDate = Moment(date).format('YYYY-MM-DD');

        } else {
            delObj.editEndDate = delObj.endDate;
        }
        this.setState({
            allWsChildDataArray: [...allWsChildDataArray]
        });
    }

    //save/update the edit deliverable dates
    saveEditDelDates = (delObj, type) => {
        let payload = {};

        if (type === 'start') {
            if (delObj.editStartDate && delObj.editStartDate !== '' && delObj.editStartDate !== delObj.startDate) {
                payload = {
                    "deliverableId": delObj.deliverableId,
                    "plannedStartDate": delObj.editStartDate,
                    "mapId": SessionStorage.read('mapId'),
                    "forceUpdate": false
                }
                this.call_updateEditDelievrable(payload);
            }
        } else if (type === 'end') {
            if (delObj.editEndDate && delObj.editEndDate !== '' && delObj.editEndDate !== delObj.endDate) {
                payload = {
                    "deliverableId": delObj.deliverableId,
                    "plannedEndDate": delObj.editEndDate,
                    "mapId": SessionStorage.read('mapId'),
                    "forceUpdate": false
                }
                this.call_updateEditDelievrable(payload);
            }
        }
    }

    call_updateEditDelievrable = (payload) => {
        const { workstreamStore } = this.props;
        this.unSavedDelPayload = {};
        this.setState({
            isEditDelDatesLoading: true
        });

        workstreamStore.updateDeliverableDates(payload)
            .then((response) => {
                if (response && response.error) {
                    this.setState({
                        isEditDelDatesLoading: false
                    });
                    return {
                        error: true
                    }
                } else if (response.data && response.data.resultCode === "OK") {
                    this.setState({
                        isEditDelDatesLoading: false
                    });
                    this.props.fetchAllWsTreeDetails();
                    this.showErrorNotification('Deliverable Date saved successfully', "Success", "success");

                } else if (response.data && response.data.resultCode === "KO") {
                    if (response.data.errorDescription === "WS100-Rule conflicted") {
                        this.unSavedDelPayload = payload;
                        let confirmMsg = `Are you sure you want to change the dates?br_br_brDependent Deliverables dates will be adjusted accordingly`;
                        this.editDelConfirmModalOpen(confirmMsg);
                        // this.depDelUpdateConfirmModalOpen(confirmMsg, wsInd, actInd, delInd)

                        // this.setState({
                        //     // allWsChildDataArray:tempWsDataArray,
                        //     // isLoading: false
                        // })
                    }
                    else {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                        this.setState({
                            isEditDelDatesLoading: false
                        });
                        // this.setState({
                        //     isLoading: false,
                        // })
                    }
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                  
                    this.setState({
                        isEditDelDatesLoading: false
                    });
                }

            });
    }

    editDelConfirmModalOpen = (title) => {

        this.setState({
            editDelDatesConfirmModalVisible: true,
            editDelDatesConfirmModalTitle: title,
            isEditDelDatesLoading: false
        });
    }
    editDelConfirmModalClose = (isYesClicked) => {
        this.setState({
            editDelDatesConfirmModalVisible: false,
            editDelDatesConfirmModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.forceUpdateDel();
        }
    }

    forceUpdateDel = () => {

        let tempPayload = this.unSavedDelPayload;
        tempPayload.forceUpdate = true
        this.call_updateEditDelievrable(tempPayload);
    }

    getDelStartDate = (delObj) => {
        let delStartDate = null;
        if (this.isDefined(delObj.editStartDate) && delObj.editStartDate !== '') {
            delStartDate = new Date(delObj.editStartDate);
        }
        return delStartDate;
    }


    getDelEndDate = (delObj) => {
        let delEndDate = null;
        if (this.isDefined(delObj.editEndDate) && delObj.editEndDate !== '') {
            delEndDate = new Date(delObj.editEndDate);
        }
        return delEndDate;
    }

    calcDelEndDateLeft = (delObj) => {

        if (delObj.chartRight > 135) {
            return delObj.chartRight - 135; // 135 is del edit dates menu width
        } else {
            return delObj.chartRight;
        }
    }

    render() {
        const { addedNewWsArray, saveOrderInProgress, disableAllTooltips } = this.props;
        const { allWsChildDataArray, selectedDelObj, selectedMileGroup, isLoading, isEditDelDatesLoading } = this.state;
        const deptDelTypesArray = [
            "Finish to Start",
            "Finish to Finish",
            "Start to Start",
            "Start to Finish"
        ];
        const startCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-start-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        const endCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-end-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        return (
            <div id="ws_gantt_main" style={{ cursor: saveOrderInProgress ? 'progress' : 'default' }} className="ws-gantt-chart-wrapper dws-default-charts">

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

                    <div className="add-ws-chart-binder">
                        {addedNewWsArray && addedNewWsArray.map((addws, ind) => (
                            <div key={ind} className="row each-ws-chart-row" style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                <div id={`addws_chart_${ind}`} className="custom-gantt-chart default-chart-color">
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="saved-ws-chart-row">
                        {allWsChildDataArray && allWsChildDataArray.map((wsObj, wsInd) => (
                            <div key={`ws _${wsInd}`} className="each-ws-encloser">
                                {wsObj.isDragEnabled ?
                                    <Fragment>
                                        <Draggable
                                            axis="y"
                                            bounds="#dws_tree_chart_main"
                                            handle={`.ws_drag_chart_${wsObj.wsId}`}
                                            scale={1}
                                            // onStart={(e) => { this.onActStart(e, wsObj) }}
                                            onStop={(e) => { this.onWsStop(e, wsObj) }}
                                        >
                                            <div className={`row each-ws-chart-row ${wsObj.isDragEnabled ? 'drag-object' : ''}`}
                                                data-ws-index={wsInd}
                                                data-drop-type="workstream"
                                                style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                <div id={`ws_chart_${wsInd}`}

                                                    style={{ cursor: 'grab', left: wsObj.chartLeft, width: wsObj.chartWidth }}
                                                    // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                                    // onClick={(e) => { this.handleWsClicks(e, wsObj) }}
                                                    className={`ws_drag_chart_${wsObj.wsId} custom-gantt-chart
                                        ${wsObj.startDate && wsObj.startDate !== '' ? 'ws-chart-color' : 'default-chart-color'}`}>
                                                </div>
                                            </div>
                                        </Draggable>

                                    </Fragment>
                                    :
                                    <div>
                                        <div className={`row each-ws-chart-row ${wsObj.anyWsCommonDragEnabled ? 'drop-object' : ''}`}
                                            data-ws-index={wsInd}
                                            data-drop-type="workstream"
                                            style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                            <div id={`ws_chart_${wsInd}`}
                                                data-ws-index={wsInd}
                                                data-drop-type="workstream"
                                                data-tip
                                                data-for={`ws_chart_hovertxt_${wsInd}`}
                                                data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
                                                data-place="top"
                                                style={{ left: wsObj.chartLeft, width: wsObj.chartWidth }}
                                                // onClick={(e) => { this.openWsModal(e, wsObj) }}
                                                onClick={(e) => { this.handleWsClicks(e, wsObj) }}
                                                className={`custom-gantt-chart
                                        ${wsObj.startDate && wsObj.startDate !== '' ? 'ws-chart-color' : 'default-chart-color'}`}>
                                            </div>

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
                                }

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
                                        {actObj.isDragEnabled ?
                                            <Fragment>
                                                <Draggable
                                                    axis="y"
                                                    bounds="#ws_gantt_main"
                                                    handle={`.act_drag_chart_${actObj.activityId}`}
                                                    scale={1}
                                                    onStart={(e) => { this.onActStart(e, actObj) }}
                                                    onStop={(e) => { this.onActStop(e, actObj) }}
                                                >
                                                    <div className={`row each-ws-chart-row ${actObj.isDragEnabled ? 'drag-object' : ''}`}
                                                        style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}
                                                        data-ws-index={wsInd}
                                                        data-act-index={actInd}
                                                        data-drop-type="activity"
                                                    >
                                                        <div id={`ws_${wsInd}_act_chart_${actInd}`}

                                                            style={{ cursor: 'grab', left: actObj.chartLeft, width: actObj.chartWidth }}
                                                            className={`act_drag_chart_${actObj.activityId} custom-gantt-chart
                                        ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}`}
                                                        // onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                        >
                                                        </div>
                                                    </div>
                                                </Draggable>

                                            </Fragment>
                                            :
                                            <div>
                                                <div className={`row each-ws-chart-row ${wsObj.anyDragEnabled ? 'drop-object' : ''}`}
                                                    style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}
                                                    data-ws-index={wsInd}
                                                    data-act-index={actInd}
                                                    data-drop-type="activity"
                                                >
                                                    <div id={`ws_${wsInd}_act_chart_${actInd}`}
                                                        data-ws-index={wsInd}
                                                        data-act-index={actInd}
                                                        data-drop-type="activity"
                                                        data-tip
                                                        data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}`}
                                                        data-place="top"
                                                        data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
                                                        style={{ left: actObj.chartLeft, width: actObj.chartWidth }}
                                                        className={`custom-gantt-chart
                                        ${actObj.startDate && actObj.startDate !== '' ? 'act-chart-color' : 'default-chart-color'}`}
                                                        //  onClick={(e) => { this.openActivityModalHandler(e, actObj) }}
                                                        onClick={(e) => { this.handleActClicks(e, actObj) }}
                                                    >
                                                    </div>

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
                                        }

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

                                                {delObj.isDragEnabled ?
                                                    <Fragment>
                                                        <Draggable
                                                            axis="y"
                                                            bounds="#ws_gantt_main"
                                                            handle={`.del_drag_chart_${delObj.deliverableId}`}
                                                            scale={1}
                                                            onStart={(e) => { this.onDelStart(e, delObj) }}
                                                            onStop={(e) => { this.onDelStop(e, delObj) }}

                                                        >
                                                            <div className={`row each-ws-chart-row  ${delObj.isDragEnabled ? 'drag-object' : ''}`}
                                                                style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}>
                                                                {/* added milestone of a deliverable */}
                                                                {delObj.addedMilestones && delObj.addedMilestones.map((mileObj, mileInd) => (
                                                                    <div key={`added_mile_${mileInd}`} className="add-mile-div del-ms-div"
                                                                        style={{ left: mileObj.milestoneLeft }}>
                                                                        <ContextMenuTrigger id={`ws_${wsInd}_act_${actInd}_del_${delInd}_add_mile_${mileInd}_context_menu`}>
                                                                            <img className="mile-icon-img" id={`add_mile_icon`} src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('add_mile', mileObj, mileInd) }}></img>
                                                                        </ContextMenuTrigger>
                                                                        <ContextMenu id={`ws_${wsInd}_act_${actInd}_del_${delInd}_add_mile_${mileInd}_context_menu`} className="mile-context-menu" >
                                                                            <MenuItem className="menu-item">
                                                                                <div className="mile-delete-div"
                                                                                    data-menu-type={`add_mile_context`}
                                                                                    data-ws-index={wsInd} data-del-index={delInd}
                                                                                    data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"></img>Delete</div>
                                                                            </MenuItem>

                                                                        </ContextMenu>
                                                                    </div>
                                                                ))
                                                                }

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
                                                                                                data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
                                                                                                src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}></img>

                                                                                        </ContextMenuTrigger>
                                                                                    </div>
                                                                                    <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_chart_hovertxt_${mileInd}`}>
                                                                                        <div>
                                                                                            <div style={{ padding: "0px 0px 4px 0px" }}>{mileObj.milestone}</div>
                                                                                            <div>Milestone Date : {(mileObj.milestoneDate === null || mileObj.milestoneDate === "") ? "" : Moment(new Date(mileObj.milestoneDate)).format('DD-MMM-YYYY')}
                                                                                            </div>
                                                                                        </div>
                                                                                    </ReactTooltip>
                                                                                    {(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? '' :
                                                                                        <ContextMenu id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_${mileInd}_context_menu`} className="mile-context-menu" >
                                                                                            <MenuItem className="menu-item">
                                                                                                <div className="mile-delete-div"
                                                                                                    data-menu-type={`mile_context`}
                                                                                                    data-ws-index={wsInd} data-del-index={delInd}
                                                                                                    data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                                ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"></img>Delete</div>
                                                                                            </MenuItem>
                                                                                        </ContextMenu>
                                                                                    }
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
                                                                                                                <span data-tip="" data-type="dark" data-for="name_not_tt">{`Milestone n...`}</span>
                                                                                                                <ReactTooltip id={`name_not_tt`}>{'Milestone name not added'}</ReactTooltip>
                                                                                                            </Fragment> :
                                                                                                            mileObj.milestone.length > 10 ?
                                                                                                                <Fragment><span data-tip="" data-for={`mile_name_tt_${mileInd}`} data-type="dark" >{mileObj.milestone.substr(0, 10)}...</span>
                                                                                                                    <ReactTooltip id={`mile_name_tt_${mileInd}`}>{mileObj.milestone}</ReactTooltip>
                                                                                                                </Fragment>
                                                                                                                : <span>{mileObj.milestone}</span>
                                                                                                        }
                                                                                                    </span>
                                                                                                    <span className="mile-delete-div"
                                                                                                        data-menu-type={`mile_context`}
                                                                                                        data-ws-index={wsInd} data-del-index={delInd}
                                                                                                        data-act-index={actInd} onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : (e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                                    ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"
                                                                                                        data-tip="" data-for={`mile_delete_tt_${mileInd}`} data-type="dark"
                                                                                                        style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer' }}
                                                                                                    ></img></span>
                                                                                                    <ReactTooltip id={`mile_delete_tt_${mileInd}`}>Delete</ReactTooltip>
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
                                                                                                data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
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


                                                                <div id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                                    data-menu-type={`del_context`}
                                                                    data-ws-index={wsInd}
                                                                    data-act-index={actInd}
                                                                    data-del-index={delInd}

                                                                    style={{ cursor: 'grab', left: delObj.chartLeft, width: delObj.chartWidth }}
                                                                    // style={{ left: `${(delInd * 50) + 20}px`, width: `${(delInd + 1) * 100}px` }}
                                                                    className={`del_drag_chart_${delObj.deliverableId} custom-gantt-chart ws_${wsInd}_act_${actInd}_del_class_${delInd}
                                                            ${delObj.startDate && delObj.startDate !== '' ? 'del-chart-color' : 'default-chart-color'}`}

                                                                >
                                                                    {/* <span className="whole-width-replica">
                                                                <span className={`left-span ws_${wsInd}_act_${actInd}_del_left_class_${delInd}`}></span>
                                                                <span className={`middle-span`}></span>
                                                                <span className={`right-span ws_${wsInd}_act_${actInd}_del_right_class_${delInd}`}></span>

                                                            </span> */}
                                                                </div>


                                                            </div>


                                                        </Draggable>

                                                    </Fragment>
                                                    :
                                                    <div className={`row each-ws-chart-row ${actObj.anyDragEnabled ? 'drop-object' : ''}`}
                                                        style={{ width: this.props.workstreamStore.sumOfBoxesWidth }}
                                                        data-drop-del-obj={delObj}
                                                        data-ws-index={wsInd}
                                                        data-act-index={actInd}
                                                        data-del-index={delInd}
                                                        data-drop-type="deliverable"
                                                    >
                                                        {/* added milestone of a deliverable */}
                                                        {delObj.addedMilestones && delObj.addedMilestones.map((mileObj, mileInd) => (
                                                            <div key={`added_mile_${mileInd}`} className="add-mile-div del-ms-div"
                                                                style={{ left: mileObj.milestoneLeft }}>
                                                                <ContextMenuTrigger id={`ws_${wsInd}_act_${actInd}_del_${delInd}_add_mile_${mileInd}_context_menu`}>
                                                                    <img className="mile-icon-img" id={`add_mile_icon`} src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('add_mile', mileObj, mileInd) }}></img>
                                                                </ContextMenuTrigger>
                                                                <ContextMenu id={`ws_${wsInd}_act_${actInd}_del_${delInd}_add_mile_${mileInd}_context_menu`} className="mile-context-menu" >
                                                                    <MenuItem className="menu-item">
                                                                        <div className="mile-delete-div"
                                                                            data-menu-type={`add_mile_context`}
                                                                            data-ws-index={wsInd} data-del-index={delInd}
                                                                            data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                        ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"></img>Delete</div>
                                                                    </MenuItem>

                                                                </ContextMenu>
                                                            </div>
                                                        ))
                                                        }

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
                                                                                        data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
                                                                                        src={mileStoneIcon} alt="ms_icon" onClick={() => { this.openMilestoneHandler('mile', mileObj, mileInd) }}></img>

                                                                                </ContextMenuTrigger>
                                                                            </div>
                                                                            <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_chart_hovertxt_${mileInd}`}>
                                                                                <div>
                                                                                    <div style={{ padding: "0px 0px 4px 0px" }}>{mileObj.milestone}</div>
                                                                                    <div>Milestone Date : {(mileObj.milestoneDate === null || mileObj.milestoneDate === "") ? "" : Moment(new Date(mileObj.milestoneDate)).format('DD-MMM-YYYY')}
                                                                                    </div>
                                                                                </div>
                                                                            </ReactTooltip>
                                                                            {(localStorage.getItem("isMaster") === "Y" || (localStorage.getItem("accessType") === "Read")) ? '' :
                                                                                <ContextMenu id={`ws_${wsInd}_act_${actInd}_del_${delInd}_group_${groupInd}_mile_${mileInd}_context_menu`} className="mile-context-menu" >
                                                                                    <MenuItem className="menu-item">
                                                                                        <div className="mile-delete-div"
                                                                                            data-menu-type={`mile_context`}
                                                                                            data-ws-index={wsInd} data-del-index={delInd}
                                                                                            data-act-index={actInd} onClick={(e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                        ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"></img>Delete</div>
                                                                                    </MenuItem>
                                                                                </ContextMenu>
                                                                            }
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
                                                                                                        <span data-tip="" data-type="dark" data-for="name_not_tt">{`Milestone n...`}</span>
                                                                                                        <ReactTooltip id={`name_not_tt`}>{'Milestone name not added'}</ReactTooltip>
                                                                                                    </Fragment> :
                                                                                                    mileObj.milestone.length > 10 ?
                                                                                                        <Fragment><span data-tip="" data-for={`mile_name_tt_${mileInd}`} data-type="dark" >{mileObj.milestone.substr(0, 10)}...</span>
                                                                                                            <ReactTooltip id={`mile_name_tt_${mileInd}`}>{mileObj.milestone}</ReactTooltip>
                                                                                                        </Fragment>
                                                                                                        : <span>{mileObj.milestone}</span>
                                                                                                }
                                                                                            </span>
                                                                                            <span className="mile-delete-div"
                                                                                                data-menu-type={`mile_context`}
                                                                                                data-ws-index={wsInd} data-del-index={delInd}
                                                                                                data-act-index={actInd} onClick={(localStorage.getItem("isMaster") === "Y" || (localStorage.getItem("accessType") === "Read")) ? () => { } : (e) => { this.deleteMilestone(e, mileObj, mileInd) }}
                                                                                            ><img src={mileStoneTrashIcon} alt="delete" className="trash-icon"
                                                                                                data-tip="" data-for={`mile_delete_tt_${mileInd}`} data-type="dark"
                                                                                                style={{ cursor: (localStorage.getItem("isMaster") === "Y" || (localStorage.getItem("accessType") === "Read")) ? 'not-allowed' : 'pointer' }}
                                                                                            ></img></span>
                                                                                            <ReactTooltip id={`mile_delete_tt_${mileInd}`}>Delete</ReactTooltip>
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
                                                                                        data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
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

                                                        {/* show/hide the del chat types for edit del dates functionality */}


                                                        <ContextMenuTrigger id={`del_context`}>
                                                            <div>
                                                                {(delObj.startDate && delObj.endDate && delObj.startDate !== '' && this.checkDelWidth(delObj) > 23) ?
                                                                    <div
                                                                        className={`${(SessionStorage && (SessionStorage.read("isMaster") === "Y" ||
                                                                            (SessionStorage.read("accessType") === "Read"))) ? '' : 'not-read-user'}`}>
                                                                        <div className={`custom-gantt-chart del-chart-color`}
                                                                            data-menu-type={`del_context`}
                                                                            data-ws-index={wsInd}
                                                                            data-act-index={actInd}
                                                                            data-del-index={delInd}
                                                                            data-drop-del-obj={delObj}
                                                                            data-drop-type="deliverable"

                                                                            onContextMenu={(e) => { this.showContextMenuHandler(e, delInd) }}
                                                                            style={{ left: delObj.chartLeft, width: delObj.chartWidth }}
                                                                        >
                                                                            {actObj.anyDragEnabled ?
                                                                                ''
                                                                                :
                                                                                <div className="whole-width-replica">
                                                                                    <div className={`left-span ws_${wsInd}_act_${actInd}_del_left_class_${delInd}
                                                                                    ${delObj.isStartOpened ? 'del-bg-white' : ''}`}
                                                                                        data-ws-index={wsInd}
                                                                                        data-act-index={actInd}

                                                                                        data-del-index={delInd}
                                                                                        onClick={(SessionStorage && (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) ? () => { } :
                                                                                            (e) => { this.openDelStartMenu(e, delObj) }}
                                                                                    >
                                                                                    </div>
                                                                                    <div className={`middle-span ws_${wsInd}_act_${actInd}_del_middle_class_${delInd}`}
                                                                                        data-ws-index={wsInd}
                                                                                        data-act-index={actInd}
                                                                                        data-del-index={delInd}
                                                                                        data-drop-type="deliverable"
                                                                                        data-tip
                                                                                        data-for={`ws_chart_${wsInd}_act_chart_${actInd}_del_chart_mid_${delInd}`}
                                                                                        // data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}
                                                                                        data-place="top"
                                                                                        data-tip-disable={`${disableAllTooltips ? 'true' : 'false'}`}
                                                                                        onClick={(e) => { this.handleDelClicks(e, delObj) }}
                                                                                    // onDoubleClick={(e) => { this.handleDelClicks(e, delObj) }}
                                                                                    >
                                                                                    </div>
                                                                                    <div className={`right-span ws_${wsInd}_act_${actInd}_del_right_class_${delInd}
                                                                                    ${delObj.isEndOpened ? 'del-bg-white' : ''}`}
                                                                                        data-ws-index={wsInd}
                                                                                        data-act-index={actInd}
                                                                                        data-del-index={delInd}
                                                                                        onClick={(SessionStorage && (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) ? () => { } :
                                                                                            (e) => { this.openDelEndMenu(e, delObj) }}
                                                                                    >
                                                                                    </div>
                                                                                </div>
                                                                            }
                                                                        </div>


                                                                    </div>
                                                                    :
                                                                    <div>
                                                                        <div id={`ws_${wsInd}_act_${actInd}_del_chart_${delInd}`}
                                                                            data-menu-type={`del_context`}
                                                                            data-ws-index={wsInd}
                                                                            data-act-index={actInd}
                                                                            data-del-index={delInd}
                                                                            data-drop-del-obj={delObj}
                                                                            data-drop-type="deliverable"
                                                                            onClick={(e) => { this.handleDelClicks(e, delObj) }}
                                                                            // onDoubleClick={(e) => { this.handleDelClicks(e, delObj) }}
                                                                            onContextMenu={(e) => { this.showContextMenuHandler(e, delInd) }}
                                                                            style={{ left: delObj.chartLeft, width: delObj.chartWidth }}
                                                                            // style={{ left: `${(delInd * 50) + 20}px`, width: `${(delInd + 1) * 100}px` }}
                                                                            className={`custom-gantt-chart ws_${wsInd}_act_${actInd}_del_class_${delInd}
                                                                            ${delObj.startDate && delObj.startDate !== '' ? 'del-chart-color' : 'default-chart-color'}`}
                                                                            data-tip

                                                                            data-for={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}
                                                                            data-place="top"
                                                                            data-tip-disable={`${((delObj.startDate && delObj.endDate && delObj.startDate !== '' && this.checkDelWidth(delObj) > 23) || (disableAllTooltips)) ? 'true' : 'false'}`}
                                                                        >
                                                                        </div>

                                                                    </div>
                                                                }
                                                            </div>
                                                        </ContextMenuTrigger>
                                                        {delObj.isStartOpened ?
                                                            <div className={`del-dates-main ${delObj.isLastDel ? 'open-to-top' : ''}`}
                                                                style={{ left: delObj.chartLeft }}
                                                            >
                                                                <div className={`row no-gutters del-start-date-menu ${isEditDelDatesLoading ? 'cursor-pro' : ''}`}>
                                                                    <div className="col-12">
                                                                        <label>Planned Start Date *</label>
                                                                    </div>
                                                                    <div id="del_edit_dates_row" className="row no-gutters">
                                                                        <div style={{ display: 'flex' }}>
                                                                            <div className="date-form-control">
                                                                                <div className="ws-date-row">
                                                                                    <DatePicker
                                                                                        selected={this.getDelStartDate(delObj)}
                                                                                        value={this.getDelStartDate(delObj)}
                                                                                        placeholderText="dd-mmm-yyyy"
                                                                                        onChange={(date) => { this.editStartDateHandler(date, wsInd, actInd, delInd) }}
                                                                                        dateFormat="dd-MMM-yyyy"
                                                                                        showMonthDropdown
                                                                                        showYearDropdown
                                                                                        useShortMonthInDropdown
                                                                                        fixedHeight
                                                                                        className="dl-start-date-picker form-control"
                                                                                        id="del_edit_start_picker"
                                                                                        popperContainer={startCalendarContainer}
                                                                                        required={true}
                                                                                    />
                                                                                    <img id="del_edit_cal" src={calIcon} alt="calender"></img>
                                                                                </div>

                                                                            </div>
                                                                            <div>
                                                                                <img id="edit_del_save"
                                                                                    className={`${isEditDelDatesLoading ? 'cursor-pro' : 'cursor-poi'}`}
                                                                                    onClick={() => { this.saveEditDelDates(delObj, 'start') }}
                                                                                    data-tip data-for={`edit_del_start_save_tt`} data-type="dark"
                                                                                    style={{ paddingLeft: '6px' }} src={smallSave} alt="save"></img>
                                                                                <ReactTooltip id={`edit_del_start_save_tt`}>
                                                                                    <span>Save</span>
                                                                                </ReactTooltip>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div> : ''
                                                        }
                                                        {delObj.isEndOpened ?
                                                            <div className={`del-dates-main ${delObj.isLastDel ? 'open-to-top' : ''}`}
                                                                style={{ left: this.calcDelEndDateLeft(delObj) }}
                                                            >
                                                                <div className={`row no-gutters del-start-date-menu ${isEditDelDatesLoading ? 'cursor-pro' : ''}`}>
                                                                    <div className="col-12">
                                                                        <label>Planned End Date *</label>
                                                                    </div>
                                                                    <div id="del_edit_dates_row" className="row no-gutters">
                                                                        <div style={{ display: 'flex' }}>
                                                                            <div className="date-form-control">
                                                                                <div className="ws-date-row">
                                                                                    <DatePicker
                                                                                        selected={this.getDelEndDate(delObj)}
                                                                                        value={this.getDelEndDate(delObj)}
                                                                                        minDate={this.getDelStartDate(delObj)}
                                                                                        placeholderText="dd-mmm-yyyy"
                                                                                        onChange={(date) => { this.editEndDateHandler(date, wsInd, actInd, delInd) }}
                                                                                        dateFormat="dd-MMM-yyyy"
                                                                                        showMonthDropdown
                                                                                        showYearDropdown
                                                                                        useShortMonthInDropdown
                                                                                        fixedHeight
                                                                                        className="dl-end-date-picker form-control"
                                                                                        id="del_edit_end_picker"
                                                                                        popperContainer={endCalendarContainer}
                                                                                        required={true}
                                                                                    />
                                                                                    <img id="del_edit_cal" src={calIcon} alt="calender"></img>
                                                                                </div>

                                                                            </div>
                                                                            <div>
                                                                                <img id="edit_del_save"
                                                                                    className={`${isEditDelDatesLoading ? 'cursor-pro' : 'cursor-poi'}`}
                                                                                    onClick={() => { this.saveEditDelDates(delObj, 'end') }}
                                                                                    data-tip data-for={`edit_del_end_save_tt`} data-type="dark"
                                                                                    style={{ paddingLeft: '6px' }} src={smallSave} alt="save"></img>
                                                                                <ReactTooltip id={`edit_del_end_save_tt`}>
                                                                                    <span>Save</span>
                                                                                </ReactTooltip>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div> : ''
                                                        }

                                                        {disableAllTooltips ?
                                                            '' : (delObj.startDate && delObj.endDate && delObj.startDate !== '' && this.checkDelWidth(delObj) > 23) ?
                                                                <ReactTooltip className="own-tt" id={`ws_chart_${wsInd}_act_chart_${actInd}_del_chart_mid_${delInd}`}>
                                                                    <div>
                                                                        <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                        <div>Owner : {delObj.owner}</div>
                                                                        <div>Department : {actObj.department}</div>
                                                                        <div>Start Date : {(delObj.startDate === null || delObj.startDate === "") ? "" : Moment(new Date(delObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                                        <div>End Date : {(delObj.endDate === null || delObj.endDate === "") ? "" : Moment(new Date(delObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                                    </div>
                                                                </ReactTooltip> :
                                                                <ReactTooltip id={`ws_chart_hovertxt_${wsInd}_act_chart_hovertxt_${actInd}_del_chart_hovertxt_${delInd}`}>
                                                                    <div>
                                                                        <div style={{ padding: "0px 0px 4px 0px" }}>{delObj.name}</div>
                                                                        <div>Owner : {delObj.owner}</div>
                                                                        <div>Department : {actObj.department}</div>
                                                                        <div>Start Date : {(delObj.startDate === null || delObj.startDate === "") ? "" : Moment(new Date(delObj.startDate)).format('DD-MMM-YYYY')}</div>
                                                                        <div>End Date : {(delObj.endDate === null || delObj.endDate === "") ? "" : Moment(new Date(delObj.endDate)).format('DD-MMM-YYYY')}</div>
                                                                    </div>
                                                                </ReactTooltip>
                                                        }

                                                    </div>

                                                }



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

                {/* context menu and menu items for deliverable charts */}
                {!(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ?
                    <div className="del-context-menu-wrapper">
                        <ContextMenu id="add_del_context" className="del-context-menu" onHide={() => { this.resetMenuHandler() }}>
                            <MenuItem className="menu-item disabled-item">Add Mileston</MenuItem>
                            <MenuItem className="menu-item disabled-item" >Dependent Deliverables</MenuItem>
                            <MenuItem className="menu-item" onClick={() => { this.deleteDeliverable('add_del') }}>Delete Deliverable</MenuItem>
                        </ContextMenu>

                        <ContextMenu id={`del_context`} className="del-context-menu" onHide={() => { this.resetMenuHandler() }}>
                            <MenuItem className={`menu-item ${selectedDelObj && selectedDelObj.startDate && selectedDelObj.startDate !== '' ? '' : 'disabled-item'}`} onClick={() => { this.addNewMilestone() }} >Add Milestone</MenuItem>
                            {/* -- comment this line for Dep Deliverables-- */}
                            {/* <MenuItem className={`menu-item ${selectedDelObj && selectedDelObj.startDate && selectedDelObj.startDate !== '' ? '' : 'disabled-item'}`} >Dependent Deliverables</MenuItem> */}

                            {/* -- uncomment the below code for Dep Deliverables-- */}

                            <div className="dependent-type-sub-menu">
                                <SubMenu id={`delId-${selectedDelObj.deliverableId}_depDel`} title={"Dependent Deliverables"} className="dep-type-single">
                                    {deptDelTypesArray.map((type, typeIndex) => (
                                        <SubMenu key={`submenu_${type}_index_${typeIndex}`} title={type} id={`delId-${selectedDelObj.deliverableId}_depDelType_${typeIndex}`} className="dep-type-submenu">
                                            <Fragment>
                                                <div className="dep-type-submenu">
                                                    {allWsChildDataArray && allWsChildDataArray.map((wsObj, wsInd) => (
                                                        <div className="depdel-ws-wrap">

                                                            {(wsObj.name.length > 18) ?
                                                                <Fragment>
                                                                    <div className="depdel-ws" data-tip="" data-for={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}`} data-place="top">
                                                                        {`${wsObj.name.substr(0, 18)}...`}
                                                                    </div>
                                                                    <ReactTooltip id={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}`}>{wsObj.name}</ReactTooltip>
                                                                </Fragment>
                                                                :
                                                                <div className="depdel-ws">
                                                                    {wsObj.name}
                                                                </div>
                                                            }

                                                            {wsObj && wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                                                <div style={{ paddingTop: "4px" }}>
                                                                    {(actObj.name.length > 16) ?
                                                                        <Fragment>
                                                                            <div className="depdel-act" data-tip="" data-for={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}_act_${actInd}`} data-place="top">
                                                                                {`${actObj.name.substr(0, 16)}...`}
                                                                            </div>
                                                                            <ReactTooltip id={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}_act_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                        </Fragment>
                                                                        :
                                                                        <div className="depdel-act">
                                                                            {actObj.name}
                                                                        </div>
                                                                    }

                                                                    {actObj && actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (
                                                                        <div key={`delid_${selectedDelObj.deliverableId}_index_${delInd}`} className="depdel-del" >
                                                                            <div style={{ maxWidth: "107px", minWidth: "105px" }} className="depdel-del-wrap">
                                                                                <input type="checkbox"
                                                                                    id={`rt_clicked_depType_${typeIndex}_ws_${wsInd}_act_${actInd}_del_${delInd}`}
                                                                                    className="input-checkbox"
                                                                                    style={{ cursor: (isLoading ? "progress" : (selectedDelObj.deliverableId === delObj.deliverableId ? "default" : "pointer")) }}
                                                                                    checked={selectedDelObj.name === "" ? () => { } : this.isChecked(typeIndex, wsInd, actInd, delInd, delObj.deliverableId, selectedDelObj)}
                                                                                    disabled={selectedDelObj.deliverableId === delObj.deliverableId ? true : false}
                                                                                    onChange={isLoading ? () => { } : (e) => this.onCheckDepDels(e, typeIndex, selectedDelObj, delObj, wsInd, actInd, delInd)} />

                                                                                {(delObj.name.length > 14) ?
                                                                                    <Fragment>
                                                                                        <span className={selectedDelObj.deliverableId === delObj.deliverableId ? "depdel-del-span-disabled" : "depdel-del-span"} data-tip="" data-for={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}_act_${actInd}_del_${delInd}`} data-place="top">
                                                                                            {`${delObj.name.substr(0, 14)}...`}
                                                                                        </span>
                                                                                        <ReactTooltip id={`depdel_rt-clicked-delId-${selectedDelObj.deliverableId}_depDelType-${typeIndex}_ws_${wsInd}_act_${actInd}_del_${delInd}`} style={{ opacity: "unset", zIndex: 1 }}>{delObj.name}</ReactTooltip>
                                                                                    </Fragment>
                                                                                    :
                                                                                    <span className={selectedDelObj.deliverableId === delObj.deliverableId ? "depdel-del-span-disabled" : "depdel-del-span"}>
                                                                                        {delObj.name}
                                                                                    </span>
                                                                                }

                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Fragment>
                                        </SubMenu>
                                    ))}
                                </SubMenu>
                            </div>
                            <MenuItem className="menu-item" onClick={() => { this.deleteDeliverable('del') }}>Delete Deliverable</MenuItem>
                        </ContextMenu>


                    </div>
                    : ''
                }

                {/* <SteppedLineTo from="ws_1_act_0_del_left_class_0" to="ws_1_act_0_del_left_class_1" orientation="h"
                            borderColor="#fff"
                            // style={{ borderStyle: 'dashed'}}
                            borderWidth={1.5}
                            borderStyle="dashed"
                            fromAnchor="left"
                            toAnchor="left" /> */}
                {this.state.isWsModalVisible ?
                    <div className="del-modal-enclose">
                        <WorkstreamDetailsModalDefineWs
                            modalCloseHandler={this.closeWsModal}
                            visible={this.state.isWsModalVisible}
                            wsName={this.state.selectedWsName}
                            wsId={this.state.selectedWsId}
                            onSaveSuccess={this.props.fetchAllWsTreeDetails}
                        /></div> :
                    ''


                }

                {this.state.isActModalVisible ?
                    <ActivityDetailsModalDefineWs
                        modalCloseHandler={this.closeActModalHandler}
                        title={this.state.selectedActName}
                        visible={this.state.isActModalVisible}
                        activityId={this.state.selectedActId}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''

                }

                {this.state.isDelModalVisible ?
                    <DeliverableDetailsModalDefineWs
                        deliverableName={this.state.selectedDelName}
                        deliverableId={this.state.selectedDelId}
                        isDelModalVisible={this.state.isDelModalVisible}
                        modalCloseHandler={this.closeDelModalHandler}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''
                }

                {this.state.isMileModalVisible ?
                    <MilestoneDetailsModalDefineWs
                        selectedMileObj={this.state.selectedMileObj}
                        isAddedMilestone={this.state.isAddedMilestone}
                        isMileModalVisible={this.state.isMileModalVisible}
                        modalCloseHandler={this.closeMileModalHandler}
                        onSaveSuccess={this.props.fetchAllWsTreeDetails}
                    />
                    : ''
                }

                {/* custom confirm box */}
                <CustomConfirmModal
                    ownClassName={'ws-mile-delete'}
                    isModalVisible={this.state.deleteMileModalVisible}
                    modalTitle={this.state.deleteMileModalTitle}
                    closeConfirmModal={this.closeDeleteMileConfirmModal}
                />
                {this.state.depDelUpdateConfirmModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'fit-content'}
                        isModalVisible={this.state.depDelUpdateConfirmModalVisible}
                        modalTitle={this.state.depDelUpdateConfirmModalTitle}
                        closeConfirmModal={this.depDelUpdateConfirmModalClose}
                    /> : ""}
                {this.state.editDelDatesConfirmModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'fit-content'}
                        isModalVisible={this.state.editDelDatesConfirmModalVisible}
                        modalTitle={this.state.editDelDatesConfirmModalTitle}
                        closeConfirmModal={this.editDelConfirmModalClose}
                    /> : ""}
            </div>
        )
    }
}

export default withRouter(AllWsGanttChart);
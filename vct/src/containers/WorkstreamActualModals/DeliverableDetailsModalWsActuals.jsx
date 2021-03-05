import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap4-modal';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import 'moment-timezone';
import { createPortal } from 'react-dom';
import ReactTooltip from 'react-tooltip';
// import './DefineWsModals.css';
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import './WorkstreamActualModals.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
import vector from "../../assets/project/workstream/Vector.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore', 'workstreamActualsStore', 'adminStore')
class DeliverableDetailsModalWsActuals extends Component {
    constructor(props) {
        super(props);

        this.state = {
            delSave: true,
            tempTable: [],
            delRaidDetails: [],
            activityId: "",
            deliverableName: "",
            delOwner: "",
            delEmail: "",
            delDescription: "",
            delSubDepartment: "",
            delDepartment: "",
            delStartDate: "",
            delEndDate: "",
            delStatus: "",
            delCompletionPerc: "",

            delCompletionPercTemp: "",
            delStatusTemp: "",

            actualEndDate: "",
            actualStartDate: "",
            expEndDate: "",
            expStartDate: "",
            pEndDate: "",
            pStartDate: "",
            deptFlag: false,
            rangeObj: {
                eed: "",
                esd: "",
                asd: "",
                aed: "",
            },
            disableObj: {
                disableActualStart: false,
                disableActualEnd: false,
                pSD: true,
                pED: true,
                eED: false,
                eSD: false,
                aSD: false,
                aED: false,
            },
            edited: false,
            showDelArray: {
                ownerDet: false,
                deptDet: false,
                plannedDatesDet: false,
                expectedDatesDet: false,
                actualDatesDet: false,
                statusDet: false,
                raidDet: false
            },
            delInfoLoading: true,
            isSelectOpen: false,
            isModalOpen: false,
            isModalCloseDateOpen: false,
            entryDatesArray: [],
            closedDatesArray: [],
            saveDelActualsModalVisible: false,
            saveDelActualsModalTitle: '',
            depDelActualsSaveModalVisible: false,
            depDelActualsSaveModalTitle: "",
        }
        this.saveDelActualsDetails = this.saveDelActualsDetails.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.handleShowHide = this.handleShowHide.bind(this);
        this.onStatusOpen = this.onStatusOpen.bind(this);
        this.SelectChange = this.SelectChange.bind(this);
        this.addNewRisk = this.addNewRisk.bind(this);
        this.deleteRisks = this.deleteRisks.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);
    }

    componentDidMount() {
        const { deliverableId } = this.props;
        this.fetchDeliverableDetails(deliverableId);
    }
    fetchDeliverableDetails(deliverableId) {
        const { workstreamStore } = this.props;
        workstreamStore.fetchDeliverableWsActuals(deliverableId)
            .then((res) => {
                if (!res.error) {
                    this.buildDelDetails(res.data.resultObj)
                }


            })
    }

    buildDelDetails = (res) => {
        this.setState({
            activityId: res.activityId,

            deliverableId: res.deliverableId,
            deliverableName: res.name,
            delOwner: res.owner,
            delDescription: res.description,
            delEmail: res.ownerEmail,

            delSubDepartment: res.subDepartment,
            delDepartment: res.department,
            fetchedResponse: (res), //for storing the fetched dates and compare if any date changes are made
            DatesObj: this.calcualteDates(res),


            delStatusTemp: this.decodeStatus(res.status),
            delCompletionPercTemp: res.complPercent,

            delStatus: this.decodeStatus(res.status),
            delCompletionPerc: res.complPercent,

            delInfoLoading: false,
            delRaidDetails: res.deliverableRisksCatagoriesDto === null ? [] : res.deliverableRisksCatagoriesDto,
            // tableData: res.deliverableRisksCatagoriesDto === null ? [] : res.deliverableRisksCatagoriesDto,
            tempTable: res.deliverableRisksCatagoriesDto === null ? [] : res.deliverableRisksCatagoriesDto
        }, () => {
            this.filterDates(res.deliverableRisksCatagoriesDto)
        })

    }
    filterDates = (temArrWsRaid) => {
        const { workstreamActualsStore } = this.props;
        let tempArr = [];
        let details = "";
        if (temArrWsRaid !== null) {
            details = temArrWsRaid
            details.map((entry) => {
                if (entry.closedDate === "") {
                    entry.display = true
                    entry.checked = true
                }
                else {
                    let closedDate = this.formatDate(entry.closedDate)
                    let newDate = this.formatDate(" ")
                    if (closedDate >= newDate) {
                        entry.display = true
                        entry.checked = true
                    } else {
                        entry.display = false
                        entry.checked = false
                    }
                }
                return true
            })

            details.map((entry) => {
                if (entry.display) {
                    tempArr.push(entry)
                }
            })
            this.setState({
                delRaidDetails: details,
                tempTable: tempArr
            })
            workstreamActualsStore.tableData = details

        }
    }
    formatDate(str) {
        let date = str === " " ? new Date() : new Date(str),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear()].join('-');
    }
    calcualteDates(res) {
        const { selectedLevel } = this.props;
        const { disableObj, rangeObj } = this.state;
        let tempDisableObj = disableObj;
        let tempRangeObj = rangeObj;
        let { pSDate, pEDate, eEDate, eSDate, aSDate, aEDate } = "";

        pSDate = (res.startDate === "" || res.startDate === null ? "" : Moment(new Date(res.startDate)).format('DD-MMM-YYYY'));
        pEDate = (res.endDate === "" || res.endDate === null ? "" : Moment(new Date(res.endDate)).format('DD-MMM-YYYY'));
        eEDate = (res.expEndDate === "" || res.expEndDate === null ? "" : Moment(new Date(res.expEndDate)).format('DD-MMM-YYYY'));
        eSDate = (res.expStartDate === "" || res.expStartDate === null ? "" : Moment(new Date(res.expStartDate)).format('DD-MMM-YYYY'));
        aSDate = (res.actualStartDate === "" || res.actualStartDate === null ? "" : Moment(new Date(res.actualStartDate)).format('DD-MMM-YYYY'));
        aEDate = (res.actualEndDate === "" || res.actualEndDate === null ? "" : Moment(new Date(res.actualEndDate)).format('DD-MMM-YYYY'));
        tempDisableObj.disableActualStart = (res.depFlag && res.disableActualStart ? true : false)
        tempDisableObj.disableActualEnd = (res.depFlag && res.disableActualEnd ? true : false)
        tempDisableObj.aSD = ((res.depFlag && res.disableActualStart) ? true : false)
        tempDisableObj.aED = ((aSDate === "" || (res.depFlag && res.disableActualEnd)) ? true : false);
        tempDisableObj.eED = ((aEDate !== "" ? true : false));
        eEDate = (aEDate !== "" ? "" : eEDate);
        tempDisableObj.eSD = ((aSDate !== "" ? true : false));
        eSDate = (aSDate !== "" ? "" : eSDate);
        if (res.depFlag) {
            tempRangeObj.eed = (res.rangeExpectedEnd);
            tempRangeObj.esd = (res.rangeExpectedStart);
            tempRangeObj.asd = (res.rangeActualStart);
            tempRangeObj.aed = (res.rangeActualEnd);

        }


        this.setState({
            pStartDate: pSDate,
            pEndDate: pEDate,
            expEndDate: eEDate,
            expStartDate: eSDate,
            actualEndDate: aEDate,
            actualStartDate: aSDate,
            disableObj: tempDisableObj,
            deptFlag: res.depFlag,
            rangeObj: tempRangeObj
        })
    }
    handleDateChange = (value, type) => {
        const { workstreamStore, selectedLevel } = this.props;
        const { disableObj } = this.state;
        let tempDisableObj = disableObj;
        switch (type) {
            case 'expStartDate':
                this.setState({
                    expStartDate: value,
                    expEndDate: ""
                })

                break
            case 'actualStartDate':
                if (value === null) {
                    tempDisableObj.eSD = false;
                    tempDisableObj.aED = true;
                    tempDisableObj.eED = false;
                    let eStartDate = (selectedLevel === 'Deliverable' && (workstreamStore.DelInfodetails.expStartDate !== "" && workstreamStore.DelInfodetails.expStartDate !== null)
                        ? new Date(workstreamStore.DelInfodetails.expStartDate) : "")
                    this.setState({
                        actualStartDate: value,
                        actualEndDate: "",
                        expStartDate: eStartDate,
                        disableObj: tempDisableObj,
                    })
                }
                else {
                    tempDisableObj.eSD = (value === null ? false : true);
                    tempDisableObj.aED = (tempDisableObj.disableActualEnd ? true : false);
                    let eStartDate = ""
                    this.setState({
                        actualStartDate: value,
                        actualEndDate: "",
                        expStartDate: eStartDate,
                        disableObj: tempDisableObj
                    })
                }

                break
            case 'expEndDate':
                this.setState({
                    expEndDate: value,
                })

                break
            case 'actualEndDate':
                if (value === null) {
                    tempDisableObj.eED = false;
                    let eEndDate = (selectedLevel === 'Deliverable' && (workstreamStore.DelInfodetails.expEndDate !== "" && workstreamStore.DelInfodetails.expEndDate !== null)
                        ? new Date(workstreamStore.DelInfodetails.expEndDate) : "")
                    this.setState({
                        actualEndDate: value,
                        expEndDate: eEndDate,
                        disableObj: tempDisableObj
                    })
                }
                else {
                    tempDisableObj.eED = true;
                    let eEndDate = ""
                    this.setState({
                        actualEndDate: value,
                        expEndDate: eEndDate,
                        disableObj: tempDisableObj
                    })
                }

                break
            default:
                break;
        }

    }

    addNewRisk = (event) => {
        const { delRaidDetails } = this.state
        const { workstreamStore } = this.props
        let newTableData = delRaidDetails
        const riskDetail = {
            'catActId': null,
            'catType': "",
            'closedDate': "",
            'description': "",
            'mitigationPlan': "",
            'openDate': "",
            'owner': "",
            'checked': true,
            'display': true

        }
        newTableData.push(riskDetail)
        this.setState({
            delRaidDetails: newTableData,
            tempTable: newTableData

        })
        workstreamStore.delRaidDetails = newTableData
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
            case "Completed within due date":
                value = "CMP_WITHIN_DUE_DT"
                break;
            case "Completed after due date":
                value = "CMP_AFTER_DUE_DT"
                break;
            case "Delayed":
                value = "DELAYED"
                break;
            case "In Progress":
                value = "INPROGRESS"
                break;
            case "Not started":
                value = "NOT_STARTED"
                break;
        }
        return value;
    }

    checkForMandatoryFields = () => {
        const { delCompletionPerc, delStatus } = this.state;
        if (delCompletionPerc !== "" && delCompletionPerc !== null &&
            delStatus !== "" && delStatus !== null
        ) {
            return true;
        } else {
            return false;
        }
    }

    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    modalCloseHandler = (type) => {
        const { delStatusTemp, delCompletionPercTemp } = this.state;
        if (type === 'close') {

            if (this.state.delInfoLoading || (this.isDefined(delStatusTemp) && delStatusTemp !== ''
                && this.isDefined(delCompletionPercTemp) && delCompletionPercTemp !== '')) {
                this.props.modalCloseHandler(type);
            } else {
                this.showNotification("Please save the mandatory fields before closing", "Error", "error");
            }
        } else {
            this.props.modalCloseHandler(type);
        }
    }
    onSaveClick = () => {
        const { deptFlag } = this.state;
        if (deptFlag && this.checkDateChange()) {
            const confirmMsg = 'Changing the dates of this deliverable will automatically changebr_br_brthe dates of the linked deliverables. Do you accept the change ?';
            this.openDepDelActualsSaveConfirmModal(confirmMsg);
        }
        else {
            this.saveDelActualsDetails()
        }
    }
    checkDateChange() {
        const { fetchedResponse, expEndDate, expStartDate, actualEndDate, actualStartDate } = this.state;
        let eEDate = (fetchedResponse.expEndDate === "" || fetchedResponse.expEndDate === null ? "" : Moment(new Date(fetchedResponse.expEndDate)).format('DD-MMM-YYYY'));
        let eSDate = (fetchedResponse.expStartDate === "" || fetchedResponse.expStartDate === null ? "" : Moment(new Date(fetchedResponse.expStartDate)).format('DD-MMM-YYYY'));
        let aSDate = (fetchedResponse.actualStartDate === "" || fetchedResponse.actualStartDate === null ? "" : Moment(new Date(fetchedResponse.actualStartDate)).format('DD-MMM-YYYY'));
        let aEDate = (fetchedResponse.actualEndDate === "" || fetchedResponse.actualEndDate === null ? "" : Moment(new Date(fetchedResponse.actualEndDate)).format('DD-MMM-YYYY'));
        
        if ((expStartDate !== eSDate) || 
        (expEndDate !== eEDate) || 
        (actualEndDate !== aEDate) || 
        (actualStartDate !== aSDate)) {
            return true;
        }
        else {
            return false;
        }
    }

    openDepDelActualsSaveConfirmModal = (title) => {
        this.setState({
            depDelActualsSaveModalVisible: true,
            depDelActualsSaveModalTitle: title,
        });
    }
    closeDepDelActualsSaveConfirmModal = (isYesClicked) => {
        this.setState({
            depDelActualsSaveModalVisible: false,
            depDelActualsSaveModalTitle: "",
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.saveDelActualsDetails();
        }
    }

    saveDelActualsDetails() {
        const { workstreamStore, workstreamActualsStore } = this.props;
        const { activityId, deliverableId, delStatus, delCompletionPerc, actualStartDate, actualEndDate, expStartDate, expEndDate, delRaidDetails } = this.state;
        const selectedLevel = "Workstream";
        let data = {};
        let newTableData = [];
        let mandatoryCheck = '';
        if (this.checkForMandatoryFields()) {

            delRaidDetails.forEach(function (element) {
                if ((element.catType === "" || element.catType === undefined) || (element.description === "" || element.description === undefined) || (element.owner === "" || element.owner === undefined) || (element.openDate === "" || element.openDate === undefined)) {
                    mandatoryCheck = 'empty';
                }
                if (RegExp(/[<>!'"[\]]/).test(element.description) || RegExp(/[<>!'"[\]]/).test(element.mitigationPlan) || RegExp(/[<>!'"[\]]/).test(element.owner)) {
                    mandatoryCheck = 'invalidAll'
                }
            })

            if (mandatoryCheck !== '') {
                if (mandatoryCheck === 'empty') {
                    this.showNotification("Please enter all mandatory fields with valid values", "error", "error");
                }
                if (mandatoryCheck === 'invalidAll') {
                    this.showNotification("Please enter all mandatory fields with valid values. Special characters [ < ! ' \" > ] are invalid", "error", "error");
                }
            }

            else {

                delRaidDetails.map((deliverable, index) => {
                    if (deliverable.catActId !== null) {
                        data = {
                            "catActId": deliverable.catActId,
                            "deliverableId": deliverableId + '',
                            "categoryType": deliverable.catType,
                            "description": deliverable.description,
                            "mitigationPlan": deliverable.mitigationPlan,
                            "owner": deliverable.owner,
                            "openDate": (Moment(deliverable.openDate).format('YYYY-MM-DD')).toString(),
                            "closedDate": deliverable.closedDate !== "" ? (Moment(deliverable.closedDate).format('YYYY-MM-DD')).toString() : ""
                        }
                        newTableData.push(data)
                    } else {
                        let data = {

                            "deliverableId": deliverableId + '',
                            "categoryType": deliverable.catType === "" ? deliverable.catType = 'Risk' : deliverable.catType,
                            "description": deliverable.description,
                            "mitigationPlan": deliverable.mitigationPlan,
                            "owner": deliverable.owner,
                            "openDate": (Moment(deliverable.openDate).format('YYYY-MM-DD')).toString(),
                            "closedDate": deliverable.closedDate !== "" ? (Moment(deliverable.closedDate).format('YYYY-MM-DD')).toString() : ""

                        }
                        newTableData.push(data)
                    }

                    return true

                })

                const payloadObj = {
                    "mapId": SessionStorage.read('mapId'),
                    "deliverableId": deliverableId,
                    "status": this.decodeStatus(delStatus),
                    "activityId": activityId,
                    "actualStartDate": actualStartDate === "" || actualStartDate === null ? "" : (Moment(actualStartDate).format('YYYY-MM-DD')).toString(),
                    "actualEndDate": actualEndDate === "" || actualEndDate === null ? "" : (Moment(actualEndDate).format('YYYY-MM-DD')).toString(),
                    "expStartDate": expStartDate === "" || expStartDate === null ? "" : (Moment(expStartDate).format('YYYY-MM-DD')).toString(),
                    "expEndDate": expEndDate === "" || expEndDate === null ? "" : (Moment(expEndDate).format('YYYY-MM-DD')).toString(),
                    "complPercent": delCompletionPerc,
                    "wsDeliverableRisks": newTableData
                }

                let invalidErrorArr = this.checkForInvalidDates(payloadObj);
                if (invalidErrorArr.length === 0) {

                    this.setState({
                        delSave: false,
                    });
                    workstreamActualsStore.saveDeliverableActuals(payloadObj)
                        .then((response) => {
                            if (response && response.data.resultCode === 'OK') {
                                // this.props.fetchAllWsDetails();
                                //workstreamStore.fetchWsGenInfo(deliverableId)
                                if (response.data.resultDescription === "Milestone date for current deliverable is out of range") {
                                    this.showNotification(response.data.resultDescription, "Error", "error");
                                }
                                else {
                                    this.showNotification("Deliverable Details saved successfully", "Success", "success");
                                }
                                this.setState({
                                    edited: false,
                                    delSave: true,
                                });
                                this.modalCloseHandler("save");

                            } else if (response && response.data.resultCode === 'KO') {
                                this.setState({
                                    delSave: true,
                                });
                                this.showNotification(response.data.errorDescription, "Error", "error");
                            } else {
                                this.showNotification("Sorry! Something went wrong", "Error", "error");
                            }
                        });

                } else {
                    this.showNotification(`${invalidErrorArr[0]}`, "error", "error")
                }
            }
        }
        else {
            this.showNotification("Please enter all the mandatory fields with valid values", "Error", "error");
        }
    }

    selectStartDate = (payload) => {
        const { pStartDate } = this.state;
        const { actualStartDate, expStartDate } = payload;
        let tempDate = '';
        if (this.isDefinedNonEmpty(actualStartDate)) {
            tempDate = ["Actual Start Date", actualStartDate];
        }
        else if (this.isDefinedNonEmpty(expStartDate)) {
            tempDate = ["Expected Start Date", expStartDate];
        }
        else if (this.isDefinedNonEmpty(pStartDate)) {
            tempDate = ["Planned Start Date", pStartDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }

    selectEndDate = (payload) => {
        const { pEndDate } = this.state;
        const { actualEndDate, expEndDate } = payload;
        let tempDate = '';
        if (this.isDefinedNonEmpty(actualEndDate)) {
            tempDate = ["Actual End Date", actualEndDate];
        }
        else if (this.isDefinedNonEmpty(expEndDate)) {
            tempDate = ["Expected End Date", expEndDate];
        }
        else if (this.isDefinedNonEmpty(pEndDate)) {
            tempDate = ["Planned End Date", pEndDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }

    checkForInvalidDates = (payload) => {

        let errorDates = [];

        const selStartDate = this.selectStartDate(payload);
        const selEndDate = this.selectEndDate(payload);

        const isAfter = Moment(selStartDate[1]).isAfter(selEndDate[1]);

        if (selStartDate.length > 0 && selEndDate.length > 0 &&
            isAfter) {
            if (selStartDate[0] === 'Planned Start Date') {
                errorDates.push(`${selEndDate[0]} cannot be before ${selStartDate[0]}.`);
            } else {
                errorDates.push(`${selStartDate[0]} cannot be after ${selEndDate[0]}.`);
            }
        }

        return errorDates;

    }

    isDefinedNonEmpty = (value) => {
        return value !== '' && value !== null;
    }

    showNotification = (message, title, type) => {
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

    handleShowHide = (event) => {
        const { showDelArray } = this.state;
        let tempShowArr = showDelArray
        switch (event.target.id) {
            case "ownerDetails":
                tempShowArr.ownerDet = !(tempShowArr.ownerDet)
                break;
            case "deptDetails":
                tempShowArr.deptDet = !(tempShowArr.deptDet)
                break;
            case "p_DateDetails":
                tempShowArr.plannedDatesDet = !(tempShowArr.plannedDatesDet)
                break;
            case "e_DateDetails":
                tempShowArr.expectedDatesDet = !(tempShowArr.expectedDatesDet)
                break;
            case "a_DateDetails":
                tempShowArr.actualDatesDet = !(tempShowArr.actualDatesDet)
                break;
            case "statusDetails":
                tempShowArr.statusDet = !(tempShowArr.statusDet)
                break;
            case "raidDetails":
                tempShowArr.raidDet = !(tempShowArr.raidDet)
                break;
            default: break;
        }
        this.setState({
            showDelArray: tempShowArr
        })
    }
    onStatusChange = (event) => {
        let value = event.target.value;
        this.setState({
            delStatus: value
        })
    }
    onCompletePercChange = (event) => {
        let value = event.target.value
        if ((value.length <= 3) || (value.indexOf(".")) >= (value.length - 2)) {
            if (Number(value) >= 0 && Number(value) <= 100) {
                this.setState({
                    delCompletionPerc: (value === "" ? "" : Number(value)),
                    delStatus: ""
                })
            }
            else {
                if (value.includes("-")) {
                    this.setState({
                        delCompletionPerc: "",
                        delStatus: ""
                    })
                }
            }
        }
    }

    onRiskDetailsChange = (event, val, index, catActId) => {
        const { delRaidDetails } = this.state;
        const { workstreamStore } = this.props;
        let newTableData = delRaidDetails;
        let count = 0;
        let newIndex = 0;

        if (catActId !== null) {
            delRaidDetails.map((deliverable, index) => {
                count = count + 1;
                if (deliverable.catActId === catActId) {
                    newIndex = count;
                }
            })
        }

        let raidIndex = newIndex !== 0 ? newIndex - 1 : index;

        for (let i = 0; i <= newTableData.length; i++) {
            if (i === raidIndex) {
                switch (val) {
                    case 'catType':
                        newTableData[i].catType = event.target.value
                        break;
                    case 'description':
                        newTableData[i].description = event.target.value
                        break;
                    case 'mitigationPlan':
                        newTableData[i].mitigationPlan = event.target.value
                        break;
                    case 'owner':
                        newTableData[i].owner = event.target.value
                        break;
                    case 'openDate':
                        newTableData[i].openDate = ((event === null) ? "" : Moment(event).format('DD-MMM-YYYY'))

                        break;
                    case 'closedDate':
                        if (newTableData[i].catType !== "" && newTableData[i].description !== "" &&
                            newTableData[i].owner !== "" && newTableData[i].openDate !== "") {
                            newTableData[i].closedDate = Moment(event).format('DD-MMM-YYYY')
                        } else {
                            // alert("Please enter all madatory fields")
                            this.showNotification(' Please enter all madatory fields', 'error', 'error')
                        }
                        break;
                    default:
                        break;

                }
            }
        }

        this.setState({
            delRaidDetails: newTableData
        })
        workstreamStore.delRaidDetails = newTableData
    }

    deleteRisks = (catActId, index) => {
        const { workstreamActualsStore } = this.props
        const { delRaidDetails, tempTable } = this.state
        let displayTempTable = tempTable
        let tempTableArr = delRaidDetails

        let count = 0;
        let newIndex = 0;
        let countTemp = 0;
        let newTempIndex = 0;

        if (catActId !== null) {
            delRaidDetails.map((deliverable, index) => {
                count = count + 1;
                if (deliverable.catActId === catActId) {
                    newIndex = count;
                }
            })

            tempTable.map((del, index) => {
                countTemp = countTemp + 1;
                if (del.catActId === catActId) {
                    newTempIndex = countTemp;
                }
            })
        }

        let tempRaidDelIndex = newTempIndex !== 0 ? newTempIndex - 1 : index;
        let raidDelIndex = newIndex !== 0 ? newIndex - 1 : index;

        if (catActId === null) {
            tempTableArr.splice(raidDelIndex, 1)
            this.setState({
                delRaidDetails: tempTableArr
            });

        } else {
            workstreamActualsStore.deleteRisks(catActId)
                .then((res) => {
                    if (res !== false && !res.error && res.data.resultCode === 'OK') {
                        tempTableArr.splice(raidDelIndex, 1)
                        displayTempTable.splice(tempRaidDelIndex, 1)
                        this.setState({
                            delRaidDetails: tempTableArr,
                            tempTable: displayTempTable
                        })
                        this.showNotification('Deleted successfully', 'success', 'success');
                    } else if (res && res.data.resultCode === 'KO') {
                        this.showErrorNotification(res.data.errorDescription, 'Error', 'error')
                    }
                })
        }
    }

    // ---custom select functions--- //

    onStatusOpen = (e, value) => {
        // const { isSelectOpen } = this.state;
        this.setState({
            isSelectOpen: value
        }, () => {
            document.addEventListener('click', this.OnStatusClose);
        })
    }
    OnStatusClose = () => {
        this.setState({
            isSelectOpen: false
        }, () => {
            document.removeEventListener('click', this.OnStatusClose);
        })
    }
    SelectChange = (event) => {
        let value = event.target.innerText;
        this.setState({
            delStatus: value,
            isSelectOpen: false
        })
    }
    // ---custom select functions--- //

    /*filter functions */
    openModal = () => {
        this.setEntryDatesArray();
    }
    setEntryDatesArray() {
        const { delRaidDetails } = this.state;
        let entryDatesArray = []
        delRaidDetails.map((entry) => {
            let openDate = entry.openDate !== "" ? Moment(entry.openDate).format('DD-MMM-YYYY') : '(Blanks)'
            if (entryDatesArray.filter(item => item.openDate === openDate).length === 0) {
                entryDatesArray.push({
                    'openDate': entry.openDate === "" ? '(Blanks)' : Moment(entry.openDate).format('DD-MMM-YYYY'),
                    'checked': entry.checked
                })
            }
            return true
        })
        entryDatesArray.unshift({
            'openDate': 'Select All',
            'checked': entryDatesArray.filter(e => e.checked === false).length > 0 ? false : true
        })
        this.setState({
            entryDatesArray: entryDatesArray,
            isModalOpen: true,
            isModalCloseDateOpen: false
        })
    }
    entryDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { delRaidDetails, tempTable } = this.state
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        if (value === 'Select All') {
            delRaidDetails.map((entry, index) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setEntryDatesArray()
            this.setState({
                tempTable: event.target.checked ? delRaidDetails : [],
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        } else {
            workstreamActualsStore.tableData.map((entry, index) => {
                if (entry.openDate === "") {
                    dateTemp = "(Blanks)"
                } else {
                    dateTemp = Moment(entry.openDate).format('DD-MMM-YYYY')
                }
                if (dateTemp === value) {
                    if (event.target.checked === true) {
                        entry.checked = true
                        entry.display = true
                        if (newTable.filter(item => ((item.catActId !== null) && (item.catActId === entry.catActId)).length === 0)) {
                            newTable.push(entry)
                        }
                        else {
                            newTable.map(entry => {
                                if (Moment(entry.openDate).format('DD-MMM-YYYY') === value) {
                                    entry.display = true
                                }
                                return true
                            })
                        }
                    } else {
                        entry.checked = false
                        index = newTable.findIndex(x => x.catActId === entry.catActId);
                        newTable.splice(index, 1)
                    }
                }
                return true
            })
            this.setEntryDatesArray()
            this.setState({
                tempTable: newTable,
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        }
    }
    openCloseDateModal() {
        this.setClosedDatesArray();
    }
    setClosedDatesArray() {
        const { delRaidDetails } = this.state;
        let closedDatesArray = []
        delRaidDetails.map((entry) => {
            let closedDate = entry.closedDate !== "" ? Moment(entry.closedDate).format('DD-MMM-YYYY') : '(Blanks)'
            if (closedDatesArray.filter(item => item.closedDate === closedDate).length === 0) {
                closedDatesArray.push({
                    'closedDate': entry.closedDate !== "" ? Moment(entry.closedDate).format('DD-MMM-YYYY') : '(Blanks)',
                    'checked': entry.checked
                })
            }
            return true
        })
        closedDatesArray.unshift({
            'closedDate': 'Select All',
            'checked': closedDatesArray.filter(e => e.checked === false).length > 0 ? false : true
        })
        this.setState({
            isModalCloseDateOpen: true,
            isModalOpen: false,
            closedDatesArray: closedDatesArray
        })
    }
    closedDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { delRaidDetails, tempTable } = this.state
        let catActIdArr = [];
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        for (let i = 0; i < newTable.length; i++) {
            catActIdArr.push(newTable[i].catActId)
        }
        if (value === 'Select All') {
            delRaidDetails.map((entry) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setClosedDatesArray()
            this.setState({
                tempTable: event.target.checked ? delRaidDetails : [],
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        } else {
            workstreamActualsStore.tableData.map((entry, index) => {
                if (entry.closedDate === "") {
                    dateTemp = "(Blanks)"
                } else {
                    dateTemp = Moment(entry.closedDate).format('DD-MMM-YYYY')
                }
                if (dateTemp === value) {
                    if (event.target.checked === true) {
                        entry.display = true
                        entry.checked = true
                        // if((catActIdArr.indexOf(entry.catActId)===-1){

                        // }
                        if (newTable.filter(item => ((item.catActId !== null) && (item.catActId === entry.catActId)).length === 0) && (catActIdArr.indexOf(entry.catActId) === -1)) {
                            newTable.push(entry)
                        }
                        else {
                            newTable.map(entry => {
                                if (Moment(entry.closedDate).format('DD-MMM-YYYY') === value) {
                                    entry.display = true
                                }
                                return true
                            })
                        }
                    } else {
                        entry.checked = false
                        index = newTable.findIndex(x => x.catActId === entry.catActId);
                        newTable.splice(index, 1)

                    }
                }
                return true
            })
            this.setClosedDatesArray()
            this.setState({
                tempTable: newTable,
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        }
    }
    closeModal = () => {
        this.setState({
            checkedValue: null,
            checkedStatus: '',
            isModalOpen: false,
            isModalCloseDateOpen: false
        })
    }
    /*filter functions */
    /*confirm modal functions*/
    closeWithoutSave = () => {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openSaveDelActualsConfirmModal(confirmMsg);
    }
    openSaveDelActualsConfirmModal = (title) => {
        this.setState({
            saveDelActualsModalVisible: true,
            saveDelActualsModalTitle: title,
        });
    }
    closeSaveDelActualsConfirmModal = (isYesClicked) => {
        this.setState({
            saveDelActualsModalVisible: false,
            saveDelActualsModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.modalCloseHandler('close');
        }
    }
    /*confirm modal functions*/


    // ----- END of Utility functions -------

    render() {
        // const { deliverableDetails, addedMilestones, addedCategories, showDelArray ,milestoneDet,newCategoryDet} = this.state;
        const { deliverableId, delOwner, delEmail, delDescription, delSubDepartment, delDepartment,
            showDelArray, delInfoLoading, delRaidDetails, delCompletionPerc,
            actualEndDate, actualStartDate, expEndDate, expStartDate, pEndDate, pStartDate, isSelectOpen, delStatus, disableObj,
            isModalOpen, entryDatesArray, checkedStatus, checkedValue, tempTable,
            isModalCloseDateOpen, closedDatesArray, delSave, deptFlag, rangeObj } = this.state;
        const { deliverableName } = this.props;

        const getTooltipData = (value) => {
            if (value || value === 0) {
                let val = String(value)
                // .replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }

        const startCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "del-raid-start-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        return (
            <Modal id="ws-actuals-ws-details" visible={this.props.isDelModalVisible} className="ws-act-ws-det-modal-main"  >
                <Fragment>
                    <div className="modal-header">
                        <h6 className="modal-title md-block" placeholder={"Workstream Name not added"}>{deliverableName}</h6>
                        <img data-tip="Close" data-type="dark" data-place="left" src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal" ></img>
                        <ReactTooltip html={true} />
                    </div>
                    {delInfoLoading ?
                        <div className="row justify-content-center" style={{ padding: "60px 0px" }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>
                        :
                        <div className="modal-body">
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.ownerDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="ownerDetails"
                                        onClick={this.handleShowHide}></img>
                                    <label>Owner Details</label>
                                </div>
                                {(showDelArray.ownerDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row form-group reg-form-control">
                                            <div className="col-sm-6 form-group">
                                                <label className="deliverable-form-label">Owner</label>

                                                <input type="text" className="form-control"
                                                    placeholder="Owner Name" maxLength="50"
                                                    value={delOwner}
                                                    id="owner"
                                                    // onChange={this.handleChange}
                                                    autoComplete='off'
                                                    disabled
                                                />

                                            </div>
                                            <div className="col-sm-6 form-group">
                                                <label className="deliverable-form-label">Email Id</label>
                                                <input type="email" className="form-control"
                                                    placeholder="Owner Email Id" maxLength="50"
                                                    id="email"
                                                    value={delEmail}
                                                    disabled
                                                    autoComplete='off'
                                                />

                                            </div>
                                        </div>
                                        <div className="row reg-form-control">
                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Description</label>
                                                <textarea rows="4" type="text" className="form-control"
                                                    value={delDescription}
                                                    maxLength="250"
                                                    id="ws-description" disabled
                                                />
                                                {delDescription && delDescription.length ?
                                                    <div className="text-area-counter">{delDescription.length} / 250 character(s)</div>
                                                    : <div className="text-area-counter">0 / 250 character(s)</div>
                                                }


                                            </div>
                                        </div>
                                    </div> : ""
                                }
                            </div>
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">

                                    <img src={(showDelArray.deptDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="deptDetails"
                                        onClick={this.handleShowHide}></img>


                                    <label >Department Details</label>
                                </div>

                                {(showDelArray.deptDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control">
                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Department</label>
                                                <input type="text" className="form-control"
                                                    placeholder="Department Name" maxLength="50"
                                                    value={delDepartment}
                                                    id="dept"
                                                    disabled
                                                />
                                            </div>

                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Sub Department</label>
                                                <input type="text" className="form-control"
                                                    placeholder="Sub Department Name" maxLength="50"
                                                    value={delSubDepartment}
                                                    id="sub-dept"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.plannedDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="p_DateDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >Planned Dates</label>
                                </div>

                                {(showDelArray.plannedDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Start Date</label>

                                                        <div className={"ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                disabled={disableObj.pSD}
                                                                value={pStartDate}
                                                                selected={pStartDate === "" || pStartDate === null ? "" : new Date(pStartDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                useShortMonthInDropdown
                                                                required={true}
                                                                className="dl-start-date-picker form-control"
                                                            />
                                                            <img src={calIcon} alt="calender" className="calIcon-disable"></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className="ws-date-row ws-date-row-disabled">
                                                                <DatePicker
                                                                    disabled={disableObj.pED}
                                                                    value={pEndDate}
                                                                    selected={pEndDate === "" || pEndDate === null ? "" : new Date(pEndDate)}
                                                                    placeholderText="dd-mmm-yyyy"
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    useShortMonthInDropdown
                                                                    className="dl-end-date-picker form-control"
                                                                    required={true}
                                                                />
                                                                <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>

                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.expectedDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="e_DateDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >Expected Dates</label>
                                </div>

                                {(showDelArray.expectedDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Start Date</label>

                                                        <div className={!disableObj.eSD ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                disabled={disableObj.eSD}
                                                                minDate={(rangeObj.esd !== "") ? new Date(rangeObj.esd) : new Date(Moment(new Date()))}
                                                                //  minDate={new Date(Moment(new Date()).add(1, "days"))}
                                                                value={expStartDate}
                                                                selected={expStartDate === "" || expStartDate === null ? "" : new Date(expStartDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                onChange={(event) => this.handleDateChange(event, 'expStartDate')}
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                useShortMonthInDropdown
                                                                fixedHeight
                                                                className="del-raid-start-date-picker dl-start-date-picker form-control"
                                                                popperContainer={startCalendarContainer}
                                                                required={true}
                                                            />
                                                            <img src={calIcon} alt="calender" style={{ cursor: disableObj.eSD ? 'default' : 'pointer' }}></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className={!disableObj.eED ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                                <DatePicker
                                                                    className="del-raid-start-date-picker dl-end-date-picker form-control"
                                                                    popperContainer={startCalendarContainer}
                                                                    disabled={disableObj.eED}
                                                                    minDate={(rangeObj.eed !== "") ? new Date(rangeObj.eed) : (expStartDate !== "" && new Date(expStartDate) > new Date() ? new Date(expStartDate) : new Date(Moment(new Date())))}
                                                                    value={expEndDate}
                                                                    selected={expEndDate === "" || expEndDate === null ? "" : new Date(expEndDate)}
                                                                    placeholderText="dd-mmm-yyyy"
                                                                    onChange={(event) => this.handleDateChange(event, 'expEndDate')}
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    fixedHeight
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    useShortMonthInDropdown
                                                                    required={true}
                                                                />
                                                                <img src={calIcon} alt="calender" style={{ cursor: disableObj.eED ? 'default' : 'pointer' }}></img>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>

                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.actualDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="a_DateDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >Actual Dates</label>
                                </div>

                                {(showDelArray.actualDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Start Date</label>

                                                        <div className={!disableObj.aSD ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                className="del-raid-start-date-picker dl-start-date-picker form-control"
                                                                popperContainer={startCalendarContainer}
                                                                disabled={disableObj.aSD}
                                                                minDate={(rangeObj.asd !== "") ? new Date(rangeObj.asd) : ""}
                                                                maxDate={new Date()}
                                                                value={actualStartDate}
                                                                selected={actualStartDate === "" || actualStartDate === null ? "" : new Date(actualStartDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                onChange={(event) => this.handleDateChange(event, 'actualStartDate')}
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                fixedHeight
                                                                useShortMonthInDropdown
                                                                required={true}
                                                            />
                                                            <img src={calIcon} alt="calender" style={{ cursor: disableObj.aSD ? 'default' : 'pointer' }}></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className={!disableObj.aED ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                                <DatePicker
                                                                    className="del-raid-start-date-picker dl-end-date-picker form-control"
                                                                    popperContainer={startCalendarContainer}
                                                                    disabled={disableObj.aED}
                                                                    minDate={(rangeObj.aed !== "") ? new Date(rangeObj.aed) : (actualStartDate !== "" ? new Date(actualStartDate) : "")}
                                                                    maxDate={new Date()}
                                                                    value={actualEndDate}
                                                                    selected={actualEndDate === "" || actualEndDate === null ? "" : new Date(actualEndDate)}
                                                                    placeholderText="dd-mmm-yyyy"
                                                                    onChange={(event) => this.handleDateChange(event, 'actualEndDate')}
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    fixedHeight
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    useShortMonthInDropdown
                                                                    required={true}
                                                                />
                                                                <img src={calIcon} alt="calender" style={{ cursor: disableObj.aED ? 'default' : 'pointer' }}></img>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>
                            {/* satus field starts */}
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.statusDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="statusDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >Status</label>
                                </div>

                                {(showDelArray.statusDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-12">
                                                <div className="row">
                                                    <div className="col-sm-3" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Completion % *</label>

                                                        <div className="complete-input-wrap">
                                                            <input type="number" min={0} className="complete-input" value={delCompletionPerc} onChange={this.onCompletePercChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-5" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">Status *</label>
                                                        <div className="col-sm-12 paddingNone" >

                                                            <CustomSelect
                                                                isCustomSelectOpen={isSelectOpen}
                                                                customStatus={delStatus}
                                                                customMilestoneStatus={false}
                                                                customCompletionPerc={delCompletionPerc}
                                                                onCustomStatusOpen={this.onStatusOpen}
                                                                onCustomSelectChange={this.SelectChange} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>
                            {/* status field ends */}
                            <div className="del-title-row ws-cost" >
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">

                                    <img src={(showDelArray.raidDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="raidDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >RAID</label>
                                </div>
                                {(showDelArray.raidDet) ?
                                    <div className="cat-linkKpi-div-wrap cat-linkKpi-div-scroll cat-link-del-section">
                                        <div className="cat-linkKpi-div">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Category *</th>
                                                        <th>Description *</th>
                                                        <th>Mitigation Plan</th>
                                                        <th>Owner *</th>
                                                        <th id="openDate" style={{ minWidth: '170px' }}>Open Date *
                                                            <span style={{ float: 'right' }}>
                                                                <img data-tip=""
                                                                    data-for="openfilter_tooltip"
                                                                    data-place="left"
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        // color: props.allSelected && props.tableData.length > 0 ? 'black' : 'grey'
                                                                    }}
                                                                    src={vector}
                                                                    alt="filter" onClick={() => this.openModal()}></img>
                                                                <ReactTooltip id="openfilter_tooltip" className="tooltip-class">
                                                                    <span>Filter</span>
                                                                </ReactTooltip>
                                                            </span>
                                                            {isModalOpen ?
                                                                <div id="riskModal1" className="filter-open-date">
                                                                    <img onClick={() => this.closeModal()}
                                                                        className="close filter-close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1' }}
                                                                        src={closeIcon} alt="close" />
                                                                    {entryDatesArray.map((entry, key) => (

                                                                        <div className="row filter-row" >
                                                                            <input type="checkbox" id="test7"
                                                                                checked={checkedValue === 'select all' ? checkedStatus :
                                                                                    entry.openDate === checkedValue ?
                                                                                        entry.checked = checkedStatus : entry.checked}
                                                                                onClick={(event) => this.entryDateFilter(event, entry.openDate, key)}
                                                                            />
                                                                            <label for="test">{entry.openDate}</label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                : ""}

                                                        </th>
                                                        <th id="closedDate" style={{ minWidth: '170px' }}>Closed Date
                                                                <span style={{ float: 'right' }}>
                                                                <img
                                                                    data-tip=""
                                                                    data-for="closefilter_tooltip"
                                                                    data-place="left"
                                                                    src={vector}
                                                                    alt="filter"
                                                                    // style={{ cursor: 'pointer', color: props.allSelected && props.tableData.length > 0 ? 'black' : 'grey' }}
                                                                    onClick={() => this.openCloseDateModal()} ></img>
                                                                <ReactTooltip id="closefilter_tooltip" className="tooltip-class">
                                                                    <span>Filter</span>
                                                                </ReactTooltip>
                                                            </span>

                                                            {isModalCloseDateOpen ?
                                                                <div id="riskModal2" className="filter-open-date">
                                                                    {/* <button type="button" onClick={() => this.closeModal()} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1', marginLeft: '80%' }} >&times;</button> */}

                                                                    <img onClick={() => this.closeModal()}
                                                                        className="close filter-close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1' }}
                                                                        src={closeIcon} alt="close" /> {closedDatesArray.map((entry, key) => (
                                                                            <div className="row filter-row" >
                                                                                <input type="checkbox" id="test7"
                                                                                    checked={checkedValue === 'select all' ? checkedStatus :
                                                                                        entry.closedDate === checkedValue ?
                                                                                            entry.checked = checkedStatus : entry.checked}
                                                                                    onClick={(event) => this.closedDateFilter(event, entry.closedDate, key)} />
                                                                                <label for="test">{entry.closedDate}</label>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                                : ""}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        delRaidDetails && delRaidDetails.length !== 0 ?
                                                            tempTable && tempTable.map((cat, key) => (
                                                                (cat.display ?
                                                                    <tr key={`risksRow${key}`}>
                                                                        <td className="textAlign-left"
                                                                            key={`risktd1${key}`}
                                                                            data-label={cat.catType}
                                                                            style={{
                                                                                backgroundColor: '#494949',
                                                                                color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80'
                                                                            }}>
                                                                            {(cat.closedDate === undefined || cat.closedDate === "") ?
                                                                                <select
                                                                                    style={{
                                                                                        background: '#494949', border: 'none',
                                                                                        color: ((cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80')
                                                                                    }}
                                                                                    id={`del-raid-${key}-category`}
                                                                                    className="cat-select"
                                                                                    value={cat.catType}
                                                                                    onChange={(event) => this.onRiskDetailsChange(event, 'catType', key, cat.catActId)}
                                                                                >
                                                                                    <option disabled defaultValue value="">Select </option>
                                                                                    <option value="Risk">Risk </option>
                                                                                    <option value="Issue">Issue </option>
                                                                                    <option value="Dependency">Dependency </option>
                                                                                </select> :
                                                                                <div style={{ height: "25px", marginTop: "8px" }}>{cat.catType} </div>
                                                                            }

                                                                        </td>
                                                                        <td className="textAlign-left"
                                                                            key={`risktd2${key}`}
                                                                            data-label={cat.description}
                                                                            style={{
                                                                                width: '20%',
                                                                                backgroundColor: '#494949'
                                                                            }}>
                                                                            {(cat.closedDate === undefined || cat.closedDate === "") ?
                                                                                <textarea
                                                                                    maxLength="250"
                                                                                    id={`del-raid-${key}-description`}
                                                                                    className="del-inputCell"
                                                                                    placeholder="Description"
                                                                                    value={cat.description}
                                                                                    style={{ color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80' }}
                                                                                    onChange={(event) => this.onRiskDetailsChange(event, 'description', key, cat.catActId)}
                                                                                />
                                                                                :
                                                                                <textarea disabled={true} className='del-disabledCell' value={cat.description}
                                                                                    id={`del-raid-${key}-description`}
                                                                                    placeholder="Description"
                                                                                    style={{
                                                                                        color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80'
                                                                                    }}
                                                                                />
                                                                            }
                                                                        </td>
                                                                        <td className="textAlign-left"
                                                                            key={`risktd3${key}`}
                                                                            data-label={cat.mitigationPlan}
                                                                            style={{
                                                                                backgroundColor: '#494949'
                                                                            }}>
                                                                            {cat.closedDate === undefined || cat.closedDate === "" ?
                                                                                <textarea
                                                                                    maxLength="250"
                                                                                    id={`del-raid-${key}-mitigationPlan`}
                                                                                    value={cat.mitigationPlan}
                                                                                    className="del-inputCell"
                                                                                    placeholder="Mitigation Plan"
                                                                                    style={{ color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80' }}
                                                                                    onChange={(event) => this.onRiskDetailsChange(event, 'mitigationPlan', key, cat.catActId)}>
                                                                                </textarea>
                                                                                :
                                                                                <textarea disabled={true} className='del-disabledCell' placeholder="Mitigation Plan" value={cat.mitigationPlan}
                                                                                    id={`del-raid-${key}-mitigationPlan`}
                                                                                    style={{
                                                                                        color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80'
                                                                                    }}
                                                                                />
                                                                            }
                                                                        </td>
                                                                        <td className="textAlign-left"
                                                                            key={`risktd4${key}`}
                                                                            data-label={cat.owner}
                                                                            style={{
                                                                                backgroundColor: '#494949'
                                                                            }}>
                                                                            {(cat.closedDate === undefined || cat.closedDate === "") ?
                                                                                <textarea
                                                                                    maxLength="50"
                                                                                    value={cat.owner}
                                                                                    className="del-inputCell"
                                                                                    placeholder="Owner"
                                                                                    id={`del-raid-${key}-Owner`}
                                                                                    style={{ color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80' }}
                                                                                    onChange={(event) => this.onRiskDetailsChange(event, 'owner', key, cat.catActId)}>
                                                                                </textarea>
                                                                                :
                                                                                <textarea disabled={true}
                                                                                    placeholder="Owner"
                                                                                    className='del-disabledCell' value={cat.owner}
                                                                                    id={`del-raid-${key}-Owner`}
                                                                                    style={{ color: (cat.closedDate === undefined || cat.closedDate === "") ? '#ffffff' : '#ffffff80' }}
                                                                                ></textarea>
                                                                            }
                                                                        </td>
                                                                        <td className=""
                                                                            key={`risktd5${key}`}
                                                                            data-label={cat.openDate}
                                                                            style={{
                                                                                backgroundColor: '#494949',
                                                                                //  (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#494949' : '#d3d3d33d' 
                                                                                padding: "8px 4px"
                                                                            }}
                                                                        >
                                                                            {(cat.closedDate === undefined || cat.closedDate === "") ?
                                                                                <div className="row dateDiv">
                                                                                    <div className="col-sm-10 centerAlign">
                                                                                        <DatePicker
                                                                                            value={cat.openDate !== "" ? Moment(new Date(cat.openDate)).format("DD-MMM-YYYY") : ""}
                                                                                            // selected={entry.openDate}
                                                                                            id={`del-raid-${key}-openDate`}
                                                                                            selected={cat.openDate === "" || cat.openDate === null ? "" : new Date(cat.openDate)}
                                                                                            placeholderText="dd-mmm-yyyy"
                                                                                            onChange={(event) => this.onRiskDetailsChange(event, 'openDate', key, cat.catActId)}
                                                                                            // dateFormat="dd/MMM/yyyy"
                                                                                            showMonthDropdown
                                                                                            showYearDropdown
                                                                                            useShortMonthInDropdown
                                                                                            fixedHeight
                                                                                            required={true}
                                                                                            style={{ zIndex: '999' }}
                                                                                            className="del-raid-start-date-picker form-control date-Input del-raid-open-date"
                                                                                            popperContainer={startCalendarContainer}
                                                                                        />
                                                                                    </div>
                                                                                    <div
                                                                                        className="col-sm-2 calender-div-Icon"
                                                                                        style={{ paddingLeft: '0px' }}>
                                                                                        <img src={calIcon} alt="calender" className="calenderImg" />
                                                                                    </div>
                                                                                </div>
                                                                                :

                                                                                <div className="row">
                                                                                    <div className="col-sm-10 centerAlign" style={{ color: "#ffffff80" }}>
                                                                                        {Moment(cat.openDate).format('DD-MMM-YYYY')}
                                                                                    </div>
                                                                                    <div style={{ paddingLeft: '0px' }}
                                                                                        className="col-sm-2 calender-div-Icon" >
                                                                                        <img src={calIcon} alt="calender" className="calenderImg" />
                                                                                    </div>
                                                                                </div>
                                                                            }
                                                                        </td>
                                                                        <td className=""
                                                                            key={`risktd6${key}`}
                                                                            data-label={cat.closedDate}
                                                                            style={{
                                                                                backgroundColor: '#494949'
                                                                                // (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#494949' : '#d3d3d33d'
                                                                            }}>
                                                                            {(cat.closedDate === undefined || cat.closedDate === "") ?
                                                                                <div className="row dateDiv">
                                                                                    <div className="col-sm-10 centerAlign">
                                                                                        <DatePicker
                                                                                            value={""}
                                                                                            selected={cat.closedDate === "" || cat.closedDate === null ? "" : new Date(cat.closedDate)}
                                                                                            // selected={entry.closedDate }
                                                                                            id={`del-raid-${key}-closeDate`}
                                                                                            closeOnScroll={false}
                                                                                            placeholderText="dd-mmm-yyyy"
                                                                                            minDate={cat.openDate !== "" ? new Date(cat.openDate) : ""}
                                                                                            maxDate={new Date()}
                                                                                            onChange={(event) => this.onRiskDetailsChange(event, 'closedDate', key, cat.catActId)}
                                                                                            dateFormat="dd-MMM-yyyy"
                                                                                            showMonthDropdown
                                                                                            showYearDropdown
                                                                                            fixedHeight
                                                                                            useShortMonthInDropdown
                                                                                            className="del-raid-start-date-picker form-control date-Input del-raid-open-date"
                                                                                            required={true}
                                                                                            popperContainer={startCalendarContainer}
                                                                                            style={{ zIndex: '122323' }}
                                                                                        />
                                                                                    </div>
                                                                                    <div style={{ paddingLeft: '0px' }}
                                                                                        className={`col-sm-2 calender-div-Icon ${(cat.closedDate !== "") ? '' : 'empty-date'}`}
                                                                                    >
                                                                                        <img src={calIcon} alt="calender" className="calenderImg" />
                                                                                    </div>
                                                                                </div>

                                                                                :
                                                                                <div className="row ">
                                                                                    <div className="col-sm-10 centerAlign" style={{ color: "#ffffff80" }}>
                                                                                        {cat.closedDate !== "" ? Moment(cat.closedDate).format('DD-MMM-YYYY') : ""}
                                                                                    </div>
                                                                                    <div style={{ paddingLeft: '0px' }}
                                                                                        className={`col-sm-2 calender-div-Icon ${(cat.closedDate !== "") ? '' : 'empty-date'}`}
                                                                                    >
                                                                                        <img src={calIcon} alt="calender" className="calenderImg" />
                                                                                    </div>
                                                                                </div>
                                                                            }

                                                                        </td>
                                                                        <div style={{ paddingLeft: '5px', paddingTop: '10px' }}>
                                                                            <img src={trashIcon} className="" alt="add" id={`del-raid-${key}-delete`}
                                                                                data-tip="" data-for="del_rid_tool_tip" data-type="dark" data-place="left"
                                                                                onClick={SessionStorage.read("accessType") === "Read" ? () => { } : (event) => (this.deleteRisks(cat.catActId, key))} />
                                                                            <ReactTooltip id="del_rid_tool_tip" > <span>Delete RID</span></ReactTooltip>
                                                                        </div>
                                                                    </tr>
                                                                    : "")))
                                                            :
                                                            <tr>
                                                                <td colSpan='6'>
                                                                    No Risks, Issues and Dependencies have been added yet
                                                            </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </table>
                                            <img style={{
                                                position: 'absolute',
                                                right: '0px',
                                                paddingTop: '5px'
                                            }}
                                                src={circPlusIcon} className="" alt="add" data-tip="" data-for="add_rid_tool_tip" data-type="dark" data-place="left"
                                                onClick={(e) => this.addNewRisk()} />
                                            <ReactTooltip id="add_rid_tool_tip" > <span>Add RID</span></ReactTooltip>
                                        </div>
                                    </div>

                                    : ""}
                            </div>


                            <div className="row">
                                <div className="col-12 del-save-div paddingNone" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}>
                                    <button type="button"
                                        disabled={SessionStorage.read("accessType") === "Read" || !(delSave) ? true : false}
                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : !(delSave) ? 'default' : 'pointer', border: 'none' }}
                                        onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : this.onSaveClick}

                                        className="btn btn-primary"  >
                                        {delSave ? 'Save' : 'Saving...'} </button>
                                </div>
                            </div>

                        </div>

                    }</Fragment>
                {this.state.saveDelActualsModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveDelActualsModalVisible}
                        modalTitle={this.state.saveDelActualsModalTitle}
                        closeConfirmModal={this.closeSaveDelActualsConfirmModal}
                    /> : ''
                }
                {this.state.depDelActualsSaveModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'wsact-save'}
                        isModalVisible={this.state.depDelActualsSaveModalVisible}
                        modalTitle={this.state.depDelActualsSaveModalTitle}
                        closeConfirmModal={this.closeDepDelActualsSaveConfirmModal}
                    /> : ""
                }


            </Modal>
        );
    }
}

export default withRouter(DeliverableDetailsModalWsActuals);
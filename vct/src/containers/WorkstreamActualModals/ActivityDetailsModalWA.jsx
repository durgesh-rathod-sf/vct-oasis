import React, { Component, Fragment } from 'react';
import Modal from 'react-bootstrap4-modal';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import './WorkstreamActualModals.css';
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import Moment from 'moment';
import ReactTooltip from 'react-tooltip';
import vector from "../../assets/project/workstream/Vector.svg";
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-disabled.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import { toast } from 'react-toastify';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore', 'workstreamActualsStore')
class ActivityDetailsModalWA extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityDetails: {},
            isSelectOpen: false,
            actComplPercent: '',
            actStatus: '',
            actRaidDetails: [],

            // raid filter vriables
            isModalOpen: false,
            isModalCloseDateOpen: false,
            entryDatesArray: [],
            closedDatesArray: [],

            ownDetailsShow: false,
            depDetailsShow: false,
            planDateDetailsShow: false,
            expDateDetailsShow: false,
            actDateDetailsShow: false,
            statusDetailsShow: false,
            raidDetailsShow: false,
            actInfoLoading: true,
            saveActActualsDetModalVisible: false,
            saveActActualsDetModalTitle: '',
            saveLoading: false
        }
        this.initialActDetails = [];

        this.saveActivityWA = this.saveActivityWA.bind(this);
        this.onDetailsClick = this.onDetailsClick.bind(this);
        this.checkForMandatoryFields = this.checkForMandatoryFields.bind(this);
    }

    componentDidMount() {
        this.getWSActivityDetails();
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
            default:
                break;
        }
        return value;
    }

    onDetailsClick(details) {
        switch (details) {
            case 'ownerDetails':
                const ownDetailsShow = this.state.ownDetailsShow
                this.setState({
                    ownDetailsShow: !ownDetailsShow
                });
                break;
            case 'deptDetails':
                const depDetailsShow = this.state.depDetailsShow
                this.setState({
                    depDetailsShow: !depDetailsShow
                });
                break;
            case 'planDateDetails':
                const planDateDetailsShow = this.state.planDateDetailsShow
                this.setState({
                    planDateDetailsShow: !planDateDetailsShow
                });
                break;
            case 'expDateDetails':
                const expDateDetailsShow = this.state.expDateDetailsShow;
                this.setState({
                    expDateDetailsShow: !expDateDetailsShow
                });
                break;
            case 'actDateDetails':
                const actDateDetailsShow = this.state.actDateDetailsShow;
                this.setState({
                    actDateDetailsShow: !actDateDetailsShow
                });
                break;

            case 'statusDetails':
                const statusDetailsShow = this.state.statusDetailsShow
                this.setState({
                    statusDetailsShow: !statusDetailsShow
                });
                break;
            case 'raidDetails':
                const raidDetailsShow = this.state.raidDetailsShow
                this.setState({
                    raidDetailsShow: !raidDetailsShow
                });
                break;
            default:
                break;
        }
    }

    checkForMandatoryFields = () => {
        const { actStatus, actComplPercent } = this.state;
        if ((this.isDefined(actStatus) && actStatus !== "") &&
            (this.isDefined(actComplPercent) && actComplPercent !== "")) {
            return true;
        } else {
            return false;
        }
    }

    saveActivityWA() {
        const { workstreamActualsStore, activityId } = this.props;
        const { actStatus, actComplPercent } = this.state;
        const selectedLevel = "Activity"
        if (this.checkForMandatoryFields()) {
            this.setState({
                saveLoading: true
            })
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "activityId": activityId,
                "status": this.decodeStatus(actStatus),
                "complPercent": actComplPercent
            }
            workstreamActualsStore.saveActivityWrokstreamTimeline(payloadObj, selectedLevel)
                .then((response) => {
                    if (response && response.data.resultCode === 'OK') {
                        this.setState({
                            saveLoading: false
                        })
                        this.showNotification("Activity Details saved successfully", "Success", "success");

                        this.props.modalCloseHandler('save');

                    } else if (response && response.data.resultCode === 'KO') {
                        this.setState({
                            saveLoading: false
                        })
                        this.showNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.setState({
                            saveLoading: false
                        })
                        this.showNotification("Sorry! Something went wrong", "Error", "error");
                    }
                });
        }
        else {
            this.showNotification("Please enter all the mandatory fields with valid values", "Error", "error");

        }
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

    getWSActivityDetails() {
        const { workstreamStore, workstreamActualsStore } = this.props;
        const activityId = this.props.activityId
        workstreamStore.getWSActivity(activityId, 'timeline')
            .then((response) => {
                if (response !== null) {
                    if (!response.error && response.data.resultCode === "OK" && response.data.resultObj !== null) {
                        this.initialActDetails = JSON.parse(JSON.stringify(response.data.resultObj));
                        workstreamActualsStore.tableData = response.data.resultObj.raid;
                        this.setState({
                            activityDetails: response.data.resultObj,
                            actStatus: this.decodeStatus(response.data.resultObj.status),
                            actComplPercent: response.data.resultObj.complPercent,
                            actRaidDetails: response.data.resultObj.raid,
                            tableData: response.data.resultObj.raid,
                            tempTable: response.data.resultObj.raid,
                            actInfoLoading: false
                        }, () => {
                            this.filterDates(response.data.resultObj.raid)
                        })
                    }
                }
            })
    }

    // raid filter state assignmet on load
    formatDate(str) {
        let date = str === " " ? new Date() : new Date(str),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear()].join('-');
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
                return true
            })
            this.setState({
                tableData: details,
                tempTable: tempArr
            })
            workstreamActualsStore.tableData = details

        }
    }

    isDefined = (value) => {
        return value !== undefined && value !== null;
    }



    handleFieldChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        this.handleStateForRender(id, value);
    }
    handleStateForRender(id, value) {
        let actDetails = this.state.activityDetails;
        switch (id) {

            case 'completion':
                // let value = event.target.value
                let { actComplPercent, actStatus } = this.state;
                if ((value.length <= 3) || (value.indexOf(".")) >= (value.length - 2)) {
                    if (Number(value) >= 0 && Number(value) <= 100) {
                        actComplPercent = value === '' ? '' : Number(value);
                        actStatus = '';
                    } else {
                        if (value.includes("-")) {
                            this.setState({
                                actComplPercent: "",
                                actStatus: ""
                            })
                        }
                    }
                }
                this.setState({
                    actComplPercent: actComplPercent,
                    actStatus: actStatus
                });
                break;

            default:
                break;
        }
        this.setState({
            activityDetails: { ...actDetails }
        });
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
        // const {activityDetails, actStatus} = this.state;
        let value = event.target.innerText;

        this.setState({
            actStatus: value,
            isSelectOpen: false
        })
    }
    // ---custom select functions--- //


    //  raid filter functions start

    entryDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { tableData, tempTable } = this.state
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        if (value === 'Select All') {
            tableData.map((entry, index) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setEntryDatesArray()
            this.setState({
                tempTable: event.target.checked ? tableData : [],
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
    closedDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { tableData, tempTable } = this.state
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        if (value === 'Select All') {
            tableData.map((entry) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setClosedDatesArray()
            this.setState({
                tempTable: event.target.checked ? tableData : [],
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
                        if (newTable.filter(item => ((item.catActId !== null) && (item.catActId === entry.catActId)).length === 0)) {
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
    openModal = () => {

        this.setEntryDatesArray();

    }
    setEntryDatesArray() {
        const { actRaidDetails } = this.state;
        let entryDatesArray = []
        actRaidDetails.map((entry) => {
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
    setClosedDatesArray() {
        const { actRaidDetails } = this.state;
        let closedDatesArray = []
        actRaidDetails.map((entry) => {
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
    closeModal = () => {
        this.setState({
            checkedValue: null,
            checkedStatus: '',
            isModalOpen: false,
            isModalCloseDateOpen: false
        })
    }
    openCloseDateModal() {

        this.setClosedDatesArray();

    }
    // raid filter functions END


    //  modalCloseHandler = (type) => {
    //     if (type === 'close') {

    //         if ( this.state.actInfoLoading || (this.isDefined(this.initialActDetails.status) &&  this.initialActDetails.status !== ''
    //         && this.isDefined(this.initialActDetails.complPercent) &&  this.initialActDetails.complPercent !== '')) {
    //             this.props.modalCloseHandler(type);
    //         } else {
    //             this.showNotification("Please save the mandatory fields before closing", "Error", "error");
    //         }
    //     } else {
    //         this.props.modalCloseHandler(type);
    //     }
    // }
    /* confirm modal functions*/
    closeWithoutSave = () => {
        this.openSaveActActualsConfirmModal('Are you sure you want to close ?');
    }
    openSaveActActualsConfirmModal = (title) => {
        this.setState({
            saveActActualsDetModalVisible: true,
            saveActActualsDetModalTitle: title,
        });
    }
    closeSaveActActualsConfirmModal = (isYesClicked) => {
        this.setState({
            saveActActualsDetModalVisible: false,
            saveActActualsDetModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.modalCloseHandler('close');
        }
    }
    /* confirm modal functions*/



    render() {
        const { activityDetails, ownDetailsShow, depDetailsShow, planDateDetailsShow,
            actRaidDetails, expDateDetailsShow, actDateDetailsShow, statusDetailsShow, raidDetailsShow, actInfoLoading,
            isModalOpen, entryDatesArray, checkedStatus, checkedValue, tempTable,
            isModalCloseDateOpen, closedDatesArray,saveLoading } = this.state
        return (
            <Modal id="activity_modal_WA" className="act-modal-wa-main" visible={this.props.visible}>
                <div className="modal-header">
                    <h6 className="modal-title  md-block">{this.props.title}</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={() => { this.closeWithoutSave() }} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>
                {actInfoLoading ?
                    <div className="row justify-content-center" style={{ padding: "60px 0px" }}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                    </div>
                    :
                    <Fragment>
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={ownDetailsShow ? drillUpIcon : drillDownIcon} alt="open" className="text-left"
                                        id="ownerDetails" onClick={() => this.onDetailsClick('ownerDetails')}></img>
                                    <label className="activity-form-label"> Owner Details</label>
                                </div>
                            </div>
                            {ownDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row form-group reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6">

                                            <label className="activity-form-label">Owner</label>
                                            <input type="text" value={activityDetails.owner} id="owner"
                                                className="form-control" placeholder="Owner Name"
                                                maxLength="50"
                                                autoComplete='off'
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6" >

                                            <label className="activity-form-label">Email Id</label>
                                            <input type="text" value={activityDetails.ownerEmail} id="ownerEmail"
                                                className="form-control" placeholder="Owner Email Id"
                                                maxLength="50"
                                                disabled={true}
                                                autoComplete='off'
                                            />
                                        </div>
                                    </div>
                                    <div className="row reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6">

                                            <label className="activity-form-label">Description</label>
                                            <textarea type="text" rows="4" className="form-control" id="description"
                                                value={activityDetails.description}
                                                maxLength="250"
                                                disabled={true}
                                            />
                                            {activityDetails && activityDetails.description ?
                                                <div className="text-area-counter">{activityDetails.description.length} / 250 character(s)</div>
                                                : <div className="text-area-counter"> 0 / 250 character(s)</div>
                                            }
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={depDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        id="deptDetails" onClick={() => this.onDetailsClick('deptDetails')}></img>
                                    <label className="activity-form-label"> Department Details</label>
                                </div>
                            </div>
                            {depDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6">
                                            <label className="activity-form-label">Department</label>
                                            <input type="text" className="form-control" id="department"
                                                placeholder="Department Name"
                                                maxLength="50"
                                                disabled={true}
                                                value={activityDetails.department}
                                            />
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6" >
                                            <label className="activity-form-label">Sub Department</label>
                                            <input type="text" className="form-control" id="subDepartment"
                                                placeholder="Sub Department Name"
                                                maxLength="50"
                                                disabled={true}
                                                value={activityDetails.subDept}
                                            />
                                        </div>
                                    </div>
                                </div> : ''
                            }
                        </div>

                        {/* planned dates div */}
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={planDateDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="p_dateDetails" onClick={() => this.onDetailsClick('planDateDetails')}></img>
                                    <label className="activity-form-label">Planned Dates</label>
                                </div>
                            </div>
                            {planDateDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control date-form-control">
                                        <div className="col-6 paddingNone">
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-xs-6">
                                                    <label className="activity-form-label">Planned Start Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.startDate !== "" && this.isDefined(activityDetails.startDate)) ? Moment(activityDetails.startDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-xs-6" >
                                                    <label className="activity-form-label">Planned End Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.endDate !== "" && this.isDefined(activityDetails.endDate)) ? Moment(activityDetails.endDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        {/* expected dates divs */}
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={expDateDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="e_dateDetails" onClick={() => this.onDetailsClick('expDateDetails')}></img>
                                    <label className="activity-form-label">Expected Dates</label>
                                </div>
                            </div>
                            {expDateDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control date-form-control">
                                        <div className="col-6 paddingNone">
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-xs-6">
                                                    <label className="activity-form-label">Expected Start Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.expStartDate !== "" && this.isDefined(activityDetails.expStartDate)) ? Moment(activityDetails.expStartDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-xs-6" >
                                                    <label className="activity-form-label">Expected End Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.expEndDate !== "" && this.isDefined(activityDetails.expEndDate)) ? Moment(activityDetails.expEndDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        {/* actual dates divs */}
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={actDateDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="a_dateDetails" onClick={() => this.onDetailsClick('actDateDetails')}></img>
                                    <label className="activity-form-label">Actual Dates</label>
                                </div>
                            </div>
                            {actDateDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control date-form-control">
                                        <div className="col-6 paddingNone">
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-xs-6">
                                                    <label className="activity-form-label">Actual Start Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.actualStartDate !== "" && this.isDefined(activityDetails.actualStartDate)) ? Moment(activityDetails.actualStartDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-xs-6" >
                                                    <label className="activity-form-label">Actual End Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd-MMM-yyyy"
                                                            value={(activityDetails.actualEndDate !== "" && this.isDefined(activityDetails.actualEndDate)) ? Moment(activityDetails.actualEndDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender" className="calIcon-disable"></img>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        {/* status details div */}
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={statusDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="statusDetails" onClick={() => this.onDetailsClick('statusDetails')}></img>
                                    <label className="activity-form-label">Status</label>
                                </div>
                            </div>
                            {statusDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control">
                                        <div className="col-sm-3 ">
                                            <label className="activity-form-label">Completion % *</label>
                                            <input type="number" className="form-control" id="completion"
                                                // placeholder="Department Name"
                                                maxLength="50"
                                                min={0}
                                                max={100}
                                                value={this.state.actComplPercent}
                                                onChange={this.handleFieldChange}
                                            />
                                        </div>
                                        <div className="col-sm-5 act-wa-select-main" >
                                            <label className="activity-form-label">Status *</label>
                                            <div className="col-sm-12 paddingNone" >
                                                <CustomSelect
                                                    isCustomSelectOpen={this.state.isSelectOpen}
                                                    customStatus={this.state.actStatus}
                                                    customMilestoneStatus={false}
                                                    customCompletionPerc={this.state.actComplPercent}
                                                    onCustomStatusOpen={this.onStatusOpen}
                                                    onCustomSelectChange={this.SelectChange} />
                                            </div>


                                        </div>
                                    </div>
                                </div>
                                : ''
                            }
                        </div>

                        {/* activity RAID details div */}
                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={raidDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="raidDetails" onClick={() => this.onDetailsClick('raidDetails')}></img>
                                    <label className="activity-form-label">RAID</label>
                                </div>
                            </div>
                            {raidDetailsShow ?
                                <div className="act-cat-scroll">
                                    <div className="cat-linkKpi-div-wrap cat-linkKpi-div-scroll">
                                        {
                                            // start
                                            actRaidDetails && actRaidDetails.length !== 0 ?
                                                <div className="cat-linkKpi-div act-cat-linkKpi-div">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Category</th>
                                                                <th>Description</th>
                                                                <th>Mitigation Plan</th>
                                                                <th>Owner</th>
                                                                <th id="openDate">Open Date
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
                                                                {/* closed date th */}
                                                                <th id="closedDate">Closed Date
                                                                <span style={{ float: 'right' }}>
                                                                        <img
                                                                            data-tip=""
                                                                            data-for="closefilter_tooltip"
                                                                            data-place="left"
                                                                            src={vector}
                                                                            alt="filter"
                                                                            style={{ cursor: 'pointer' }}
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
                                                                        : ""}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tempTable && tempTable.map((cat, catInd) => (
                                                                <tr key={`raid_cat_${cat.catType}_${catInd}`}>
                                                                    <td className="textAlign-left">{cat.catType}</td>
                                                                    <td className="textAlign-left">{cat.description}</td>
                                                                    <td className="textAlign-left">{cat.mitigationPlan}</td>
                                                                    <td className="textAlign-left">{cat.owner}</td>
                                                                    <td className="textAlign-right">{cat.openDate !== "" ? Moment(new Date(cat.openDate)).format("DD-MMM-YYYY") : ""}</td>
                                                                    <td className="textAlign-right">{cat.closedDate !== "" ? Moment(new Date(cat.closedDate)).format("DD-MMM-YYYY") : ""}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                :
                                                <div className="form-group row nodata-label" >
                                                    <label>  No RAID details to display</label>
                                                </div>
                                            // end
                                        }
                                    </div>
                                </div>
                                : ''
                            }
                        </div>

                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}>
                                <button type="button" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : (saveLoading?"default":'pointer') }}
                                    disabled={(SessionStorage.read("accessType") === "Read" || saveLoading)? true : false}
                                    className="btn btn-primary" onClick={(SessionStorage.read("accessType") === "Read" || saveLoading) ? 'return false;' : this.saveActivityWA}>
                                    {saveLoading ? "Saving..." : "Save"}</button>
                            </div>
                        </div>
                    </Fragment>
                }
                {this.state.saveActActualsDetModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveActActualsDetModalVisible}
                        modalTitle={this.state.saveActActualsDetModalTitle}
                        closeConfirmModal={this.closeSaveActActualsConfirmModal}
                    />
                    : ''

                }

            </Modal>
        );
    }
}

export default withRouter(ActivityDetailsModalWA);

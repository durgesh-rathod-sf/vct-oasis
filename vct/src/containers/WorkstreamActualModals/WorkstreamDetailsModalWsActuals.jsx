import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap4-modal';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import 'moment-timezone';
// import { createPortal } from 'react-dom';
import ReactTooltip from 'react-tooltip';
// import './DefineWsModals.css';
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import './WorkstreamActualModals.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
// import Downshift from 'downshift';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import vector from "../../assets/project/workstream/Vector.svg";
var SessionStorage = require('store/storages/sessionStorage');
@inject('workstreamStore', 'workstreamActualsStore', 'adminStore')
class WorkstreamDetailsModalWsActuals extends Component {
    constructor(props) {
        super(props);

        this.state = {
            wsTeamMember: "",
            userDetails: "",
            wsName: "",
            wsOwner: "",
            wsEmail: "",
            wsDescription: "",
            wsSubDepartment: "",
            wsDepartment: "",
            wsStartDate: "",
            wsEndDate: "",
            selectedMember: "",
            wsStatus: "",
            wsCompletionPerc: "",

            wsActualEndDate: "",
            wsActualStartDate: "",
            wsExpectedEndDate: "",
            wsExpectedStartDate: "",
            wsPlannedEndDate: "",
            wsPlannedStartDate: "",
            wsTeamArray: [],
            wsLinkedKpiBenefits: [],
            wsInvestments: [],
            isKpiModalOpen: false,
            isInvModalOpen: false,
            invWsDetails: "",
            kpiWsDetails: "",
            selectedIconTab: 'general_info',
            edited: false,
            wsOwnerError: '',
            wsEmailError: "",
            TeamErr: "",
            wsDescriptionError: '',
            saveGenInfoModalVisible: false,
            saveGenInfoModalTitle: '',
            showDelArray: {
                ownerDet: false,
                deptDet: false,
                plannedDatesDet: false,
                expectedDatesDet: false,
                actualDatesDet: false,
                statusDet: false,
                raidDet: false
            },
            wsInfoLoading: true,
            isSelectOpen: false,
            isModalOpen: false,
            isModalCloseDateOpen: false,
            entryDatesArray: [],
            closedDatesArray: [],
            saveWsActualsDetModalVisible: false,
            saveWsActualsDetModalTitle: '',
            saveLoading:false
        }
        this.saveWsActualsDetails = this.saveWsActualsDetails.bind(this);
        this.onUserEmailChangeHandler = this.onUserEmailChangeHandler.bind(this);
        this.handleShowHide = this.handleShowHide.bind(this);
        this.onStatusOpen = this.onStatusOpen.bind(this);
        this.SelectChange = this.SelectChange.bind(this);
        this.formatDate = this.formatDate.bind(this)
    }

    componentDidMount() {
        const { wsId } = this.props;
        this.fetchWsInfo(wsId);
    }
    fetchWsInfo(wsId) {
        const { workstreamStore } = this.props;
        workstreamStore.fetchWsGenInfo(wsId, "actuals")
            .then((res) => {
                if (!res.error) {
                    this.buildKpisList(res)
                }

            })
        //    const { adminStore } = this.props;
        //    adminStore.fetchUsers()
        //        .then((response) => {
        //           this.setState({
        //                userDetails: adminStore.userDetails,
        //            });
        //        });
    }
    buildKpisList = (res) => {
        const { workstreamActualsStore } = this.props;
        let temArrWsRaid = res.workStreamRisksCatagoriesDto;

        workstreamActualsStore.tableData = temArrWsRaid;
        this.setState({
            isGeneralInfoOpen: true,
            // selectedWsDetails : details,
            wsId: res.wsId,
            wsName: res.name,
            wsOwner: res.owner,
            wsDescription: res.description,
            wsEmail: res.ownerEmail,

            wsTeamArray: (res.teamEmails === null ? [] : res.teamEmails.split(";")),
            wsSubDepartment: res.subDept,
            wsDepartment: res.department,

            wsPlannedStartDate: (res.startDate === "" ? "" : Moment(new Date(res.startDate)).format('DD-MMM-YYYY')),
            wsPlannedEndDate: (res.endDate === "" ? "" : Moment(new Date(res.endDate)).format('DD-MMM-YYYY')),
            wsExpectedStartDate: (res.expStartDate === "" ? "" : Moment(new Date(res.expStartDate)).format('DD-MMM-YYYY')),
            wsExpectedEndDate: (res.expEndDate === "" ? "" : Moment(new Date(res.expEndDate)).format('DD-MMM-YYYY')),
            wsActualStartDate: (res.actualStartDate === "" ? "" : Moment(new Date(res.actualStartDate)).format('DD-MMM-YYYY')),
            wsActualEndDate: (res.actualEndDate === "" ? "" : Moment(new Date(res.actualEndDate)).format('DD-MMM-YYYY')),

            wsStatus: this.decodeStatus(res.status),
            wsCompletionPerc: res.complPercent,

            wsInfoLoading: false,
            // wsRaidDetails:workStreamRisksCatagoriesDto,
            wsRaidDetails: temArrWsRaid,
            tableData: temArrWsRaid,
            tempTable: temArrWsRaid
        }, () => {
            this.filterDates(temArrWsRaid)
        })

    }
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
            })
            this.setState({
                tableData: details,
                tempTable: tempArr
            })
            workstreamActualsStore.tableData = details

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
    checkForMandatoryFields = () => {
        const { wsName, wsCompletionPerc, wsStatus } = this.state;
        if (wsName !== "" && wsCompletionPerc !== "" && wsCompletionPerc !== null &&
            wsStatus !== "" && wsStatus !== null
        ) {
            return true;
        } else {
            return false;
        }
    }
    saveWsActualsDetails() {
        const { workstreamStore, workstreamActualsStore } = this.props;
        const { wsId, wsStatus, wsCompletionPerc } = this.state;
        const selectedLevel = "Workstream"
        if (this.checkForMandatoryFields()) {
            this.setState({
                saveLoading:true
            })
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "wsId": wsId,
                "status": this.decodeStatus(wsStatus),
                "complPercent": wsCompletionPerc
            }
            workstreamActualsStore.saveActivityWrokstreamTimeline(payloadObj, selectedLevel)
                .then((response) => {
                    if (response && response.data.resultCode === 'OK') {
                        // this.props.fetchAllWsDetails();

                        this.showNotification("Workstream Details saved successfully", "Success", "success");
                        this.setState({
                            edited: false,
                            saveLoading:false
                        })
                        this.props.onSaveSuccess();
                        this.props.modalCloseHandler();

                    } else if (response && response.data.resultCode === 'KO') {
                        this.setState({
                            saveLoading:false
                        })
                        this.showNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.setState({
                            saveLoading:false
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

    onUserEmailChangeHandler = (event) => {
        const { wsTeamArray } = this.state;
        let tempTeamArr = wsTeamArray;
        let value = (event.target.value);
        var res = value.substring(value.length, value.length - 14);
        const err = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') || value === "" ?
            (tempTeamArr.includes(value) ? "Team member is already added" : "") : 'Please enter valid email Id. Email Id field should include @accenture.com');

        this.setState({
            wsTeamMember: event.target.value,
            TeamErr: err,
        })


    };

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
            wsStatus: value
        })
    }
    onCompletePercChange = (event) => {
        let value = event.target.value
        if ((value.length <= 3) || (value.indexOf(".")) >= (value.length - 2)) {
            if (Number(value) >= 0 && Number(value) <= 100) {
                this.setState({
                    wsCompletionPerc: (value === "" ? "" : Number(value)),
                    wsStatus: ""
                })
            }
            else {
                if (value.includes("-")) {
                    this.setState({
                        wsCompletionPerc: "",
                        wsStatus: ""
                    })
                }
            }

        }
    }
    // handleCompletionKeypress=(event)=>{

    //         if(event.charCode === 45){
    //             this.setState({
    //             wsCompletionPerc: "",
    //             wsStatus: ""
    //         })
    //     }
    // }
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
            wsStatus: value,
            isSelectOpen: false
        })
    }
    // ---custom select functions--- //
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
        const { wsRaidDetails } = this.state;
        let entryDatesArray = []
        wsRaidDetails.map((entry) => {
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
        const { wsRaidDetails } = this.state;
        let closedDatesArray = []
        wsRaidDetails.map((entry) => {
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
    /* confirm modal function*/
    closeWithoutSave = () => {
        this.openSaveWsActualsConfirmModal('Are you sure you want to close ?');
    }
    openSaveWsActualsConfirmModal = (title) => {
        this.setState({
            saveWsActualsDetModalVisible: true,
            saveWsActualsDetModalTitle: title,
        });
    }

    closeSaveWsActualsConfirmModal = (isYesClicked) => {
        this.setState({
            saveWsActualsDetModalVisible: false,
            saveWsActualsDetModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.modalCloseHandler();
        }
    }
    /* confirm modal function*/

    // ----- END of Utility functions -------

    render() {
        // const { deliverableDetails, addedMilestones, addedCategories, showDelArray ,milestoneDet,newCategoryDet} = this.state;
        const { wsId, wsOwner, wsEmail, wsDescription, wsSubDepartment, wsDepartment,
            showDelArray, wsTeamArray, wsTeamMember, TeamErr, wsInfoLoading, wsRaidDetails, wsCompletionPerc,
            wsActualEndDate, wsActualStartDate, wsExpectedEndDate, wsExpectedStartDate, wsPlannedEndDate, wsPlannedStartDate, isSelectOpen, wsStatus,
            isModalOpen, entryDatesArray, checkedStatus, checkedValue, tempTable,
            isModalCloseDateOpen, closedDatesArray, saveLoading } = this.state;
        const { wsName } = this.props;

        return (
            <Modal id="ws-actuals-ws-details" visible={this.props.visible} className="ws-act-ws-det-modal-main"  >
                <Fragment>
                    <div className="modal-header">
                        <h6 className="modal-title md-block" placeholder={"Workstream Name not added"}>{wsName}</h6>
                        <img data-tip="Close" data-type="dark" data-place="left" src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal" ></img>
                        <ReactTooltip html={true} />
                    </div>
                    {wsInfoLoading ?
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
                                                    value={wsOwner}
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
                                                    value={wsEmail}
                                                    disabled
                                                    autoComplete='off'
                                                />

                                            </div>
                                        </div>
                                        <div className="row reg-form-control">
                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Team Members</label>
                                                <div className="teamList-class" >

                                                    <div className="col-sm-12 paddingNone">
                                                        <div className="row">
                                                            <div className="col-sm-10 paddingNone">
                                                                <input type="text" className="form-control"
                                                                    placeholder="Enter Email" maxLength="50"
                                                                    value={wsTeamMember || ''}
                                                                    disabled
                                                                /*onKeyPress={(event) => event.charCode === 13 ? this.addTeamMember(event) : ""}*/
                                                                />
                                                                <span style={{ color: '#ffffff' }}><small>{TeamErr}</small></span>
                                                            </div>
                                                            <div className="col-sm-1" style={{ padding: '5px 0px 0px 25px' }}>
                                                                <img src={circPlusIcon} className="disable-img" alt="add" data-tip="" data-for="add_team_email_tool_tip" data-type="dark" data-place="bottom" />
                                                                <ReactTooltip id="add_team_email_tool_tip" > <span>Add team member</span></ReactTooltip>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row team-list-wrap">
                                                        {wsTeamArray && wsTeamArray.map((user, userIndex) => (
                                                            <div className="col-sm-4">
                                                                <div className="team-list">
                                                                    <p data-tip
                                                                        data-type="dark"
                                                                        data-for={`team-tooltip_${userIndex}`}
                                                                        data-place="bottom">
                                                                        {(user.split("@")[0].length > 13) ? `${user.substring(0, 13)}...` : user.split("@")[0]}
                                                                    </p>
                                                                    <ReactTooltip id={`team-tooltip_${userIndex}`} >
                                                                        <span>{user}</span>
                                                                    </ReactTooltip>
                                                                    <img src={closeIcon} alt="close"
                                                                        data-tip
                                                                        data-type="dark"
                                                                        data-for={`team-tooltip-delete`}
                                                                        data-place="bottom"
                                                                        id={userIndex}
                                                                    // onClick={(e) => this.removeTeamMember(e, user)}
                                                                    />
                                                                    <ReactTooltip id={`team-tooltip-delete`} >
                                                                        <span>Delete</span>
                                                                    </ReactTooltip>
                                                                </div>

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 form-group">
                                                <label className="deliverable-form-label">Description</label>
                                                <textarea rows="4" type="text" className="form-control"
                                                    value={wsDescription}
                                                    maxLength="250"
                                                    id="ws-description" disabled
                                                />
                                                {wsDescription && wsDescription.length ?
                                                    <div className="text-area-counter">{wsDescription.length} / 250 character(s)</div>
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
                                                    value={wsDepartment}
                                                    id="dept"
                                                    disabled
                                                />
                                            </div>

                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Sub Department</label>
                                                <input type="text" className="form-control"
                                                    placeholder="Sub Department Name" maxLength="50"
                                                    value={wsSubDepartment}
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

                                                        <div className="ws-date-row ws-date-row-disabled">
                                                            <DatePicker
                                                                value={wsPlannedStartDate}
                                                                placeholderText="dd/mm/yyyy"
                                                                dateFormat="dd-MMM-yyyy"
                                                                className="dl-start-date-picker form-control"
                                                                disabled
                                                            />
                                                            <img src={calIcon} alt="calender" className="calIcon-disable"></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className="ws-date-row ws-date-row-disabled">
                                                                <DatePicker
                                                                    value={wsPlannedEndDate}
                                                                    placeholderText="dd/mm/yyyy"
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    className="dl-end-date-picker form-control"
                                                                    disabled
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

                                                        <div className="ws-date-row ws-date-row-disabled">
                                                            <DatePicker
                                                                value={wsExpectedStartDate}
                                                                placeholderText="dd/mm/yyyy"
                                                                dateFormat="dd-MMM-yyyy"
                                                                className="dl-start-date-picker form-control"
                                                                disabled
                                                            />
                                                            <img src={calIcon} alt="calender" className="calIcon-disable"></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className="ws-date-row ws-date-row-disabled">
                                                                <DatePicker
                                                                    value={wsExpectedEndDate}
                                                                    placeholderText="dd/mm/yyyy"
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    className="dl-end-date-picker form-control"
                                                                    disabled
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

                                                        <div className="ws-date-row ws-date-row-disabled">
                                                            <DatePicker
                                                                value={wsActualStartDate}
                                                                placeholderText="dd/mm/yyyy"
                                                                dateFormat="dd-MMM-yyyy"
                                                                className="dl-start-date-picker form-control"
                                                                disabled
                                                            />
                                                            <img src={calIcon} alt="calender" className="calIcon-disable"></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className="ws-date-row ws-date-row-disabled">
                                                                <DatePicker
                                                                    value={wsActualEndDate}
                                                                    placeholderText="dd/mm/yyyy"
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    className="dl-end-date-picker form-control"
                                                                    disabled
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
                                                            <input type="number" min={0} className="complete-input" value={wsCompletionPerc}
                                                                //  onKeyPress={(event) =>this.handleCompletionKeypress(event) }	
                                                                onChange={this.onCompletePercChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-5" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">Status *</label>
                                                        <div className="col-sm-12 paddingNone" >

                                                            <CustomSelect
                                                                isCustomSelectOpen={isSelectOpen}
                                                                customStatus={wsStatus}
                                                                customMilestoneStatus={false}
                                                                customCompletionPerc={wsCompletionPerc}
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
                                    <div className="cat-linkKpi-div-wrap cat-linkKpi-div-scroll">
                                        {
                                            // start
                                            wsRaidDetails && wsRaidDetails.length !== 0 ?
                                                <div className="cat-linkKpi-div" id="raidContainerTable">
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
                                                                <th id="closedDate">Closed Date
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
                                                                        : ""}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tempTable && tempTable.map((cat) => (
                                                                (cat.display ? <tr>
                                                                    <td className="textAlign-left">{cat.catType}</td>
                                                                    <td className="textAlign-left">{cat.description}</td>
                                                                    <td className="textAlign-left">{cat.mitigationPlan}</td>
                                                                    <td className="textAlign-left">{cat.owner}</td>
                                                                    <td className="textAlign-right">{cat.openDate !== "" ? Moment(new Date(cat.openDate)).format("DD-MMM-YYYY") : ""}</td>
                                                                    <td className="textAlign-right">{cat.closedDate !== "" ? Moment(new Date(cat.closedDate)).format("DD-MMM-YYYY") : ""}</td>
                                                                </tr>
                                                                    : ""
                                                                )
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                :
                                                <div className="form-group row del-detail-row nodata-label" >
                                                    <label> No RAID details to display</label>
                                                </div>
                                            // end
                                        }
                                    </div>

                                    : ""}
                            </div>


                            <div className="row">
                                <div className="col-12 del-save-div paddingNone" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" :  (saveLoading?"default":'pointer')  }}>
                                    <button type="button"
                                        disabled={(SessionStorage.read("accessType") === "Read" ||  saveLoading)? true : false}
                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : (saveLoading?"default":'pointer') }}
                                        onClick={(SessionStorage.read("accessType") === "Read" || saveLoading) ? 'return false;' : this.saveWsActualsDetails}

                                        className="btn btn-primary"  >
                                       {saveLoading?"Saving...": "Save" }</button>
                                </div>
                            </div>

                        </div>

                    }</Fragment>
                {/* } */}

                {this.state.saveWsActualsDetModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveWsActualsDetModalVisible}
                        modalTitle={this.state.saveWsActualsDetModalTitle}
                        closeConfirmModal={this.closeSaveWsActualsConfirmModal}
                    /> : ''
                }


            </Modal>
        );
    }
}

export default withRouter(WorkstreamDetailsModalWsActuals);
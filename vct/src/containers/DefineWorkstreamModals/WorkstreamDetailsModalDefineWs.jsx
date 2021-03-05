import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap4-modal';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import 'moment-timezone';
import ReactTooltip from 'react-tooltip';
import './DefineWsModals.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore', 'adminStore')
class WorkstreamDetailsModal extends Component {
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
            wsDepartmentError: "",
            wsSubDeptError: "",
            TeamErr: "",
            wsDescriptionError: '',
            saveWsDetModalVisible: false,
            saveWsDetModalTitle: '',
            showDelArray: {
                ownerDet: false,
                deptDet: false,
                datesDet: false,
                benefitsDet: false,
                costsDet: false
            },
            wsInfoLoading: true,
            saveLoading:false,
        }
        this.saveWsDetails = this.saveWsDetails.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onUserEmailChangeHandler = this.onUserEmailChangeHandler.bind(this);
        this.ModalKpiHandler = this.ModalKpiHandler.bind(this);
        this.ModalInvHandler = this.ModalInvHandler.bind(this);
        this.ModalInvCloseHandler = this.ModalInvCloseHandler.bind(this);
        this.ModalKpiCloseHandler = this.ModalKpiCloseHandler.bind(this);

        this.handleShowHide = this.handleShowHide.bind(this);
        this.removeTeamMember = this.removeTeamMember.bind(this);
        this.addTeamMember = this.addTeamMember.bind(this);
    }

    componentDidMount() {
        const { wsId } = this.props;
        this.fetchWsInfo(wsId);
    }
    fetchWsInfo(wsId) {
        const { workstreamStore } = this.props;
        workstreamStore.fetchWsGenInfo(wsId)
            .then((res) => {
                if (res.error) {
                    return {
                        error: true
                    }
                } else {
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
        let linkedKpiList = res.linkedKPIs;
        let maxYear = "";
        if (linkedKpiList !== null) {
            maxYear = linkedKpiList[0].splitKpis.length;
            for (let i = 0; i < linkedKpiList.length; i++) {
                if (maxYear < linkedKpiList[i].splitKpis.length) {
                    maxYear = linkedKpiList[i].splitKpis.length;
                }
            }
            for (let p = 0; p < linkedKpiList.length; p++) {
                // if(maxYear > linkedKpiList[p].splitKpis.length ){
                let yearArr = [];
                for (let q = 0; q < linkedKpiList[p].splitKpis.length; q++) {
                    yearArr.push(q + 1)
                }
                for (let k = 0; k < linkedKpiList[p].splitKpis.length; k++) {
                    if ((linkedKpiList[p].splitKpis[k].year + 1) <= maxYear && yearArr.indexOf(linkedKpiList[p].splitKpis[k].year + 1) === -1) {
                        linkedKpiList[p].splitKpis.push(
                            {
                                "year": (linkedKpiList[p].splitKpis[k].year + 1),
                                "benefit": ""
                            }
                        )
                    }
                }

                // }

            }
        }

        this.setState({
            maxYear: maxYear,
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
            wsStartDate: (res.startDate === "" ? "" : Moment(new Date(res.startDate)).format('DD-MMM-YYYY')),

            wsEndDate: (res.endDate === "" ? "" : Moment(new Date(res.endDate)).format('DD-MMM-YYYY')),

            wsLinkedKpiBenefits: linkedKpiList,
            wsInvestments: res.linkedCostCategories,
            wsInfoLoading: false
        })

    }
    openSaveWsConfirmModal = (title) => {
        this.setState({
            saveWsDetModalVisible: true,
            saveWsDetModalTitle: title,
        });
    }

    closeSaveWsConfirmModal = (isYesClicked) => {
        this.setState({
            saveWsDetModalVisible: false,
            saveWsDetModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.props.modalCloseHandler();
        }
    }



    checkForMandatoryFields = () => {
        const { wsName, wsOwner, wsEmail, wsOwnerError, wsEmailError, TeamErr, wsDescriptionError } = this.state;
        if (wsName !== "" && wsOwner !== "" && wsOwner !== null &&
            wsEmail !== "" && wsEmail !== null &&
            // wsDescription !== "" && wsDescription !== null &&
            wsOwnerError === '' && wsDescriptionError === '' && wsEmailError === '' && TeamErr === '') {
            return true;
        } else {
            return false;
        }
    }
    saveWsDetails() {
        const { workstreamStore } = this.props;
        const { wsId, wsName, wsOwner, wsDescription, wsEmail, wsDepartment, wsSubDepartment, wsTeamArray } = this.state;
        let wsTeamsString = wsTeamArray.toString()
        let finalWsTeam = (wsTeamsString === "" ? null : wsTeamsString.replace(/,/g, ";"));
        this.setState({
            saveLoading:true
        })
        if (this.checkForMandatoryFields()) {
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "name": wsName,
                "wsId": wsId,
                "owner": wsOwner,
                "description": wsDescription,
                "ownerEmail": wsEmail.toLowerCase(),
                "teamEmails": finalWsTeam,
                "department": wsDepartment,
                "subDept": wsSubDepartment


            }
            workstreamStore.saveWorkstreamDetails(payloadObj)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        // this.props.fetchAllWsDetails();
                        workstreamStore.fetchWsGenInfo(wsId)
                        this.showNotification("Workstream Details saved successfully", "Success", "success");
                        this.setState({
                            edited: false,
                            saveLoading:false
                        })
                        this.props.onSaveSuccess();
                        this.props.modalCloseHandler();

                    } else if (!response.error && response.data.resultCode === 'KO') {
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
            this.setState({
                saveLoading:false
            })
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
    handleChange = (event) => {
        let value = event.target.value
        let type = event.target.id
        let errors = ''
        switch (type) {
            case "owner":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid owner name. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsOwner: value,
                    edited: true,
                    wsOwnerError: errors
                })
                break;
            case "email":

                let emailValue = value.toLowerCase();
                // errors = !RegExp(/[<>!'"[\]]/).test(value) ? '': 'Please enter valid owner name. Special characters [ < ! \' " > ] are invalid';
                var res = emailValue.substring(emailValue.length, emailValue.length - 14);
                // errors = ((res === "@accenture.com") ? "" : 'Please enter valid email Id. Email Id field should include @accenture.com');
                errors = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(emailValue) && emailValue !== '@accenture.com') || emailValue === "" ? "" : 'Please enter valid email Id. Email Id field should include @accenture.com');

                this.setState({
                    wsEmail: value,
                    edited: true,
                    wsEmailError: errors
                })
                break;
            case "ws-description":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsDescription: value,
                    edited: true,
                    wsDescriptionError: errors
                })
                break;
            case "dept":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsDepartment: value,
                    edited: true,
                    wsDepartmentError: errors
                    // wsDescriptionError: errors
                })
                break;
            case "sub-dept":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsSubDepartment: value,
                    edited: true,
                    wsSubDeptError: errors
                    // wsDescriptionError: errors
                })
                break;
            default:
                break;

        }

    }
    onUserEmailChangeHandler = (event) => {
        const { wsTeamArray } = this.state;
        let tempTeamArr = wsTeamArray;
        let value = (event.target.value).toLowerCase();
        var res = value.substring(value.length, value.length - 14);
        const err = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') || value === "" ?
            (tempTeamArr.includes(value) ? "Team member is already added" : "") : 'Please enter valid email Id. Email Id field should include @accenture.com');

        this.setState({
            wsTeamMember: event.target.value,
            TeamErr: err,
        })

    };
    addTeamMember = (email) => {
        const { wsTeamArray, wsTeamMember } = this.state;
        let teamTeamMember = wsTeamMember;
        let tempTeamArr = wsTeamArray;
        let value = (email).toLowerCase();
        var res = value.substring(value.length, value.length - 14);
        const err = tempTeamArr.includes(value) ? "Team member is already added" :
            ((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') && value !== "" ?
                '' : 'Please enter valid email Id. Email Id field should include @accenture.com';
        /*
        const err1 = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') || value === "" ?
            (tempTeamArr.includes(value) ? "Team member is already added" : "") : 'Please enter valid email Id. Email Id field should include @accenture.com');

        */
        if (err === "") {
            tempTeamArr.push(value);
            teamTeamMember = ""
        }
        this.setState({
            TeamErr: err,
            wsTeamArray: tempTeamArr,
            wsTeamMember: teamTeamMember
        })
    }
    removeTeamMember = (event) => {
        const { wsTeamArray } = this.state;
        const tempTeamArr = wsTeamArray;
        for (let i = 0; i < wsTeamArray.length; i++) {
            if (i === Number(event.target.id)) {
                tempTeamArr.splice(i, 1)
            }
        }
        this.setState({
            wsTeamArray: tempTeamArr,
        })
    }
    ModalInvHandler = (event, inv) => {
        const { isInvModalOpen } = this.state;
        this.setState({
            isInvModalOpen: !isInvModalOpen,
            invWsDetails: inv
        })
    }
    ModalInvCloseHandler = () => {
        const { isInvModalOpen } = this.state;
        this.setState({
            isInvModalOpen: !isInvModalOpen,

        })
    }
    ModalKpiHandler = (event, kpi) => {
        const { isKpiModalOpen } = this.state;
        this.setState({
            isKpiModalOpen: !isKpiModalOpen,
            kpiWsDetails: kpi
        })
    }
    ModalKpiCloseHandler = (event) => {
        const { isKpiModalOpen } = this.state;
        this.setState({
            isKpiModalOpen: !isKpiModalOpen
        })
    }

    switchIconHandler = (icon_type) => {
        const { workstreamStore } = this.props;
        let savedOwner = workstreamStore.wsGIdetails.owner;
        let savedDesc = workstreamStore.wsGIdetails.description;

        if (icon_type === 'general_info') {
            const { selectedIconTab, wsId } = this.state;
            if (selectedIconTab === 'act_and_del') {
                let storeStartDate = '', storeEndDate = '';
                workstreamStore.fetchWsGenInfo(wsId)
                    .then(response => {
                        // if (response.error) {
                        //     return {
                        //         error: true
                        //     }
                        // } else {
                            if (response) {
                                storeStartDate = response['startDate'];
                                storeEndDate = response['endDate'];
                            }
                            this.setState({
                                selectedIconTab: icon_type,
                                wsStartDate: (storeStartDate === "" ? "" : Moment(new Date(storeStartDate)).format('DD-MMM-YYYY')),
                                wsEndDate: (storeEndDate === "" ? "" : Moment(new Date(storeEndDate)).format('DD-MMM-YYYY'))
                            });
                        // }
                    });
            } else {
                this.setState({
                    selectedIconTab: icon_type
                });
            }

        } else {
            if (savedOwner !== null && savedDesc !== null && this.state.wsOwnerError === '' && this.state.wsDescriptionError === '') {
                this.setState({
                    selectedIconTab: icon_type
                })
            }
            else {
                this.showNotification("Please save Workstream Owner and Description before switching to Activities and Deliverables section", "Error", "error");
            }

        }
    }
    closeWithoutSave = () => {
        // if (edited === false) {
        //     this.props.modalCloseHandler()
        // }
        // else {
        this.openSaveWsConfirmModal('Are you sure you want to close ?');

        // }
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
            case "dateDetails":
                tempShowArr.datesDet = !(tempShowArr.datesDet)
                break;
            case "benefits":
                tempShowArr.benefitsDet = !(tempShowArr.benefitsDet)
                break;
            case "costs":
                tempShowArr.costsDet = !(tempShowArr.costsDet)
                break;
            default: break;
        }
        this.setState({
            showDelArray: tempShowArr
        })
    }


    // ----- END of Utility functions -------

    render() {
        // const { deliverableDetails, addedMilestones, addedCategories, showDelArray ,milestoneDet,newCategoryDet} = this.state;
        const { wsOwner, wsEmail, wsDescription, wsSubDepartment, wsDepartment, wsLinkedKpiBenefits, wsInvestments, wsStartDate, wsEndDate,
             showDelArray, wsTeamArray, wsTeamMember, TeamErr, wsEmailError, wsOwnerError,wsDepartmentError,wsSubDeptError, wsInfoLoading,saveLoading } = this.state;
        const { wsName } = this.props;
        //     const startCalendarContainer = ({ children }) => children ? (
        //     createPortal(React.cloneElement(children, {
        //         className: "dl-start-date-picker react-datepicker-popper"
        //     }), document.body)
        // ) : null;

        // const endCalendarContainer = ({ children }) => children ? (
        //     createPortal(React.cloneElement(children, {
        //         className: "dl-end-date-picker react-datepicker-popper"
        //     }), document.body)
        // ) : null;
        const getTooltipData = (value) => {
            if (value || value === 0) {
                let val = String(value)
                // .replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        return (
            <Modal id="DeliverableModal" visible={this.props.visible} className="deli-modal-main">
                {/* {wsInfoLoading ?
                     <div className="row justify-content-center" style={{ height: '50px' }}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                    </div>
                    : */}
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
                                {/* <div className="row col-sm-12 del-title-subrow"> */}

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
                                                <label className="deliverable-form-label">Owner *</label>

                                                <input type="text" className="form-control"
                                                    placeholder="Owner Name" maxLength="50"
                                                    value={wsOwner}
                                                    id="owner"
                                                    onChange={this.handleChange}
                                                    autoComplete='off'
                                                />
                                                <span style={{ color: '#ffffff' }}><small>{wsOwnerError}</small></span>
                                            </div>
                                            <div className="col-sm-6 form-group">
                                                <label className="deliverable-form-label">Email Id *</label>
                                                <input type="email" className="form-control"
                                                    placeholder="Owner Email Id" maxLength="50"
                                                    id="email"
                                                    value={wsEmail}
                                                    onChange={this.handleChange}
                                                    autoComplete='off'
                                                />
                                                <span style={{ color: '#ffffff' }}><small>{wsEmailError}</small></span>
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
                                                                    onChange={this.onUserEmailChangeHandler}
                                                                /*onKeyPress={(event) => event.charCode === 13 ? this.addTeamMember(event) : ""}*/
                                                                />
                                                                <span style={{ color: '#ffffff' }}><small>{TeamErr}</small></span>
                                                            </div>
                                                            <div className="col-sm-1" style={{ padding: '5px 0px 0px 25px' }}>
                                                                <img src={circPlusIcon} alt="add" data-tip="" data-for="add_team_email_tool_tip" data-type="dark" data-place="bottom"
                                                                    onClick={() => this.addTeamMember(this.state.wsTeamMember)} style={{ cursor: 'pointer' }} />
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
                                                                        id={userIndex} onClick={(e) => this.removeTeamMember(e, user)} />
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
                                                    id="ws-description" onChange={this.handleChange}
                                                />
                                                {wsDescription && wsDescription.length ?
                                                    <div className="text-area-counter">{wsDescription.length} / 250 character(s)</div>
                                                    : <div className="text-area-counter">0 / 250 character(s)</div>
                                                }

                                                <span style={{ color: '#ffffff' }}><small>{this.state.wsDescriptionError}</small></span>
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
                                                    onChange={this.handleChange}
                                                />
                                                 <span style={{ color: '#ffffff' }}><small>{wsDepartmentError}</small></span>
                                            </div>

                                            <div className="col-sm-6">
                                                <label className="deliverable-form-label">Sub Department</label>
                                                <input type="text" className="form-control"
                                                    placeholder="Sub Department Name" maxLength="50"
                                                    value={wsSubDepartment}
                                                    id="sub-dept"
                                                    onChange={this.handleChange}
                                                />
                                                <span style={{ color: '#ffffff' }}><small>{wsSubDeptError}</small></span>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showDelArray.datesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="dateDetails"
                                        onClick={this.handleShowHide}></img>

                                    <label >Dates</label>
                                </div>

                                {(showDelArray.datesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Start Date</label>

                                                        <div className="ws-date-row ws-date-row-disabled">
                                                            <DatePicker
                                                                // selected={wsStartDate}
                                                                value={wsStartDate}
                                                                placeholderText="dd/mm/yyyy"
                                                                // onChange={(date) => { this.startDateHandler(date) }}
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                // useShortMonthInDropdown
                                                                // fixedHeight
                                                                className="dl-start-date-picker form-control"
                                                                // popperContainer={startCalendarContainer}
                                                                // // required={true}
                                                                disabled
                                                            />
                                                            <img src={calIcon} alt="calender"></img>

                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                                        <label className="deliverable-form-label">End Date</label>
                                                        <div className="col-sm-12 paddingNone">
                                                            <div className="ws-date-row ws-date-row-disabled">
                                                                <DatePicker
                                                                    // selected={wsEndDate}
                                                                    value={wsEndDate}
                                                                    // minDate={wsEndDate}
                                                                    placeholderText="dd/mm/yyyy"
                                                                    // onChange={(date) => { this.endDateHandler(date) }}
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    // showMonthDropdown
                                                                    // fixedHeight
                                                                    // useShortMonthInDropdown
                                                                    // popperContainer={endCalendarContainer}
                                                                    className="dl-end-date-picker form-control"
                                                                    // required={true}
                                                                    disabled
                                                                />
                                                                <img src={calIcon} alt="calender"></img>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : ""}
                            </div>
                            <div className="del-title-row ws-benfits" >
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">

                                    <img src={(showDelArray.benefitsDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="benefits"
                                        onClick={this.handleShowHide}></img>

                                    <label >Benefits</label>
                                </div>
                                {(showDelArray.benefitsDet) ?
                                    <div className="ws-linkKpi-div-wrap">
                                        {wsLinkedKpiBenefits && wsLinkedKpiBenefits.length !== 0 ?
                                            <div className="ws-linkKpi-div">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Link KPI's</th>
                                                            {wsLinkedKpiBenefits[0].splitKpis && wsLinkedKpiBenefits[0].splitKpis.map((sKpi) => (
                                                                <th>Year {sKpi.year}</th>
                                                            ))}
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {wsLinkedKpiBenefits && wsLinkedKpiBenefits.map((kpi, kpiIndex) => (
                                                            (kpi.splitKpis.length !== 0 && kpi.wsKpiBenefit !== "" /*&& kpi.percent !== 0 */ ?
                                                                <tr>
                                                                    <td style={{ paddingLeft: "15px", textAlignLast: "left" }}
                                                                        data-tip={getTooltipData(kpi.kpiName)}
                                                                        data-for={`kpiName${kpiIndex}`}
                                                                    >

                                                                        {(kpi.kpiName.length > 10) ? `${kpi.kpiName.substr(0, 10)}...` : kpi.kpiName}
                                                                        <ReactTooltip html={true} id={`kpiName${kpiIndex}`} />
                                                                    </td>
                                                                    {kpi.kpiType === "NON_FINANCIAL" ?

                                                                        kpi.splitKpis && kpi.splitKpis.map((sKpi, sKpiIndex) => (

                                                                            <td
                                                                                style={{ width: "100px" }}>
                                                                                <label className="generalInfo-label modal-info-label"
                                                                                // data-type="dark"
                                                                                // data-tip
                                                                                // data-for={`ws-linkKpis_${kpiIndex}_${sKpiIndex}`}
                                                                                >
                                                                                    -
                                                                            </label>
                                                                            </td>
                                                                        )) :

                                                                        kpi.splitKpis && kpi.splitKpis.map((sKpi, sKpiIndex) => (
                                                                            (sKpi.benefit === "" ?
                                                                                <td style={{ padding: "8px" }}>NA</td> :
                                                                                <td
                                                                                    data-type="dark"
                                                                                    data-tip={getTooltipData(Number(sKpi.benefit) / 1000000)}
                                                                                    data-for={`kpiName${kpiIndex}_kpiValue${sKpiIndex}`}
                                                                                    style={{ width: "100px" }}>
                                                                                    <label className="generalInfo-label modal-info-label"
                                                                                    // data-type="dark"
                                                                                    // data-tip
                                                                                    // data-for={`ws-linkKpis_${kpiIndex}_${sKpiIndex}`}
                                                                                    >

                                                                                        $&nbsp;{Number(Number(sKpi.benefit) / 1000000).toFixed(2)}&nbsp;Mn
                                                                            </label>
                                                                                    <ReactTooltip html={true} id={`kpiName${kpiIndex}_kpiValue${sKpiIndex}`} />
                                                                                </td>)
                                                                        ))}
                                                                    {kpi.kpiType === "NON_FINANCIAL" ?
                                                                        <td >
                                                                            <span>
                                                                                <label className="generalInfo-label">
                                                                                    -
                                                                            </label>
                                                                            </span>
                                                                        </td>
                                                                        :
                                                                        <td >
                                                                            <span
                                                                                data-type="dark"
                                                                                data-tip={getTooltipData(Number(kpi.wsKpiBenefit) / 1000000)}
                                                                            >
                                                                                <label className="generalInfo-label"
                                                                                // data-type="dark"
                                                                                // data-tip
                                                                                // data-for={`ws-linkKpisTotal_${kpiIndex}`}
                                                                                >
                                                                                    $&nbsp;{Number(Number(kpi.wsKpiBenefit) / 1000000).toFixed(2)}&nbsp;Mn
                                                                            </label>
                                                                                <ReactTooltip />
                                                                            </span>
                                                                        </td>}
                                                                </tr>
                                                                : "")
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            :
                                            <div className="form-group row del-detail-row nodata-label">
                                                <label >  No Linked KPIs to display</label>
                                            </div>
                                        }
                                    </div>

                                    : ""}
                            </div>

                            <div className="del-title-row ws-cost" >
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">

                                    <img src={(showDelArray.costsDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="costs"
                                        onClick={this.handleShowHide}></img>

                                    <label >Costs</label>
                                </div>
                                {(showDelArray.costsDet) ?
                                    <div className="ws-linkKpi-div-wrap">
                                        {
                                            // start
                                            wsInvestments && wsInvestments.length !== 0 ?
                                                <div className="ws-linkKpi-div">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Linked Cost <br />Categories</th>
                                                                {wsInvestments[0].splitCostCategories && wsInvestments[0].splitCostCategories.map((sInv) => (
                                                                    <th>Year {sInv.year}</th>
                                                                ))}
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {wsInvestments && wsInvestments.map((inv, invIndex) => (
                                                                (inv.splitCostCategories.length !== 0 && inv.wsInvBenefit !== "" /*&& inv.percentAllocation !== 0 */ ?
                                                                    <tr>
                                                                        <td style={{ paddingLeft: "15px", textAlignLast: "left" }}
                                                                            data-tip={getTooltipData(inv.catName)}
                                                                            data-for={`InvName${invIndex}`}>
                                                                            {(inv.catName.length > 10) ? `${inv.catName.substr(0, 10)}...` : inv.catName}
                                                                            <ReactTooltip html={true} id={`InvName${invIndex}`} /></td>
                                                                        {inv.splitCostCategories && inv.splitCostCategories.map((sInv, sInvIndex) => (
                                                                            <td style={{ width: "100px" }} data-type="dark"
                                                                                data-tip={getTooltipData(Number(sInv.investment) / 1000000)}
                                                                                data-for={`InvName${invIndex}_Inv${sInvIndex}`}
                                                                            >
                                                                                <label
                                                                                    className="generalInfo-label modal-info-label">
                                                                                    $&nbsp;{Number(Number(sInv.investment) / 1000000).toFixed(2)}&nbsp;Mn
                                                                            </label>
                                                                                <ReactTooltip html={true} id={`InvName${invIndex}_Inv${sInvIndex}`} />
                                                                            </td>
                                                                        ))}
                                                                        <td>
                                                                            <span data-type="dark"
                                                                                data-tip={getTooltipData(Number(inv.wsInvBenefit) / 1000000)}
                                                                            ><label className="generalInfo-label">
                                                                                    $&nbsp;{Number(Number(inv.wsInvBenefit) / 1000000).toFixed(2)}&nbsp;Mn
                                                                            </label>

                                                                                <ReactTooltip html={true} />
                                                                            </span>

                                                                        </td>

                                                                    </tr>
                                                                    : "")
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                :
                                                <div className="form-group row del-detail-row nodata-label" >
                                                    <label>  No Cost category to display</label>
                                                </div>
                                            // end
                                        }
                                    </div>

                                    : ""}
                            </div>


                            <div className="row">
                                <div className="col-12 del-save-div paddingNone" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : 'pointer' }}>
                                    <button type="button"
                                        disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? true : false}
                                        style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer') }}
                                        onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? () => { } : () => this.saveWsDetails()}
                                        className="btn btn-primary"  >
                                        {saveLoading ? "Saving...":"Save"} </button>
                                </div>
                            </div>

                        </div>

                    }</Fragment>
                {/* } */}
                {this.state.saveWsDetModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveWsDetModalVisible}
                        modalTitle={this.state.saveWsDetModalTitle}
                        closeConfirmModal={this.closeSaveWsConfirmModal}
                    /> : ''
                }

            </Modal>
        );
    }
}

export default withRouter(WorkstreamDetailsModal);
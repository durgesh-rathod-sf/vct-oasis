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
import './WorkstreamActualModals.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

import CustomSelect from "../../components/CustomSelect/CustomSelect";
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class MilestoneDetailsModalWsActuals extends Component {
    constructor(props) {
        super(props);

        this.state = {
            milestoneDataObj: '',
            milestoneLoading: true,
            showMilArray: {
                plannedDatesDet: false,
                expectedDatesDet: false,
                actualDatesDet: false,
                statusDet: false,
            },
            disableObj: {
                eD: false,
                aD: false,
            },
            isSelectOpen: false,
            milStatus: "",
            saveMilActualsModalVisible: false,
            saveMilActualsModalTitle: '',
            milSave: true,
        }

        //this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    componentDidMount() {
        const { selectedMileObj, isAddedMilestone } = this.props;
        this.fetchMilestoneDetails(selectedMileObj.milestoneId);
    }

    fetchMilestoneDetails(milestoneId) {
        const { workstreamStore } = this.props;
        const { milestoneDataObj } = this.state;
        let temp = milestoneDataObj;
        if (this.isDefined(milestoneId)) {
            workstreamStore.fetchMilestoneDetails(milestoneId)
                .then(response => {
                    if (response && !response.error && response.data) {
                        if (response.data.resultCode === "OK") {
                            const miledetails = response.data.resultObj.milestones;
                            if (miledetails.length > 0) {
                                this.initialMilestoneDetails = JSON.parse(JSON.stringify(miledetails[0]));
                                const fetchActualDate = miledetails[0].actualDate;
                                const fetchExpDate = miledetails[0].expDate;

                                //temp.actualDate =  fetchActualDate === null || fetchActualDate === "" ? "" : Moment(new Date(miledetails[0].actualDate)).format('DD-MMM-YYYY');
                                //temp.expDate = fetchExpDate === null || fetchExpDate === "" ? "" : Moment(new Date(miledetails[0].expDate)).format('DD-MMM-YYYY');

                                this.setState({
                                    milestoneDataObj: miledetails[0],
                                    milestoneLoading: false,
                                    disableObj: {
                                        eD: (fetchActualDate === null || fetchActualDate === "") ? false : true,
                                        aD: (fetchExpDate === null || fetchExpDate === "") ? false : true,
                                    },
                                    milStatus: this.decodeStatus(miledetails[0].status),

                                });
                            }

                            // this.buildActivitiesToState(actList);
                        } else {
                            console.log('response.data.errorDescription');
                        }
                    }

                });
        }
    }

    saveMilestoneDetails = () => {
        const { milestoneDataObj, milStatus } = this.state;
        const { workstreamStore, isAddedMilestone } = this.props;

        if (this.isDefined(milStatus) && milStatus !== '') {
            let payloadObj = {
                "deliverableId": '' + milestoneDataObj.deliverableId,
                "milestones": [
                    {
                        "milestone": milestoneDataObj.milestone.trim(),
                        "milestoneDate": milestoneDataObj.milestoneDate,
                        "expDate": milestoneDataObj.expDate === "" || milestoneDataObj.expDate === null ? "" : (Moment(milestoneDataObj.expDate).format('YYYY-MM-DD')).toString(),
                        "actualDate": milestoneDataObj.actualDate === "" || milestoneDataObj.actualDate === null ? "" : (Moment(milestoneDataObj.actualDate).format('YYYY-MM-DD')).toString(),
                        "status": this.decodeStatus(milStatus)
                    }]
            };
            if (isAddedMilestone) {

            } else {
                let milarr = payloadObj.milestones[0];
                milarr['milestoneId'] = milestoneDataObj.milestoneId
            }

            this.setState({
                milSave: false,
            });
            workstreamStore.saveMilestoneDetails(payloadObj)
                .then(response => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        this.showErrorNotification("Milestone Details saved successfully", "Success", "success");
                        this.props.onSaveSuccess();
                        this.props.modalCloseHandler();
                    } else if (!response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });

        } else {
            this.showErrorNotification("Please enter all the mandatory fields with valid values", "Error", "error");
        }


    }

    /*
    modalCloseHandler (type) {
        if (type === 'close') {
            const {milestoneDataObj, milestoneLoading} = this.state;
            if ( milestoneLoading || this.isDefined(this.initialMilestoneDetails.milestoneDate) &&  this.initialMilestoneDetails.milestoneDate !== '') {
                this.props.modalCloseHandler(type);
            } else {
                this.showErrorNotification("Please save the mandatory fields before closing", "Error", "error");
            }
        } else {
            this.props.modalCloseHandler(type);
        }
    }
    */
    /*
    startDateHandler(date) {
        let {milestoneDataObj} = this.state;
        let newDate = '';
        if (this.isDefined(date) && date !== '') {
            newDate = Moment(date).format('YYYY-MM-DD');
        } else {
            newDate = '';
        }
        milestoneDataObj.milestoneDate = newDate;
        this.setState({
            milestoneDataObj : milestoneDataObj,
        });
   }
   */

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
    /*
       onChangeHandler = (event) => {
        const {milestoneDataObj} = this.state;
           let val = event.target.value;
           milestoneDataObj.milestone = val;
           this.setState({
            milestoneDataObj: milestoneDataObj,
           })
       }
       */
    // Hide /Show menus
    handleShowHide = (event) => {
        const { showMilArray } = this.state;
        let tempShowArr = showMilArray
        switch (event.target.id) {
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
            default: break;
        }
        this.setState({
            showMilArray: tempShowArr
        })
    }

    //Date change handler
    handleDateChange = (value, type) => {
        const { workstreamStore } = this.props;
        const { disableObj, actualDate, expDate, milestoneDataObj } = this.state;
        let tempDisableObj = disableObj;
        let tempMilestoneDataObj = milestoneDataObj;
        switch (type) {
            case 'expDate':
                if (value === null) {
                    tempDisableObj.aD = false;
                    tempDisableObj.eD = false;
                    tempMilestoneDataObj.actualDate = "";
                    tempMilestoneDataObj.expDate = "";
                    this.setState({
                        disableObj: tempDisableObj,
                        milestoneDataObj: tempMilestoneDataObj,
                    })
                }
                else {
                    tempDisableObj.aD = true;
                    tempDisableObj.eD = false;
                    tempMilestoneDataObj.actualDate = "";
                    tempMilestoneDataObj.expDate = value;
                    this.setState({
                        disableObj: tempDisableObj,
                        milestoneDataObj: tempMilestoneDataObj
                    })
                }

                break
            case 'actualDate':
                if (value === null) {
                    tempDisableObj.aD = false;
                    tempDisableObj.eD = false;
                    tempMilestoneDataObj.actualDate = "";
                    tempMilestoneDataObj.expDate = "";
                    this.setState({
                        disableObj: tempDisableObj,
                        milestoneDataObj: tempMilestoneDataObj,
                    })
                }
                else {
                    tempDisableObj.eD = true;
                    tempDisableObj.aD = false;
                    tempMilestoneDataObj.actualDate = value;
                    tempMilestoneDataObj.expDate = "";
                    this.setState({
                        disableObj: tempDisableObj,
                        milestoneDataObj: tempMilestoneDataObj,
                    })
                }
                break
            default:
                break;
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
            milStatus: value,
            isSelectOpen: false
        })
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
            case "Completed within due date":
                value = "CMP_WITHIN_DUE_DT"
                break;
            case "Completed after due date":
                value = "CMP_AFTER_DUE_DT"
                break;
            case "Delayed":
                value = "DELAYED"
                break;
        }
        return value;
    }
    // ---custom select functions--- //

    /*confirm modal functions*/
    closeWithoutSave = () => {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openSaveDelActualsConfirmModal(confirmMsg);
    }
    openSaveDelActualsConfirmModal = (title) => {
        this.setState({
            saveMilActualsModalVisible: true,
            saveMilActualsModalTitle: title,
        });
    }
    closeSaveDelActualsConfirmModal = (isYesClicked) => {
        this.setState({
            saveMilActualsModalVisible: false,
            saveMilActualsModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.modalCloseHandler();
        }
    }
    /*confirm modal functions*/

    // setting min and max dates of milestone based on deliverable dates
    setNewStartDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.delActualStartDate !== "" && chartObj.delActualStartDate !== null) {
            tempDate = chartObj.delActualStartDate;

        }
        else if (chartObj.delExpStartDate !== "" && chartObj.delExpStartDate !== null) {
            tempDate = chartObj.delExpStartDate;
        }
        else {
            tempDate = chartObj.delStartDate;
        }
        return tempDate;
    }
    setNewEndDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.delActualEndDate !== "" && chartObj.delActualEndDate !== null) {
            tempDate = chartObj.delActualEndDate;

        }
        else if (chartObj.delExpEndDate !== "" && chartObj.delExpEndDate !== null) {
            tempDate = chartObj.delExpEndDate;
        }
        else {
            tempDate = chartObj.delEndDate;
        }
        return tempDate;
    }

    render() {
        const { isMileModalVisible, isAddedMilestone, selectedMileObj } = this.props;
        const { milestoneDataObj, milestoneLoading, showMilArray, disableObj, isSelectOpen, milStatus, milSave } = this.state;
        let mileStartDate = null;
        let delStartDate = null;
        let delEndDate = null;
        let actualDate = null;
        let expDate = null;

        const startCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-milestn-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        if (this.isDefined(milestoneDataObj.milestoneDate) && milestoneDataObj.milestoneDate !== '') {
            mileStartDate = new Date(milestoneDataObj.milestoneDate);
        }

        if (this.isDefined(milestoneDataObj.delStartDate) && milestoneDataObj.delStartDate !== '') {
            let tempDate = this.setNewStartDate(milestoneDataObj);
            delStartDate = new Date(tempDate);
        }

        if (this.isDefined(milestoneDataObj.delEndDate) && milestoneDataObj.delEndDate !== '') {
            let tempDate = this.setNewEndDate(milestoneDataObj);
            delEndDate = new Date(tempDate);
        }

        if (this.isDefined(milestoneDataObj.expDate) && milestoneDataObj.expDate !== '') {
            expDate = new Date(milestoneDataObj.expDate);
        }

        if (this.isDefined(milestoneDataObj.actualDate) && milestoneDataObj.actualDate !== '') {
            actualDate = new Date(milestoneDataObj.actualDate);
        }

        return (
            <Modal id="ws-actuals-ws-details" visible={isMileModalVisible} className="ws-act-ws-det-modal-main">
                <Fragment>
                    <div className="modal-header">
                        <h6 className="modal-title md-block" style={{ wordBreak: 'break-word', paddingRight: '8px' }}>
                            {isAddedMilestone ?
                                'Milestone Name Not Added'
                                : selectedMileObj.milestone !== '' ?
                                    selectedMileObj.milestone : 'Milestone Name Not Added'
                            }
                        </h6>
                        <img style={{ paddingTop: '4px' }} data-tip="Close" data-type="dark" data-place="left" src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal" ></img>
                        <ReactTooltip html={true} />
                    </div>
                    {milestoneLoading ?
                        <div className="row justify-content-center" style={{ padding: "60px 0px" }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>
                        :
                        <div className="modal-body">
                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showMilArray.plannedDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="p_DateDetails"
                                        onClick={this.handleShowHide}></img>
                                    <label>Planned Date</label>
                                </div>
                                {(showMilArray.plannedDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Planned Date</label>

                                                        <div className={"ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                disabled={true}
                                                                value={mileStartDate}
                                                                selected={mileStartDate === "" || mileStartDate === null ? "" : new Date(mileStartDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                useShortMonthInDropdown
                                                                required={true}
                                                                className="dl-start-date-picker form-control"
                                                            />
                                                            <img src={calIcon} alt="calender" style={{ cursor: 'default' }}></img>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ""
                                }
                            </div>

                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showMilArray.expectedDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="e_DateDetails"
                                        onClick={this.handleShowHide}></img>
                                    <label>Expected Date</label>
                                </div>
                                {(showMilArray.expectedDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Expected Date</label>

                                                        <div className={!disableObj.eD ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                disabled={disableObj.eD}
                                                                minDate={delStartDate}
                                                                maxDate={delEndDate}
                                                                //  minDate={new Date(Moment(new Date()).add(1, "days"))}
                                                                value={expDate}
                                                                selected={expDate === "" || expDate === null ? "" : new Date(expDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                onChange={(event) => this.handleDateChange(event, 'expDate')}
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                useShortMonthInDropdown
                                                                fixedHeight
                                                                className="del-raid-start-date-picker dl-start-date-picker form-control"
                                                                popperContainer={startCalendarContainer}
                                                                required={true}
                                                            />
                                                            <img src={calIcon} alt="calender" style={{ cursor: disableObj.eD ? "default" : "pointer" }}></img>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ""
                                }
                            </div>

                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showMilArray.actualDatesDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="a_DateDetails"
                                        onClick={this.handleShowHide}></img>
                                    <label>Actual Date</label>
                                </div>
                                {(showMilArray.actualDatesDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-6" style={{ paddingLeft: "0px" }}>

                                                        <label className="deliverable-form-label">Actual Date</label>

                                                        <div className={!disableObj.aD ? "ws-date-row ws-date-row-enabled" : "ws-date-row ws-date-row-disabled"}>
                                                            <DatePicker
                                                                disabled={disableObj.aD}
                                                                minDate={delStartDate}
                                                                maxDate={delEndDate}
                                                                //  minDate={new Date(Moment(new Date()).add(1, "days"))}
                                                                value={actualDate}
                                                                selected={actualDate === "" || actualDate === null ? "" : new Date(actualDate)}
                                                                placeholderText="dd-mmm-yyyy"
                                                                onChange={(event) => this.handleDateChange(event, 'actualDate')}
                                                                dateFormat="dd-MMM-yyyy"
                                                                showMonthDropdown
                                                                useShortMonthInDropdown
                                                                showYearDropdown
                                                                fixedHeight
                                                                className="del-raid-start-date-picker dl-start-date-picker form-control"
                                                                popperContainer={startCalendarContainer}
                                                                required={true}
                                                            />
                                                            <img src={calIcon} alt="calender" style={{ cursor: disableObj.aD ? "default" : "pointer" }}></img>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ""
                                }
                            </div>

                            <div className="del-title-row ">
                                <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                    <img src={(showMilArray.statusDet) ? drillUpIcon : drillDownIcon}
                                        alt="open" className="drillDownIcon"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                        id="statusDetails"
                                        onClick={this.handleShowHide}></img>
                                    <label>Milestone Status</label>
                                </div>

                                {(showMilArray.statusDet) ?
                                    <div className="act-modal-body-div">
                                        <div className="row reg-form-control date-form-control">
                                            <div className="col-sm-12">
                                                <div className="row">

                                                    <div className="col-sm-5" style={{ padding: "0px" }}>
                                                        <label className="deliverable-form-label">Status *</label>
                                                        <div className="col-sm-12 paddingNone" >

                                                            <CustomSelect
                                                                isCustomSelectOpen={isSelectOpen}
                                                                customStatus={milStatus}
                                                                customCompletionPerc={100}
                                                                customMilestoneStatus={true}
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

                            <div className="row">
                                <div className="col-12 del-save-div paddingNone" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}>
                                    <button type="button"
                                        disabled={SessionStorage.read("accessType") === "Read" || !(milSave) ? true : false}
                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : !(milSave) ? 'default' : 'pointer', border: 'none' }}
                                        onClick={() => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveMilestoneDetails()}

                                        className="btn btn-primary"  >
                                        {milSave ? 'Save' : 'Saving...'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    }
                </Fragment>
                {this.state.saveMilActualsModalVisible ?

                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveMilActualsModalVisible}
                        modalTitle={this.state.saveMilActualsModalTitle}
                        closeConfirmModal={this.closeSaveDelActualsConfirmModal}
                    /> : ''
                }

            </Modal>
        );
    }
}

export default withRouter(MilestoneDetailsModalWsActuals);
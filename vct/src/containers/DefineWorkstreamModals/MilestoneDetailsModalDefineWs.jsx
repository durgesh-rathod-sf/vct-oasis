import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap4-modal';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import 'moment-timezone';
import { createPortal } from 'react-dom';
import ReactTooltip from 'react-tooltip';
import './DefineWsModals.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class MilestoneDetailsModalDefineWs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            milestoneDataObj: '',
            milestoneLoading: true,
            saveMileStoneModalVisible: false,
            saveMilestoneModalTitle: '',
            saveLoading:false
        }

        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    componentDidMount() {
        const { selectedMileObj, isAddedMilestone } = this.props;
        if (!isAddedMilestone) {
            this.fetchMilestoneDetails(selectedMileObj.milestoneId);
        } else {
            let miledetails = {}
            this.initialMilestoneDetails = JSON.parse(JSON.stringify(selectedMileObj));
            this.setState({
                milestoneDataObj: selectedMileObj,
                milestoneLoading: false
            });
        }

    }



    fetchMilestoneDetails(milestoneId) {
        const { workstreamStore } = this.props;
        if (this.isDefined(milestoneId)) {
            workstreamStore.fetchMilestoneDetails(milestoneId)
                .then(response => {
                    if (response && !response.error && response.data) {
                        if (response.data.resultCode === "OK") {
                            const miledetails = response.data.resultObj.milestones;
                            if (miledetails.length > 0) {
                                this.initialMilestoneDetails = JSON.parse(JSON.stringify(miledetails[0]));
                                this.setState({
                                    milestoneDataObj: miledetails[0],
                                    milestoneLoading: false
                                });
                            }

                            // this.buildActivitiesToState(actList);
                        }
                    }

                });
        }
    }

    saveMilestoneDetails = () => {
        const { milestoneDataObj } = this.state;
        const { workstreamStore, isAddedMilestone } = this.props;
        this.setState({
            saveLoading:true
        })

        if (this.isDefined(milestoneDataObj.milestoneDate) && milestoneDataObj.milestoneDate !== '') {
           
            let payloadObj = {
                "deliverableId": '' + milestoneDataObj.deliverableId,
                "milestones": [
                    {
                        "milestone": milestoneDataObj.milestone.trim(),
                        "milestoneDate": milestoneDataObj.milestoneDate
                    }]
            };
            if (isAddedMilestone) {

            } else {
                let milarr = payloadObj.milestones[0];
                milarr['milestoneId'] = milestoneDataObj.milestoneId
            }
            workstreamStore.saveMilestoneDetails(payloadObj)
                .then(response => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        this.showErrorNotification("Milestone Details saved successfully", "Success", "success");
                       this.setState({
                        saveLoading:false
                       })
                        this.props.onSaveSuccess();
                        this.modalCloseHandler('save');
                    } else if (!response.error && response.data.resultCode === 'KO') {
                        this.setState({
                            saveLoading:false
                           })
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.setState({
                            saveLoading:false
                           })
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    }
                });

        } else {
            this.setState({
                saveLoading:false
               })
            this.showErrorNotification("Please enter all the mandatory fields with valid values", "Error", "error");
        }


    }

    modalCloseHandler(type) {
        if (type === 'close') {
            const { milestoneDataObj, milestoneLoading } = this.state;
            if ((milestoneLoading || this.isDefined(this.initialMilestoneDetails.milestoneDate)) && this.initialMilestoneDetails.milestoneDate !== '') {
                this.props.modalCloseHandler(type);
            } else {
                this.showErrorNotification("Please save the mandatory fields before closing", "Error", "error");
            }
        } else {
            this.props.modalCloseHandler(type);
        }
    }

    startDateHandler(date) {
        let { milestoneDataObj } = this.state;
        let newDate = '';
        if (this.isDefined(date) && date !== '') {
            newDate = Moment(date).format('YYYY-MM-DD');
        } else {
            newDate = '';
        }
        milestoneDataObj.milestoneDate = newDate;
        this.setState({
            milestoneDataObj: milestoneDataObj,
        });
    }

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

    onChangeHandler = (event) => {
        const { milestoneDataObj } = this.state;
        let val = event.target.value;
        milestoneDataObj.milestone = val;
        this.setState({
            milestoneDataObj: milestoneDataObj,
        })
    }
    closeWithoutSave = () => {
        this.openSaveMilestoneConfirmModal('Are you sure you want to close ?');
    }
    openSaveMilestoneConfirmModal = (title) => {
        this.setState({
            saveMileStoneModalVisible: true,
            saveMilestoneModalTitle: title,
        });
    }

    closeSaveMilestoneConfirmModal = (isYesClicked) => {
        this.setState({
            saveMileStoneModalVisible: false,
            saveMilestoneModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.props.modalCloseHandler();
        }
    }
    render() {
        const { isMileModalVisible, isAddedMilestone, selectedMileObj } = this.props;
        const { milestoneDataObj, milestoneLoading ,saveLoading} = this.state;
        let mileStartDate = null;
        let delStartDate = null;
        let delEndDate = null;

        const startCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-milestn-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        if (this.isDefined(milestoneDataObj.milestoneDate) && milestoneDataObj.milestoneDate !== '') {
            mileStartDate = new Date(milestoneDataObj.milestoneDate);
        }

        if (this.isDefined(milestoneDataObj.delStartDate) && milestoneDataObj.delStartDate !== '') {
            delStartDate = new Date(milestoneDataObj.delStartDate);
        }

        if (this.isDefined(milestoneDataObj.delEndDate) && milestoneDataObj.delEndDate !== '') {
            delEndDate = new Date(milestoneDataObj.delEndDate);
        }

        return (
            <Modal id="MilestoneModal" visible={isMileModalVisible} className="milestone-modal-main">
                <div className="modal-header">
                    <h6 className="modal-title md-block" style={{ wordBreak: 'break-word', paddingRight: '8px' }}>
                        {isAddedMilestone ?
                            'Milestone Name Not Added'
                            : selectedMileObj.milestone !== '' ?
                                selectedMileObj.milestone : 'Milestone Name Not Added'
                        }
                    </h6>
                    <img style={{ paddingTop: '4px' }} data-tip="Close" data-type="dark" data-place="left" src={closeIcon} alt="close" onClick={() => { this.closeWithoutSave() }} data-dismiss="modal" ></img>
                    <ReactTooltip html={true} />
                </div>
                {milestoneLoading ?
                    <div className="row justify-content-center" style={{ padding: "60px 0px" }}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                    </div>
                    :
                    <div className="modal-body">
                        <div className="modal-body-content">
                            <div className="col-12 paddingNone modal-body-div">
                                <label className="milestone-form-label">Deliverable</label>
                                <input type="text" className="form-control" disabled
                                    placeholder="Deliverable Name" maxLength="50"
                                    defaultValue={milestoneDataObj.deliverableName} id="del_Name"
                                />
                            </div>

                            <div className="col-12 paddingNone modal-body-div">
                                <label className="milestone-form-label">Milestone</label>
                                <input type="text" className="form-control" id="milestoneName"
                                    placeholder="Milestone Name" maxLength="50"
                                    value={milestoneDataObj.milestone || ''}
                                    onChange={(e) => { this.onChangeHandler(e) }}
                                />
                            </div>

                            <div className="col-6 paddingNone modal-body-div">
                                <label className="milestone-form-label">Milestone Date *</label>
                                <div className="milestone-date-row paddingNone">
                                    <DatePicker
                                        selected={mileStartDate}
                                        value={mileStartDate}
                                        minDate={delStartDate}
                                        maxDate={delEndDate}
                                        placeholderText="dd-MMM-yyyy"
                                        onChange={(date) => { this.startDateHandler(date) }}
                                        dateFormat="dd-MMM-yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        useShortMonthInDropdown
                                        fixedHeight
                                        className="dl-milestn-date-picker form-control"
                                        popperContainer={startCalendarContainer}
                                        required={true}
                                    />
                                    <img src={calIcon} alt="calender"></img>
                                </div>
                            </div>


                            <div className="col-12 del-save-div paddingNone" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer') }}>
                                <button type="button" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer'), width: "25%" }}
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? true : false}
                                    className="btn btn-primary" onClick={() => (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? 'return false;' : this.saveMilestoneDetails()} >
                                   { saveLoading?"Saving...":"Save"} </button>
                            </div>
                        </div>

                    </div>
                }
                {this.state.saveMileStoneModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveMileStoneModalVisible}
                        modalTitle={this.state.saveMilestoneModalTitle}
                        closeConfirmModal={this.closeSaveMilestoneConfirmModal}
                    /> : ''
                }
            </Modal>
        );
    }
}

export default withRouter(MilestoneDetailsModalDefineWs);
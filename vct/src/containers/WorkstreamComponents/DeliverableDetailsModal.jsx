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

import './DeliverableDetailsModal.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-enabled.svg';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class DeliverableDetailsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deliverableDetails: {},
            addedMilestones: [],
            addedCategories: [],
            isFormDirty: false,
            ownerNameError: '',
            descriptionError: '',
            saveDelModalVisible: false,
            saveDelModalTitle: ''
        }
        this.initialCategories = [];

        this.isDefined = this.isDefined.bind(this);
        this.fetchWSDeliverableDetails = this.fetchWSDeliverableDetails.bind(this);
    }

    componentDidMount() {
        const { deliverableId } = this.props;
        this.fetchWSDeliverableDetails(deliverableId);
    }

    fetchWSDeliverableDetails(deliverableId) {
        const { workstreamStore } = this.props;
        if (this.isDefined(deliverableId)) {
            workstreamStore.fetchDeliverableDetails(deliverableId)
                .then(response => {
                    if (response && response.data) {
                        if (!response.error && response.data.resultCode === "OK") {
                            const delDetails = response.data.resultObj;
                            this.initialCategories = JSON.parse(JSON.stringify(delDetails.categories));
                            this.setState({
                                deliverableDetails: delDetails
                            })
                            // this.buildActivitiesToState(actList);
                        } else {
                            console.log('response.data.errorDescription');
                        }
                    }

                });
        }
    }

    // owner name handle
    delOwnerHandler = (event) => {
        const { deliverableDetails } = this.state;
        deliverableDetails.owner = event.target.value;
        const errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid owner name. Special characters [ < ! \' " > ] are invalid';
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true,
            ownerNameError: errors
        });
    }

    // description handler
    delDescriptionHandler = (event) => {
        const { deliverableDetails } = this.state;
        deliverableDetails.description = event.target.value;
        const errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true,
            descriptionError: errors
        });
    }

    // frequency handler
    changeFrequency = (event) => {
        const { deliverableDetails } = this.state;
        deliverableDetails.frequency = event.target.value;
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true
        });
    }

    // Start Date function
    startDateHandler = (date) => {
        let { deliverableDetails } = this.state;
        if (this.isDefined(date) && date !== '') {
            let endDateObj = new Date(deliverableDetails.endDate);
            if (endDateObj < date) {
                deliverableDetails.endDate = null;
            }
            deliverableDetails.startDate = Moment(date).format('YYYY-MM-DD');

        } else {
            deliverableDetails.startDate = null;
        }
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true
        });
    }

    // End Date function
    endDateHandler = (date) => {
        let { deliverableDetails } = this.state;
        if (this.isDefined(date) && date !== '') {
            deliverableDetails.endDate = Moment(date).format('YYYY-MM-DD');
        } else {
            deliverableDetails.endDate = null;
        }
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true
        });
    }

    // START of saved milestones functions
    milestoneNameHandler = (event, mIndex) => {
        let { deliverableDetails } = this.state;
        let MilestnsArr = [...deliverableDetails.milestones];
        MilestnsArr[mIndex].milestone = event.target.value;
        deliverableDetails.milestones = MilestnsArr;
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true
        });
    }

    milestoneDateHandler = (date, mIndex) => {
        let { deliverableDetails } = this.state;
        let MilestnsArr = [...deliverableDetails.milestones];
        if (this.isDefined(date) && date !== '') {
            MilestnsArr[mIndex].milestoneDate = Moment(date).format('YYYY-MM-DD');
        } else {
            MilestnsArr[mIndex].milestoneDate = '';
        }
        deliverableDetails.milestones = MilestnsArr;
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true
        });
    }

    deleteMilestone = (event, mIndex) => {
        let { deliverableDetails } = this.state;
        const { workstreamStore } = this.props;
        let deliDetObj = { ...deliverableDetails };
        let MilestnsArr = deliDetObj.milestones;
        const MileStoneId = MilestnsArr[mIndex].milestoneId;
        if (this.isDefined(MileStoneId)) {
            workstreamStore.deleteMilestone(MileStoneId)
                .then((res) => {
                    if (!res.error && res.data.resultCode === 'OK') {
                        deliDetObj.milestones.splice(mIndex, 1);
                        this.setState({
                            deliverableDetails: deliDetObj,
                            isFormDirty: true
                        })
                        // this.fetchWSDeliverableDetails(deliverableId); //this call will erase user entered data fields like owner,dates..                    
                        this.showErrorNotification("Milestone Deleted Successfully", "Success", "success");
                    } else if (!res.error && res.data.resultCode === 'KO') {
                        this.showErrorNotification(res.data.errorDescription, "Error", "error");
                        console.log('error in Delete: ' + res.data.errorDescription);
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });

        }
    }
    // END of saved milestones functions

    // START of Added milestones functions
    addAMilestone = (event) => {
        const { addedMilestones } = this.state;
        const addedMilArr = [...addedMilestones];
        addedMilArr.push({
            "milestone": '',
            "milestoneDate": ''
        });
        this.setState({
            addedMilestones: addedMilArr,
            isFormDirty: true
        });
    }
    addedMilestoneNameHandler = (event, maIndex) => {
        const { addedMilestones } = this.state;
        const addedMilArr = [...addedMilestones];
        addedMilArr[maIndex].milestone = event.target.value;
        this.setState({
            addedMilestones: addedMilArr
        });
    }

    addedMilestoneDateHandler = (date, maIndex) => {
        const { addedMilestones } = this.state;
        const addedMilArr = [...addedMilestones];
        if (this.isDefined(date) && date !== '') {
            addedMilArr[maIndex].milestoneDate = Moment(date).format('YYYY-MM-DD');
        } else {
            addedMilArr[maIndex].milestoneDate = '';
        }
        this.setState({
            addedMilestones: addedMilArr
        });
    }

    deleteAddedMilestone = (event, maIndex) => {
        const { addedMilestones } = this.state;
        const addedMilArr = [...addedMilestones];
        addedMilArr.splice(maIndex, 1);
        this.setState({
            addedMilestones: addedMilArr
        });
    }
    // END of Added milestones functions

    // START of saved Categories functions
    categoryNameHandler = (event, catIndex) => {
        const { deliverableDetails } = this.state;
        let delDetObj = { ...deliverableDetails };
        let CategsArr = delDetObj.categories;
        CategsArr[catIndex].name = event.target.value;
        this.setState({
            deliverableDetails: delDetObj,
            isFormDirty: true
        });
    }

    categoryInfoHandler = (event, catIndex) => {
        const { deliverableDetails } = this.state;
        let delDetObj = { ...deliverableDetails };
        let CategsArr = delDetObj.categories;
        CategsArr[catIndex].info = event.target.value;
        this.setState({
            deliverableDetails: delDetObj,
            isFormDirty: true
        });
    }

    categoryGlobalHandler = (event, catIndex) => {
        const { deliverableDetails } = this.state;
        let delDetObj = { ...deliverableDetails };
        let CategsArr = delDetObj.categories;
        CategsArr[catIndex].isGlobal = event.target.checked ? 'Y' : 'N';
        this.setState({
            deliverableDetails: delDetObj,
            isFormDirty: true
        });
    }

    deleteCategory = (event, catIndex) => {
        const { deliverableDetails } = this.state;
        const { workstreamStore } = this.props;
        let delDetObj = { ...deliverableDetails };
        let CategsArr = delDetObj.categories;
        const categoryId = CategsArr[catIndex].categoryId;

        const payloadObj = {
            'id': categoryId,
            'globalFlag': CategsArr[catIndex].isGlobal
        }
        if (this.isDefined(categoryId)) {
            workstreamStore.deleteCategory(payloadObj)
                .then((res) => {
                    if (!res.error && res.data.resultCode === 'OK') {
                        delDetObj.categories.splice(catIndex, 1);
                        this.initialCategories.splice(catIndex, 1);
                        this.setState({
                            deliverableDetails: delDetObj,
                            isFormDirty: true
                        });
                        // this.fetchWSDeliverableDetails(deliverableId);    // this will erase the user enetered owner,description,date fields                
                        this.showErrorNotification("Category Deleted successfully", "Success", "success");
                    } else if (!res.error && res.data.resultCode === 'KO') {
                        this.showErrorNotification(res.data.errorDescription, "Error", "error");
                        console.log('error in Delete: ' + res.data.errorDescription);
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
        }
    }
    // END of saved Categories functions

    // START of Added Categories functions
    addACategory = (event) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr.push({
            "name": '',
            "info": '',
            "isGlobal": 'N'
        })
        this.setState({
            addedCategories: CategsArr,
            isFormDirty: true
        });
    }

    addedCategoryNameHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].name = event.target.value;
        this.setState({
            addedCategories: CategsArr
        });
    }

    addedCategoryInfoHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].info = event.target.value;
        this.setState({
            addedCategories: CategsArr
        });
    }

    addedCategoryGlobalHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].isGlobal = event.target.checked ? 'Y' : 'N';
        this.setState({
            addedCategories: CategsArr
        });
    }

    deleteAddedCategory = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr.splice(catIndex, 1);
        this.setState({
            addedCategories: CategsArr
        });
    }
    // END of Added Categories functions

    // Save deliverable functions
    getCategoriesPayload = () => {
        let builtCategArr = [];
        let savedCategArr = [];
        let addedCatStateObj = [];
        const { deliverableDetails, addedCategories } = this.state;
        const deliverDetails = { ...deliverableDetails };
        const categArray = [...deliverDetails.categories];
        addedCatStateObj = [...addedCategories];
        categArray.map(cat => {
            savedCategArr.push({
                'categoryId': cat.categoryId,
                'name': cat.name,
                'info': cat.info,
                'isGlobal': cat.isGlobal
            })
        });
        addedCatStateObj.map(addC => {
            if (addC.name) {
                addC.name = addC.name.trim();
            }
        });
        builtCategArr = [...savedCategArr, ...addedCatStateObj]
        return builtCategArr;
    }

    getMilestonePayload = () => {
        let builtMilesArr = [];
        let savedMilesArr = [];
        let addedMilesStateArray = [];
        const { deliverableDetails, addedMilestones } = this.state;
        const deliverDetails = { ...deliverableDetails };
        const mlstnArray = [...deliverDetails.milestones];
        addedMilesStateArray = [...addedMilestones];
        mlstnArray.map(milestn => {
            savedMilesArr.push({
                'milestoneId': milestn.milestoneId,
                'milestone': milestn.milestone,
                'milestoneDate': milestn.milestoneDate
            });
        });
        addedMilesStateArray.map(addMile => {
            if (addMile.milestone) {
                addMile.milestone = addMile.milestone.trim();
            }
        })
        builtMilesArr = [...savedMilesArr, ...addedMilesStateArray]
        return builtMilesArr;
    }

    checkForMandatoryFields = () => {
        const { deliverableDetails } = this.state;
        if ((this.isDefined(deliverableDetails.owner) && deliverableDetails.owner !== '') &&
            this.state.descriptionError === '' && this.state.ownerNameError === '' &&
            (this.isDefined(deliverableDetails.startDate) && deliverableDetails.startDate !== '') &&
            (this.isDefined(deliverableDetails.endDate) && deliverableDetails.endDate !== '') &&
            (this.isDefined(deliverableDetails.frequency) && deliverableDetails.frequency !== '') && (deliverableDetails.frequency !== 'null')) {
            return true;
        } else {
            return false;
        }
    }

    isEmptyCategories = (categoriesPayload) => {
        let isCatNameEmpty = false;
        const re = RegExp(/[<>!'"[\]]/);
        categoriesPayload.map(cat => {
            if (cat.name === '') {
                isCatNameEmpty = true;
                return isCatNameEmpty
            }
            else if (re.test(cat.name) || re.test(cat.info)) {
                isCatNameEmpty = true;
                return isCatNameEmpty
            }
        });
        return isCatNameEmpty;
    }

    isEmptyMilestones = (milestonesPayload) => {
        let isMilestoneEmpty = false;
        const re = RegExp(/[<>!'"[\]]/);
        milestonesPayload.map(mst => {
            if (mst.milestone === '' || mst.milestoneDate === '' || mst.milestoneDate === null) {
                isMilestoneEmpty = true;
                return isMilestoneEmpty
            }
            else if (re.test(mst.milestone)) {
                isMilestoneEmpty = true;
                return isMilestoneEmpty
            }
        });
        return isMilestoneEmpty;
    }

    saveDeliverable = () => {
        const { deliverableDetails, isFormDirty } = this.state;
        const { workstreamStore, deliverableId } = this.props;
        if (this.checkForMandatoryFields()) {
            const categoriesPayload = this.getCategoriesPayload();
            const milestonesPayload = this.getMilestonePayload();

            if (categoriesPayload.length > 0 && this.isEmptyCategories(categoriesPayload)) {
                this.showErrorNotification("Please enter missing category fields with valid values. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            } else if (milestonesPayload.length > 0 && this.isEmptyMilestones(milestonesPayload)) {
                this.showErrorNotification("Please enter missing Milestone details with valid values. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            }
            else {
                const payloadObj = {
                    "mapId": SessionStorage.read('mapId'),
                    "activityId": '' + deliverableDetails.activityId,
                    "deliverableId": '' + deliverableDetails.deliverableId,
                    "name": deliverableDetails.name,
                    'owner': deliverableDetails.owner,
                    'description': deliverableDetails.description,
                    'frequency': deliverableDetails.frequency,
                    'startDate': deliverableDetails.startDate,
                    'endDate': deliverableDetails.endDate,
                    'milestones': milestonesPayload,
                    'categories': categoriesPayload,
                    "label": 'N'
                }
                if (this.isDefined(deliverableId)) {
                    workstreamStore.saveDeliverableDetails(payloadObj)
                        .then(response => {
                            if (!response.error && response.data.resultCode === 'OK') {
                                this.showErrorNotification("Deliverable Details saved successfully", "Success", "success");
                                this.props.modalCloseHandler(isFormDirty);
                            } else if (!response.error && response.data.resultCode === 'KO') {
                                console.log(response.data.errorDescription);
                                this.showErrorNotification(response.data.errorDescription, "Error", "error");
                            } else {
                                this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                                console.log('error: something went wrong in SAVE');
                            }
                        });
                }
            }
        } else {
            this.showErrorNotification("Please enter all the mandatory fields with valid values", "Error", "error");
            console.log('error: mandatory fields error');
        }
    }

    openSaveDelConfirmModal = (title) => {
        this.setState({
            saveDelModalVisible: true,
            saveDelModalTitle: title,
        });
    }

    closeSaveDelConfirmModal = (isYesClicked) => {
        this.setState({
            saveDelModalVisible: false,
            saveDelModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.saveDeliverable();
        } else {
            const { isFormDirty } = this.state;
            this.props.modalCloseHandler(isFormDirty);

        }
    }

    closeWithoutSave = () => {
        const { isFormDirty } = this.state;
        if (isFormDirty) {
            const confirmMsg = 'Do you want to save the data before closing ?';
            this.openSaveDelConfirmModal(confirmMsg);

        } else {
            this.props.modalCloseHandler(isFormDirty);
        }
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

    showCatCheckboxError = (e) => {
        this.showErrorNotification("This category is available in all of the deliverables", "Error", "error");
    }


    // ----- END of Utility functions -------

    render() {
        const { isDelModalVisible } = this.props;
        const { deliverableDetails, addedMilestones, addedCategories } = this.state;

        let delStartDate = null;
        let delEndDate = null;

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

        const milestoneCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-milstn-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        const addMilestoneCalendarContainer = ({ children }) => children ? (
            createPortal(React.cloneElement(children, {
                className: "dl-add-milstn-date-picker react-datepicker-popper"
            }), document.body)
        ) : null;

        if (this.isDefined(deliverableDetails.startDate) && deliverableDetails.startDate !== '') {
            delStartDate = new Date(deliverableDetails.startDate);
        }

        if (this.isDefined(deliverableDetails.endDate) && deliverableDetails.endDate !== '') {
            delEndDate = new Date(deliverableDetails.endDate);
        }

        return (
            <Modal id="DeliverableModal" visible={isDelModalVisible} className="deli-modal-main">
                <div className="modal-header">
                    <h6 className="modal-title md-block">{this.props.deliverableName}</h6>
                    <img data-tip="Close" data-type="dark" src={closeIcon} alt="close" onClick={(e) => { this.closeWithoutSave() }} data-dismiss="modal" ></img>
                    <ReactTooltip html={true} />
                </div>
                <div className="modal-body">
                    <div className="form-group row del-detail-row reg-form-control">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="deliverable-form-label">Owner*</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >
                            <input type="text" className="form-control"
                                placeholder="Owner" maxLength="50"
                                value={deliverableDetails.owner || ''}
                                onChange={(e) => { this.delOwnerHandler(e) }}
                            />
                            <span style={{ color: '#ffffff' }}><small>{this.state.ownerNameError}</small></span>
                        </div>
                    </div>

                    <div className="form-group row del-detail-row reg-form-control">
                        <div className="col-sm-6 dept-sm">
                            <div className="col-sm-12 col-md-12 col-xs-12">

                                <label className="deliverable-form-label">Department</label>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12" >
                                <input type="text" className="form-control" readOnly
                                    placeholder="Department" maxLength="50"
                                    defaultValue={deliverableDetails.department}
                                />
                            </div>
                        </div>
                        <div className="col-sm-6 dept-sm">
                            <div className="col-sm-12 col-md-12 col-xs-12">

                                <label className="deliverable-form-label">Sub Department</label>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12" >
                                <input type="text" className="form-control" readOnly
                                    placeholder="Sub Department" maxLength="50"
                                    defaultValue={deliverableDetails.subDepartment}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group row del-detail-row">
                        <div className="col-sm-4 dept-sm date-form-control">
                            <div className="col-sm-12 col-md-12 col-xs-12">

                                <label className="deliverable-form-label">Start Date*</label>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12" >
                                <div className="ws-date-row">
                                    <DatePicker
                                        selected={delStartDate}
                                        value={delStartDate}
                                        placeholderText="dd-mmm-yyyy"
                                        onChange={(date) => { this.startDateHandler(date) }}
                                        dateFormat="dd-MMM-yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        useShortMonthInDropdown
                                        fixedHeight
                                        className="dl-start-date-picker form-control"
                                        popperContainer={startCalendarContainer}
                                        required={true}
                                    />
                                    <img src={calIcon} alt="calender"></img>
                                </div>

                            </div>
                        </div>
                        <div className="col-sm-4 dept-sm date-form-control">
                            <div className="col-sm-12 col-md-12 col-xs-12">

                                <label className="deliverable-form-label">End Date*</label>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12">
                                <div className="ws-date-row">
                                    <DatePicker
                                        selected={delEndDate}
                                        value={delEndDate}
                                        minDate={delStartDate}
                                        placeholderText="dd-mmm-yyyy"
                                        onChange={(date) => { this.endDateHandler(date) }}
                                        dateFormat="dd-MMM-yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        fixedHeight
                                        useShortMonthInDropdown
                                        popperContainer={endCalendarContainer}
                                        className="dl-end-date-picker form-control"
                                        required={true}
                                    />
                                    <img src={calIcon} alt="calender"></img>
                                </div>

                            </div>
                        </div>
                        <div className="col-sm-4 dept-sm reg-form-control">
                            <div className="col-sm-12 col-md-12 col-xs-12">

                                <label className="deliverable-form-label">Tracking Frequency*</label>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12 tra-fre-control" >
                                <select
                                    value={deliverableDetails.frequency || ''}
                                    id="del-frequency"
                                    readOnly={false}
                                    name="frequency_details"
                                    className="form-control"
                                    onChange={(event) => this.changeFrequency(event)}
                                >
                                    <option value='null'>Select</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                    <option value="Monthly">Monthly</option>

                                </select>
                            </div>
                        </div>

                    </div>
                    <div className="form-group row del-detail-row reg-form-control">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="deliverable-form-label">Description</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >
                            <textarea rows="4" type="text" className="form-control"
                                value={deliverableDetails.description || ''}
                                maxLength="250"
                                onChange={(e) => { this.delDescriptionHandler(e) }}
                            />
                            {deliverableDetails && deliverableDetails.description ?
                                <div className="text-area-counter">{deliverableDetails.description.length} / 250 character(s)</div>
                                : <div className="text-area-counter"> 0 / 250 character(s)</div>

                            }

                            <span style={{ color: '#ffffff' }}><small>{this.state.descriptionError}</small></span>
                        </div>
                    </div>

                    <div className="form-group add-more-mile row del-detail-row">
                        <div className="col-12">
                            <label onClick={(e) => { this.addAMilestone(e) }}><img src={circPlusIcon} alt="add"></img>&nbsp; Add more milestones</label>
                        </div>
                    </div>
                    {/* Added Milestone rows */}
                    {addedMilestones && addedMilestones.map((mst, maIndex) => (
                        <div key={maIndex} className="form-group row del-detail-row miles-form-group">
                            <div className="col-sm-6 dept-sm">
                                <div className="col-sm-12 col-md-12 col-xs-12">

                                    <label className="deliverable-form-label">Milestone*</label>
                                </div>
                                <div className="col-sm-12 col-md-12 col-xs-12 reg-form-control">
                                    <input type="text" className="form-control"
                                        placeholder="Milestone" maxLength="50"
                                        value={mst.milestone}
                                        onChange={(e) => { this.addedMilestoneNameHandler(e, maIndex) }}
                                    ></input>

                                </div>
                            </div>
                            <div className="col-sm-6 dept-sm date-form-control">
                                <div className="col-sm-12">
                                    <label className="deliverable-form-label">End Date*</label>
                                </div>
                                <div className="col-sm-12 cat-del-binder">
                                    <div className="ws-date-row">
                                        <DatePicker
                                            selected={mst.milestoneDate !== '' ? new Date(mst.milestoneDate) : null}
                                            value={mst.milestoneDate !== '' ? new Date(mst.milestoneDate) : null}
                                            placeholderText="dd-mmm-yyyy"
                                            onChange={(date) => { this.addedMilestoneDateHandler(date, maIndex) }}
                                            dateFormat="dd-MMM-yyyy"
                                            showMonthDropdown
                                            showYearDropdown
                                            useShortMonthInDropdown
                                            popperContainer={addMilestoneCalendarContainer}
                                            className="dl-add-milstn-date-picker form-control"
                                            required={true}
                                        />
                                        <img src={calIcon} alt="calender"></img>
                                    </div>
                                    <div className="delete-icon">
                                        <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete" onClick={(e) => { this.deleteAddedMilestone(e, maIndex) }}></img>
                                        <ReactTooltip html={true} />
                                    </div>
                                </div>

                            </div>


                        </div>
                    ))
                    }

                    {/* Milestone rows */}
                    {deliverableDetails.milestones && deliverableDetails.milestones.map((mst, mIndex) => (
                        <div key={mIndex} className="form-group row del-detail-row miles-form-group">
                            <div className="col-sm-6 dept-sm">
                                <div className="col-sm-12 col-md-12 col-xs-12">

                                    <label className="deliverable-form-label">Milestone*</label>
                                </div>
                                <div className="col-sm-12 col-md-12 col-xs-12 reg-form-control">

                                    <input type="text" className="form-control"
                                        placeholder="Milestone" maxLength="50"
                                        value={mst.milestone}
                                        onChange={(e) => { this.milestoneNameHandler(e, mIndex) }}
                                    ></input>
                                </div>
                            </div>
                            <div className="col-sm-6 dept-sm">
                                <div className="col-sm-12">
                                    <label className="deliverable-form-label">End Date*</label>
                                </div>
                                <div className="col-sm-12 cat-del-binder date-form-control">

                                    <div className="ws-date-row">
                                        <DatePicker
                                            selected={mst.milestoneDate !== '' ? new Date(mst.milestoneDate) : null}
                                            value={mst.milestoneDate !== '' ? new Date(mst.milestoneDate) : null}
                                            placeholderText="dd-mmm-yyyy"
                                            onChange={(date) => { this.milestoneDateHandler(date, mIndex) }}
                                            dateFormat="dd-MMM-yyyy"
                                            showMonthDropdown
                                            showYearDropdown
                                            useShortMonthInDropdown
                                            popperContainer={milestoneCalendarContainer}
                                            className="dl-milstn-date-picker form-control"
                                            required={true}
                                        />
                                        <img src={calIcon} alt="calender"></img>
                                    </div>

                                    <div className="delete-icon">
                                        <img data-tip="Delete" data-type="dark" src={trashIcon} alt='delete'
                                            style={{
                                                opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                                cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                            }}
                                            onClick={SessionStorage.read("accessType") === "Read" ? () => { } : (e) => { this.deleteMilestone(e, mIndex) }}></img>
                                        <ReactTooltip html={true} />
                                    </div>
                                </div>

                            </div>


                        </div>
                    ))
                    }


                    <div className="form-group add-more-info row del-detail-row">
                        <div className="col-12">
                            <label onClick={(e) => { this.addACategory(e) }}><img src={circPlusIcon} alt="add"></img>&nbsp; Add more information</label>
                        </div>
                    </div>

                    {/* Addded categories rows */}
                    {addedCategories && addedCategories.map((cat, catIndex) => (
                        <div key={catIndex} className="form-group row del-detail-row reg-form-control">
                            <div className="col-sm-6 col-md-6 col-xs-6" style={{ display: "inline-flex" }}>

                                <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                    value={cat.name} maxLength="50"
                                    onChange={(e) => { this.addedCategoryNameHandler(e, catIndex) }}
                                />

                            </div>
                            <div className="col-sm-6 col-md-6 col-xs-6 cat-del-binder" >
                                <input type="text" name="categoryInfo" placeholder="Add Information" className="form-control"
                                    value={cat.info} maxLength="50"
                                    onChange={(e) => { this.addedCategoryInfoHandler(e, catIndex) }}
                                />
                                <div className="delete-icon">
                                    <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete" disabled={cat.categoryId !== null ? false : true}
                                        onClick={(e) => { this.deleteAddedCategory(e, catIndex) }}
                                    ></img>
                                    <ReactTooltip html={true} />
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row" style={{ display: "inline-flex" }} >
                                <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                    onChange={(e) => { this.addedCategoryGlobalHandler(e, catIndex) }} className="category-checkbox" />
                                <label className="category-include-text"> Appear in all Deliverables of the Activity</label>


                            </div>
                        </div>
                    ))
                    }

                    {/* categories rows */}
                    {deliverableDetails.categories && deliverableDetails.categories.map((cat, catIndex) => (
                        <div key={catIndex} className="form-group row del-detail-row reg-form-control">
                            <div className="col-sm-6 col-md-6 col-xs-6" style={{ display: "inline-flex" }}>

                                <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                    value={cat.name} maxLength="50"
                                    disabled={
                                        this.initialCategories[catIndex].isParent === 'N' && this.initialCategories[catIndex].isGlobal === 'Y' ? true : false}
                                    onChange={(e) => { this.categoryNameHandler(e, catIndex) }}
                                />
                            </div>
                            <div className="col-sm-6 col-md-6 col-xs-6 cat-del-binder" >
                                <input type="text" name="categoryInfo" placeholder="Add Information" className="form-control"
                                    value={cat.info} maxLength="50"
                                    onChange={(e) => { this.categoryInfoHandler(e, catIndex) }}
                                />
                                <div className="delete-icon">
                                    <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete"
                                        disabled={cat.categoryId !== null ? false : true}
                                        style={{
                                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                        }}
                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteCategory(e, catIndex)}
                                    ></img>
                                    <ReactTooltip html={true} />
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row" style={{ display: "inline-flex" }} >
                                {this.initialCategories[catIndex].isParent === 'N' && this.initialCategories[catIndex].isGlobal === 'Y' ?
                                    <input type="checkbox" checked={cat.isGlobal === 'Y' ? false : false}
                                        onChange={(e) => { this.categoryGlobalHandler(e, catIndex) }} className="category-checkbox disabled-checkbox"
                                        onClick={(e) => { this.showCatCheckboxError(e) }} readOnly={'readonly'} />
                                    :
                                    <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                        onChange={(e) => { this.categoryGlobalHandler(e, catIndex) }} className="category-checkbox" />
                                }
                                <label className="category-include-text"> Appear in all Deliverables of the Activity</label>


                            </div>
                        </div>
                    ))
                    }



                    <div className="form-group row del-detail-row">
                        <div className="col-12 del-save-div" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}>
                            <button type="button"
                                style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                className="btn btn-primary" onClick={() => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveDeliverable()} >
                                save </button>
                        </div>
                    </div>

                </div>
                <CustomConfirmModal
                    ownClassName={'ws-del-delete-modal'}
                    isModalVisible={this.state.saveDelModalVisible}
                    modalTitle={this.state.saveDelModalTitle}
                    closeConfirmModal={this.closeSaveDelConfirmModal}
                />

            </Modal>
        );
    }
}

export default withRouter(DeliverableDetailsModal);
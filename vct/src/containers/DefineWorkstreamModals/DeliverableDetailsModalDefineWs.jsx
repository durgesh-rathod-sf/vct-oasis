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
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class DeliverableDetailsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deliverableDetails: {},
            //addedMilestones: [],
            addedCategories: [],
            isFormDirty: false,
            ownerNameError: '',
            descriptionError: '',
            emailError: '',
            saveDelModalVisible: false,
            saveDelModalTitle: '',
            showDelArray: {
                basicDet: false,
                deptDet: false,
                datesDet: false,
                addInfo: false,
                addMilestones: false
            },
            //milestoneDet:{},
            newCategoryDet: {},
            delInfoLoading: true,
            delUpdateConfirmModalVisible: false,
            delUpdateConfirmModalTitle: '',
            saveLoading:false
        }
        this.initialCategories = [];


        this.isDefined = this.isDefined.bind(this);
        this.fetchWSDeliverableDetails = this.fetchWSDeliverableDetails.bind(this);
        this.handleShowHide = this.handleShowHide.bind(this);
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
                    if (response && !response.error && response.data) {
                        if (response.data.resultCode === "OK") {
                            const delDetails = response.data.resultObj;
                            this.initialCategories = JSON.parse(JSON.stringify(delDetails.categories));
                            this.setState({
                                deliverableDetails: delDetails,
                                delInfoLoading: false
                            })
                            // this.buildActivitiesToState(actList);
                        } else {
                        }
                    }

                });
        }
    }

    // owner name handle
    delOwnerHandler = (event) => {
        const { deliverableDetails } = this.state;
        deliverableDetails.owner = event.target.value;
        const errors = RegExp(/^[A-Za-z._\s-]*$/).test(event.target.value) ? '' : 'Please enter valid owner name. Owner name field can have alphabets . _ - space only';
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true,
            ownerNameError: errors
        });
    }
    delEmailHandler = (event) => {
        const { deliverableDetails } = this.state;

        deliverableDetails.ownerEmail = (event.target.value);
        let value = (event.target.value).toLowerCase();
        var res = value.substring(value.length, value.length - 14);
        const errors = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') || value === "" ? "" : 'Please enter valid email Id. Email Id field should include @accenture.com');

        // const errors = RegExp(/^[A-Za-z._\s-]*$/).test(event.target.value) ? '' : 'Please enter valid email Id. Email Id field should include @accenture.com';
        this.setState({
            deliverableDetails: deliverableDetails,
            isFormDirty: true,
            emailError: errors
        });
    }

    // description handler
    delDescriptionHandler = (event) => {
        const { deliverableDetails } = this.state;
        deliverableDetails.description = event.target.value;
        const errors = RegExp(/^[0-9A-Za-z._,()&#@%$'\s-]*$/).test(event.target.value) ? '' : 'Please enter valid description. Special characters except # . _ \' @ % $ & , ( ) - space are invalid';
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
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    }
                });
        }
    }
    // END of saved Categories functions

    // START of Added Categories functions
    addACategory = (event) => {
        const { addedCategories, newCategoryDet } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr.push({
            "name": newCategoryDet.name,
            "info": newCategoryDet.info,
            "isGlobal": 'N'
        })
        this.setState({
            addedCategories: CategsArr,
            isFormDirty: true,
            newCategoryDet: {}
        });
    }

    addedCategoryNameHandler = (event, catIndex) => {
        const { addedCategories, newCategoryDet } = this.state;
        let tempCatDet = newCategoryDet;
        let CategsArr = [...addedCategories];
        if (catIndex === "new") {
            tempCatDet.name = event.target.value;
            this.setState({
                newCategoryDet: tempCatDet
            });
        }
        else {
            CategsArr[catIndex].name = event.target.value;
            this.setState({
                addedCategories: CategsArr
            });
        }

    }

    addedCategoryInfoHandler = (event, catIndex) => {
        const { addedCategories, newCategoryDet } = this.state;
        let tempCatDet = newCategoryDet;
        let CategsArr = [...addedCategories];
        if (catIndex === "new") {
            tempCatDet.info = event.target.value;
            this.setState({
                newCategoryDet: tempCatDet
            });
        }
        else {
            CategsArr[catIndex].info = event.target.value;
            this.setState({
                addedCategories: CategsArr
            });
        }
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


    checkForMandatoryFields = () => {
        const { deliverableDetails } = this.state;
        if ((this.isDefined(deliverableDetails.owner) && deliverableDetails.owner !== '') &&
            this.state.descriptionError === '' && this.state.ownerNameError === '' && this.state.emailError === '' &&
            (this.isDefined(deliverableDetails.startDate) && deliverableDetails.startDate !== '') &&
            (this.isDefined(deliverableDetails.endDate) && deliverableDetails.endDate !== '') &&
            (this.isDefined(deliverableDetails.ownerEmail) && deliverableDetails.ownerEmail !== '')
            /*&& (this.isDefined(deliverableDetails.frequency) && deliverableDetails.frequency !== '') && (deliverableDetails.frequency !== 'null')*/) {
            return true;
        } else {
            return false;
        }
    }

    isEmptyCategories = (categoriesPayload) => {
        let isCatNameEmpty = false;
        const re = RegExp(/^[0-9A-Za-z._,()&#@%$'\s-]*$/);
        categoriesPayload.map(cat => {
            if (cat.name === '' || !this.isDefined(cat.name)) {
                isCatNameEmpty = true;
                return isCatNameEmpty
            }
            else if (!re.test(cat.name) || !re.test(cat.info)) {
                isCatNameEmpty = true;
                return isCatNameEmpty
            }
        });
        return isCatNameEmpty;
    }


    saveDeliverable = () => {
        const { deliverableDetails } = this.state;
        const { deliverableId } = this.props;
        if (this.checkForMandatoryFields()) {
            const categoriesPayload = this.getCategoriesPayload();
            // const milestonesPayload = this.getMilestonePayload();

            if (categoriesPayload.length > 0 && this.isEmptyCategories(categoriesPayload)) {
                this.showErrorNotification("Please enter missing category fields with valid values. Special characters except # . _ \' @ % $ & , ( ) - space are invalid", "Error", "error");
            } else {
                const payloadObj = {
                    "mapId": SessionStorage.read('mapId'),
                    "activityId": '' + deliverableDetails.activityId,
                    "deliverableId": '' + deliverableDetails.deliverableId,
                    "name": deliverableDetails.name,
                    'owner': deliverableDetails.owner,
                    'ownerEmail': (deliverableDetails.ownerEmail).toLowerCase(),
                    'description': deliverableDetails.description,
                    'frequency': deliverableDetails.frequency,
                    'startDate': deliverableDetails.startDate,
                    'endDate': deliverableDetails.endDate,
                    'categories': categoriesPayload,
                    "label": 'N',
                    "forceUpdate": false
                }
                if (this.isDefined(deliverableId)) {
                    /*save removed from here*/
                    this.call_saveDeliverable(payloadObj)

                }
            }
        } else {
            this.showErrorNotification("Please enter all the mandatory fields with valid values", "Error", "error");
        }
    }
    call_saveDeliverable = (payloadObj) => {
        const { workstreamStore } = this.props;
        this.setState({
            saveLoading:true
        })
        workstreamStore.saveDeliverableDetails(payloadObj)
            .then(response => {
                if (!response.error && response.data.resultCode === 'OK') {
                    this.showErrorNotification("Deliverable Details saved successfully", "Success", "success");

                    this.setState({
                        isFormDirty: false,
                        saveLoading:false
                    })
                    this.props.onSaveSuccess();
                    this.props.modalCloseHandler();
                } else if (!response.error && response.data.resultCode === 'KO') {
                    if (response.data.errorDescription === "WS100-Rule conflicted") {
                        this.setState({
                            saveDelPayload: payloadObj,
                            saveLoading:false
                        })
                        let confirmMsg = `Are you sure you want to change the dates?br_br_brDependent Deliverables dates will be adjusted accordingly`
                        this.DelUpdateConfirmModalOpen(confirmMsg)
                    }
                    else {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                       this.setState({ saveLoading:false})
                    }

                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    this.setState({ saveLoading:false})
                }
            });
    }

    DelUpdateConfirmModalOpen = (title) => {

        this.setState({
            delUpdateConfirmModalVisible: true,
            delUpdateConfirmModalTitle: title,
        });
    }
    DelUpdateConfirmModalClose = (isYesClicked) => {
        this.setState({
            delUpdateConfirmModalVisible: false,
            delUpdateConfirmModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.forceUpdateDel();
        }
    }
    forceUpdateDel = () => {
        const { saveDelPayload } = this.state;
        let tempPayload = saveDelPayload;
        tempPayload.forceUpdate = true
        this.call_saveDeliverable(tempPayload)
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
            this.props.modalCloseHandler();
        }
    }

    closeWithoutSave = () => {
        const { isFormDirty } = this.state;
        // if (isFormDirty) {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openSaveDelConfirmModal(confirmMsg);

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

    /*
    showCatCheckboxError = (e) => {
        this.showErrorNotification("This category is available in all of the deliverables", "Error", "error");
    }
    */

    handleShowHide = (event) => {
        const { showDelArray } = this.state;
        let tempShowArr = showDelArray
        switch (event.target.id) {
            case "basicDetails":
                tempShowArr.basicDet = !(tempShowArr.basicDet)
                break;
            case "deptDetails":
                tempShowArr.deptDet = !(tempShowArr.deptDet)
                break;
            case "dateDetails":
                tempShowArr.datesDet = !(tempShowArr.datesDet)
                break;
            case "addMoreInfo":
                tempShowArr.addInfo = !(tempShowArr.addInfo)
                break;
            /*case "addMoreMileStones":
                tempShowArr.addMilestones = !(tempShowArr.addMilestones)
                break;
                */
            default: break;
        }
        this.setState({
            showDelArray: tempShowArr
        })
    }


    // ----- END of Utility functions -------

    render() {
        const { isDelModalVisible } = this.props;
        const { deliverableDetails, addedMilestones, addedCategories, showDelArray, milestoneDet, newCategoryDet, delInfoLoading, saveLoading } = this.state;

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
                    {/*<img data-tip="Close" data-type="dark" data-place="left" src={closeIcon} alt="close" onClick={(e) => { this.closeWithoutSave() }} data-dismiss="modal" ></img>*/}
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
                            {/* <div className="row col-sm-12 del-title-subrow"> */}

                            <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">
                                <img src={(showDelArray.basicDet) ? drillUpIcon : drillDownIcon}
                                    alt="open" className="drillDownIcon"
                                    data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                    id="basicDetails"
                                    onClick={this.handleShowHide}></img>
                                <label>Basic Details</label>
                            </div>
                            {(showDelArray.basicDet) ?
                                <div className="act-modal-body-div">
                                    <div className="row form-group reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6 form-group">

                                            <label className="deliverable-form-label">Owner *</label>

                                            <input type="text" className="form-control"
                                                placeholder="Owner Name" maxLength="150"
                                                value={deliverableDetails.owner || ''}
                                                onChange={(e) => { this.delOwnerHandler(e) }}
                                            />
                                            <span style={{ color: '#ffffff' }}><small>{this.state.ownerNameError}</small></span>
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6 form-group" >
                                            <label className="deliverable-form-label">Email Id *</label>
                                            <input type="email" className="form-control"
                                                placeholder="Owner Email Id" maxLength="50"
                                                value={deliverableDetails.ownerEmail || ''}
                                                onChange={(e) => { this.delEmailHandler(e) }}
                                            />
                                            <span style={{ color: '#ffffff' }}><small>{this.state.emailError}</small></span>

                                        </div>
                                    </div>
                                    <div className="row reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6">
                                            <label className="deliverable-form-label">Description</label>
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
                                </div>
                                : ""
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
                                        <div className="col-sm-6 col-md-6 col-xs-6">
                                            <label className="deliverable-form-label">Department</label>
                                            <input type="text" className="form-control" readOnly
                                                placeholder="Department" maxLength="50"
                                                defaultValue={deliverableDetails.department}
                                            />
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6">
                                            <label className="deliverable-form-label">Sub Department</label>
                                            <input type="text" className="form-control" readOnly
                                                placeholder="Sub Department" maxLength="50"
                                                defaultValue={deliverableDetails.subDepartment}
                                            />
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
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-xs-6" style={{ paddingLeft: "0px" }}>
                                                    <label className="deliverable-form-label">Start Date *</label>
                                                    <div className="ws-date-row">
                                                        <DatePicker
                                                            selected={delStartDate}
                                                            value={delStartDate}
                                                            placeholderText="dd/mm/yyyy"
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
                                                <div className="col-sm-6 col-md-6 col-xs-6" style={{ paddingRight: "0px" }}>
                                                    <label className="deliverable-form-label">End Date *</label>
                                                    <div className="col-sm-12 paddingNone">
                                                        <div className="ws-date-row">
                                                            <DatePicker
                                                                selected={delEndDate}
                                                                value={delEndDate}
                                                                minDate={delStartDate}
                                                                placeholderText="dd/mm/yyyy"
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
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                : ""}
                        </div>
                     
                        <div className="del-title-row ">
                            <div className="col-sm-12 col-md-12 col-xs-12 del-modal-scroll-div row ">

                                <img src={(showDelArray.addInfo) ? drillUpIcon : drillDownIcon}
                                    alt="open" className="drillDownIcon"
                                    data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                    id="addMoreInfo"
                                    onClick={this.handleShowHide}></img>

                                <label >Add More Information</label>
                            </div>
                            {(showDelArray.addInfo) ?
                                <div>

                                    <div className="row del-detail-row reg-form-control" style={{ paddingBottom: "20px" }}>
                                        <div className="col-sm-5 col-sm-5-customized" style={{ display: "inline-flex", padding: "0px 15px 0px 0px" }}>
                                            <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                                value={newCategoryDet.name ? newCategoryDet.name : ""} maxLength="50"
                                                onChange={(e) => { this.addedCategoryNameHandler(e, "new") }}
                                            />
                                        </div>
                                        <div className="col-sm-5 col-sm-5-customized cat-del-binder  custom-justify-right" style={{ padding: "0px 0px 0px 15px" }} >
                                            <input type="text" name="categoryInfo" placeholder="Add Information" className="form-control "
                                                value={newCategoryDet.info ? newCategoryDet.info : ""} maxLength="50"
                                                onChange={(e) => { this.addedCategoryInfoHandler(e, "new") }}
                                            />
                                        </div>
                                        <div className="col-sm-2 delete-icon paddingNone col-sm-2-customized">
                                            <img data-tip="Add" data-type="dark" data-place="left" src={circPlusIcon} alt="add"
                                                onClick={(e) => { this.addACategory(e) }}
                                            ></img>
                                            <ReactTooltip html={true} />

                                        </div>
                                        {/* <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row" style={{ display: "inline-flex" }} >
                                        <input type="checkbox" 
                                        checked={cat.isGlobal === 'Y' ? true : false}
                                        onChange={(e) => { this.addedCategoryGlobalHandler(e, catIndex) }} 
                                        className="category-checkbox" />
                                        <label className="category-include-text"> Appear in all Deliverables of the Activity</label>
                                    </div> */}
                                    </div>
                                    {/*  */}


                                    {/* Addded categories rows */}
                                    {addedCategories && addedCategories.map((cat, catIndex) => (
                                        <div key={catIndex} className="row del-detail-row reg-form-control">
                                            <div className="col-sm-5 col-sm-5-customized" style={{ display: "inline-flex", padding: "0px 15px 0px 0px" }}>
                                                <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                                    value={cat.name} maxLength="50"
                                                    onChange={(e) => { this.addedCategoryNameHandler(e, catIndex) }}
                                                />
                                            </div>
                                            <div className="col-sm-5 col-sm-5-customized cat-del-binder  custom-justify-right" style={{ padding: "0px 0px 0px 15px" }} >
                                                <input type="text" name="categoryInfo" placeholder="Add Information" className="form-control"
                                                    value={cat.info} maxLength="50"
                                                    onChange={(e) => { this.addedCategoryInfoHandler(e, catIndex) }}
                                                />
                                            </div>
                                            <div className="col-sm-2 delete-icon paddingNone col-sm-2-customized">
                                                <img data-tip="Delete" data-type="dark" data-place="left" src={trashIcon} alt="delete" disabled={cat.categoryId !== null ? false : true}
                                                    onClick={(e) => { this.deleteAddedCategory(e, catIndex) }}
                                                ></img>
                                                <ReactTooltip html={true} />
                                            </div>
                                            <div className="col-sm-12 paddingNone cat-checkbox-row" style={{ display: "inline-flex", paddingBottom: "20px" }} >
                                                <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                                    onChange={(e) => { this.addedCategoryGlobalHandler(e, catIndex) }} className="category-checkbox" />
                                                <label className="category-include-text"> Appear in all Deliverables of the Activity</label>


                                            </div>
                                        </div>
                                    ))
                                    }

                                    {/* categories rows */}
                                    {deliverableDetails.categories && deliverableDetails.categories.map((cat, catIndex) => (
                                        <div key={catIndex} className="row del-detail-row reg-form-control">
                                            <div className="col-sm-5 col-sm-5-customized" style={{ display: "inline-flex", padding: "0px 15px 0px 0px" }}>

                                                <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                                    value={cat.name} maxLength="50"
                                                    disabled={
                                                        this.initialCategories[catIndex].isParent === 'N' && this.initialCategories[catIndex].isGlobal === 'Y' ? true : false}
                                                    onChange={(e) => { this.categoryNameHandler(e, catIndex) }}
                                                />
                                            </div>
                                            <div className="col-sm-5 col-sm-5-customized cat-del-binder  custom-justify-right" style={{ padding: "0px 0px 0px 15px" }} >
                                                <input type="text" name="categoryInfo" placeholder="Add Information" className="form-control"
                                                    value={cat.info} maxLength="50"
                                                    onChange={(e) => { this.categoryInfoHandler(e, catIndex) }}
                                                />
                                            </div>
                                            <div className="col-sm-2 delete-icon paddingNone col-sm-2-customized">
                                                <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete" data-place="left"
                                                    disabled={cat.categoryId !== null ? false : true}
                                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : 'pointer' }}
                                                    onClick={(e) => (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : this.deleteCategory(e, catIndex)}
                                                ></img>
                                                <ReactTooltip html={true} />
                                            </div>

                                            <div className="col-sm-12 paddingNone cat-checkbox-row" style={{ display: "inline-flex", paddingBottom: "20px" }} >
                                                {this.initialCategories[catIndex].isParent === 'N' && this.initialCategories[catIndex].isGlobal === 'Y' ?
                                                    <><input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                                /*onChange={(e) => { this.categoryGlobalHandler(e, catIndex) }}*/ className="category-checkbox disabled-checkbox"
                                                /*onClick={(e) => { this.showCatCheckboxError(e) }}*/ readOnly={'readonly'} data-tip="" data-for="del_category_tool_tip" data-type="dark" data-place="right" />
                                                        <ReactTooltip id="del_category_tool_tip" > <span>This category is available <br /> in all of the deliverables</span></ReactTooltip>
                                                    </>
                                                    :
                                                    <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                                        onChange={(e) => { this.categoryGlobalHandler(e, catIndex) }} className="category-checkbox" />
                                                }
                                                <label className="category-include-text"> Appear in all Deliverables of the Activity</label>


                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>

                                : ""}
                        </div>


                        <div className="row">
                            <div className="col-12 del-save-div paddingNone" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer')  }}>
                                <button type="button" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer') }}
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? true : false}
                                    className="btn btn-primary" 
                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? () => { } : () => this.saveDeliverable()} >
                                    {saveLoading?"Saving...":"Save"} </button>
                            </div>
                        </div>

                    </div>

                }
                {this.state.saveDelModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveDelModalVisible}
                        modalTitle={this.state.saveDelModalTitle}
                        closeConfirmModal={this.closeSaveDelConfirmModal}
                    />
                    : ''

                }
                {this.state.delUpdateConfirmModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'fit-content-delDw'}
                        isModalVisible={this.state.delUpdateConfirmModalVisible}
                        modalTitle={this.state.delUpdateConfirmModalTitle}
                        closeConfirmModal={this.DelUpdateConfirmModalClose}
                    /> : ""}


            </Modal>
        );
    }
}

export default withRouter(DeliverableDetailsModal);
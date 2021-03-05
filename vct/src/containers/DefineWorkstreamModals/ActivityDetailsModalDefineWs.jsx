import React, { Component, Fragment } from 'react';
import Modal from 'react-bootstrap4-modal';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
//import '../WorkstreamComponents/ActivityModal/ActivityModal.css';
import './DefineWsModals.css'
import Moment from 'moment';
import ReactTooltip from 'react-tooltip';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import calIcon from '../../assets/project/workstream/date-disabled.svg';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ActivityDetailsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityDetails: {},
            ownerName: "",
            ownerEmail: "",
            description: "",
            department: "",
            subDept: "",
            addedCategories: [],
            ownerError: "",
            descriptionError: "",
            departmentError: "",
            subDeptError: "",
            emailError: "",
            edited: false,
            ownDetailsShow: false,
            depDetailsShow: false,
            dateDetailsShow: false,
            infoDetailsShow: false,
            newCategory: {},
            actInfoLoading: true,
            saveActDetModalVisible: false,
            saveActDetModalTitle: '',
            saveLoading:false,
        }
        this.deleteCategory = this.deleteCategory.bind(this);
        this.handleAddInformation = this.handleAddInformation.bind(this);
        this.categoryNameHandler = this.categoryNameHandler.bind(this);
        this.categoryInfoHandler = this.categoryInfoHandler.bind(this);
        this.categoryGlobalHandler = this.categoryGlobalHandler.bind(this);
        this.saveActivity = this.saveActivity.bind(this);
        this.onDetailsClick = this.onDetailsClick.bind(this);
        this.checkForMandatoryFields = this.checkForMandatoryFields.bind(this);
    }

    componentDidMount() {
        this.getWSActivityDetails();
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
            case 'dateDetails':
                const dateDetailsShow = this.state.dateDetailsShow
                this.setState({
                    dateDetailsShow: !dateDetailsShow
                });
                break;
            case 'infoDetails':
                const infoDetailsShow = this.state.infoDetailsShow
                this.setState({
                    infoDetailsShow: !infoDetailsShow
                });
                break;
            default:
                break;
        }
    }

    checkForMandatoryFields = () => {
        const { activityDetails } = this.state;
        if ((this.isDefined(activityDetails.owner) && activityDetails.owner !== "") &&
            (this.isDefined(activityDetails.ownerEmail) && activityDetails.ownerEmail !== "")) {
            return true;
        } else {
            return false;
        }
    }

    saveActivity() {
        const { workstreamStore } = this.props;
        const { activityDetails, ownerError, descriptionError, departmentError, subDeptError, emailError } = this.state;
        const categoriesArray = this.getCategoriesPayload();
        var isEmpty = '';

        if (categoriesArray.length > 0) {
            for (var i = 0; i < categoriesArray.length; i++) {
                if (categoriesArray[i].name === "" || !this.isDefined(categoriesArray[i].name)) {
                    isEmpty = 'isEmptyCat';
                }
                else if (!RegExp(/^[0-9A-Za-z._,()&#@%$'\s-]*$/).test(categoriesArray[i].name) || !RegExp(/^[0-9A-Za-z._,()&#@%$'\s-]*$/).test(categoriesArray[i].info)) {
                    isEmpty = 'inValidCat';
                }
                else if (ownerError !== '' || descriptionError !== '' || departmentError !== '' || subDeptError !== '' || emailError !== '' || !this.checkForMandatoryFields()) {
                    isEmpty = 'inValidCatInValidAct';
                }
            }
        }
        else if (ownerError !== '' || descriptionError !== '' || departmentError !== '' || subDeptError !== '' || emailError !== '' || !this.checkForMandatoryFields()) {
            isEmpty = 'inValidCatInValidAct';
        }

        if (isEmpty) {
            /* show a notification message to fill the category names */
            switch (isEmpty) {
                case 'isEmptyCat':
                    this.showNotification('categoryNameEmpty');
                    break;
                case 'inValidCat':
                    this.showNotification('categoryNameInvalid');
                    break;
                case 'inValidCatInValidAct':
                    this.showNotification('categoryNameActInvalid');
                    break;
                default:
                    break;

            }
        }
        else {
            this.setState({
                saveLoading:true
            })
            const payload = {
                "mapId": SessionStorage.read('mapId'),
                "wsId": (activityDetails.wsId).toString(),
                "activityId": (activityDetails.activityId).toString(),
                "activityName": activityDetails.name,
                "owner": this.state.ownerName ? this.state.ownerName : activityDetails.owner,
                "ownerEmail": this.state.ownerEmail ? this.state.ownerEmail : (activityDetails.ownerEmail).toLowerCase(),
                "description": this.state.description ? this.state.description : activityDetails.description,
                "department": this.state.department ? this.state.department : activityDetails.department,
                "subDepartment": this.state.subDept ? this.state.subDept : activityDetails.subDept,
                "categories": categoriesArray,
                "label": "N"
            }
            workstreamStore.saveActivityDetails(payload)
                .then((response) => {
                    if (response !== null && !response.error) {
                        if (response.data.resultCode === "OK") {
                            /* notification message for save successful */
                            this.showNotification('saveActivityDetailsSuccess', response.data.resultDescription);
                            this.setState({
                                edited: false,
                                saveLoading:false,
                            })
                            this.props.onSaveSuccess();
                            this.props.modalCloseHandler();
                        } else if (response.data.resultCode === "KO" && response.data.errorDescription === null && response.data.errorDescription !== "") {
                            this.setState({
                                saveLoading:false,
                            })
                            this.showNotification('saveActivityDetailsErrorForDuplicateCategory', response.data.errorDescription);
                        } else if (response.data.resultCode === "KO") {
                            this.setState({
                                saveLoading:false,
                            })
                            this.showNotification('saveActivityDetailsError', response.data.errorDescription);
                            // this.props.modalCloseHandler("save");
                        }
                    }
                })
        }
    }

    showNotification(type, message) {
        switch (type) {
            case 'deleteSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'deleteKO':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'deleteError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={"Sorry! Something went wrong"}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'saveActivityDetailsErrorForDuplicateCategory':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'categoryNameActInvalid':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please enter mandatory fields with valid values and try again.'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'categoryNameInvalid':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please enter category fields with valid values. Special characters except # . _ \' @ % $ & , ( ) - space are invalid'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'categoryNameEmpty':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'The category fields are empty'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'saveActivityDetailsSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'saveActivityDetailsError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'newCategoryDelete':
                toast.info(<NotificationMessage
                    title="Warning"
                    bodytext={'New category cannot be deleted before save'}
                    icon="warning"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }

    getWSActivityDetails() {
        const { workstreamStore } = this.props;
        const activityId = this.props.activityId
        workstreamStore.getWSActivity(activityId)
            .then((response) => {
                if (response !== null && !response.error) {
                    if (response.data.resultCode === "OK" && response.data.resultObj !== null) {
                        this.setState({
                            activityDetails: response.data.resultObj,
                            actInfoLoading: false
                        })
                    }
                }
            })
    }


    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    deleteCategory = (event, catIndex) => {
        const { activityDetails } = this.state;
        const { workstreamStore } = this.props;
        let catDetailsObj = { ...activityDetails };
        let CategsArr = catDetailsObj.categories;
        const categoryId = CategsArr[catIndex].categoryId;

        const payloadObj = {
            'id': categoryId,
            'globalFlag': CategsArr[catIndex].isGlobal
        }
        if (this.isDefined(categoryId)) {
            workstreamStore.deleteCategory(payloadObj)
                .then((res) => {
                    if (!res.error && res.data.resultCode === 'OK') {
                        /* add notification message for successful delete */
                        this.showNotification("deleteSuccess", res.data.resultDescription);
                        this.getWSActivityDetails();
                    } else if (!res.error && res.data.resultCode === 'KO') {
                        this.showNotification("deleteKO", res.data.errorDescription);
                    } else {
                        this.showNotification("deleteError");
                    }
                });
        }
    }

    handleAddInformation() {
        const { addedCategories } = this.state;
        const { newCategory } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr.push({
            "name": newCategory.newCategoryName,
            "info": newCategory.newCategoryInfo,
            "isGlobal": 'N'
        })

        this.setState({
            addedCategories: CategsArr,
            newCategory: {
                newCategoryName: '',
                newCategoryInfo: '',
            }
        });

    }

    addedCategoryNameHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].name = event.target.value;
        this.setState({
            edited: true,
            addedCategories: CategsArr
        });
    }

    addedCategoryInfoHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].info = event.target.value;
        this.setState({
            edited: true,
            addedCategories: CategsArr
        });
    }

    addedCategoryGlobalHandler = (event, catIndex) => {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr[catIndex].isGlobal = event.target.checked ? 'Y' : 'N';
        this.setState({
            edited: true,
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

    getCategoriesPayload = () => {
        let builtCategArr = [];
        let savedCategArr = [];
        let addedCatStateObj = [];
        const { activityDetails, addedCategories } = this.state;
        const actDetails = { ...activityDetails };
        const categArray = [...actDetails.categories];
        addedCatStateObj = [...addedCategories];
        categArray.map(cat => {
            savedCategArr.push({
                'categoryId': cat.categoryId,
                'name': cat.name,
                'info': cat.info,
                'isGlobal': cat.isGlobal
            })
            return true
        });
        addedCatStateObj.map(addC => {
            if (addC.name) {
                addC.name = addC.name.trim();
            }
            return true
        });
        builtCategArr = [...savedCategArr, ...addedCatStateObj]
        return builtCategArr;
    }

    handleFieldChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        this.handleStateForRender(id, value);
    }
    handleStateForRender(id, value) {
        let actDetails = this.state.activityDetails;
        let newCategory = this.state.newCategory;
        let ownerError, descriptionError, departmentError, subDeptError, emailError = '';
        switch (id) {
            case "owner": {
                ownerError = RegExp(/^[A-Za-z._\s-]*$/).test(value) ? '' : 'Please enter valid owner name. Owner name field can have alphabets . _ - space only';
                this.setState({
                    ownerError: ownerError,
                    edited: true,
                });
                actDetails.owner = value;
                break;
            }
            case "description": {
                descriptionError = RegExp(/^[0-9A-Za-z._,()&#@%$'\s-]*$/).test(value) ? '' : 'Please enter valid description. Special characters except # . _ \' @ % $ & , ( ) - space are invalid';
                this.setState({
                    descriptionError: descriptionError,
                    edited: true
                });
                actDetails.description = value;
                break;
            }
            case "department": {
                departmentError = RegExp(/^[0-9A-Za-z._#(),&@\s-]*$/).test(value) ? '' : 'Please enter valid department. Special characters except # . _ @ & ( ) , - space are invalid';
                this.setState({
                    departmentError: departmentError,
                    edited: true
                });
                actDetails.department = value;
                break;
            }
            case "subDepartment": {
                subDeptError = RegExp(/^[0-9A-Za-z._#(),&@\s-]*$/).test(value) ? '' : 'Please enter valid sub department. Special characters except # . _ @ & ( ) , - space are invalid';
                this.setState({
                    edited: true,
                    subDeptError: subDeptError,
                });
                actDetails.subDept = value;
                break;
            }
            case "ownerEmail": {
                let ownerEmail = value.toLowerCase();
                var res = ownerEmail.substring(ownerEmail.length, ownerEmail.length - 14);
                emailError = ((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(ownerEmail) && ownerEmail !== '@accenture.com') || ownerEmail === "" ? "" : 'Please enter valid email Id. Email Id field should include @accenture.com';
                this.setState({
                    edited: true,
                    emailError: emailError,
                });
                actDetails.ownerEmail = value;
                break;
            }
            case "newCategoryName": {
                newCategory.newCategoryName = value;
                break;
            }
            case "newCategoryInfo": {
                newCategory.newCategoryInfo = value;
                break;
            }

            default:
                break;
        }
        this.setState({
            edited: true,
            activityDetails: { ...actDetails },
            newCategory: { ...newCategory },
        }, () => {
            console.log("");
        });
    }

    categoryNameHandler = (event, catIndex) => {
        const { activityDetails } = this.state;
        let actDetailsObj = { ...activityDetails };
        let CategsArr = actDetailsObj.categories;
        CategsArr[catIndex].name = event.target.value;
        this.setState({
            edited: true,
            activityDetails: actDetailsObj
        });
    }

    categoryInfoHandler = (event, catIndex) => {
        const { activityDetails } = this.state;
        let actDetailsObj = { ...activityDetails };
        let CategsArr = actDetailsObj.categories;
        CategsArr[catIndex].info = event.target.value;
        this.setState({
            edited: true,
            activityDetails: actDetailsObj
        });
    }

    categoryGlobalHandler = (event, catIndex) => {
        const { activityDetails } = this.state;
        let actDetailsObj = { ...activityDetails };
        let CategsArr = actDetailsObj.categories;
        CategsArr[catIndex].isGlobal = event.target.checked ? 'Y' : 'N';
        this.setState({
            edited: true,
            activityDetails: actDetailsObj
        });
    }

    /*
    showCatCheckboxError = (e) => {
        this.showNotification('saveActivityDetailsError', 'This category is available in all of the activities');
    }
    */
    closeWithoutSave = () => {
        // if (edited === false) {
        //     this.props.modalCloseHandler()
        // }
        // else {
        this.openSaveActConfirmModal('Are you sure you want to close ?');

        // }
    }
    openSaveActConfirmModal = (title) => {
        this.setState({
            saveActDetModalVisible: true,
            saveActDetModalTitle: title,
        });
    }

    closeSaveActConfirmModal = (isYesClicked) => {
        this.setState({
            saveActDetModalVisible: false,
            saveActDetModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.props.modalCloseHandler();
        }
    }

    render() {
        const { activityDetails, addedCategories, ownDetailsShow, depDetailsShow, dateDetailsShow, infoDetailsShow, newCategory, actInfoLoading,saveLoading } = this.state;
        const { workstreamStore } = this.props;
        return (
            <Modal id="activityModal" visible={this.props.visible}>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">{this.props.title}</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal"></img>
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

                                            <label className="activity-form-label">Owner *</label>
                                            <input type="text" value={activityDetails.owner} id="owner"
                                                className="form-control" placeholder="Owner Name"
                                                maxLength="50"
                                                autoComplete='off'
                                                onChange={this.handleFieldChange}
                                            />
                                            <span><small>{this.state.ownerError}</small></span>
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6" >

                                            <label className="activity-form-label">Email Id *</label>
                                            <input type="text" value={activityDetails.ownerEmail} id="ownerEmail"
                                                className="form-control" placeholder="Owner Email Id"
                                                maxLength="50"
                                                autoComplete='off'
                                                onChange={this.handleFieldChange}
                                            />
                                            <span><small>{this.state.emailError}</small></span>
                                        </div>
                                    </div>
                                    <div className="row reg-form-control">
                                        <div className="col-sm-6 col-md-6 col-xs-6">

                                            <label className="activity-form-label">Description</label>
                                            <textarea type="text" rows="4" className="form-control" id="description"
                                                value={activityDetails.description}
                                                maxLength="250"
                                                onChange={this.handleFieldChange}
                                            />
                                            {activityDetails && activityDetails.description ?
                                                <div className="text-area-counter">{activityDetails.description.length} / 250 character(s)</div>
                                                : <div className="text-area-counter"> 0 / 250 character(s)</div>
                                            }

                                            <span><small>{this.state.descriptionError}</small></span>
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={depDetailsShow ? drillUpIcon : drillDownIcon} alt="open" id="deptDetails"
                                        onClick={() => this.onDetailsClick('deptDetails')}></img>
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
                                                value={activityDetails.department}
                                                onChange={this.handleFieldChange}
                                            />
                                            <span><small>{this.state.departmentError}</small></span>
                                        </div>
                                        <div className="col-sm-6 col-md-6 col-xs-6" >
                                            <label className="activity-form-label">Sub Department</label>
                                            <input type="text" className="form-control" id="subDepartment"
                                                placeholder="Sub Department Name"
                                                maxLength="50"
                                                value={activityDetails.subDept}
                                                onChange={this.handleFieldChange}
                                            />
                                            <span><small>{this.state.subDeptError}</small></span>
                                        </div>
                                    </div>
                                </div> : ''
                            }
                        </div>

                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={dateDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right" id="dateDetails"
                                        onClick={() => this.onDetailsClick('dateDetails')}></img>
                                    <label className="activity-form-label"> Dates</label>
                                </div>
                            </div>
                            {dateDetailsShow ?
                                <div className="act-modal-body-div">
                                    <div className="row reg-form-control date-form-control">
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-xs-6">
                                                    <label className="activity-form-label">Start Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd/mm/yyyy"
                                                            value={(activityDetails.startDate !== "" && this.isDefined(activityDetails.startDate)) ? Moment(activityDetails.startDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender"></img>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-xs-6" >
                                                    <label className="activity-form-label">End Date</label>
                                                    <div className="ws-date-row">
                                                        <input type="text" className="form-control"
                                                            placeholder="dd/mm/yyyy"
                                                            value={(activityDetails.endDate !== "" && this.isDefined(activityDetails.endDate)) ? Moment(activityDetails.endDate).format('DD-MMM-YYYY') : ""}
                                                            disabled
                                                        />
                                                        <img src={calIcon} alt="calender"></img>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : ""
                            }
                        </div>

                        <div className="act-modal-div">
                            <div className="row reg-form-control">
                                <div className="col-sm-12 col-md-12 col-xs-12 act-modal-scroll-div">
                                    <img src={infoDetailsShow ? drillUpIcon : drillDownIcon} alt="open"
                                        data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right" id="addmoreinformation"
                                        onClick={() => this.onDetailsClick('infoDetails')}></img>
                                    <label className="activity-form-label">Add More Information</label>
                                </div>
                            </div>
                            {infoDetailsShow ?
                                <div className="act-modal-body-div" style={{ marginBottom: "-20px" }}>
                                    <div className="row reg-form-control act-cat-details" style={{ marginBottom: "20px" }}>
                                        <div className="row act-category" >
                                            <div className="col-sm-6 col-md-6 col-xs-6">
                                                <input type="text" className="form-control" id="newCategoryName"
                                                    placeholder="Add Category"
                                                    maxLength="50"
                                                    value={newCategory.newCategoryName}
                                                    onChange={this.handleFieldChange}
                                                />
                                            </div>
                                            <div className="col-sm-6 col-md-6 col-xs-6">
                                                <input type="text" className="form-control" id="newCategoryInfo"
                                                    placeholder="Add Information"
                                                    maxLength="50"
                                                    value={newCategory.newCategoryInfo}
                                                    onChange={this.handleFieldChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="act-category-plus">
                                            <img data-tip="Add" data-type="dark" data-place="left" src={circPlusIcon} alt="add" onClick={this.handleAddInformation} style={{ cursor: 'pointer' }}></img>
                                            <ReactTooltip html={true}></ReactTooltip>
                                        </div>
                                    </div>

                                    {addedCategories && addedCategories.map((cat, catIndex) => (
                                        <div key={catIndex}>
                                            <div className="row reg-form-control act-cat-details">
                                                <div className="row act-category">
                                                    <div className="col-sm-6 col-md-6 col-xs-6">

                                                        <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                                            value={cat.name}
                                                            maxLength="50"
                                                            onChange={(e) => { this.addedCategoryNameHandler(e, catIndex) }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6 col-xs-6" >
                                                        <input type="text" id={catIndex} name="categoryInfo" placeholder="Add Information" className="form-control"
                                                            value={cat.info}
                                                            maxLength="50"
                                                            onChange={(e) => { this.addedCategoryInfoHandler(e, catIndex) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row delete-icon act-category-plus">
                                                    <img data-tip="Delete" data-type="dark" data-place="left" src={trashIcon} alt="delete" className="" disabled={cat.categoryId !== null ? false : true}
                                                        onClick={(e) => { this.deleteAddedCategory(e, catIndex) }}
                                                    ></img>
                                                    <ReactTooltip html={true} />
                                                </div>

                                            </div>

                                            <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row pb-3" >
                                                <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                                    onChange={(e) => { this.addedCategoryGlobalHandler(e, catIndex) }}
                                                    className="activity-checkbox" style={{ marginRight: "10px" }} />
                                                <label className="activity-include-text"> Appear in all Activities of the Workstream</label>

                                            </div>
                                        </div>
                                    ))}
                                    {activityDetails && Object.keys(activityDetails).length > 0 && activityDetails.categories.length > 0 && activityDetails.categories.map((option, index) => (
                                        <div key={option}>
                                            <div className="row reg-form-control act-cat-details">
                                                <div className="row act-category">
                                                    <div className="col-sm-6 col-md-6 col-xs-6">

                                                        <input type="text" required id={option.categoryId} name="categoryName" placeholder="Add Category" className="form-control"
                                                            value={option.name}
                                                            maxLength="50"
                                                            disabled={(workstreamStore.WSActivityDetails.categories[index].isParent === "N" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "Y") ? true : false}
                                                            onChange={(e) => { this.categoryNameHandler(e, index) }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6 col-xs-6 cat-del-binder" >
                                                        <input type="text" id={option.categoryId} name="categoryInfo" placeholder="Add Information" className="form-control"
                                                            value={option.info} maxLength="50"
                                                            onChange={(e) => { this.categoryInfoHandler(e, index) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="delete-icon  act-category-plus">
                                                    <img data-tip="Delete" data-type="dark" data-place="left"
                                                        src={trashIcon} alt="delete" className="" disabled={option.categoryId !== null ? false : true}
                                                        style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : 'pointer' }}
                                                        onClick={(e) => (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : this.deleteCategory(e, index)}
                                                    ></img>
                                                    <ReactTooltip html={true} />
                                                </div>
                                            </div>

                                            <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row pb-3">


                                                {(workstreamStore.WSActivityDetails.categories[index].isParent === "Y" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "Y") &&
                                                    <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                                                }
                                                {(workstreamStore.WSActivityDetails.categories[index].isParent === "N" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "N") &&
                                                    <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                                                }
                                                {(workstreamStore.WSActivityDetails.categories[index].isParent === "N" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "Y") &&
                                                    <><input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} readOnly={'readonly'} /*onClick={(e) => { this.showCatCheckboxError(e) }}*/ className="activity-checkbox disabled-cat-box" style={{ marginRight: "10px" }} data-tip="" data-for="act_category_tool_tip" data-type="dark" data-place="right" />
                                                        <ReactTooltip id="act_category_tool_tip" > <span>This category is available <br /> in all of the activities</span></ReactTooltip>
                                                    </>
                                                }
                                                {(workstreamStore.WSActivityDetails.categories[index].isParent === "Y" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "N") &&
                                                    <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                                                }
                                                <label className="activity-include-text"> Appear in all Activities of the Workstream</label>


                                            </div>

                                        </div>
                                    ))}

                                </div>
                                : ''
                            }
                        </div>

                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" :(saveLoading?"default":'pointer') }}>
                                <button type="button" style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (saveLoading?"default":'pointer') }}
                                    className="btn btn-primary"
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || saveLoading) ? true : false}
                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || saveLoading) ? 'return false;' : this.saveActivity}>
                                    {saveLoading?"Saving...":"Save"}</button>
                            </div>
                        </div>
                    </Fragment>
                }
                {this.state.saveActDetModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveActDetModalVisible}
                        modalTitle={this.state.saveActDetModalTitle}
                        closeConfirmModal={this.closeSaveActConfirmModal}
                    /> : ''
                }

            </Modal>
        );
    }
}

export default withRouter(ActivityDetailsModal);

import React, { Component } from 'react';
import Modal from 'react-bootstrap4-modal';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import './ActivityModal.css';
import Moment from 'moment';
import ReactTooltip from 'react-tooltip';
import saveIco from "../../../assets/project/workstream/saveIcon.png";
import linkKpiIcon from '../../../assets/project/workstream/person.svg';
import calender from '../../../assets/project/workstream/calenderIcon.png';
import description from '../../../assets/project/workstream/description.png';
import ownerIcon from "../../../assets/project/workstream/person_1.png";
import department from "../../../assets/project/workstream/department.png";
import closeIcon from '../../../assets/project/workstream/modal-close.svg';
import calIcon from '../../../assets/project/workstream/date-disabled.svg';
import circPlusIcon from "../../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../../assets/project/viewDeals/trash-delete-icon.svg';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ActivityDetailsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityDetails: {},
            ownerName: "",
            description: "",
            department: "",
            subDept: "",
            addedCategories: [],
            ownerError: "",
            descriptionError: "",
            departmentError: "",
            subDeptError: "",
        }
        this.deleteCategory = this.deleteCategory.bind(this);
        this.handleAddInformation = this.handleAddInformation.bind(this);
        this.categoryNameHandler = this.categoryNameHandler.bind(this);
        this.categoryInfoHandler = this.categoryInfoHandler.bind(this);
        this.categoryGlobalHandler = this.categoryGlobalHandler.bind(this);
        this.saveActivity = this.saveActivity.bind(this);
    }

    componentDidMount() {
        this.getWSActivityDetails();
    }
    saveActivity() {
        const { workstreamStore } = this.props;
        const { activityDetails, ownerError, descriptionError, departmentError, subDeptError } = this.state;
        const categoriesArray = this.getCategoriesPayload();
        var isEmpty = '';

        if (categoriesArray.length > 0) {
            for (var i = 0; i < categoriesArray.length; i++) {
                if (categoriesArray[i].name === "") {
                    isEmpty = 'isEmptyCat';
                }
                else if (RegExp(/[<>!'"[\]]/).test(categoriesArray[i].name) || RegExp(/[<>!'"[\]]/).test(categoriesArray[i].info)) {
                    isEmpty = 'inValidCat';
                }
                else if (ownerError !== '' || descriptionError !== '' || departmentError !== '' || subDeptError !== '') {
                    isEmpty = 'inValidCatInValidAct';
                }
            }
        }
        else if (ownerError !== '' || descriptionError !== '' || departmentError !== '' || subDeptError !== '') {
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
                default:
                    break;

            }
        }
        else {
            const payload = {
                "mapId": SessionStorage.read('mapId'),
                "wsId": (activityDetails.wsId).toString(),
                "activityId": (activityDetails.activityId).toString(),
                "activityName": activityDetails.name,
                "owner": this.state.ownerName ? this.state.ownerName : activityDetails.owner,
                "description": this.state.description ? this.state.description : activityDetails.description,
                "department": this.state.department ? this.state.department : activityDetails.department,
                "subDepartment": this.state.subDept ? this.state.subDept : activityDetails.subDept,
                "categories": categoriesArray,
                "label": "N"
            }
            // console.log("payload:",payload);
            workstreamStore.saveActivityDetails(payload)
                .then((response) => {
                    if (response !== null) {
                        if (!response.error && response.data.resultCode === "OK") {
                            /* notification message for save successful */
                            this.showNotification('saveActivityDetailsSuccess', response.data.resultDescription);
                            this.props.modalCloseHandler();
                        } else if (!response.error && response.data.resultCode === "KO" && response.data.resultDescription === null && response.data.errorDescription !== "") {
                            this.showNotification('saveActivityDetailsErrorForDuplicateCategory', response.data.errorDescription);
                        } else if (!response.error && response.data.resultCode === "KO") {
                            this.showNotification('saveActivityDetailsError', response.data.resultDescription);
                            this.props.modalCloseHandler();
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
                    bodytext={'Please enter valid values and try again.'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'categoryNameInvalid':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please enter category fields with valid values. Special characters [ < ! \' " > ] are invalid'}
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
                console.log("Default");
                break;
        }
    }

    getWSActivityDetails() {
        const { workstreamStore } = this.props;
        const activityId = this.props.activityId
        workstreamStore.getWSActivity(activityId)
            .then((response) => {
                if (response !== null) {
                    if (!response.error && response.data.resultCode === "OK" && response.data.resultObj !== null) {
                        this.setState({
                            activityDetails: response.data.resultObj,
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
                        this.showNotification("deleteKO", res.data.resultDescription);
                    } else {
                        this.showNotification("deleteError");
                    }
                });
        }
    }

    handleAddInformation() {
        const { addedCategories } = this.state;
        let CategsArr = [...addedCategories];
        CategsArr.push({
            "name": '',
            "info": '',
            "isGlobal": 'N'
        })
        this.setState({
            addedCategories: CategsArr
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
        });
        addedCatStateObj.map(addC => {
            if (addC.name) {
                addC.name = addC.name.trim();
            }
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
        let ownerError, descriptionError, departmentError, subDeptError = '';
        switch (id) {
            case "owner": {
                ownerError = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid owner name. Special characters [ < ! \' " > ] are invalid';
                this.setState({ ownerError: ownerError, });
                actDetails.owner = value;
                break;
            }
            case "description": {
                descriptionError = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                this.setState({ descriptionError: descriptionError, });
                actDetails.description = value;
                break;
            }
            case "department": {
                departmentError = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid department. Special characters [ < ! \' " > ] are invalid';
                this.setState({ departmentError: departmentError, });
                actDetails.department = value;
                break;
            }
            case "subDepartment": {
                subDeptError = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid sub department. Special characters [ < ! \' " > ] are invalid';
                this.setState({ subDeptError: subDeptError, });
                actDetails.subDept = value;
                break;
            }
            default:
                console.log("");
                break;
        }
        this.setState({
            activityDetails: { ...actDetails },
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
            activityDetails: actDetailsObj
        });
    }

    categoryInfoHandler = (event, catIndex) => {
        const { activityDetails } = this.state;
        let actDetailsObj = { ...activityDetails };
        let CategsArr = actDetailsObj.categories;
        CategsArr[catIndex].info = event.target.value;
        this.setState({
            activityDetails: actDetailsObj
        });
    }

    categoryGlobalHandler = (event, catIndex) => {
        const { activityDetails } = this.state;
        let actDetailsObj = { ...activityDetails };
        let CategsArr = actDetailsObj.categories;
        CategsArr[catIndex].isGlobal = event.target.checked ? 'Y' : 'N';
        this.setState({
            activityDetails: actDetailsObj
        });
    }

    showCatCheckboxError = (e) => {
        this.showNotification('saveActivityDetailsError', 'This category is available in all of the activities');
    }

    render() {
        const { activityDetails, addedCategories } = this.state;
        const { workstreamStore } = this.props;
        return (
            <Modal id="activityModal" visible={this.props.visible}>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">{this.props.title}</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" src={closeIcon} alt="close" onClick={this.props.modalCloseHandler} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>
                <div className="row form-group reg-form-control">
                    <div className="col-sm-12 col-md-12 col-xs-12">

                        <label className="activity-form-label">Owner</label>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xs-12" >
                        <input type="text" value={activityDetails.owner} id="owner"
                            className="form-control" placeholder="Owner"
                            maxLength="50"
                            onChange={this.handleFieldChange}
                        />
                        <span style={{ color: '#ffffff' }}><small>{this.state.ownerError}</small></span>
                    </div>
                </div>

                <div className="row form-group reg-form-control">
                    <div className="col-sm-6 dept-sm">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="activity-form-label">Department</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >
                            <input type="text" className="form-control" id="department"
                                placeholder="Department"
                                maxLength="50"
                                value={activityDetails.department}
                                onChange={this.handleFieldChange}
                            />
                            <span style={{ color: '#ffffff' }}><small>{this.state.departmentError}</small></span>
                        </div>

                    </div>
                    <div className="col-sm-6 dept-sm">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="activity-form-label">Sub Department</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >
                            <input type="text" className="form-control" id="subDepartment"
                                placeholder="Sub Department"
                                maxLength="50"
                                value={activityDetails.subDept}
                                onChange={this.handleFieldChange}
                            />
                            <span style={{ color: '#ffffff' }}><small>{this.state.subDeptError}</small></span>
                        </div>

                    </div>

                </div>

                <div className="row form-group date-form-control">
                    <div className="col-sm-6 dept-sm">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="activity-form-label">Start Date</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >
                            <div className="ws-date-row">
                                <input type="text" className="form-control"
                                    placeholder="dd-mmm-yyyy"
                                    value={(activityDetails.startDate !== "" && this.isDefined(activityDetails.startDate)) ? Moment(activityDetails.startDate).format('DD-MMM-YYYY') : ""}
                                    disabled
                                />
                                <img src={calIcon} alt="calender"></img>
                            </div>

                        </div>
                    </div>
                    <div className="col-sm-6 dept-sm">
                        <div className="col-sm-12 col-md-12 col-xs-12">

                            <label className="activity-form-label">End Date</label>
                        </div>
                        <div className="col-sm-12 col-md-12 col-xs-12" >

                            <div className="ws-date-row">
                                <input type="text" className="form-control"
                                    placeholder="dd-mmm-yyyy"
                                    value={(activityDetails.endDate !== "" && this.isDefined(activityDetails.endDate)) ? Moment(activityDetails.endDate).format('DD-MMM-YYYY') : ""}
                                    disabled
                                />
                                <img src={calIcon} alt="calender"></img>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="row form-group reg-form-control">
                    <div className="col-sm-12 col-md-12 col-xs-12">

                        <label className="activity-form-label">Description</label>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xs-12" >
                        <textarea type="text" rows="4" className="form-control" id="description"
                            value={activityDetails.description}
                            maxLength="250"
                            onChange={this.handleFieldChange}
                        />
                        {activityDetails && activityDetails.description ?
                            <div className="text-area-counter">{activityDetails.description.length} / 250 character(s)</div>
                            : <div className="text-area-counter"> 0 / 250 character(s)</div>
                        }

                        <span style={{ color: '#ffffff' }}><small>{this.state.descriptionError}</small></span>
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-sm-5 col-md-5 col-xs-5">
                        <label className="activity-form-label" onClick={this.handleAddInformation} style={{ cursor: 'pointer' }}>
                            <img src={circPlusIcon} alt="add"></img> Add more information</label>
                    </div>
                </div>
                {/* Add new Category */}
                {addedCategories && addedCategories.map((cat, catIndex) => (
                    <div key={catIndex} className="form-group reg-form-control">
                        <div className="row">
                            <div className="col-sm-6 col-md-6 col-xs-6" style={{ display: "inline-flex" }}>

                                <input type="text" required name="categoryName" placeholder="Add Category" className="form-control"
                                    value={cat.name}
                                    maxLength="50"
                                    onChange={(e) => { this.addedCategoryNameHandler(e, catIndex) }}
                                />
                            </div>
                            <div className="col-sm-6 col-md-6 col-xs-6 cat-del-binder" >
                                <input type="text" id={catIndex} name="categoryInfo" placeholder="Add Information" className="form-control"
                                    value={cat.info}
                                    maxLength="50"
                                    onChange={(e) => { this.addedCategoryInfoHandler(e, catIndex) }}
                                />
                                <div className="delete-icon">
                                    <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete" className="" disabled={cat.categoryId !== null ? false : true}
                                        onClick={(e) => { this.deleteAddedCategory(e, catIndex) }}
                                    ></img>
                                    <ReactTooltip html={true} />
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row" style={{ display: "inline-flex", paddingLeft: "0" }} >
                            <input type="checkbox" checked={cat.isGlobal === 'Y' ? true : false}
                                onChange={(e) => { this.addedCategoryGlobalHandler(e, catIndex) }}
                                className="activity-checkbox" style={{ marginRight: "10px" }} />
                            <label className="activity-include-text"> Appear in all Activities of the Workstream</label>

                        </div>
                    </div>
                ))
                }
                {activityDetails && Object.keys(activityDetails).length > 0 && activityDetails.categories.length > 0 && activityDetails.categories.map((option, index) => (
                    <div key={option} className="row form-group reg-form-control">
                        <div className="row" style={{ width: '100%', marginLeft: 0 }}>
                            <div className="col-sm-6 col-md-6 col-xs-6" style={{ display: "inline-flex" }}>

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
                                <div className="delete-icon">
                                    <img data-tip="Delete" data-type="dark" src={trashIcon} alt="delete" className="" disabled={option.categoryId !== null ? false : true}
                                        style={{
                                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                        }}
                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteCategory(e, index)}
                                    ></img>
                                    <ReactTooltip html={true} />
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-12 col-md-12 col-xs-12 cat-checkbox-row">


                            {(workstreamStore.WSActivityDetails.categories[index].isParent === "Y" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "Y") &&
                                <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                            }
                            {(workstreamStore.WSActivityDetails.categories[index].isParent === "N" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "N") &&
                                <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                            }
                            {(workstreamStore.WSActivityDetails.categories[index].isParent === "N" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "Y") &&
                                <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? false : false} readOnly={'readonly'} onClick={(e) => { this.showCatCheckboxError(e) }} className="activity-checkbox disabled-cat-box" style={{ marginRight: "10px" }} />
                            }
                            {(workstreamStore.WSActivityDetails.categories[index].isParent === "Y" && workstreamStore.WSActivityDetails.categories[index].isGlobal === "N") &&
                                <input type="checkbox" id={option.categoryId} checked={option.isGlobal === 'Y' ? true : false} onChange={(e) => { this.categoryGlobalHandler(e, index) }} className="activity-checkbox" style={{ marginRight: "10px" }} />
                            }

                            <label className="activity-include-text"> Appear in all Activities of the Workstream</label>


                        </div>

                    </div>
                ))}


                <div className="row form-group ">
                    <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}>
                        <button type="button" style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                            className="btn btn-primary"
                            disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                            onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveActivity}>
                            Save</button>
                    </div>
                </div>

            </Modal>
        );
    }
}

export default withRouter(ActivityDetailsModal);

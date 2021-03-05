import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../../components/Menu/Menu';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import pencil from "../../../assets/admin/pencil.svg";
import ReactTooltip from 'react-tooltip';
import deleteIcon from "../../../assets/newDealsIcons/trashdelete.svg";
import plusIco from "../../../assets/project/fvdt/addRowIcon.svg";
import calendarIcon from "../../../assets/project/fvdt/calendar.svg";
import './OpportunityRequest.css';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import FilterMenu, { SubMenu, MenuItem } from 'rc-menu';
import 'rc-menu/assets/index.css';
import radioSelected from '../../../assets/project_DWS/radio-selected-1.svg'
import radioNotSelected from '../../../assets/project_DWS/radio-not-selected-1.svg';
import filterIcon from '../../../assets/project_DWS/filterIcon.svg';
import eraseIcon from '../../../assets/project_DWS/eraserIcon.svg';

@inject('adminStore', 'editVDTStore')
@observer
class OpportunityRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            oppRequestsList: [],
            IndustriesArray: [],
            OfferingsArray: [],
            selectedIndustry: "",
            offIndMainObj: {},
            showSpinner: false,
            isFilterByOpen: false,
            selectedKeys: [],
            disableSaveBtn: true,
            isSaveLoading:false
            // emailErrIndArr:[]
        }
        this.onIndustryChange = this.onIndustryChange.bind(this)
        this.onOfferingClick = this.onOfferingClick.bind(this);
        this.onOfferingChange = this.onOfferingChange.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onAddClick = this.onAddClick.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);

        this.isDefined = this.isDefined.bind(this);

        this.groupOfIndustries = {};
        this.groupOfOfferings = {};

    }



    componentDidMount() {
        const { editVDTStore, adminStore } = this.props;
        let IndustryArr = [];
        this.fetchOppRequests()
        adminStore.getMasterIndustries()
            .then((res) => {
                if (res.data.resultCode === "OK") {
                    let data = res.data;
                    IndustryArr = [...data.resultObj];
                    this.groupOfIndustries = this.groupBy(IndustryArr, 'indName');
                    this.setState({
                        IndustriesArray: IndustryArr
                    })
                } else if (res.data.resultCode === "KO") {
                    this.showErrorNotification(res.data.errorDescription, 'Error', 'error');
                }

            })


    }
    fetchOppRequests = () => {
        const { adminStore, editVDTStore } = this.props;
        let oppRequestsArr = [];
        this.setState({
            showSpinner: true
        })
        let offeringsGroup = [];
        adminStore.fetchOppRequests()
            .then((res) => {
                if (res.data && res.data.resultCode === "OK") {
                    // get call for offerings
                    editVDTStore.loadOfferings()
                        .then((offResponse) => {
                            if (offResponse.data.resultCode === 'OK') {

                                offeringsGroup = offResponse.data.resultObj.groupedByIndustry
                                oppRequestsArr = res.data.resultObj;
                                oppRequestsArr.map((oppObj, orInd) => {
                                    oppObj["isEditable"] = false;
                                    oppObj['isNewlyAdded'] = false;
                                    oppObj['trackIndex'] = orInd;
                                    if (oppObj.indName && offeringsGroup[oppObj.indName]) {
                                        oppObj['offeringOptionsArray'] = offeringsGroup[oppObj.indName];
                                    } else {
                                        oppObj['offeringOptionsArray'] = []
                                    }
                                });

                                this.setState({
                                    oppRequestsList: oppRequestsArr,
                                    masterReq: oppRequestsArr,
                                    offIndMainObj: offResponse.data.resultObj,
                                    showSpinner: false,
                                    disableSaveBtn: true
                                });
                            } else if (offResponse.data.resultCode === "KO") {
                                this.showErrorNotification(offResponse.data.errorDescription, "Error", "error");
                                // this.setState({
                                //     showSpinner: false
                                // })
                            }
                        });
                } else if (res.data && res.data.resultCode === "KO") {
                    this.showErrorNotification(res.data.errorDescription, "Error", "error");
                    this.setState({
                        showSpinner: false
                    })
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    this.setState({
                        oppRequestsList: oppRequestsArr,
                        showSpinner: false,
                    })
                }
            })
    }
    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'adminpanel':
                history.push('/admin');
                break;
        }
    }
    onIndustryChange = (event, orIndex) => {
        const { oppRequestsList, offIndMainObj } = this.state;
        let tempOppReqList = [...oppRequestsList]
        tempOppReqList[orIndex].indName = event.target.value; //set the indName value

        let tempArr = this.groupOfIndustries[event.target.value];
        tempOppReqList[orIndex].indId = tempArr[0].indId; // set the indId value



        if (!tempOppReqList[orIndex].isNewlyAdded) {
            let tempIndustryObj = offIndMainObj.groupedByIndustry;
            let offeringsList = []
            if (tempIndustryObj && tempIndustryObj[event.target.value]) {
                offeringsList = tempIndustryObj[event.target.value];
            }
            tempOppReqList[orIndex].offeringName = 'Select';
            tempOppReqList[orIndex].offeringMapId = null;
            tempOppReqList[orIndex].offeringOptionsArray = offeringsList; // set the offering options array
        }

        this.setState({
            selectedIndustry: event.target.value,
            oppRequestsList: tempOppReqList
        })
    }
    onOfferingClick = (e, orIndex) => {
        // const { offIndMainObj, oppRequestsList } = this.state;
        // let selectedIndustry = oppRequestsList[orIndex].indName;
        // let tempIndustryObj = offIndMainObj.groupedByIndustry;
        // let offeringsList = []
        // if (tempIndustryObj && tempIndustryObj[selectedIndustry]) {
        //     offeringsList = tempIndustryObj[selectedIndustry];
        // }  
        // oppRequestsList[orIndex].offeringOptionsArray = offeringsList; // set the offering options array
        // this.setState({
        //     oppRequestsList: [...oppRequestsList]
        // });
    }
    onOfferingChange = (event, orIndex) => {
        const { oppRequestsList, offIndMainObj } = this.state;
        let tempOppReqList = [...oppRequestsList]
        tempOppReqList[orIndex].offeringName = event.target.value;
        let ind = tempOppReqList[orIndex].indName;
        let offGroupArray = offIndMainObj.groupedByIndustry[ind];
        offGroupArray.map(each => {
            if (each.projectName === event.target.value) {
                tempOppReqList[orIndex].offeringMapId = each.mapId;
            }
        });
        this.setState({
            selectedIndustry: event.target.value,
            oppRequestsList: tempOppReqList
        })
    }
    onEditClick = (event, orIndex) => {
        const { oppRequestsList } = this.state;
        let tempOppReqList = [...oppRequestsList]
        tempOppReqList[orIndex].isEditable = true
        this.setState({
            oppRequestsList: tempOppReqList,
            disableSaveBtn: false
        })
    }
    onAddClick = () => {
        const { oppRequestsList } = this.state;
        let tempOppReqList = [...oppRequestsList]
        let newOppObj = {
            "oppReqId": null,
            "oppId": null,
            "oppName": null,
            "oppDesc": null,
            "clientName": null,
            "geography": null,
            "indId": null,
            "indName": null,
            "indSegment": null,
            "oppOwnerEmail": null,
            "bdWbse": null,
            "vaStartDate": null,
            "vroSmeId": null,
            "vroSme": null,
            "offeringName": null,
            "offeringMapId": null,
            'offeringName': null,
            "vaStatus": null,
            "chargeWbse": null,
            "vtStartDate": null,
            "vtStatus": null,
            "isEditable": true,
            'isNewlyAdded': true,
            'trackIndex': tempOppReqList.length,
            'offeringOptionsArray': []
        }
        tempOppReqList.push(newOppObj);
        this.setState({
            oppRequestsList: tempOppReqList,
            disableSaveBtn: false
        })

    }
    capitalize = (word) => {
        let result = (word[0].toUpperCase()).concat((word.substring(1, word.length)).toLowerCase());
        return result;
    }
    onChangeHandler = (event, orIndex, type) => {
        const { oppRequestsList } = this.state;
        let tempOppReqList = [...oppRequestsList]

        switch (type) {
            case "oppId":
                tempOppReqList[orIndex].oppId = event.target.value
                break;
            case "oppName":
                tempOppReqList[orIndex].oppName = event.target.value
                break;
            case "oppDesc":
                tempOppReqList[orIndex].oppDesc = event.target.value
                break;
            case "oppOwnerEmail":
                tempOppReqList[orIndex].oppOwnerEmail = event.target.value
                break;
            case "clientName":
                tempOppReqList[orIndex].clientName = event.target.value
                break;
            case "geography":
                tempOppReqList[orIndex].geography = event.target.value
                break;
            case "indSegment":
                tempOppReqList[orIndex].indSegment = event.target.value
                break;
            case "bdWbse":
                tempOppReqList[orIndex].bdWbse = event.target.value
                break;
            // case "vaStartDate":
            //     tempOppReqList[orIndex].vaStartDate = event.target.value
            //     break;
            case "vroSme":
                tempOppReqList[orIndex].vroSme = event.target.value
                break;
            case "vaStatus":
                tempOppReqList[orIndex].vaStatus = event.target.value
                break;
            case "chargeWbse":
                tempOppReqList[orIndex].chargeWbse = event.target.value
                break;
            // case "vtStartDate":

            //     tempOppReqList[orIndex].vtStartDate = event.target.value
            //     break;
            case "vtStatus":
                tempOppReqList[orIndex].vtStatus = event.target.value
                break;

        }
        this.setState({
            oppRequestsList: tempOppReqList
        })
    }
    handleStartDate = (date, orIndex, type) => {
        const { oppRequestsList } = this.state;
        let tempOppReqList = [...oppRequestsList];

        let formatDate = ((date === "" || date === null) ? null : Moment(date).format('DD-MM-YYYY'));

        switch (type) {
            case "vaStartDate":
                tempOppReqList[orIndex].vaStartDate = formatDate
                break;
            case "vtStartDate":
                tempOppReqList[orIndex].vtStartDate = formatDate
                break;
        }
        this.setState({
            oppRequestsList: tempOppReqList
        })
    }

    /* filterBy VA and VT handlers start*/
    handleFilterBy = () => {
        this.setState({
            isFilterByOpen: true
        }, () => {
            document.addEventListener('click', this.closeFilter);
        })
    }

    closeFilter = (event) => {
        this.setState({
            isFilterByOpen: false,
        }, () => {
            document.removeEventListener('click', this.closeFilter);
        })
    }

    handleInnerMenu = (event) => {
        this.setState({
            selectedKeys: event.keyPath,
        }, () => {
            this.handleFilterByChoice(this.state.selectedKeys[0])
        });
    }

    handleFilterBySubMenu = (event) => {
        this.setState({
            isFilterByOpen: false,
        });
    }

    handleFilterByChoice = (filterBy) => {
        const { masterReq } = this.state;
        let dupList = masterReq, filteredArray = [];
        if (filterBy !== "" && filterBy.split('-')[0] === 'VA') {
            filteredArray = dupList.filter(row => row.vaStatus === (filterBy.split('-')[1]).toUpperCase());
        } else {
            filteredArray = dupList.filter(row => row.vtStatus === (filterBy.split('-')[1]).toUpperCase());
        }
        this.setState({
            oppRequestsList: [...filteredArray]
        })
    }

    handleClearSelection = () => {
        const { masterReq } = this.state;
        this.setState({
            oppRequestsList: [...masterReq],
            selectedKeys: [],
        })
    }
    /* filterBy VA and VT handlers end */
    //utility functions

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

    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    isDefinedNonEmpty = (value) => {
        return value !== undefined && value !== null && value.toString().trim() !== '';
    }

    isValidString = (value) => {
        return !RegExp(/[<>!'"[\]]/).test(value);
    }

    // Accepts the array and key
    groupBy = (array, key) => {
        // Return the end result
        return array.reduce((result, currentValue) => {
            // If an array already present for key, push it to the array. Else create an array and push the object
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue
            );
            // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
            return result;
        }, {}); // empty object is the initial value for result object
    };


    // Start of delete handlers
    onDeleteHandler = (event, orInd, oppObj) => {
        event.preventDefault();
        const { oppRequestsList } = this.state;


        if (this.isDefinedNonEmpty(oppObj.oppReqId)) {
            this.openDeleteUserConfirmModal('Are you sure you want to delete it ?', orInd, oppObj);
        }
        else {
            let newOppRequestList = []
            let tempOppReqList = [...oppRequestsList];
            let newRowsCount = 0;

            tempOppReqList && tempOppReqList.map((oppReq, index) => {
                if (index !== orInd) {
                    newOppRequestList.push(oppReq);
                    if (oppReq.isEditable) {
                        newRowsCount = newRowsCount + 1
                    }
                }
            })

            this.setState({
                oppRequestsList: newOppRequestList,
                disableSaveBtn: newRowsCount === 0
            })
        }
    }

    openDeleteUserConfirmModal = (title, id, oppObj) => {
        this.setState({
            deleteUserModalVisible: true,
            deleteUserModalTitle: title,
            deleteUserIndex: id,
            deleteUserOppReId: oppObj.oppReqId,
        });
    }

    closeDeleteUserConfirmModal = (isYesClicked) => {

        this.setState({
            deleteUserModalVisible: false,
            deleteUserModalTitle: '',
        });
        if (isYesClicked) {
            //new delete function
            this.setState({ isDelete: true, showSpinner: true })
            this.deleteUserConfirm();
        } else {
            this.setState({
                deleteUserIndex: '',
                deleteUserOppReId: '',
                isDelete: false
            });
        }
    }

    deleteUserConfirm() {

        const { adminStore } = this.props;
        const { deleteUserIndex, deleteUserOppReId } = this.state;

        let payload = {
            "deleteOppRequestIdList": [deleteUserOppReId]
        }

        adminStore.deleteOppRequest(payload)
            .then(response => {
                if (!response.error && response.data.resultCode === 'OK') {
                    this.showErrorNotification("Opportunity Request deleted successfully", "Success", "success");
                    // this.props.modalCloseHandler();
                    this.setState({
                        deleteUserOppReId: '',
                        deleteUserIndex: '',
                    })
                    this.fetchOppRequests();
                } else if (response && response.data.resultCode === 'KO') {
                    this.setState({
                        showSpinner: false
                    });
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                }
            });
    }
    // End of delete handlers

    // save or update opp requests functions

    handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            switch (type) {
                case 'save':
                    this.saveOppRequests(e);
                    break;
                default:
                    break;
            }
        }
    }

    checkForMandatory = (oppReqList) => {
        let mandatoryErrorInd = [];
        let inValidStringErrorInd = [];
        oppReqList.map((eachOrObj, orInd) => {

            if (this.isDefinedNonEmpty(eachOrObj.oppId)) {

                if (this.isValidString(eachOrObj.oppId) && this.isValidString(eachOrObj.oppName) && this.isValidString(eachOrObj.oppDesc)
                    && this.isValidString(eachOrObj.oppOwnerEmail) && this.isValidString(eachOrObj.clientName) && this.isValidString(eachOrObj.geography)
                    && this.isValidString(eachOrObj.indSegment) && this.isValidString(eachOrObj.bdWbse) && this.isValidString(eachOrObj.vroSme)) {

                } else {
                    inValidStringErrorInd.push(eachOrObj.trackIndex);
                }

            } else {
                mandatoryErrorInd.push(eachOrObj.trackIndex);
            }

        });
        let obj = {
            mandatoryErrorInd: mandatoryErrorInd,
            inValidStringErrorInd: inValidStringErrorInd
        }
        return obj;
    }
    validateEmail = (oppReqList) => {
        let errorInd = [];
        oppReqList.map((eachOrObj, orInd) => {
            if (!(this.isEmailValid(eachOrObj.oppOwnerEmail) && this.isEmailValid(eachOrObj.vroSme))) {
                errorInd.push(eachOrObj.trackIndex);
            }
        });
        return errorInd;
    }
    isEmailValid = (email) => {
        if (this.isDefined(email)) {
            let value = email.toLowerCase();
            var res = value.substring(value.length, value.length - 14);
            let isVaild = (((res === "@accenture.com") && RegExp(/^[0-9A-Za-z.@]*$/).test(value) && value !== '@accenture.com') || value === "" ? true : false);
            return isVaild;
        }
        else {
            return true;
        }

    }
    // isValidEmail = (value,orIndex) => {
    //     const {emailErrIndArr} = this.state;
    //     if(emailErrIndArr.length>0 && ( emailErrIndArr.indexOf(orIndex) !== -1 &&  !this.isEmailValid(value))){
    //         return true;
    //     }
    //     else{
    //         return false;
    //     }
    // }

    saveOppRequests = (e) => {
        const { oppRequestsList, offIndMainObj } = this.state;
        const { adminStore } = this.props;

        let allOppReqList = JSON.parse(JSON.stringify(oppRequestsList));
        let editedReqList = []
        allOppReqList.map(orObj => {
            if (orObj.isEditable) {
                editedReqList.push(orObj);
            }
        });

        if (editedReqList.length > 0) { // check if any row is made editable
            let errorObj = this.checkForMandatory(editedReqList);
            let emailErrRowsArray = this.validateEmail(editedReqList);

            if (errorObj.mandatoryErrorInd.length !== 0) { //check for mandatory field
                this.showErrorNotification("Please enter opportunity id", "Error", "error");
            } else if (emailErrRowsArray.length !== 0) {
                this.setState({
                    emailErrIndArr: emailErrRowsArray
                })
                this.showErrorNotification('Please enter valid accenture email id for Owner and CN VRO SME.', "Error", "error");
            } else if (errorObj.inValidStringErrorInd.length !== 0) { // check for invalid characters
                this.showErrorNotification("Please enter valid values. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            } else {

                let payloadArray = [];
                this.setState({
                    isSaveLoading:true
                })
                editedReqList.map(oppObj => {

                    let payloadObj = {
                        "oppReqId": oppObj.oppReqId,
                        "oppId": oppObj.oppId ? oppObj.oppId.trim() : oppObj.oppId,
                        "oppName": oppObj.oppName ? oppObj.oppName.trim() : oppObj.oppName,
                        "oppDesc": oppObj.oppDesc ? oppObj.oppDesc.trim() : oppObj.oppDesc,
                        "clientName": oppObj.clientName ? oppObj.clientName.trim() : oppObj.clientName,
                        "geography": oppObj.geography ? oppObj.geography.trim() : oppObj.geography,
                        "indId": oppObj.indId ? oppObj.indId + ''.trim() : oppObj.indId,
                        "indName": oppObj.indName ? oppObj.indName.trim() : oppObj.indName,
                        "indSegment": oppObj.indSegment ? oppObj.indSegment.trim() : oppObj.indSegment,
                        "oppOwnerEmail": oppObj.oppOwnerEmail ? oppObj.oppOwnerEmail.trim() : oppObj.oppOwnerEmail,
                        "bdWbse": oppObj.bdWbse ? oppObj.bdWbse.trim() : oppObj.bdWbse,
                        "vaStartDate": oppObj.vaStartDate,
                        "vroSmeId": oppObj.vroSmeId ? oppObj.vroSmeId.toString().trim() : oppObj.vroSmeId,
                        "vroSme": oppObj.vroSme ? oppObj.vroSme.trim() : oppObj.vroSme,
                        "offeringMapId": oppObj.offeringMapId ? oppObj.offeringMapId : null,
                        'offeringName': oppObj.offeringName ? oppObj.offeringName === 'Select' ? null : oppObj.offeringName.trim() : oppObj.offeringName,
                        "vaStatus": oppObj.vaStatus ? oppObj.vaStatus.trim() : null,
                        "chargeWbse": oppObj.chargeWbse ? oppObj.chargeWbse.trim() : null,
                        "vtStartDate": oppObj.vtStartDate,
                        "vtStatus": oppObj.vtStatus ? oppObj.vtStatus.trim() : null,
                    }

                    payloadArray.push(payloadObj);

                });
                adminStore.saveOppRequests(payloadArray)
                    .then(response => {
                        if (!response.error && response.data.resultCode === 'OK') {
                            this.showErrorNotification("Opportunity Requests saved successfully", "Success", "success");
                            // this.props.modalCloseHandler();
                            this.setState({
                                isSaveLoading:false
                            });
                            this.fetchOppRequests();
                        } else if (response && response.data.resultCode === 'KO') {
                            this.setState({
                                showSpinner: false,
                                isSaveLoading:false
                            });
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                        } else {
                            this.setState({
                                isSaveLoading:false
                            });
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        }
                    });
            }
        }

    }

    render() {
        const { oppRequestsList, IndustriesArray, OfferingsArray, showSpinner, isFilterByOpen, selectedKeys,isSaveLoading } = this.state
        return (
            <Fragment>
                <Menu />
                <div className="container-fluid" id="opp_req" style={{ paddingRight: '0px' }}>
                    <div className="row" style={{ backgroundColor: '#3B3B3B' }} >
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>
                                    <li className="breadcrumb-item active" aria-current="page">Opportunity / Program Delivery Requests</li>
                                </ol>
                            </nav>
                        </div>
                    </div>


                    <div className='row col-sm-12' style={{ padding: "0px 20px 0px 40px" }}>

                        <div className="page-header-row accessHeader" style={{ display: 'flex', justifyContent: 'space-between' }}>

                            <div style={{ paddingleft: '-15px' }}><label className="page-header-label">Opportunity / Program Delivery Requests</label></div>
                            <div style={{ float: "right" }} className="opp-req-filterBy" >
                                <img src={filterIcon} alt=""
                                    style={{ marginRight: '12px' }}
                                    className={`${((oppRequestsList && oppRequestsList.length) > 0 || selectedKeys.length > 0) ? 'filter-enabled' : 'filter-disabled'}`}
                                    data-tip="" data-for="filter_opp-req" data-type="dark"
                                    onClick={(oppRequestsList.length > 0 || selectedKeys.length > 0) ? this.handleFilterBy : () => { }}
                                    id="filter_icon" name="filter"
                                    data-class="filter-tooltip-placement"
                                />
                                <ReactTooltip id="filter_opp-req">
                                    <span>Filter By</span>
                                </ReactTooltip>
                                <img src={eraseIcon} alt=""
                                    className={`${(selectedKeys && selectedKeys.length !== 0) ? 'filter-enabled' : 'filter-disabled'}`}
                                    data-tip="" data-for="clear_filter" data-type="dark" data-place="left"
                                    onClick={this.handleClearSelection}
                                    id="clear_all" name="clear_all"
                                />
                                <ReactTooltip id="clear_filter">
                                    <span>Clear all selections</span>
                                </ReactTooltip>
                                {isFilterByOpen ?
                                    <FilterMenu
                                        className="filterBy-menu"
                                        direction='rtl'
                                        selectedKeys={selectedKeys}
                                        onSelect={this.handleInnerMenu}
                                    >
                                        <SubMenu
                                            id="Approve/ Reject VA"
                                            onClick={this.handleFilterBySubMenu}
                                            style={{ background: "#505050" }}
                                            title={<div className="main-menu"><span style={{ marginLeft: '12px' }}>Approve/ Reject VA</span>
                                                {(selectedKeys && selectedKeys.length > 0 && selectedKeys[0].split('-')[0] === "VA") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </div>} key="VA">
                                            <MenuItem
                                                id="Approve VA"
                                                onClick={this.handleInnerMenu}
                                                key="VA-Approved"
                                            ><div className="sub-menu">Approved<span>
                                                {(selectedKeys && selectedKeys[0] === "VA-Approved") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                            <MenuItem
                                                id="Reject VA"
                                                key="VA-Rejected"
                                                onClick={this.handleInnerMenu}
                                            ><div className="sub-menu">Rejected<span>
                                                {(selectedKeys && selectedKeys[0] === "VA-Rejected") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                        </SubMenu>
                                        <SubMenu
                                            id="Approve/ Reject VT"
                                            onClick={this.handleFilterBySubMenu}
                                            title={<div className="main-menu"><span style={{ marginLeft: '12px' }}>Approve/ Reject VT</span>
                                                {(selectedKeys && selectedKeys.length > 0 && selectedKeys[0].split('-')[0] === "VT") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </div>} key="VT">
                                            <MenuItem
                                                id="Approve VT"
                                                onClick={this.handleInnerMenu}
                                                key="VT-Approved"
                                            ><div className="sub-menu">Approved<span>
                                                {(selectedKeys && selectedKeys[0] === "VT-Approved") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                            <MenuItem
                                                id="Reject VT"
                                                key="VT-Rejected"
                                                onClick={this.handleInnerMenu}
                                            ><div className="sub-menu">Rejected<span>
                                                {(selectedKeys && selectedKeys[0] === "VT-Rejected") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                        </SubMenu>
                                    </FilterMenu> : ""}
                            </div>
                        </div>

                    </div>
                    <div className="row col-sm-12 accessTableHead" >


                        <div className="accessTable opp-req-table-main">
                            {/* <div className="vdt-table" > */}
                            {showSpinner ?
                                <div className="row justify-content-center spinner-div">
                                    <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff' }}></i>
                                </div> :
                                selectedKeys.length > 0 && oppRequestsList.length === 0 ?
                                    <div className="row justify-content-center spinner-div">
                                        <p className="no-records">No records found!</p>
                                    </div> :
                                    <Fragment>
                                        <div id="opp_req_table_scroll" className="table-responsive horizontal-scroll-except-first-column">
                                            <table className="opp-req-table table">
                                                <thead style={{ whiteSpace: 'nowrap' }}>
                                                    <tr>
                                                        <th className="fixed-left border-right-0"> <div className="opp-side-heading" style={{ lineHeight: "25px" }}>Opportunity / Program Delivery</div>
                                                            <th className="sub-th border-left-only">ID</th>
                                                            <th className="sub-th">Name</th>
                                                            <th className="sub-th desc-cell">Description</th>
                                                            <th className="sub-th border-right-only">Owner</th>
                                                        </th>
                                                        <th>Client Name</th>
                                                        <th >Geography</th>
                                                        <th >Industry</th>
                                                        <th >BD<br /> WBSE</th>
                                                        <th>VA Start<br />Date </th>
                                                        <th>CN VRO<br />SME</th>
                                                        <th>Offering<br />Name</th>
                                                        <th>Approve/<br />Reject VA</th>
                                                        <th>Chargeable<br />WBSE </th>
                                                        <th>VT Start<br />Date </th>
                                                        <th>Approve/<br />Reject VT </th>
                                                        <th className="border-right-0">
                                                            <th className="right-sub-th" >Action</th>
                                                        </th>

                                                    </tr>
                                                </thead>
                                                <tbody >
                                                    {oppRequestsList && oppRequestsList.map((oppReqObj, orIndex) => (
                                                        <Fragment>
                                                            <tr>
                                                                <td className="fixed-left border-right-0 border-top-0">
                                                                    <td className="sub-td border-left-only" id={oppReqObj.oppId + '_oppId'}>
                                                                        {oppReqObj.isEditable ? <input type="text" id={'oppId_' + orIndex} maxLength="100" className="input" value={oppReqObj.oppId} onChange={(e) => this.onChangeHandler(e, orIndex, "oppId")} /> : <p>{oppReqObj.oppId}</p>}
                                                                    </td>
                                                                    <td className="sub-td" id={oppReqObj.oppId + '_oppName'}>
                                                                        {oppReqObj.isEditable ? <input type="text" id={'oppName_' + orIndex} maxLength="100" className="input" value={oppReqObj.oppName} onChange={(e) => this.onChangeHandler(e, orIndex, "oppName")} /> : <p>{oppReqObj.oppName}</p>}
                                                                    </td>
                                                                    <td className="sub-td desc-cell" id={oppReqObj.oppId + '_oppDesc'}
                                                                        data-tip={oppReqObj.oppDesc}
                                                                        data-for={oppReqObj.oppId + 'td_oppDesc'}
                                                                        data-place="top">
                                                                        {oppReqObj.isEditable ? <input className="input desc-input" type="text" id={'oppDesc_' + orIndex} maxLength="250" value={oppReqObj.oppDesc} onChange={(e) => this.onChangeHandler(e, orIndex, "oppDesc")} /> : <p className="desc-input">{oppReqObj.oppDesc}</p>}

                                                                    </td>
                                                                    <td className="sub-td border-right-only" id={oppReqObj.oppId + '_oppOwnerEmail'}>
                                                                        {oppReqObj.isEditable ?
                                                                            <input type="text" maxLength="100" id={'oppOwnerEmail_' + orIndex} className="input" value={oppReqObj.oppOwnerEmail}
                                                                                // style={{
                                                                                //     border:(this.isValidEmail(oppReqObj.oppOwnerEmail,orIndex) ? "1px solid #a24f4f":""),
                                                                                //     boxShadow:(this.isValidEmail(oppReqObj.oppOwnerEmail,orIndex) ? "0px 0px 2px 1px #a24f4f":""),
                                                                                // }}
                                                                                onChange={(e) => this.onChangeHandler(e, orIndex, "oppOwnerEmail")} />
                                                                            : <p>{oppReqObj.oppOwnerEmail}</p>}
                                                                    </td>
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppCientName'}>
                                                                    {oppReqObj.isEditable ? <input type="text" id={'oppCientName_' + orIndex} maxLength="100" className="input" value={oppReqObj.clientName} onChange={(e) => this.onChangeHandler(e, orIndex, "clientName")} /> : <p>{oppReqObj.clientName}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppGeography'}>
                                                                    {oppReqObj.isEditable ? <input type="text" id={'oppGeography_' + orIndex} maxLength="100" className="input" value={oppReqObj.geography} onChange={(e) => this.onChangeHandler(e, orIndex, "geography")} /> : <p>{oppReqObj.geography}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppIndName'}>
                                                                    {oppReqObj.isEditable ?
                                                                        <select tabIndex="2" className="kpi-trend-select"
                                                                            defaultValue="Select"
                                                                            className="input"
                                                                            value={oppReqObj.indName}
                                                                            onChange={(e) => { this.onIndustryChange(e, orIndex) }}
                                                                            id="access-control-filter"
                                                                            name={'oppIndName_' + orIndex}

                                                                        >
                                                                            <option value="Select" selected disabled>Select</option>
                                                                            {IndustriesArray && IndustriesArray.map((IndustryObj) => (
                                                                                <option value={IndustryObj.indName}>{IndustryObj.indName}</option>
                                                                            ))}


                                                                        </select>
                                                                        : <p>{oppReqObj.indName}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppBdWBSE'}>
                                                                    {oppReqObj.isEditable ? <input type="text" id={'oppBdWBSE_' + orIndex} maxLength="100" className="input" value={oppReqObj.bdWbse} onChange={(e) => this.onChangeHandler(e, orIndex, "bdWbse")} /> : <p>{oppReqObj.bdWbse}</p>}
                                                                </td>

                                                                <td id={oppReqObj.oppId + '_oppVdStartDate'}>
                                                                    {oppReqObj.isEditable ?
                                                                        <div className="date-wrapper">
                                                                            <DatePicker
                                                                                value={(oppReqObj.vaStartDate !== null) ? new Date(Moment(oppReqObj.vaStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD')) : null}
                                                                                selected={oppReqObj.vaStartDate !== null ? new Date(Moment(oppReqObj.vaStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD')) : null}
                                                                                placeholder="Awaited"
                                                                                onChange={(date) => this.handleStartDate(date, orIndex, "vaStartDate")}
                                                                                dateFormat="dd-MMM-yyyy"
                                                                                showMonthDropdown
                                                                                showYearDropdown
                                                                                fixedHeight
                                                                                popperModifiers={{
                                                                                    offset: {
                                                                                        enabled: true,
                                                                                        offset: "5px, 10px"
                                                                                    },
                                                                                    preventOverflow: {
                                                                                        enabled: true,
                                                                                        escapeWithReference: false,
                                                                                        boundariesElement: "viewport"
                                                                                    }
                                                                                }}
                                                                                useShortMonthInDropdown
                                                                                className="input dateInput"
                                                                                required={true}
                                                                                id={'oppVdStartDate_' + orIndex}
                                                                            />
                                                                            <img src={calendarIcon} alt='calendarIcon' className="calendar-img" />
                                                                        </div>


                                                                        : <p><span >{oppReqObj.vaStartDate === null ? null : Moment(oppReqObj.vaStartDate, 'DD-MM-YYYY').format('DD-MMM-YYYY')}</span>
                                                                            <img src={calendarIcon} alt='calendarIcon' className="calendar-img" /></p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppVroSME'}>
                                                                    {oppReqObj.isEditable ? <input type="text" id={'oppVroSME_' + orIndex} maxLength="100" className="input" value={oppReqObj.vroSme} onChange={(e) => this.onChangeHandler(e, orIndex, "vroSme")}
                                                                    // style={{
                                                                    //     border:(this.isValidEmail(oppReqObj.vroSme,orIndex) ? "1px solid #ae5252;":""),
                                                                    //     boxShadow:(this.isValidEmail(oppReqObj.vroSme,orIndex) ? "0px 0px 2px 1px #ae5252;":""),
                                                                    // }}
                                                                    /> : <p>{oppReqObj.vroSme}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppOfferingArray'}>
                                                                    {(oppReqObj.isEditable && (!oppReqObj.isNewlyAdded)) ?
                                                                        <select tabIndex="2" className="kpi-trend-select"
                                                                            defaultValue="Select"
                                                                            className="input"
                                                                            value={oppReqObj.offeringName}
                                                                            onClick={(e) => { this.onOfferingClick(e, orIndex) }}
                                                                            onChange={(e) => { this.onOfferingChange(e, orIndex) }}
                                                                            id="access-control-filter"
                                                                            name={'oppOfferingArray_' + orIndex}

                                                                        >
                                                                            <option value="Select" selected disabled>Select</option>
                                                                            {oppReqObj.offeringOptionsArray.map((OfferingObj) => (
                                                                                <option value={OfferingObj.projectName}>{OfferingObj.projectName}</option>
                                                                            ))}

                                                                        </select>
                                                                        : <p>{oppReqObj.offeringName}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppVaStatusList'}>
                                                                    {(oppReqObj.isEditable && (oppReqObj.offeringName !== null && oppReqObj.offeringName !== "Select")) ?
                                                                        <select tabIndex="2" className="kpi-trend-select"
                                                                            defaultValue="Select"
                                                                            className="input"
                                                                            value={oppReqObj.vaStatus}
                                                                            onChange={(e) => this.onChangeHandler(e, orIndex, "vaStatus")}
                                                                            id="access-control-filter"
                                                                            name={'oppVaStatusList_' + orIndex}

                                                                        >
                                                                            <option value="Select" selected disabled>Select</option>
                                                                            <option value="APPROVED">Approved</option>
                                                                            <option value="REJECTED">Rejected</option>

                                                                        </select>
                                                                        : <p>{!this.isDefinedNonEmpty(oppReqObj.vaStatus) ? oppReqObj.vaStatus : this.capitalize(oppReqObj.vaStatus)}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppChargeWbse'}>
                                                                    {(oppReqObj.isEditable && (oppReqObj.vaStatus === "APPROVED")) ? <input type="text" id={'oppChargeWbse_' + orIndex} maxLength="100" className="input" placeholder="Awaited" value={oppReqObj.chargeWbse} onChange={(e) => this.onChangeHandler(e, orIndex, "chargeWbse")} /> : <p>{oppReqObj.chargeWbse}</p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppVtStartDate'}>
                                                                    {(oppReqObj.isEditable && (oppReqObj.vaStatus === "APPROVED")) ?
                                                                        <div className="date-wrapper">
                                                                            <DatePicker
                                                                                value={oppReqObj.vtStartDate !== null ? new Date(Moment(oppReqObj.vtStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD')) : null}
                                                                                selected={oppReqObj.vtStartDate !== null ? new Date(Moment(oppReqObj.vtStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD')) : null}

                                                                                placeholder="Awaited"
                                                                                onChange={(date) => this.handleStartDate(date, orIndex, "vtStartDate")}
                                                                                dateFormat="dd-MMM-yyyy"
                                                                                showMonthDropdown
                                                                                showYearDropdown
                                                                                fixedHeight
                                                                                popperModifiers={{
                                                                                    offset: {
                                                                                        enabled: true,
                                                                                        offset: "5px, 10px"
                                                                                    },
                                                                                    preventOverflow: {
                                                                                        enabled: true,
                                                                                        escapeWithReference: false,
                                                                                        boundariesElement: "viewport"
                                                                                    }
                                                                                }}
                                                                                useShortMonthInDropdown
                                                                                // className="input-Ben-actuals-target date-Input"
                                                                                className="input dateInput"
                                                                                required={true}
                                                                                id={'oppVtStartDate_' + orIndex}
                                                                            />
                                                                            <img src={calendarIcon} alt='calendarIcon' className="calendar-img" />
                                                                        </div>


                                                                        : <p><span >{oppReqObj.vtStartDate === null ? null : Moment(oppReqObj.vtStartDate, 'DD-MM-YYYY').format('DD-MMM-YYYY')}</span>
                                                                            <img src={calendarIcon} alt='calendarIcon' className="calendar-img" /></p>}
                                                                </td>
                                                                <td id={oppReqObj.oppId + '_oppVtStatus'}>
                                                                    {(oppReqObj.isEditable && (oppReqObj.vaStatus === "APPROVED" && oppReqObj.chargeWbse !== null && oppReqObj.chargeWbse !== "" && oppReqObj.vtStartDate !== null && oppReqObj.vtStartDate !== "")) ?
                                                                        <select tabIndex="2" className="kpi-trend-select"
                                                                            defaultValue="Select"
                                                                            className="input"
                                                                            value={oppReqObj.vtStatus}
                                                                            onChange={(e) => this.onChangeHandler(e, orIndex, "vtStatus")}
                                                                            id="access-control-filter"
                                                                            name={'oppVtStatus_' + orIndex}
                                                                        >
                                                                            <option value="Select" selected disabled>Select</option>
                                                                            <option value="APPROVED ">Approved</option>
                                                                            <option value="REJECTED">Rejected</option>

                                                                        </select>
                                                                        : <p>{!this.isDefinedNonEmpty(oppReqObj.vtStatus) ? oppReqObj.vtStatus : this.capitalize(oppReqObj.vtStatus)}</p>}
                                                                </td>
                                                                <td className="border-right-0 border-top-0" id={oppReqObj.oppId + '_editDelete'}>
                                                                    <td className="right-sub-td">
                                                                        <img src={pencil} alt="edit" className="edit-img" data-for="edit-opp" data-place="top" data-tip="Edit" id={'editIcon_' + orIndex}
                                                                            onClick={(e) => { this.onEditClick(e, orIndex) }}
                                                                        />

                                                                        <img src={deleteIcon} alt="delete" className="delete-img" data-for="delete-opp" data-place="top" data-tip="Delete" id={'deleteIcon_' + orIndex}
                                                                            onClick={(e) => { this.onDeleteHandler(e, orIndex, oppReqObj) }} />


                                                                    </td>
                                                                </td>

                                                            </tr>
                                                            <ReactTooltip id={oppReqObj.oppId + 'td_oppDesc'}  className="tooltip-class opp" />
                                                        </Fragment>
                                                    ))}

                                                </tbody>
                                            </table>
                                            <ReactTooltip id="edit-opp" className="tooltip-class" />
                                            <ReactTooltip id="delete-opp" className="tooltip-class" />

                                        </div>
                                        <div className="row no-gutters add-row">
                                            <img src={plusIco} alt="plus" className="add-img" data-for="add-opp" data-place="right" data-tip="Add Row"
                                                onClick={this.onAddClick}
                                            />
                                            <ReactTooltip id="add-opp" className="tooltip-class" />
                                        </div>
                                        <div className="row no-gutters save-div">
                                          {isSaveLoading?
                                            <button type="submit" alt="save"
                                            disabled
                                            className="btn btn-primary">
                                            Saving
                                            <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',marginLeft:"8px" }}></i>
                                            </button> :
                                            <button type="submit" alt="save"
                                                disabled={(oppRequestsList && oppRequestsList.length === 0) || this.state.disableSaveBtn}
                                                className="btn btn-primary"
                                                onClick={oppRequestsList && oppRequestsList.length === 0 ? () => { } : (e) => { this.saveOppRequests(e) }}
                                                onKeyDown={oppRequestsList && oppRequestsList.length === 0 ? () => { } : (e) => { this.handleKeyDown(e, 'save') }}
                                            >Save
                                        </button>
                                        }
                                    
                                      
                                       

                                        </div>


                                    </Fragment>

                            }
                            {/* </div> */}

                        </div>

                    </div>
                </div>
                { this.state.deleteUserModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'client-master-delete-modal'}
                        isModalVisible={this.state.deleteUserModalVisible}
                        modalTitle={this.state.deleteUserModalTitle}
                        closeConfirmModal={this.closeDeleteUserConfirmModal}
                    /> : ''}
            </Fragment >

        )
    }
}

export default withRouter(OpportunityRequest);

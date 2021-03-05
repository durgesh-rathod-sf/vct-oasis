import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../../components/Menu/Menu';
import UserForm from '../UserForm/UserForm';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import pencil from "../../../assets/admin/pencil.svg";
import trash from "../../../assets/admin/trash.svg";
import save from "../../../assets/admin/save.svg";
import ReactTooltip from 'react-tooltip';
import MultiSelect from "react-multi-select-component";
import DatePicker from "react-datepicker";
import calendarIcon from "../../../assets/project/fvdt/calendar.svg";
import './AccessManagement.css';
import DashBoardUtils from '../../../containers/Dashboards/DashboardUtils';
import Select from 'react-select';
var SessionStorage = require('store/storages/sessionStorage');


const defaultStyle = {
    container: () => ({ width: "320px" }),
    control: (base) => ({
        ...base, color: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '2px', textAlign: 'left', backgroundColor: '#5A5A5A',
        borderColor: 'rgba(255, 255, 255, 0.8)', minHeight: '32px',
        '&:hover': { borderColor: 'rgba(255, 255, 255, 0.8)' }
    }),
    indicatorSeparator: (base) => ({ ...base, display: 'none' }),
    menu: (base) => ({
        ...base, width: "200px", fontSize: '12px', marginTop: 0, borderRadius: '2px',
        paddingTop: 0, paddingBottom: 0,
    }),
    indicatorsContainer: (base) => ({ ...base, padding: 0 }),
    menuList: (base) => ({
        ...base, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'left',
        height: '210px', backgroundColor: '#5A5A5A', border: '1px solid rgba(255, 255, 255, 0.8)',
    }),
    dropdownIndicator: (base) => ({
        ...base, padding: 0, paddingRight: '2px', color: 'rgba(255, 255, 255, 0.8)',
        '&:hover': { color: '#fff' }, '& svg': { width: 14, height: 14 }
    }),
    option: (base) => ({ ...base, padding: 0, paddingTop: '5px', paddingLeft: "10px", }),
    // placeholder: (base) => ({...base, color: 'rgba(255, 255, 255, 0.8)'}),
    '&:hover': { backgroundColor: '#595959' },
    singleValue: (base) => ({ ...base, color: 'rgba(255, 255, 255, 0.8)' }),

}


@inject('adminStore')
@observer
class AccessManagement extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            userDetails: '',
            editUser: false,
            userId: '',
            userName: '',
            userType: '',
            loadTable: false,
            noMatchData: false,
            deleteUserModalVisible: false,
            deleteUserModalTitle: '',
            deleteUserIndex: '',
            userTypeToDisplay: '',
            showSpinner: false,
            isUserTypeUpdated: false,
            isDelete: false,
            selectedIndustryValues: [],
            industryList: [],
            refreshNewUserDetails: false,
            isId: 'internalUser',
            endDate: new Date(),
            userTypeSelected: 'Accenture',
            accountNamesList: [],
            isAccountNamesLoading: false,
            nonAccentureFilterOptions: [],
            selectedAccountName: "",
            isUpdateLoading: false
        }
        this.deleteHandler = this.deleteHandler.bind(this);
        this.editHandler = this.editHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
        this.searchAccount = this.searchAccount.bind(this);
        this.deleteUserConfirm = this.deleteUserConfirm.bind(this);
        this.openDeleteUserConfirmModal = this.openDeleteUserConfirmModal.bind(this);
        this.closeDeleteUserConfirmModal = this.closeDeleteUserConfirmModal.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }
    accessList = [];
    enabledUserTypeforEdit = [];
    userTypeSelected = 'Accenture'

    customIndustryValueRenderer = (e, index) => {
        return this.state.selectedIndustryValues !== undefined && this.state.selectedIndustryValues.length > 1
            ? "Multiple"
            : ""

    };

    getMasterIndustries = () => {
        const { adminStore } = this.props;
        if (this.state.industryList.length === 0) {
            adminStore.getMasterIndustries()
                .then(response => {
                    if (response && response.data && !response.error && response.data.resultCode === 'OK') {
                        let industriesList = [];
                        response.data.resultObj.map((data, index) => {
                            let industry = { value: data.indId, label: data.indName }
                            industriesList.push(industry);
                        });
                        this.setState({
                            industryList: industriesList,
                        })
                    }else if(response && response.data && response.data.resultCode === 'KO'){
                        this.showErrorNotification(response.data.errorDescription)
                    }
                    
                });
        }
    }

    setIndustrySelected = (selected, objInd) => {

        /* const { userDetails } = this.state;
         let objListArr = [...userDetails];
         objListArr[objInd].industries = selected;*/

        this.setState({
            //userDetails: objListArr,
            selectedIndustryValues: selected
        })
    }

    openDeleteUserConfirmModal = (title, id) => {
        this.setState({
            deleteUserModalVisible: true,
            deleteUserModalTitle: title,
            deleteUserIndex: id
        });
    }

    closeDeleteUserConfirmModal = (isYesClicked) => {
        this.setState({
            deleteUserModalVisible: false,
            deleteUserModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.setState({ isDelete: true })
            this.deleteUserConfirm();
        } else {
            this.setState({
                deleteUserIndex: '',
                isDelete: false
            });
        }
    }

    deleteUserConfirm() {
        const { adminStore } = this.props;
        const { deleteUserIndex } = this.state;
        adminStore.deleteUser(deleteUserIndex)
            .then((response) => {
                if (response && response.data.resultCode === 'OK') {
                    // return {
                    //     error: true
                    // }
                    this.showSuccessNotification('delete', response.data.resultDescription);
                    // window.location.reload(); // history.push('admin/access-control');
                    // this.searchAccount(data);
                    this.getUsersList();
                } else if(response && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription);  
                }

            })
            .catch(error => {
                return {
                    error: true
                }
            });
    }

    deleteHandler(event, deleteId) {
        event.preventDefault();
        this.openDeleteUserConfirmModal('Are you sure you want to delete it ?', deleteId);
    }




    editHandler(event, editId) {
        event.preventDefault();        
        let eventValue = event.currentTarget.id; 
        this.setState({
            userId: '',
            userEmail: '',
            userType:'',
            endDate: '',
            selectedIndustryValues: [],
            accountName: {
                label: ''
            }           
        },() => {
            let user = editId.split(':');
            let id = eventValue;
            this.getMasterIndustries();
            const { userDetails } = this.state;
            let objListArr = [...userDetails];
            let industriesList = [];
            objListArr[id].industries !== undefined && objListArr[id].industries.length >= 1 && objListArr[id].industries.map((data, index) => {

                if (data.label !== undefined) {
                    let industry = { value: data.value, label: data.label }
                    industriesList.push(industry);
                }
                else {
                    let industry = { value: data.indId, label: data.indName }
    
                    industriesList.push(industry);
                }
    
            });
            let newModifieddate = new Date(DashBoardUtils.formatDateMMDDYY(user[3]))
            if(user[2] === "A") {
                newModifieddate = this.calculateEndDate();
            }
            if(user[2] === 'D'){
                user[2]=''
            }
            this.setState({
                editUser: true,
                userId: user[0],
                userEmail: user[1],
                userType: user[2],
                endDate: newModifieddate,
                selectedIndustryValues: industriesList,
                accountName: {
                    label: user[4]
                }
            })
        })
    }
    

    updateHandler(event, id) {
        const { adminStore } = this.props;
        const { userEmail, userType, selectedIndustryValues, endDate, accountName } = this.state;
        if (userType !== "Select" && (userType !== "" || userType !== undefined)) {
            if ((userType === "IL" && selectedIndustryValues.length > 0) || userType !== "IL") {
                this.setState({
                    isUpdateLoading: true
                })
                let industryRequestData = []
                selectedIndustryValues.length > 0 && selectedIndustryValues.forEach((industry) => {
                    let data = {
                        "userIndMapId": null,
                        "indName": industry.label,
                        "indId": industry.value
                    }
                    industryRequestData.push(data);
                });
                let accountNameValue = ''
                if(userType === 'EU' && accountName !== null){
                    accountNameValue = accountName.label;
                }
                let endDt = DashBoardUtils.formatDate(endDate)
                if(userType === 'A'){
                    endDt = undefined;
                }
                    adminStore.updateUser(userEmail, userType, id, industryRequestData,accountNameValue, endDt)
                        .then((res) => {
                            if (res && res.data.resultCode === 'OK') {
                                this.showSuccessNotification('update', res.data.resultDescription);
                                this.setState({
                                    isUserTypeUpdated: true,
                                    isUpdateLoading: false
                                });
                                this.getUsersList();
                            } else if(res && res.data.resultCode === 'KO') {
                                this.showErrorNotification(res.data.errorDescription);
                                this.setState({
                                    isUpdateLoading: false
                                });
                            }
                            else{
                                this.setState({
                                    isUpdateLoading: false
                                });
                            }
                        })
                    }
                else{
                    this.showErrorNotification('Please select Access Type/Industry');
                }
        }
        else {
            this.showErrorNotification('Please select User Type');
        }

    }

    handleAccountNameChange =(value) => {
        this.setState({
            accountName: value
        })
    }

    handleAccessTypeChange = (value) => {
        this.setState({
            accessType: value.target.value
        })
    }




    getAccessDropdownValues = (userType) =>{
        this.enabledUserTypeforEdit = [];
        switch(userType){
            case 'A' :
                this.accessList = [{value: 'A', label:'Admin'},
                    {value: 'IL', label:'Industry Lead'},
                    {value: 'O', label:'Offering Lead'},
                    {value: 'C', label:'Creator'},
                    {value: 'IU', label:'Internal User'}];
                break;
            case 'IL':
                this.accessList = [
                    {value: 'C', label:'Creator'},
                    {value: 'IU', label:'Internal User'}];
                break;
            case 'O':
                this.accessList = [
                    {value: 'IU', label:'Internal User'}];
                break;
            case 'C':
                this.accessList = [
                    {value: 'IU', label:'Internal User'}];
                break;
            case 'IU':
                this.accessList = [
                    {value: 'G', label:'Guest'}];
                break;
            default:
                break;
        }

        if(this.accessList.length>0){
            this.accessList.map(access=>{                
                    this.enabledUserTypeforEdit.push(access.value)          
            })
        }
        if(userType === 'A'){
            this.enabledUserTypeforEdit.push('D')
        }
        
    }


    editDisabled(userType){
        /* if(userType === 'A'){
            return false
        }else{ */
            if(this.state.userTypeSelected === 'Non-Accenture' && userType !== 'IU'){
                this.enabledUserTypeforEdit.push('EU')
            }
            return this.enabledUserTypeforEdit.includes(userType) ? false: true
       //}
       
    }


    showUpdateErrorNotification(message) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={message}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showErrorNotification(text) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={text}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showSuccessNotification(type,text) {
        switch (type) {
            case 'delete':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={text}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'update':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={text}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
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
    componentDidMount() {
        
        let userType = SessionStorage.read('userType');
        if(this.state.userTypeSelected !== 'Non-Accenture'){
            this.getAccessDropdownValues(userType);
        }else{
            this.accessList = [
                {value: 'EU', label:'External User'}];
        }      
       
        this.getUsersList();
    }

    getUsersList = () => {
        const { adminStore } = this.props;
        const { isDelete } = this.state;
        this.setState({
            showSpinner: true,
        });
        adminStore.fetchUsers('',this.state.userTypeSelected)
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                    if(response && !response.error && response.data.resultCode === 'OK'){
                        this.setState({
                            userDetails: adminStore.userDetails,
                            loadTable: true,
                            showSpinner: false,
                            isUserTypeUpdated: false,
                            editUser: false,
                            nonAccentureFilterOptions: this.state.userTypeSelected === 'Non-Accenture' ? ["Select All", ...new Set(adminStore.userDetails.map(user => user.accountName))] : []
                            
                        })
                        var select = document.getElementById("access-control-filter");
                        if (select !== null && select !== "") {
                        // select.value = "Sort by"
                        select.value = "Sort by"
                        const selectAfterEdit = {
                            target:{
                                value: select.value
                            }
                        }; 
                        this.searchAccount(selectAfterEdit);
                        }
                }else if(response && response.data.resultCode === 'KO'){
                    this.showErrorNotification(response.data.errorDescription);
                }
            // }
            })
        if (isDelete) {
            var select = document.getElementById("access-control-filter");
            //select.value = "Sort by"
            if (select !== null && select !== "") {
                // select.value = "Sort by"
                const selectAfterDelete = {
                    target:{
                        value: select.value
                    }
                };
                this.searchAccount(selectAfterDelete);
             }
        }

    }

    onChangeUserNameHandler = (event) => {
        this.setState({
            userName: event.currentTarget.value
        })
    }

     calculateEndDate() {
      let modifiedEndDate = new Date(new Date().setDate(new Date().getDate() + 30))
      //this.setState({endDate : modifiedEndDate })
      return modifiedEndDate;
      }


    onChangeUserTypeHandler = (event) => {
      //  if (event.currentTarget.value === "")
        if (event.currentTarget.value !== "IL") {
            this.setState({
                selectedIndustryValues: [],
            })
        }
        this.setState({
            userType: event.currentTarget.value,
            userTypeToDisplay: event.currentTarget.value
        })
    }
    // searchInputHandler = (e) => {        
    //     this.setState({
    //         searchString: e.target.value
    //     });
    //
    


   getUsers(userType,id){
     const {adminStore} = this.props
    this.setState({
        loader: false,
        isId: id,
        userTypeSelected: userType
       },() => {
        if(this.state.userTypeSelected !== 'Non-Accenture'){
            this.getAccessDropdownValues(SessionStorage.read('userType'));
        }else{
            this.accessList = [
                {value: 'EU', label:'External User'}];
                this.fetchAccountNames()
        }
        this.getUsersList()
       })   
   }
    


    
    getUserType(userType) {
        let searchString = ""
        if (userType !== "") {
            switch (userType) {
                case 'D':
                    searchString = 'Guest';
                    break;
                case 'U':
                    searchString = 'User';
                    break;
                case 'A':
                    searchString = 'Admin';
                    break;
                case 'C':
                    searchString = 'Creators';
                    break;
                case 'O':
                    searchString = 'OfferingLead';
                    break;
                case 'IL':
                    searchString = 'IndustryLead';
                    break;
                case 'EU':
                    searchString = 'ExternalUser';
                    break;
                case 'IU':
                    searchString = 'InternalUser';
                    break;
                default:
                    break;
            }
            return (searchString === "" ? userType : searchString)
        }
    }

    getUserTypeForSave(userType) {
        let searchString = ""
        if (userType !== "") {
            switch (userType) {
                case 'D':
                    searchString = 'Guest';
                    break;
                case 'U':
                    searchString = 'User';
                    break;
                case 'A':
                    searchString = 'Admin';
                    break;
                case 'C':
                    searchString = 'Creators';
                    break;
                case 'O':
                    searchString = 'OfferingLead';
                    break;
                case 'IL':
                    searchString = 'IndustryLead';
                    break;
                case 'EU':
                    searchString = 'ExternalUser';
                        break;
                case 'IU':
                    searchString = 'InternalUser';
                      break;
                default:
                    break;
            }
            return (searchString === "" ? userType : searchString)
        }
    }

    handleChangeDate = (date)  => {
       this.setState({
           endDate: date
       })
      }

    searchAccount = (e) => {
        const { adminStore } = this.props;
        let userDetailsArray = adminStore.userDetails;
        let searchString = '';
        switch (e.target.value) {
            case 'Select All':
                searchString = 'All';
                break;
            case 'Guest':
                searchString = 'D';
                break;
            case 'Internal User':
                searchString = 'IU';
                break;
            case 'Admin':
                searchString = 'A';
                break;
            case 'Creator':
                searchString = 'C';
                break;
            case 'Offering Lead':
                searchString = 'O';
                break;
            case 'Industry Lead':
                searchString = 'IL';
                break;
            case 'External User':
                searchString = 'EU';
                break;
            default:
                break;
        }
        let accListArr = JSON.parse(JSON.stringify(userDetailsArray));
        if(this.state.userTypeSelected === "Non-Accenture"){
            searchString = e.target.value
        }
        if (searchString.trim() !== '' && searchString.trim() !== "Sort by") {
            let filteredList = [];
            let name = 'userType';
            let noMatchedData = false;
            if(this.state.userTypeSelected === "Non-Accenture"){
                name = "accountName"
            }
            if (searchString !== 'All') {
                filteredList = accListArr.filter(obj => {
                    if (searchString === "Select All" || (obj[name] !== null && obj[name].toLowerCase() === searchString.toLowerCase())) {
                        return obj;
                    }
                });
            }
            else {
                filteredList = accListArr;
            }
            if (filteredList.length === 0) {
                noMatchedData = true;
            } else {
                noMatchedData = false;
            }
            let userList = [];
            if(SessionStorage.read('userType')!== 'A'){
                userList = filteredList.filter(user => 
                    user.createdBy === SessionStorage.read('username')
                )
            }else{
                userList = filteredList;
            }
            this.setState({
                userDetails: userList,
                noMatchData: noMatchedData,
                editUser: false
            }, () => {
                ReactTooltip.rebuild();
            });

        } else {
            let userList = [];
            if(SessionStorage.read('userType')!== 'A'){
                userList = accListArr.filter(user => 
                    user.createdBy === SessionStorage.read('username')
                )
            }else{
                userList = accListArr;
            }
            this.setState({
                userDetails: userList,
                noMatchData: true,
                editUser: false
            }, () => {
                ReactTooltip.rebuild();
            });

        }
    }

    fetchAccountNames = () => {
        const { adminStore } = this.props;
        adminStore.getAccountNames()
            .then(response => {
                if (response && !response.error && response.data.resultCode === "OK" && response.data.resultObj.length > 0) {
                    const test = response.data.resultObj.map((account, index) => {
                        let accnameObj = {};
                        accnameObj['label'] = account.accountName;
                        accnameObj['value'] = (account.tenantId).toString();
                        return accnameObj;
                    });
                    this.setState({
                        accountNamesList: test,
                        isAccountNamesLoading: false
                    });
                } else {
                    this.showErrorNotification("Error", response.data.resultDescription);
                }
            });
    
    }
    

    render() {
        const { showSpinner, userDetails, editUser, userId, userType, loadTable, isUserTypeUpdated, refreshNewUserDetails,isUpdateLoading } = this.state;
       
        const getToolTipData = (industries) => {
            let tooltipValue = [];
            industries.map((industry, id) => {

                tooltipValue.push(industry.indName)
            })
            let newlineToolTip = tooltipValue.join(",\n")
            return newlineToolTip
        }

        const getMultipleData = (industries) => {
            let multiValue = [];
            industries.map((industry, id) => {

                multiValue.push(industry.indName.substr(0, 3) + '...')
            })
            return multiValue.join(', ')
        }
        const isAdmin = SessionStorage.read('userType') === 'A' ? true: false;
        return (           
            <Fragment>
                <Menu />
                <div className="container-fluid" id="userForm" style={{ paddingRight: '0px' }}>
                    <div className="row" style={{ backgroundColor: '#3B3B3B' }} >
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    {isAdmin && <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>}
                                    {isAdmin && <li className="breadcrumb-item active" aria-current="page">Access Control</li>}
                                    {!isAdmin && <li className="breadcrumb-item active" aria-current="page">Access Management</li>}
                                </ol>
                            </nav>
                        </div>
                    </div>


                    <div className='row col-sm-12'>

                        <div className="page-header-row accessHeader" >

                            <div style={{ paddingleft: '-15px', marginBottom: '-35px' }}><label className="page-header-label">Add User</label></div>
                             <div style={{ float: "right" }}>
                        
                             <span className="radio-item">
                                   <input type="radio" id="internalUser" defaultChecked={this.state.userTypeSelected === 'Accenture'} value="Accenture" name="userType" onClick={(event) => this.getUsers(event.target.value,event.target.id)} /> 
                                   <label for="internalUser"> Accenture IDs </label>
                                   </span>
                                   <span className="radio-item">
                                   <input type="radio" id="externalUser" defaultChecked={this.state.userTypeSelected === 'Non-Accenture'} value="Non-Accenture" name="userType"  onClick={(event) => this.getUsers(event.target.value,event.target.id)}/>
                                   <label for="externalUser"> Non-Accenture IDs </label>
                                   </span> &nbsp; &nbsp;
                       


                             <select tabIndex="2" className="kpi-trend-select"
                                    defaultValue="Sort by"
                                    className="master-dropdownSort"
                                    onChange={(e) => { this.searchAccount(e) }}
                                    id="access-control-filter"

                                >
                                    <option value="Sort by" defaultValue disabled>Filter by</option>
                                    {
                                        this.state.userTypeSelected === "Non-Accenture"
                                        ?
                                            this.state.nonAccentureFilterOptions.map(accountName => accountName && accountName.trim() && <option value={accountName} key={accountName}>{accountName}</option>)
                                        :
                                        <Fragment>
                                            <option value="Select All">Select All</option>
                                            {SessionStorage.read('userType') !== 'IL' && <option value="Admin">Admin</option>}
                                            <option value="Industry Lead">Industry Lead</option>
                                            <option value="Offering Lead">Offering Lead</option>
                                            <option value="Creator">Creator</option>
                                            <option value="Internal User">Internal User</option>
                                            <option value="Guest">Guest</option>
                                        </Fragment>
                                    }
                                </select>
                            </div>


                        </div>

                    </div>
                    <div className="row col-sm-12 accessTableHead" >
                        <div className="row" style={{ width: '100%' }}>
                            <UserForm
                                userDetails={userDetails}
                                getUsersList={this.getUsersList}
                                refreshNewUserDetails={refreshNewUserDetails}
                                userTypeSelected={this.state.userTypeSelected}
                                industriesList={this.state.industryList}
                                accountNamesList={this.state.accountNamesList}
                            />

                            <div className="col-sm-8 accessTable">
                                {/* <div  style={{width:'750px', marginTop: '25px',marginLeft:'45px' }}> */}
                                <div className="vdt-table" >
                                    {showSpinner ?
                                        <div className="row justify-content-center spinner-div">
                                            <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff' }}></i>
                                        </div> :
                                        <div id="AccessManagementTable"  className="table-responsive">
                                            <table className="table">
                                                <thead style={{ whiteSpace: 'nowrap' }}>
                                                    <tr>
                                                        <th style={{ width: '26%' }}>Email Id</th>
                                                        <th style={{ width: '13%', paddingLeft:'8px' }}>Access Type</th>
                                                        {this.state.isId === "externalUser" ? 
                                                        <th style={{ width: '20%', paddingLeft: '30px' }}>Account Name</th> : "" }
                                                        {this.state.isId !== "externalUser" ? 
                                                        <th style={{ width: '20%', paddingLeft: '30px'  }}>Industry</th> : "" }
                                                        <th style={{ width: '20%', paddingLeft:'45px' }}>End Date</th>
                                                        <th style={{ width: '20%', paddingLeft:'40px' }}>Last Login</th>
                                                        <th style={{ width: '20%' , paddingLeft: '26px'  }}>Action</th>
                                                        {/* <th style={{ textAlignLast: "center" }}>Edit</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody >
                                                    {loadTable ?
                                                        userDetails && userDetails.map((user, userIndex) => (

                                                            <tr id={userIndex} key={userIndex}>
                                                       
                                                                <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', color: '#ffffff'}}
                                                            
                                                                data-for={user.userEmail}
                                                                data-tip=""
                                                                data-place="top">
                                                                    <p style={{width: '120px'}}>{user.userEmail}</p>
                                                                </td> 
                                                                {editUser && this.state.userTypeSelected === 'Accenture' && user.userId === parseInt(userId) ? <td style={{ /*paddingLeft: '70px' textAlign: 'center', , padding: '0px'*/  verticalAlign: 'middle' }}>
                                                                    <select
                                                                        style={{ height: '30px', width: '100%', marginLeft:'26px' }}
                                                                        type="text"
                                                                        className="master-dropdown1"
                                                                        id={`${user.userEmail}`}
                                                                        defaultValue={userType !== "" ? this.getUserType(userType) : this.getUserType(user.userType)}
                                                                        value={this.state.userType}
                                                                        onChange={this.onChangeUserTypeHandler}
                                                                        /* disabled={this.editDisabled(userType)} */
                                                                        required
                                                                    >    <option value="" defaultValue disabled>Select</option>
                                                                         {this.accessList.map(element => {
                               return  <option value={element.value}> {element.label} </option>
                            })}
                                                                    </select>

                                                                </td> :
                                                                    <td style={{verticalAlign: 'middle' }}>
                                                                        <p style={{marginLeft:'36px'}}>{
                                                                            user.userType === 'D' ? 'Guest' :
                                                                                user.userType === 'U' ? 'User' :
                                                                                    user.userType === 'A' ? 'Admin' :
                                                                                        user.userType === 'C' ? 'Creator' :
                                                                                            user.userType === 'O' ? 'Offering Lead' :
                                                                                                user.userType === 'IL' ? 'Industry Lead' :
                                                                                                  user.userType === 'EU' ? 'External User' :
                                                                                                    user.userType === 'IU' ? 'Internal User' :
                                                                                                    ''}</p>
                                                                    </td>
                                                                }
                                                                 {editUser && user.userId === parseInt(userId) && this.state.isId === "externalUser" ? 
                                                                 <td style={{ verticalAlign: 'middle' }}>
                                                                     <div className="col form-group_newProject" style={{marginBottom:'0px', marginLeft:'7px'}}>
                        <Select
                            size={1}
                            id="selectAccountNameDropdown"
                            isSearchable
                            isClearable
                            className="accName-input dropDown"
                            value={this.state.accountName}
                            onChange={this.handleAccountNameChange}
                            styles={defaultStyle}
                            noOptionsMessage={() => "Requested Account name is not available in the list, please reach out to Admin to get it enabled."}
                            options={
                                this.state.accountNamesList && this.state.accountNamesList.constructor === Array
                                    ? this.state.accountNamesList
                                    : []
                            }
                            theme={theme => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#004DFF",
                                    primary: "#00BAFF",
                                    neutral0: '#5A5A5A',
                                    primary50: '#004DFF'
                                },
                            })}
                            placeholder="Select Account Name"
                        />
                    </div>
                    
                                                                 </td> : this.state.isId === "externalUser" ? <td style={{verticalAlign: 'middle' }}><p style={{marginLeft:'19px'}}>{user.accountName}</p></td> : ''}
                                                                 {/* {!editUser && (user.userId !== parseInt(userId)) && this.state.isId === "externalUser" ? 
                                                                 <td style={{ width: '20%', verticalAlign: 'middle' }}>{user.accountName}</td> : ""} */}
                                                                  {this.state.isId === "externalUser" ?  "" :
                                                                (editUser && (userType === "IL" || userType === "IndustryLead") && user.userId === parseInt(userId) ?
                                                                    <td style={{ verticalAlign: 'middle' }} className="access-control-multiselect">
                                                                        <div style={{marginLeft:'7px', width:'105px'}}>
                                                                        <MultiSelect
                                                                            options={this.state.industryList}
                                                                            value={this.state.selectedIndustryValues}
                                                                            onChange={(e) => this.setIndustrySelected(e, userIndex)}
                                                                            labelledBy="Select"
                                                                            disableSearch={true}
                                                                            id={`${user.userEmail}_industry`}
                                                                            valueRenderer={(e) => this.customIndustryValueRenderer(e, userIndex)}
                                                                            ClearSelectedIcon

                                                                        />
                                                                        </div>

                                                                    </td> :
                                                                    (editUser && (userType !== "IL" || userType !== "IndustryLead") && user.userId === parseInt(userId)) ?
                                                                        <td style={{ verticalAlign: 'middle' }}>
                                                                            <label className="label-div" style={{marginLeft: '25px'}}>
                                                                                -
                                                                               
                                                                            </label>
                                                                        </td>
                                                                        :
                                                                        <td style={{ verticalAlign: 'middle' }}>
                                                                            <p style={{marginLeft:'24px'}} className="label-div" data-for={`${user.userEmail}_industries`} data-place="top" data-type="dark" data-tip="">
                                                                            
                                                                                {user.industries && user.industries.length > 1 ?
                                                                                    getMultipleData(user.industries).length > 20 ?
                                                                                        <Fragment>
                                                                                            <span>{getMultipleData(user.industries).substr(0, 20)/*user.industries[0].indName.substr(0, 16)*/ + '..'}</span>
                                                                                            <ReactTooltip id={`${user.userEmail}_industries`}>{getToolTipData(user.industries)}</ReactTooltip>
                                                                                        </Fragment>
                                                                                        :
                                                                                        <Fragment>
                                                                                            <span>{getMultipleData(user.industries)}</span>
                                                                                            <ReactTooltip id={`${user.userEmail}_industries`}>{getToolTipData(user.industries)}</ReactTooltip>
                                                                                        </Fragment>
                                                                                    :
                                                                                    user.industries && user.industries.length === 1 ?
                                                                                        user.industries[0].indName.length > 16 ?
                                                                                            <Fragment><span >{user.industries[0].indName.substr(0, 16)}...</span>
                                                                                                <ReactTooltip id={`${user.userEmail}_industries`}>{user.industries[0].indName}</ReactTooltip>
                                                                                            </Fragment>
                                                                                            : <span>{user.industries[0].indName}</span>

                                                                                        :
                                                                                        '-'
                                                                                }


                                                                            </p>
                                                                            {/*<ReactTooltip id = {`${user.userEmail}_industries`}>Capital Markets, Insurance</ReactTooltip>*/}
                                                                        </td>
                                                                        
                                                                )}
                                                                
                                                             
                              <td style={{ verticalAlign: 'middle' }}>
                     {editUser && user.userId === parseInt(userId) && (/* (user.userType !== 'A') || */ this.state.userType !== 'A' )? <div style={{paddingLeft:'0px'}}className="date-wrapper">
                      
                      <DatePicker  placeholderText="dd/mm/yyyy"  dateFormat="dd-MMM-yyyy"   
                      showMonthDropdown
                      showYearDropdown
                      selected={this.state.endDate !== null && isNaN(this.state.endDate.getTime()) ? new Date() : this.state.endDate }
                      value={user.endDate !== null ? new Date(DashBoardUtils.formatDateMMDDYY(user.endDate)) : new Date()}
                      onChange={this.handleChangeDate}
                      minDate={new Date()}
                      
                      className="DateFieldStyle" />
                      
                      <img src={calendarIcon} alt="CalendarIcon"  style={{ width: "18px", marginLeft: "-23px", zIndex: '1' }}></img>
                  
                      
                      </div>:(user.userType === 'A' || user.userType === 'D' || this.state.userType === 'A') ? <p style={{marginLeft:'35px'}}>-</p>:<p style={{marginLeft:'35px'}}>{DashBoardUtils.formatDateWithFullMonth(user.endDate)}</p>}
                                                                
                                                               
                                                                   </td> 
                                                                   {/* For Last Login */}
                                                                <td style={{verticalAlign: 'middle' }}> <p style={{marginLeft:'30px'}}> {DashBoardUtils.formatDateWithFullMonth(user.lastLogin)}</p></td>

                                                                <td style={{ /*textAlign: 'center',*/ cursor: 'pointer', verticalAlign: 'middle'/*, paddingLeft: '110px'*/ }}>


                                                                    {editUser && user.userId === parseInt(userId) ?

                                                                        <div className="fa fa-check1" onClick={isUpdateLoading?()=>{}:(event) => this.updateHandler(event, user.userId)}>
                                                                            <img src={save} alt=""
                                                                             style={{ paddingLeft: '5px',cursor:(isUpdateLoading?"default":"pointer"),opacity:(isUpdateLoading?"0.5":"unset") }}
                                                                                id={`${user.userEmail}_save`}
                                                                                data-tip="Save"
                                                                                data-for="ac-tooltip" />
                                                                                  {isUpdateLoading ?
                                                                                    <i className="fa fa-spinner fa-spin savespin"></i>
                                                                                   : ""} 
                                                                        </div>
                                                                        :

                                                                        <div className="fa fa-pencil1" id={userIndex} onClick={this.editDisabled(user.userType)? '':(event) => this.editHandler(event, user.userId + ':' + user.userEmail + ':' + user.userType+ ':' + user.endDate+':'+user.accountName)}>

                                                                            <img src={pencil} alt=""
                                                                                id={`${user.userEmail}_edit`}
                                                                                data-tip="Edit"
                                                                                data-for="ac-tooltip"
                                                                                style={{
                                                                                    opacity: (this.editDisabled(user.userType)) ? '0.5' : 'unset',
                                                                                    cursor: (this.editDisabled(user.userType)) ? 'not-allowed' :'pointer'
                                                                                }}
                                                                            />


                                                                        </div>
                                                                    }
                                                                    <i style={{ paddingLeft: '25px' }} className="fa fa-trash1" onClick={this.editDisabled(user.userType)? '':(event) => this.deleteHandler(event, user.userId)}>
                                                                        <img src={trash} alt=""
                                                                            id={`${user.userEmail}_delete`}
                                                                            data-tip="Delete"
                                                                            data-for="ac-tooltip"
                                                                            style={{
                                                                                opacity: (this.editDisabled(user.userType)) ? '0.5' : 'unset',
                                                                                cursor: (this.editDisabled(user.userType)) ? 'not-allowed' :'pointer'
                                                                            }}
                                                                        />


                                                                    </i>
                                                                    
                                                                </td>

                                                            </tr>

                                                        )) : ''}

                                                </tbody>
                                            </table>
                                            <ReactTooltip id="ac-tooltip" className="tooltip-class" />
                                        </div>


                                    }</div>
                            </div>

                        </div>
                        {/* <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} /> */}

                    </div>
                </div>
                {this.state.deleteUserModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'client-master-delete-modal'}
                        isModalVisible={this.state.deleteUserModalVisible}
                        modalTitle={this.state.deleteUserModalTitle}
                        closeConfirmModal={this.closeDeleteUserConfirmModal}
                    />
                    : ""
                }
            </Fragment >

        )
    }
}

export default withRouter(AccessManagement);
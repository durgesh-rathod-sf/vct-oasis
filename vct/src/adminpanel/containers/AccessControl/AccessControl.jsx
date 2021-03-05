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

@inject('adminStore')
@observer
class AccessControl extends Component {
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
            isUpdateLoading: false
        }
        this.deleteHandler = this.deleteHandler.bind(this);
        this.editHandler = this.editHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
        this.searchAccount = this.searchAccount.bind(this);
        this.deleteUserConfirm = this.deleteUserConfirm.bind(this);
        this.openDeleteUserConfirmModal = this.openDeleteUserConfirmModal.bind(this);
        this.closeDeleteUserConfirmModal = this.closeDeleteUserConfirmModal.bind(this);
    }

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
                    } else if (response && response.data && response.data.resultCode === 'KO') {
                        this.showErrorNotification(response.data.errorDescription)
                    }

                });
        }
    }

    setIndustrySelected = (selected, objInd) => {

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
                } else if (response && response.data.resultCode === 'KO') {
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
        let user = editId.split(' ');
        let id = event.currentTarget.id;
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

        this.setState({
            editUser: true,
            userId: user[0],
            userEmail: user[1],
            userType: user[2],
            selectedIndustryValues: industriesList,
        })

    }

    updateHandler(event, id) {
        const { adminStore } = this.props;
        const { userEmail, userType, selectedIndustryValues } = this.state;
        let userTypeForSave = this.getUserTypeForSave(userType)
        if (userType !== "Select" && (userTypeForSave !== "" || userTypeForSave !== undefined)) {
            if ((userTypeForSave === "IndustryLead" && selectedIndustryValues.length > 0) || userTypeForSave !== "IndustryLead") {
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

                adminStore.updateUser(userEmail, userTypeForSave, id, industryRequestData)
                    .then((res) => {
                        if (res && res.data.resultCode === 'OK') {
                            this.showSuccessNotification('update', res.data.resultDescription);
                            this.setState({
                                isUserTypeUpdated: true,
                                isUpdateLoading: false
                            });
                            this.getUsersList();
                        } else if (res && res.data.resultCode === 'KO') {
                            this.setState({
                                isUpdateLoading: false
                            });
                            this.showErrorNotification(res.data.errorDescription);
                        }
                        else{
                            this.setState({
                                isUpdateLoading: false
                            });
                        }
                    })
            }
            else {
                this.showErrorNotification('Please select Access Type/Industry');
            }
        }
        else {
            this.showErrorNotification('Please select User Type');
        }

    }
    //Remove this while handling KO scenarios

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

    showSuccessNotification(type, text) {
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
        this.getUsersList();
    }

    getUsersList = () => {
        const { adminStore } = this.props;
        const { isDelete } = this.state;
        this.setState({
            showSpinner: true,
        });
        adminStore.fetchUsers()
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                if (response && !response.error && response.data.resultCode === 'OK') {
                    this.setState({
                        userDetails: adminStore.userDetails,
                        loadTable: true,
                        showSpinner: false,
                        isUserTypeUpdated: false,
                        editUser: false,
                    })
                    var select = document.getElementById("access-control-filter");
                    if (select !== null && select !== "") {
                        // select.value = "Sort by"
                        const selectAfterEdit = {
                            target: {
                                value: select.value
                            }
                        };
                        this.searchAccount(selectAfterEdit);
                    }
                } else if (response && response.data.resultCode === 'KO') {
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
                    target: {
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

    onChangeUserTypeHandler = (event) => {

        if (event.currentTarget.value !== "IndustryLead") {
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
    // }
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
                default:
                    break;
            }
            return (searchString === "" ? userType : searchString)
        }
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
            case 'User':
                searchString = 'U';
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
            default:
                break;
        }
        let accListArr = JSON.parse(JSON.stringify(userDetailsArray));
        if (searchString.trim() !== '') {
            let filteredList = [];
            let name = 'userType';
            let noMatchedData = false;
            if (searchString !== 'All') {
                filteredList = accListArr.filter(obj => {


                    if (obj[name] !== null && obj[name].toLowerCase().includes(searchString.toLowerCase())) {
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
            this.setState({
                userDetails: filteredList,
                noMatchData: noMatchedData,
                editUser: false
            }, () => {
                ReactTooltip.rebuild();
            });

        } else {
            this.setState({
                userDetails: accListArr,
                noMatchData: true,
                editUser: false
            }, () => {
                ReactTooltip.rebuild();
            });

        }
    }


    render() {
        const { showSpinner, userDetails, editUser, userId, userType, loadTable, isUserTypeUpdated, refreshNewUserDetails, isUpdateLoading } = this.state;

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

        return (
            <Fragment>
                <Menu />
                <div className="container-fluid" id="userForm" style={{ paddingRight: '0px' }}>
                    <div className="row" style={{ backgroundColor: '#3B3B3B' }} >
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>
                                    <li className="breadcrumb-item active" aria-current="page">Access Control</li>
                                </ol>
                            </nav>
                        </div>
                    </div>


                    <div className='row col-sm-12'>

                        <div className="page-header-row accessHeader" >

                            <div style={{ paddingleft: '-15px' }}><label className="page-header-label">Add User</label></div>
                            <div style={{ float: "right" }}>

                                <select tabIndex="2" className="kpi-trend-select"
                                    defaultValue="Sort by"
                                    className="master-dropdownSort"
                                    onChange={(e) => { this.searchAccount(e) }}
                                    id="access-control-filter"

                                >
                                    <option value="Sort by" selected disabled>Filter by</option>
                                    <option value="Select All">Select All</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Industry Lead">Industry Lead</option>
                                    <option value="Offering Lead">Offering Lead</option>
                                    <option value="Creator">Creator</option>
                                    <option value="User">User</option>
                                    <option value="Guest">Guest</option>
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
                                industryList={this.state.industryList}
                            />

                            <div className="col-sm-8 accessTable">
                                {/* <div  style={{width:'750px', marginTop: '25px',marginLeft:'45px' }}> */}
                                <div className="vdt-table" >
                                    {showSpinner ?
                                        <div className="row justify-content-center spinner-div">
                                            <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff' }}></i>
                                        </div> :
                                        <div className="table-responsive">
                                            <table className="table">
                                                <thead style={{ whiteSpace: 'nowrap' }}>
                                                    <tr>
                                                        <th style={{ width: '30%' }}>Email Id</th>
                                                        <th style={{ width: '20%' }}>Access Type</th>
                                                        <th style={{ width: '20%' /*, paddingLeft: '100px'*/ }}>Industry</th>
                                                        <th style={{ width: '20%', paddingLeft: '26px' }}>Action</th>
                                                        {/* <th style={{ textAlignLast: "center" }}>Edit</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody >
                                                    {loadTable ?
                                                        userDetails && userDetails.map((user, userIndex) => (

                                                            <tr id={userIndex} key={userIndex}>

                                                                <td style={{ width: '31%', verticalAlign: 'middle' }}>
                                                                    {user.userEmail}
                                                                </td>

                                                                {editUser && user.userId === parseInt(userId) ? <td style={{ /*paddingLeft: '70px' textAlign: 'center', , padding: '0px'*/ width: '20%', verticalAlign: 'middle' }}>
                                                                    <select
                                                                        style={{ height: '30px', width: '80%' }}
                                                                        type="text"
                                                                        className="master-dropdown1"
                                                                        id={`${user.userEmail}`}
                                                                        value={userType !== "" ? this.getUserType(userType) : this.getUserType(user.userType)}
                                                                        onChange={this.onChangeUserTypeHandler}
                                                                        disabled={isUserTypeUpdated}
                                                                        required
                                                                    >
                                                                        <option value=" " selected disabled>Select</option>
                                                                        <option value="Admin">Admin</option>
                                                                        <option value="IndustryLead">Industry Lead</option>
                                                                        <option value="OfferingLead">Offering Lead</option>
                                                                        <option value="Creators">Creator</option>
                                                                        <option value="User">User</option>
                                                                        <option value="Guest">Guest</option>
                                                                    </select>

                                                                </td> :
                                                                    <td style={{ width: '20%'/*, padding: '0px'*/, verticalAlign: 'middle' }}>
                                                                        {
                                                                            user.userType === 'D' ? 'Guest' :
                                                                                user.userType === 'U' ? 'User' :
                                                                                    user.userType === 'A' ? 'Admin' :
                                                                                        user.userType === 'C' ? 'Creator' :
                                                                                            user.userType === 'O' ? 'Offering Lead' :
                                                                                                user.userType === 'IL' ? 'Industry Lead' :
                                                                                                    ''}
                                                                    </td>
                                                                }

                                                                {editUser && (userType === "IL" || userType === "IndustryLead") && user.userId === parseInt(userId) ?
                                                                    <td style={{ width: '20%' /*, padding: '0px'*/, verticalAlign: 'middle' }} className="access-control-multiselect">
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

                                                                    </td> :
                                                                    (editUser && (userType !== "IL" || userType !== "IndustryLead") && user.userId === parseInt(userId)) ?
                                                                        <td style={{ width: '20%'/*, padding: '0px'*/, verticalAlign: 'middle' }}>
                                                                            <label className="label-div">
                                                                                -
                                                                                {/*this.state.selectedIndustryValues && this.state.selectedIndustryValues.length > 1 ?
                                                                                    "Multiple": 
                                                                                        this.state.selectedIndustryValues && this.state.selectedIndustryValues.length === 1 ? 
                                                                                        this.state.selectedIndustryValues.label :
                                                                                '-'*/}
                                                                            </label>
                                                                        </td>
                                                                        :
                                                                        <td style={{ width: '20%'/*, padding: '0px'*/, verticalAlign: 'middle' }}>
                                                                            <label className="label-div" data-for={`${user.userEmail}_industries`} data-place="top" data-type="dark" data-tip="">
                                                                                {/*user.industries && user.industries.length > 1 ?
                                                                                    "Multiple": 
                                                                                        user.industries && user.industries.length === 1 ? 
                                                                                        user.industries[0].indName : 
                                                                                '-'*/}
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


                                                                            </label>
                                                                            {/*<ReactTooltip id = {`${user.userEmail}_industries`}>Capital Markets, Insurance</ReactTooltip>*/}
                                                                        </td>
                                                                }

                                                                <td style={{ /*textAlign: 'center',*/ cursor: 'pointer', width: '20%', verticalAlign: 'middle'/*, paddingLeft: '110px'*/ }}>


                                                                    {
                  
                                                                        (editUser && user.userId === parseInt(userId) ?

                                                                            <i className="fa fa-check1" onClick={isUpdateLoading?()=>{}:(event) => this.updateHandler(event, user.userId)}>
                                                                                <img src={save} alt="" style={{ paddingLeft: '5px' }}
                                                                                    id={`${user.userEmail}_save`}
                                                                                    data-tip="Save"
                                                                                    data-for="ac-tooltip" />
                                                                                {isUpdateLoading ?
                                                                                    <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "5px 0px 0px -22px", cursor: "default" }}></i>
                                                                                    : ""}
                                                                            </i>
                                                                            :

                                                                            <i className="fa fa-pencil1" id={userIndex} onClick={(event) => this.editHandler(event, user.userId + ' ' + user.userEmail + ' ' + user.userType)}>

                                                                                <img src={pencil} alt=""
                                                                                    id={`${user.userEmail}_edit`}
                                                                                    data-tip="Edit"
                                                                                    data-for="ac-tooltip"
                                                                                />


                                                                            </i>
                                                                        )
                                                                    }
                                                                    <i style={{ paddingLeft: '25px' }} className="fa fa-trash1" onClick={(event) => this.deleteHandler(event, user.userId)}>
                                                                        <img src={trash} alt=""
                                                                            id={`${user.userEmail}_delete`}
                                                                            data-tip="Delete"
                                                                            data-for="ac-tooltip"
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

export default withRouter(AccessControl);
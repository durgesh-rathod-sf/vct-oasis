import React, { Component } from 'react';
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import './NewUserRegistrationModal.css'
import DatePicker from 'react-datepicker';
import calender from "../../assets/project/date_calender.svg";
import Select from 'react-select';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import MultiSelect from "react-multi-select-component";
import classNames from 'classnames';
import DashboardUtils from '../../containers/Dashboards/DashboardUtils';
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
        ...base, width: "320px", fontSize: '12px', marginTop: 0, borderRadius: '2px',
        paddingTop: 0, paddingBottom: 0,
    }),
    indicatorsContainer: (base) => ({ ...base, padding: 0 }),
    menuList: (base) => ({
        ...base, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'left',
        height: '110px', backgroundColor: '#5A5A5A', border: '1px solid rgba(255, 255, 255, 0.8)',
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
class NewUserRegistrationModal extends Component {
    isExternalUser = false;
    accessList = [];
    constructor(props) {
        super(props)
        this.state = {
            endDt: '',
            emailID: '',
            accountName: '',
            accountValue: '',
            accessType: '',
            industriesList: [],
            selectedIndustryForKPIs: '',
            loader:false
        };
    }

    componentDidMount() {
        let accessType = '';
        let userType = SessionStorage.read('userType');
        let newEndDate = new Date();
        newEndDate = new Date(newEndDate.setDate(newEndDate.getDate() + 30))
        if (this.props.userTypeSelected === 'Non-Accenture') {
            this.isExternalUser = true
            let externalAccess = {
                 value: 'EU', label: 'External User' 
            }
            this.accessList.push(externalAccess);
            this.setState({
                endDt: newEndDate,
                accessType: this.accessList[0].value,
                emailID: this.props.eId,
                accountName: this.props.selectedAccountName
            })
        } else {
            this.isExternalUser = false
            this.getAccessDropdownValues(userType);
            this.setState({
                endDt: newEndDate,
               // accessType: this.accessList[0].value,
                emailID: this.props.eId
            })
        }
    }

    getAccessDropdownValues = (userType) => {
        switch (userType) {
            case 'A':
                this.accessList = [{ value: 'A', label: 'Admin' },
                { value: 'IL', label: 'Industry Lead' },
                { value: 'O', label: 'Offering Lead' },
                { value: 'C', label: 'Creator' },
                { value: 'IU', label: 'Internal User' }];
                break;
            case 'IL':
                this.accessList = [
                    { value: 'C', label: 'Creator' },
                    { value: 'IU', label: 'Internal User' }];
                break;
            case 'O':
                this.accessList = [
                    { value: 'IU', label: 'Internal User' }];
                break;
            case 'C':
                this.accessList = [
                    { value: 'IU', label: 'Internal User' }];
                break;
            case 'IU':
                this.accessList = [
                    { value: 'G', label: 'Guest' }];
                break;
            case 'EU':
                this.accessList = [
                    { value: 'EU', label: 'External User' }];
                break;
            default:
                break;
        }
    }
    emailChangeHandler = (value) => {
        this.setState({
            emailID: value.target.value
        })
    }

    handleEndDtChange = (value) => {
        this.setState({
            endDt: value
        })
    }
    handleAccountNameChange = (value) => {
        this.setState({
            accountName: value
        })
    }
    handleAccessTypeChange = (value) => {
        if(this.state.industriesList.length === 0 && value.target.value === "IL"){
            this.getMasterIndustries()
        }
        let newEndDate = '';
        if(value.target.value !== 'A'){
            newEndDate = new Date();
            newEndDate = new Date(newEndDate.setDate(newEndDate.getDate() + 30))
        }
        this.setState({ 
            endDt: newEndDate,           
            accessType: value.target.value
        })
    }

    setSelectedIndustry = (value) => {
        this.setState({
            selectedIndustryForKPIs:value
        })
    }

    submitUserModal = () => {
        const { adminStore } = this.props;
        const { emailID, endDt, accountName, accessType, selectedIndustryForKPIs } = this.state;
        let isError = false;
        if (!this.isExternalUser && this.state.emailID.indexOf('@accenture.com') === -1) {
            isError = true;
            this.showNotification('Error', 'Accenture ID should contain @accenture.com')
        }
        else if (this.isExternalUser && this.state.emailID.indexOf('@accenture.com') !== -1) {
            isError = true;
            this.showNotification('Error', 'Non-Accenture ID should not contain @accenture.com')
        }
        if (accessType === null || accessType === "") {
            isError = true;
            this.showNotification('Error', 'Please choose access type.') 
        }
       if (!isError) {
            this.setState({
                loader: true
            }, () => {
                let accountNameValue = ''           
            let industryRequestData = []
            accessType === 'IL' && selectedIndustryForKPIs.length > 0  && selectedIndustryForKPIs.forEach((industry)=>{
                let data ={
                    "userIndMapId" : null,
                    "indName" : industry.label,
                    "indId": industry.value
                }
                    industryRequestData.push(data);
            });
            if(accessType === 'EU' && accountName !== null){
                accountNameValue = accountName.label;
            }
            let endDt = DashboardUtils.formatDate(this.state.endDt);
            adminStore.addUser(emailID, accessType, industryRequestData, accountNameValue, endDt)
                .then((response) => {
                    if (response && response.data.resultCode === 'OK') {
                        this.showNotification("Success", response.data.resultDescription);
                        this.setState({
                            enterpriseId: '',
                            accessType: '',
                            loader: false
                        });
                        this.props.addUserModalVisible()
                    } else if (response && response.data.resultCode === 'KO') {
                        this.showNotification("Error", response.data.errorDescription);
                        this.setState({
                            loader:false,
                        })
                    }
                    // window.location.reload();
                    // this.props.getUsersList();
                })
            })
            
        }
        
    }

    getMasterIndustries = () => {
        const { adminStore } = this.props;
        adminStore.getMasterIndustries()
            .then(response => {
                if (response && response.data && !response.error && response.data.resultCode === "OK") {
                    let industriesList = [];
                    response.data.resultObj.map((data, index) => {
                        let industry = { value: data.indId, label: data.indName }
                        industriesList.push(industry);
                    });
                    this.setState({
                        industriesList: industriesList,
                    })
                }else if(response.data.resultCode === "KO"){
                    this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                }
                else {
                }
            });
    }

    showNotification(type,bodytext) {
        let notifyType = type.toLowerCase();
        switch(notifyType) {
            case 'error' :{
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={bodytext}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            }
            case 'success':{
                toast.info(
                    <NotificationMessage
                        title="Success"
                        bodytext={bodytext}
                        icon="success"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
            }
        }
        
    }

    render() {
        return (
            <Modal id="newUserRegistrationModal" visible={true}>
                <div id="modalTitle" className="row">
                    <p className="modalTitle"> Add User</p>
                    <i class="fa fa-close" style={{ fontSize: '24px', marginTop: '24px', marginLeft: '246px' }} onClick={this.props.addUserModalVisible}></i>
                </div>
                <div id="modalContent" className={classNames({'showLoader': this.state.loader, 'row form-group':true})}>
                    <div className="form-content">
                        <label>Email ID *</label>
                        <input type="text" className="form-control form-input "
                            defaultValue={this.props.eId}
                            onBlur={this.emailChangeHandler}
                            id="emailID"
                            maxLength = "99"
                        />
                    </div>
                    <div className="form-content">
                        <label>Access Type *</label>
                        {this.isExternalUser && <input type="text" className="form-control form-input "
                            value='External'
                            id="accessType"
                            disabled
                        />}
                        {!this.isExternalUser && <div className="form-content">
                            <select
                                className="master-dropdown"
                                id="accessType-filter"
                                onChange={this.handleAccessTypeChange}>
                                 <option value="Select" selected disabled>Select</option>   
                                {this.accessList.map(element => {
                                    return <option value={element.value}> {element.label} </option>
                                })}
                            </select>
                        </div>}
                    </div>
                    {this.state.accessType === "IL" ?
                    <div className="form-content">
                             <div> <label className="form-label">Industry *</label> <br /></div>
                           
                            <MultiSelect
                                options={this.state.industriesList}
                                value={this.state.selectedIndustryForKPIs}
                                onChange={this.setSelectedIndustry}
                                labelledBy="Select"
                                disableSearch={true}
                                placeholder={this.state.placeholder}
                                valueRenderer={this.customValueRendererIndustry}
                                ClearSelectedIcon
                            />
                            
                    </div>
                    : ''}
                    {/* Loader Part */}
                    <div style={{marginLeft:'-170px'}}>
                        {this.state.loader&&<i className="fa fa-spinner fa-spin" style={{ fontSize: '70px' }}></i>}
                    </div>
                    {this.isExternalUser && <div className="col form-group_newProject">
                        <label htmlFor="accountInput" className="required-label">
                            Account Name&nbsp;
                                        </label>
                        {this.isExternalUser && <input type="text" className="form-control form-input "
                            value={this.state.accountName.label}
                            id="accountName"
                            disabled
                        />}                        
                    </div>}
                    <div className="form-content">
                        <label>End Date</label>
                        <div
                            className="input-group"
                            style={{ width: '570px' }}
                        >
                            <DatePicker
                                value={this.state.endDt}
                                selected={this.state.endDt}
                                onChange={this.handleEndDtChange}
                                dateFormat="dd-MMM-yyyy"
                                minDate={new Date()}
                                showMonthDropdown
                                showYearDropdown
                                useShortMonthInDropdown
                                fixedHeight
                                className="form-control form-input datepicker-input"
                                disabled={this.state.accessType === "A"}
                            />
                            {this.state.accessType !== "A" && <div
                                style={{
                                    marginLeft: '-32px',
                                    zIndex: '0',
                                    fontSize: '22px',
                                    color: '#ffffff',
                                }}
                            >
                                <img src={calender} alt="calender" />
                            </div>}
                        </div>
                    </div>
                    <div className="form-content" style={{ marginBottom: '56px', marginTop: '24px' }}>
                        <button type="button" className="btn btn-light yes-button" onClick={this.submitUserModal}
                        >Add User</button>
                    </div>
                </div>  
            </Modal>
        )
    }
}

export default NewUserRegistrationModal;
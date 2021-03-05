import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import './UserForm.css';
import DatePicker from "react-datepicker";
import 'moment-timezone';
import MultiSelect from "react-multi-select-component";
import calendarIcon from "../../../assets/project/fvdt/calendar.svg";
import DashBoardUtils from '../../../containers/Dashboards/DashboardUtils'
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


@inject('myProjectStore')
@inject('adminStore')
@observer
class UserForm extends Component {
    isExternal = false;
    accessList =[];
    constructor(props) {
        super(props);
        this.addUser = this.addUser.bind(this)
        this.state = {
            userList: '',
            enterpriseId: '',
            accessType: '',
            mailError: '',
            endDate: '',
            industriesList: [],
            accountName:'',
            selectedIndustryForKPIs: [],
            accountNamesList:[],
            isAccountNamesLoading: false,
            isAddLoading:false,
            isEdited: false
            
        }

        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleDate = this.handleDate.bind(this);

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

    customValueRendererIndustry = () => {
        return this.state.selectedMultipleIndustryItems > 1
            ? "Multiple"
            : ""
    };

    setSelectedIndustry = (selected) => {
        this.setState({
            selectedIndustryForKPIs: selected,
            selectedMultipleIndustryItems: selected.length
        });

    }

    componentDidMount() {
        const { userDetails } = this.props;
        const { myProjectStore } = this.props;
        let userType = SessionStorage.read('userType'); 
        this.getAccessDropdownValues(userType);
        if(this.props.userTypeSelected === "Non-Accenture"){
            this.fetchAccountNames();

        }
        this.setState({
            userList: userDetails,
            //accessType: this.accessList[0].value
        })
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

    handleChangeDate = (value) => {
       this.setState({
       endDate: value,
       isEdited: true
      })
   }

      handleAccountNameChange =(value) => {
        this.setState({
            accountName: value
        })
    }

    handleAccessTypeChange = (value) => {
        if(this.state.industriesList.length === 0 && value.target.value === "IL"){
            this.getMasterIndustries()
            this.setState({
                accessType: value.target.value,
                isEdited: false
            },() => {
                this.setEnterpriseId(this.state.enterpriseId)
            })
        }else{
            this.setState({
                selectedIndustryForKPIs: [],
                selectedMultipleIndustryItems: 0,
                accessType: value.target.value,
                isEdited: false
            },() => {
                this.setEnterpriseId(this.state.enterpriseId)
            });  
        }
        if(value.target.value === 'EU'){
            this.setState({
                isEdited: false
            })
            this.fetchAccountNames()
        }
            
        
    }

   handleDate = () => {
    const {accessType,accountName,selectedIndustryForKPIs} = this.state;
    let newEndDt = new Date(new Date().setDate(new Date().getDate() + 30))
    if (this.props.userTypeSelected === "Accenture" && accessType === "IL" && selectedIndustryForKPIs.length === 0){
        newEndDt = ""
    }
    if(this.props.userTypeSelected === "Accenture") {
     if (accessType === 'A' || accessType === '' || accessType === false){
        newEndDt = "" ;
        }
     }
  
     if (this.props.userTypeSelected === "Non-Accenture" && accountName === "") {
        newEndDt = "";
     }
    return newEndDt;
    }



    
    componentDidUpdate(prevProps, prevState) {
        let userType = SessionStorage.read('userType'); 
      
        if(prevProps.userTypeSelected !== this.props.userTypeSelected){
            this.accessList =[];
            this.getAccessDropdownValues(userType);
           this.fetchAccountNames();
        
           this.setState({accessType :this.props.userTypeSelected === "Non-Accenture" && "EU",selectedIndustryForKPIs :[],enterpriseId :'',endDate :'',accountName :'',mailError:''})
        }

        if(this.props.userTypeSelected === "Non-Accenture" && prevState.accessType !== this.state.accessType && this.state.accessType === ""){
            this.setState({accessType :this.props.userTypeSelected === "Non-Accenture" && "EU"});
        }
        
      }



    getAccessDropdownValues = (userType) => {
        switch(userType){
            case 'A' :              
                if(this.props.userTypeSelected === "Accenture"){
                   this.accessList = [{value: 'A', label:'Admin'},
                    {value: 'IL', label:'Industry Lead'},
                    {value: 'O', label:'Offering Lead'},
                    {value: 'C', label:'Creator'},
                    {value: 'IU', label:'Internal User'}
                  ];
                }else {
                    this.accessList.push({value: 'EU', label:'External User'});

                }   
             
                break;
            case 'IL':
                if(this.props.userTypeSelected === "Accenture"){
                this.accessList = [
                    {value: 'C', label:'Creator'},
                    {value: 'IU', label:'Internal User'},
                   ];
                }else{
                    this.accessList.push({value: 'EU', label:'External User'});

                }
                break;
            case 'O':
                if(this.props.userTypeSelected === "Accenture"){
                this.accessList = [
                    {value: 'IU', label:'Internal User'}
                   ];
                }else{
                    this.accessList.push({value: 'EU', label:'External User'});
                }
                break;
            case 'C':
                if(this.props.userTypeSelected === "Accenture"){
                this.accessList = [
                    {value: 'IU', label:'Internal User'},
                   ];
                }else{
                    this.accessList.push({value: 'EU', label:'External User'});
                }
                break;
            case 'IU':
                this.accessList = [
                    {value: 'G', label:'Guest'}];
                break;
            case 'EU':
            this.accessList = [
                {value: 'EU', label:'External User'}];
            break;
            default:
                break;
        }
    }

    checkIfUserIsUnique(userList, enterpriseId) {
        for (let user of userList) {
            if (user.userEmail === enterpriseId.trim()) {
                return false;
            }
        }
        return true;
    }

    addUser(event) {
        event.preventDefault();
        const { adminStore } = this.props;
        const { enterpriseId, accessType, userList, selectedIndustryForKPIs, endDate, accountName } = this.state;

        if (!this.checkIfUserIsUnique(userList, enterpriseId)) {
            this.showAlreadyExistsNotification();
        }
        else {
            let accountNameValue = ''
            let industryRequestData=[];
            this.setState({
                isAddLoading:true
            })
            selectedIndustryForKPIs.length > 0  && selectedIndustryForKPIs.forEach((industry)=>{
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
            let newEndDate = new Date();
            if(accessType !== 'A' && endDate === ''){
                newEndDate = new Date(newEndDate.setDate(newEndDate.getDate() + 30))
            }else{
                newEndDate = endDate;
            }
            let endDt = DashBoardUtils.formatDate(newEndDate)
            adminStore.addUser(enterpriseId, accessType, industryRequestData, accountNameValue, endDt)
                .then((response) => {
                    if (response && response.data.resultCode === 'OK') {
                        this.showSuccessNotification("Success", response.data.resultDescription);
                      
                        this.setState({
                            enterpriseId: '',
                            accessType:'',
                            endDate: '',
                            isAddLoading:false,
                            accountName :''
                        });
                        if(this.props.userTypeSelected === "Accenture"){
                            var select = document.getElementById("admin-accessType-filter");
                            select.value = ""
                        }
                      
                       
                    } else if(response && response.data.resultCode === 'KO'){
                        this.showErrorNotification("Error", response.data.errorDescription);
                        this.setState({
                            isAddLoading:false
                        })
                    }
                    // window.location.reload();
                    this.props.getUsersList();
                })
        }
    }


    showAlreadyExistsNotification() {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={'User already exists'}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showSuccessNotification(title, bodytext) {
        toast.info(<NotificationMessage
            title={title}
            bodytext={bodytext}
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }
    showErrorNotification(title, bodytext) {
        toast.error(<NotificationMessage
            title={title}
            bodytext={bodytext}
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    changeAccess = (event) => {
        event.preventDefault();
        if(this.state.industriesList.length === 0 && event.currentTarget.value === "IndustryLead"){
            this.getMasterIndustries()
        }
        else{
            this.setState({
                selectedIndustryForKPIs: [],
                selectedMultipleIndustryItems: 0,
            });
        }
        this.setState({
            accessType: event.currentTarget.value
        })

    }

	/*validateEmail(email) {
		//let valCheck= RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/);
		//let valCheck = RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
        return RegExp(/^[0-9A-Za-z._-@]*$/).test(email);
    }*/

    setEnterpriseId = (value) => {
        value = (value).toLowerCase();
       const {userTypeSelected } = this.props;
      let  isError = false;
        if (DashBoardUtils.isEmailValid(value) ){         
        if ( userTypeSelected === 'Non-Accenture' && (value.indexOf('@accenture.com') !== -1)) {
            isError = true
            this.setState({
                mailError:'Non-Accenture Email ID should not contain @accenture.com',
                enterpriseId: value
    
            })
        }
        else if (userTypeSelected === 'Accenture' && (value.indexOf('@accenture.com') === -1) ) {
            isError = true
            this.setState({
               mailError: 'Accenture Email ID should contain @accenture.com',
               enterpriseId: value
               
            })
        }
        else {
            this.setState({
                mailError:'',
                enterpriseId: value
            })
        }
    }
        else  {
        this.setState({
            mailError:'Please provide valid Email ID.',
            enterpriseId: value

        })
        }
        
    }

    validateUser = (event) => {
     if (event.indexOf('@accenture.com') === -1) {
     this.isExternal = true
     return true;
     }

     else {
         this.isExternal = false
         return false;
        }
      }

getSaveDisableState = () =>{
    if(this.props.userTypeSelected === "Accenture"){
        return ((this.state.enterpriseId.trim() !== "" && this.state.mailError === '') && this.state.accessType !== "" && this.state.selectedIndustryForKPIs.length > 0  && this.state.endDate !=='') ? false : true

    }else{
        return ((this.state.enterpriseId.trim() !== "" && this.state.mailError === '') && this.state.accessType !== "" && this.state.accountName !=='' && this.state.endDate !=='') ? false : true
    }   
}

    render() {
        const {isAddLoading} = this.state;
        return (

            <div className="col-sm-4" id="userForm" style={{ marginTop: '10px' }} >


                <form>

                    <div className="userFormRow" >
                        <div className="userFormLable"><label className="form-label">Email Id *</label> </div>

                        <input className="textboxStyle" type="text" maxLength = "99" 
                        onChange={e => this.setEnterpriseId(e.target.value)} value={this.state.enterpriseId} />
                        <span style={{ color: '#ffffff' }}><small>{this.state.mailError}</small></span>
                    </div>
                    {SessionStorage.read("userType") === "EU" ? 
                     <div className="userFormRow" >
                     <div className="userFormLable"><label className="form-label">Access Type *</label> </div>
                    <input className="textboxStyle" type="text" value="External User" disabled/>
                    </div> :
                   
                    <div className="userFormRow">
                        <div className="userFormLable"> <label className="form-label">Access Type *</label> <br /></div>
                        { this.props.userTypeSelected === "Accenture" ?   
                        <select
                            className="master-dropdown"
                            id="admin-accessType-filter"
                            onChange={this.handleAccessTypeChange}>
                        
                            
                                <option value="" selected disabled>Select</option> 
                                {/* <option value ={this.accessList && this.accessList[0] && this.accessList[0].value} selected>{ this.accessList && this.accessList[0] && this.accessList[0].label}</option>} */}

                            { this.props.userTypeSelected === "Accenture" && this.accessList.map(element => {
                               return <option value={element.value}> {element.label} </option>
                            })}
                        </select> :
                        <input className="textboxStyle"  id="admin-accessType-filter" type="text" value={this.accessList &&  this.accessList[0] && this.accessList[0].label} readOnly/>}
                    </div>}

                    {this.state.accessType === "IL" && this.props.userTypeSelected === "Accenture" ?
                    <div className="userFormRow">
                        <div className="userFormLable"> <label className="form-label">Industry *</label> <br /></div>
                        
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

                 {  this.props.userTypeSelected !== "Accenture"  ?   
                    <div className="col form-group_newProject" style={{marginLeft:'58px', marginTop:'10px', marginBottom:'0px'}}>
                        <label htmlFor="accountInput" className="required-label">
                            Account Name&nbsp;
                                        </label>

                        <Select
                            size={1}
                            id="selectAccountNameDropdown"
                            isSearchable
                            isClearable
                            className="accName-input"
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
                    : ''}
                    {this.state.accessType !== 'A' ? 
                     <div className="userFormRow" >
                      <div className="userFormLable"><label className="form-label">End Date </label> 
                      <div className="date-wrapper">
                      
                       <DatePicker  placeholderText="dd/mm/yyyy"  dateFormat="dd-MMM-yyyy"   
                       showMonthDropdown
                       showYearDropdown
                       value={this.state.isEdited ? this.state.endDate : this.handleDate()}
                       selected={this.state.isEdited ? this.state.endDate : this.handleDate()}
                       onChange={this.handleChangeDate}
                       minDate={new Date()}
                       disabled = {this.state.accessType === 'A' || this.state.accessType === 'D'}
                       className="textboxStyle" />
                       
                      {this.state.accessType !== 'A' &&<img src={calendarIcon} alt="CalendarIcon"  style={{ width: "18px", marginLeft: "-23px", zIndex: '0' }}></img>}
                  
                       
                       </div>
                       </div>
                       </div>
                         : '' }
               
                 
                    <div className="userFormRow" style={{ paddingTop: '16px' }}>
                        <div className="cr-de-btn-div">
                            {isAddLoading? 
                            <button type="submit" className="btn btn-primary"
                                // onClick={this.addUser}
                                disabled>
                                Adding User {" "}
                                <i className="fa fa-spinner fa-spin  add-spin" style={{ color: '#ffffff',marginLeft:"8px" }}></i>
                              </button>:
                            <button type="submit" className="btn btn-primary"
                                onClick={this.addUser}
                                disabled={this.props.userTypeSelected === "Accenture" ?   ((this.state.enterpriseId.trim() === "" || this.state.mailError !== '') || this.state.accessType === ""  || (this.state.accessType === "IL" && this.state.selectedIndustryForKPIs.length === 0 ))  : ((this.state.enterpriseId.trim() === "" || this.state.mailError !== '')|| this.state.accessType === "" || this.state.accountName ==='' ) }>
                                Add User {" "}
                                {/* <i className="fa fa-plus"></i> */}
                            </button>
                            }
                        </div>

                    </div>

                </form>
            </div>

        )
    }
}



export default withRouter(UserForm);
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
//import Moment from 'react-moment';
import 'moment-timezone';
import { toast } from 'react-toastify';
import S3BucketUpload from '../S3BucketUpload/S3BucketUpload';
import Menu from '../../components/Menu/Menu';
import ProjectUser from '../../components/ProjectUser/ProjectUser';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import 'react-datepicker/dist/react-datepicker.css';
import '../MyProjects/MyProjects.css';
import './NewProject.css';
import ModalConvertConfirm from './ModalConvertConfirm.jsx';
import ReactTooltip from 'react-tooltip';
import Storage from '@aws-amplify/storage';
import { SetS3Config } from '../Login/Login';
import calender from "../../assets/project/date_calender.svg";
import Logo from '../../assets/logo/logo.png';
import cross from '../../assets/newDealsIcons/cross.svg';
import { blue } from '@material-ui/core/colors';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import NewUserRegistrationModal from '../../components/ProjectUser/NewUserRegistrationModal'
import DashBoardUtils from '../Dashboards/DashboardUtils';
var SessionStorage = require('store/storages/sessionStorage');

const env = process.env.REACT_APP_BASE_URL;
// const defaultStyle = {

//     indicatorSeparator: () => ({
//         border: null
//     }),
//     control: (provided, state) => {
//         const border = "0.5px solid #F0F0F0";
//         const borderRadius = '2px';


//         return { ...provided, border, borderRadius,
//             '&:focus': {
//             // borderColor: "none",
//             // outline: "0",
//             // boxShadow: "none"

//         },
//         '&:hover': {
//             borderColor: "none",

//         },
//      };
//     },
//     container: () => ({
//         width: "320px",
//     }),
//     singleValue: () => ({
//         color: "rgba(255, 255, 255, 0.7)",


//     }),
//     menuList: provided => ({
//         ...provided,
//         height: '80px',
//         backgroundColor: "#5A5A5A",
//         // width:"320px",
//         border: "0.5px solid #F0F0F0",
//         borderTop: "none"
//     }),
//     menu: provided => ({
//         ...provided,
//         // border: "0.5px solid #F0F0F0",
//         width: "320px",
//     }),

//     option: styles => {
//         return {
//             ...styles,
//             color: '#FFFFFF',
//             fontFamily: "Poppins",
//             fontStyle: "normal",
//             fontWeight: "normal",
//             fontSize: "14px",
//             height: "30px",
//             '&:hover': {
//                 backgroundColor: '#595959'
//             },
//             //   '&:select': {
//             //     backgroundColor: '#595959'
//             //   },

//         };
//     }

// };


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
const createOption = (label: string) => ({
    label: label !== null ? label : "",
    // value: label !== null ? label.toLowerCase().replace(/\W/g, '') : "",  check with swathi on this
    value: label !== null ? label : "",
});

@inject('myProjectStore')
@inject('adminStore')
@observer
class NewProject extends Component {
    userNameChangedFromAutoCompleteFlag = false;
    constructor(props) {
        super(props);
        this.state = {
            dateValue: new Date(),
            projectUsers: [],
            accountName: '',
            projectName: '',
            ownerName: '',
            description: '',
            downloadBtn: false,
            templateFileVisible: false,
            editBtnLoader: false,
            formattedDate: '',
            initialUsersList: [],
            file: null,
            displayFile: null,
            userDetails: '',
            addUser: false,
            email: '',
            modalVisible: false,
            errMsg: '',
            projectId: '',
            mapId: '',
            accountNamesList: [],
            isAccountNamesLoading: true,
            replaceLoader: false,
            renameLoader: false,
            projectNameError: false,
            ownerNameError: false,
            descriptionError: false,
            userAccessModalVisible: false,
            userAccessModalTitle: '',
            fileDeleteModalvisible: false,
            fileDeleteModalTitle: '',
            userDeleteModalVisible: false,
            userDeleteModalTitle: '',
            confirmModalEventData: '',
            loader: false,
            projectEndDate: '',
            addUserModalVisible: false,
            enableAddButton: false,
            userTypeSelected: 'Accenture',
            usersType: ''
        };

        this.addFileToS3 = this.addFileToS3.bind(this);
        this.resetFile = this.resetFile.bind(this);
        this.addUserHandler = this.addUserHandler.bind(this);
        this.deleteUserHandler = this.deleteUserHandler.bind(this);
        this.onUserEmailChangeHandler = this.onUserEmailChangeHandler.bind(this);
        this.onUserAccessChangeHandler = this.onUserAccessChangeHandler.bind(this);
        this.onChangeFormFieldHandler = this.onChangeFormFieldHandler.bind(this);
        this.submitProjectHandler = this.submitProjectHandler.bind(this);
        this.updateUserHandler = this.updateUserHandler.bind(this);
        this.downloadProjectTemplate = this.downloadProjectTemplate.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onConvert = this.onConvert.bind(this);
        this.onRenameClick = this.onRenameClick.bind(this);
        this.onReplaceClick = this.onReplaceClick.bind(this);
        this.getBucketName = this.getBucketName.bind(this);
        this.onConfirmUserAccessChange = this.onConfirmUserAccessChange.bind(this);
        this.openUserAccessModal = this.openUserAccessModal.bind(this);
        this.closeUserAccessModal = this.closeUserAccessModal.bind(this);
        this.onConfirmUserDeletehandler = this.onConfirmUserDeletehandler.bind(this);
        this.openUserDeleteModal = this.openUserDeleteModal.bind(this);
        this.closeUserDeleteModal = this.closeUserDeleteModal.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addUserModal = this.addUserModal.bind(this);
    }
    componentDidMount() {
        const { myProjectStore } = this.props;
        const { editProjectId } = myProjectStore;
        let usersTypeLocal;
        myProjectStore.emailId = ""
        let projectName = '';
        let option = SessionStorage.read('option_selected');
        if (option === 'sales') {
            usersTypeLocal = 'AssignOpportunity';
            this.setState({
                usersType: "AssignOpportunity"
            })
        }
        else {
            usersTypeLocal = 'AssignProject';
            this.setState({
                usersType: "AssignProject"
            })
        }
        if (editProjectId) {
            // this.getTemplateFileDetails()
            const { projectDetails } = myProjectStore;
            const projectDataLength = projectDetails.length;
            for (let i = 0; i < projectDataLength; i++) {
                if (Number(projectDetails[i].projectId) === Number(editProjectId)) {
                    projectName = projectDetails[i].projectName;
                    this.setState({
                        accountName: createOption(projectDetails[i].accountName),
                        projectName: projectDetails[i].projectName,
                        ownerName: projectDetails[i].ownerName,
                        description: projectDetails[i].description,
                        dateValue: this.getDateFromString(projectDetails[i].startDate),
                        isAccountNamesLoading: false
                    });
                    myProjectStore.accountName = createOption(projectDetails[i].accountName);
                    myProjectStore.projectName = projectDetails[i].projectName;
                    myProjectStore.ownerName = projectDetails[i].ownerName;
                    myProjectStore.description = projectDetails[i].description;
                    myProjectStore.startDate = projectDetails[i].startDate;
                }
            }
            SessionStorage.write('projectId', editProjectId);
            SessionStorage.write('selectedEditProjectName', projectName);
            myProjectStore.getProjectUsers(editProjectId).then(response => {
                if (response && !response.error && response.resultCode === 'OK') {
                    // if(myProjectStore.projectUsersList.length === 0 ){
                    //     const userDetail = {
                    //         email_user0: '',
                    //         access_user0: 'Read',
                    //         delete_index: 0,
                    //     };
                    //     projectUsers.push(userDetail); 
                    // }else{
                    //     let index = myProjectStore.projectUsersList.length
                    //     const userDetail = {
                    //         ["email_user"+"index"] : '',
                    //         ["access_user0"+"index"]: 'Read',
                    //         delete_index: 0,
                    //     };
                    //     projectUsers.push(userDetail); 
                    // }
                    this.setState({
                        projectUsers: myProjectStore.projectUsersList,
                        initialUsersList: [...myProjectStore.initialUsersList],
                    });
                } else if (response && response.resultCode === 'KO') {
                    this.showErrorNotification('Error', response.errorDescription);
                }
            });
        }

        this.fetchUsers(usersTypeLocal, this.state.userTypeSelected);

        /* test for account names */
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

        /* end */
    }

    fetchUsers = (usersType, userTypeSelected) => {
        const { adminStore } = this.props;
        adminStore.fetchUsers(usersType, userTypeSelected).then(response => {
            if (response && !response.error && response.data && response.data.resultCode === 'OK') {
                this.pageLoader = false;
                let userList = [];
                if(userTypeSelected === 'Non-Accenture' && this.state.accountName !== '' && this.state.accountName !== null){
                   /*  adminStore.userDetails.map(user => {
                        if(user.accountName === this.state.accountName.value){
                            userList.push(user)
                        }
                    }) */
                    userList = this.filterUser()
                    /* if(userList.length === 0){
                        userList = adminStore.userDetails;
                    } */
                }else if(userTypeSelected === 'Non-Accenture' && (this.state.accountName === '' || this.state.accountName === null)){
                    userList =  [{
                        userEmail: 'Please select Account Name first, before adding Non Accenture User ID'
                    }]
                }
                else if(userTypeSelected === 'Accenture'){
                    userList = adminStore.userDetails;
                }
                this.setState({
                    userDetails: userList
                });
            } else if (response && response.data && response.data.resultCode === 'KO') {
                this.showErrorNotification('Error', response.data.errorDescription);
            }
            // }
        });
    }

    filterUser(){
        const { adminStore } = this.props;
        let userList = [];
        if(this.state.accountName !== null){
            adminStore.userDetails.map(user => {
                if(user.accountName === this.state.accountName.label){
                    userList.push(user)
                }
            })
        }        
        return userList;
    }
    onConvert = () => {
        const { myProjectStore } = this.props;
        const { projectUsers } = this.state;
        const flag = "";
        let emails = []
        for (let i = 0; i < projectUsers.length; i++) {
            emails.push(projectUsers[i]['email_user' + i])      // }
        }
        this.setState({
            editBtnLoader: true
        })
        myProjectStore.dealToProject(projectUsers, flag)
            .then((res) => {
                if (!res.error && res.resultCode === "KO") {
                    if (res.resultDescription.includes("already exists")) {
                        this.setState({
                            errMsg: res.errorDescription,
                            projectId: res.resultObj.project_id,
                            mapId: res.resultObj.map_id,
                            modalVisible: true,
                            editBtnLoader: false
                        })
                    }
                    else {
                        this.showWarningNotification('error', res.errorDescription);
                        this.setState({
                            editBtnLoader: false
                        })
                    }
                }
                else {

                    this.setState({
                        editBtnLoader: false
                    })
                    this.showWarningNotification("success", "")
                    if (emails.length > 0) {
                        this.mailUsersOnCreateOrUpdateProject(emails);
                    }
                    this.addFileToS3(res.resultObj.target_project_id)

                }
            })

    }
    onCancelClick = () => {
        const { history } = this.props;
        this.setState({
            modalVisible: false,
        });
        SessionStorage.write('option_selected', 'sales');
        history.push('/my-deals');
    };
    onRenameClick = () => {
        const { myProjectStore } = this.props;
        const { projectUsers } = this.state;
        const flag = "rename";
        let emails = []
        this.setState({
            renameLoader: true
        })
        for (let i = 0; i < projectUsers.length; i++) {
            emails.push(projectUsers[i]['email_user' + i])      // }
        }
        myProjectStore.dealToProject(projectUsers, flag)
            .then((res) => {
                this.setState({
                    errMsg: res.errorDescription,
                    projectId: res.resultObj.target_project_id,
                    mapId: res.resultObj.target_map_id,
                    modalVisible: true,
                    renameLoader: false
                })
                if (!res.error && res.resultCode === "OK") {

                    this.showWarningNotification("success", "");
                    this.setState({
                        modalVisible: false,
                        renameLoader: false
                    })
                    if (emails.length > 0) {
                        this.mailUsersOnCreateOrUpdateProject(emails);
                    }
                    this.addFileToS3(res.resultObj.target_project_id)
                }
                else {
                    this.showWarningNotification('error', res.errorDescription);
                    this.setState({
                        modalVisible: false,
                        renameLoader: false
                    })
                }
            })
    }
    onReplaceClick = () => {
        const { myProjectStore } = this.props;
        const { projectUsers } = this.state;
        let emails = []
        this.setState({
            replaceLoader: true
        })
        for (let i = 0; i < projectUsers.length; i++) {
            emails.push(projectUsers[i]['email_user' + i])      // }
        }
        myProjectStore.deleteProject({
            mapId: this.state.mapId,
            userId: SessionStorage.read('userId'),
            projectId: this.state.projectId
        }).then((response) => {
            if (response && !response.error) {
                //    this.onConvert()
                const flag = "";
                myProjectStore.dealToProject(projectUsers, flag)
                    .then((res) => {
                        if (!res.error && res.resultCode === "OK") {

                            this.showWarningNotification("success", "");
                            this.setState({
                                modalVisible: false,
                                replaceLoader: false
                            })
                            if (emails.length > 0) {
                                this.mailUsersOnCreateOrUpdateProject(emails);
                            }
                            this.addFileToS3(res.resultObj.target_project_id);
                        }
                        else {
                            this.showWarningNotification('error', res.errorDescription);
                            this.setState({
                                modalVisible: false,
                                replaceLoader: false
                            })
                        }
                    })
            }
            else {
                this.showWarningNotification('error', 'projectDeletionFailure');
            }

        })
    }

    onChange(file) {
        this.setState({
            displayFile: URL.createObjectURL(file),
            file: file,
        });
    }

    getBucketName() {
        // eslint-disable-next-line default-case
        switch (env) {
            case 'production':
                return 'prod-valuecockpit-ui';
            case 'preprod':
                return 'preprod-valuecockpit-ui';
            case 'staging':
                return 'uat-valuecockpit-ui';
            case 'development':
                return 'dev-valuecockpit-ui';
            case 'local':
                return 'dev-valuecockpit-ui';
            case 'productionb':
                return 'prodb-valuecockpit-ui';
            case 'dev2':
                return 'dev2-valuecockpit-ui';
            case 'training':
                return 'training-valuecockpit-ui';
        }
    }

    addFileToS3(projectId) {
        const { history } = this.props;
        let bucketName = this.getBucketName();
        const uploadUrl = bucketName + '/vroimages/' + projectId;
        this.state.file && SetS3Config(uploadUrl);
        if (this.state.file) {
            Storage.put(`test1.png`, this.state.file, {
                contentType: this.state.file.type,
            })
                .then(res => {
                    // res.removeHeader('Content-Length');
                    history.push('my-deals');
                }).catch(e => {
                    this.showNotification();
                    history.push('my-deals');
                });
        } else {
            history.push('my-deals');
        }
    }

    getDateFromString(dateString) {
        return new Date(
            Number(dateString.split('-')[2]),
            Number(dateString.split('-')[1] - 1),
            Number(dateString.split('-')[0])
        );
    }
    handleChange = value => {
        const { myProjectStore } = this.props;
        let formattedDate = this.formatDate(value);
        this.setState(
            {
                dateValue: value,
                formattedDate: formattedDate,
            },
            () => {
                myProjectStore.startDate = this.state.formattedDate;
            }
        );
    };

    formatDate(value) {
        if (value) {
            let date = value.getDate().toString();
            let month = (value.getMonth() + 1).toString();
            let year = value.getFullYear().toString();
            if (month < 10) {
                month = '0' + month;
            }
            if (date < 10) {
                date = '0' + date;
            }
            return `${date}-${month}-${year}`;
        }
    }

    redirectHandler(type) {
        const { history } = this.props;
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'sales':
                history.push('/home');
                break;
            case 'myproject':
                history.push('my-deals');
                break;
            case 'sales-home':
                history.push('/sales-home');
                break;
            case 'Delivery':
                history.push('/delivery');
                break;
            default:
                break;
        }
    }

    submitProjectHandler = event => {
        event.preventDefault();
        let emails = [];
        const { projectUsers }  = {...this.state};
        const { myProjectStore } = this.props;
        const {projectName, ownerName, description} = this.state
        let validationFlag = false;
        myProjectStore.startDate = myProjectStore.startDate
            ? myProjectStore.startDate
            : this.formatDate(new Date());
        for (let i = 0; i < projectUsers.length; i++) {
            emails.push(projectUsers[i]['email_user' + i]); // }
        }

        if(projectName.trim() === '' || ownerName.trim() === '' || description.trim() === ''){
            validationFlag = true;
        }

        if (!validationFlag) {
            this.setState({
                editBtnLoader: true,
            });
            myProjectStore.saveNewProject(projectUsers, 'NEW').then(response => {
                if (response && !response.error && response.resultCode === 'OK') {
                    myProjectStore.projectCreated = true;
                    this.setState({
                        editBtnLoader: false,
                    });
                    this.showWarningNotification('success', this.state.projectName);
                    if (emails.length > 0) {
                        this.mailUsersOnCreateOrUpdateProject(emails);
                    }
                    this.addFileToS3(myProjectStore.projectId);
                } else {
                    this.setState({
                        editBtnLoader: false,
                    });
                    const { errormessage } = myProjectStore;
                    this.showWarningNotification('error', errormessage);
                }
            });
        }
        else{
            this.setState({
                projectName : projectName.trim() === '' ? projectName.trim() : projectName,
                ownerName : ownerName.trim() === '' ? ownerName.trim() : ownerName,
                description : description.trim() === '' ? description.trim() : description,
            })
            this.showWarningNotification('error', 'Please fill all the mandatory fields');
        }
        myProjectStore.emailId = "";
    };

    showWarningNotification(type, projectName) {
        switch (type) {
            case 'success':
                toast.info(
                    <NotificationMessage
                        title="Success"
                        bodytext={'Successfully created ' + projectName}
                        icon="success"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
            case 'error':
                toast.error(
                    <NotificationMessage
                        title="Failure"
                        bodytext={projectName}
                        icon="error"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
            default:
                break;
        }
    }

    showErrorNotification(title, bodytext) {
        toast.error(<NotificationMessage
            title={title}
            bodytext={bodytext}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showUserNotification(type) {
        let option = SessionStorage.read('option_selected');
        // eslint-disable-next-line default-case
        switch (type) {
            case 'projectAddition':
                toast.info(
                    <NotificationMessage
                        title="Success"
                        bodytext={`Successfully updated ${option === 'sales' ? 'Opportunity' : 'Project'}  details`}
                        icon="success"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
            case 'userValidation':
                toast.error(
                    <NotificationMessage
                        title="Error"
                        bodytext={'Please add user'}
                        icon="error"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
            case 'emailValidation':
                toast.error(
                    <NotificationMessage
                        title="Error"
                        bodytext={'Please enter valid email'}
                        icon="error"
                    />,
                    {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    }
                );
                break;
        }
    }

    showNotification() {
        toast.error(
            <NotificationMessage title="Sorry, Client logo cannot be updated" bodytext={''} icon="error" />,
            {
                position: toast.POSITION.BOTTOM_RIGHT,
            }
        );
    }

    showEmailChangedNotification(msg) {
        toast.info(
            <NotificationMessage title="" bodytext={msg} icon="success" />,
            {
                position: toast.POSITION.BOTTOM_RIGHT,
            }
        );
    }

    addUserHandler = (event, from) => {
        const { myProjectStore } = this.props;
        if (!this.validateUserExistenceInTool() && this.state.userTypeSelected === 'Accenture' && from !== 'fromDropDown') {
            this.showErrorNotification("Error", 'Selected User not exists in tool. Please add the user using Add User link from drop-down');
        }
        else if (this.state.userTypeSelected === 'Non-Accenture' && myProjectStore.emailId.indexOf('@accenture.com') !== -1) {
            this.showErrorNotification('Error', 'Non-Accenture ID\'s should not contain @accenture.com')
        }
        else if (!this.validateUserExistenceInTool()) {
            this.addUserModal();
        } else {
            this.setState({
                addUser: true,
            });
            const { projectUsers } = this.state;
            if (projectUsers.length === 0) {
                const userDetail = {
                    email_user0: myProjectStore.emailId,
                    endDt_user0: this.state.projectEndDate,
                    access_user0: myProjectStore.accessTypeSelected,
                    delete_index: 0,
                };
                projectUsers.push(userDetail);
                this.setState({
                    projectUsers: projectUsers,
                    projectEndDate: ''
                });
            } else {
                if (projectUsers.some((proj, index) => projectUsers[index][`email_user${index}`] === this.state.email)) {
                    this.showEmailChangedNotification(`${this.state.email} user added already`);
                    myProjectStore.emailId = "";
                    this.setState({
                        projectEndDate: ''
                    });
                    return;
                } else {
                    const lastIndex = projectUsers.length;
                    const userDetail = {
                        ['email_user' + lastIndex]: myProjectStore.emailId,
                        ['endDt_user' + lastIndex]: this.state.projectEndDate,
                        ['access_user' + lastIndex]: myProjectStore.accessTypeSelected,
                        delete_index: lastIndex,
                    };
                    projectUsers.push(userDetail);
                    this.setState({
                        projectUsers: projectUsers,
                        projectEndDate: ''
                    });
                }
            }
            myProjectStore.emailId = "";
            myProjectStore.accessTypeSelected = "Read";
            myProjectStore.endDt = '';
        }
    };

    onChangeFormFieldHandler = event => {
        const { myProjectStore } = this.props;
        let errors = '';
        // eslint-disable-next-line default-case
        switch (event.target.id) {
            case 'accountInput':
                myProjectStore.accountName = event.target.value;
                this.setState({
                    accountName: event.target.value,
                });
                break;
            case 'projectInput':
                myProjectStore.projectName = event.target.value;
                errors = !RegExp(/[<>!'"[\]]/).test(myProjectStore.projectName) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    projectName: event.target.value,
                    projectNameError: errors,
                });
                break;
            case 'ownerInput':
                myProjectStore.ownerName = event.target.value;
                errors = !RegExp(/[<>!'"[\]]/).test(myProjectStore.ownerName) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    ownerName: event.target.value,
                    ownerNameError: errors,
                });
                break;
            case 'descriptionInput':
                myProjectStore.description = event.target.value;
                errors = !RegExp(/[<>!'"[\]]/).test(myProjectStore.description) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    description: event.target.value,
                    descriptionError: errors,
                });
                break;
        }
    };

    deleteUserHandler = event => {
        event.preventDefault();
        this.openUserDeleteModal('Are you sure you want to delete this user?', event);
        // if (window.confirm('Are you sure you want to delete this user?')) {


        // }
    };

    onConfirmUserDeletehandler = () => {
        const { projectUsers, confirmModalEventData } = this.state;
        projectUsers.splice(this.getIndex(confirmModalEventData.target.id), 1);
        const updatedProjectUsers = this.resetDeleteIndices(projectUsers);
        if (updatedProjectUsers.length === 0) {
            this.setState({
                projectUsers: [...updatedProjectUsers],
                addUser: false,
            });
        } else {
            this.setState({
                projectUsers: [...updatedProjectUsers],
            });
        }
    }

    openUserDeleteModal = (title, event) => {
        const eventObj = {
            'target': {
                'id': event.target.id,
                'value': event.target.value
            }
        }
        this.setState({
            userDeleteModalVisible: true,
            userDeleteModalTitle: title,
            confirmModalEventData: eventObj
        });
    }

    closeUserDeleteModal = (isYesClicked) => {
        this.setState({
            userDeleteModalVisible: false,
            userDeleteModalTitle: ''
        });
        if (isYesClicked) {
            this.onConfirmUserDeletehandler();
        } else {

        }
        this.setState({ confirmModalEventData: '' });
    }

    addUserModal = () => {
        this.setState({
            addUserModalVisible: true
        })
    }
    getIndex(targetId) {
        return Number(targetId[targetId.length - 1]);
    }

    resetDeleteIndices(projectUsers) {
        let newProjectUsers = projectUsers;
        for (let i = 0; i < projectUsers.length; i++) {
            const oldIndex = projectUsers[i]['delete_index'];
            projectUsers[i]['delete_index'] = i;
            projectUsers[i][`email_user${projectUsers[i][`delete_index`]}`] = projectUsers[i][`email_user${oldIndex}`];
            projectUsers[i][`access_user${projectUsers[i][`delete_index`]}`] = projectUsers[i][`access_user${oldIndex}`];
            projectUsers[i][`endDt_user${projectUsers[i][`delete_index`]}`] = projectUsers[i][`endDt_user${oldIndex}`];
            if (oldIndex !== i) {
                delete projectUsers[i][`email_user${oldIndex}`];
                delete projectUsers[i][`access_user${oldIndex}`];
                delete projectUsers[i][`endDt_user${oldIndex}`];
            }
        }
        return projectUsers;
    }
    onUserEmailChangeHandler = (item, event) => {
        const { projectUsers } = this.state;
        let targetValue = "";
        const { myProjectStore } = this.props;
        this.userNameChangedFromAutoCompleteFlag = false;
        if (item !== null) {
            targetValue = item;
        } else {
            targetValue = "";
        }
        if (targetValue !== undefined && targetValue !== '') {
            myProjectStore.emailId = targetValue;
        }
        let fieldValidations = this.validateFields();
        this.setState({
            email: myProjectStore.emailId,
            enableAddButton: fieldValidations
        });
        // return(<Modalalert text={}/>)
        let msg = '';
        if (targetValue) {
            msg = `You selected ${targetValue}`;
        } else if (targetValue !== undefined && targetValue.length === 0) {
            msg = 'Selection Cleared'
        }
        // const msg = `${targetValue} ? 'You selected ${targetValue}': 'Selection Cleared'`;
        /*  if(msg.trim().length > 0){
                this.showEmailChangedNotification(msg);
            } */
    };

    userNameChangedFromAutoComplete = () => {
        this.userNameChangedFromAutoCompleteFlag = true;
    }
    onUserAccessChangeHandler = event => {
        const { myProjectStore } = this.props;
        event.preventDefault();
        this.openUserAccessModal('Are you sure you want to edit user access type?', event);
        // if (window.confirm('Are you sure you want to edit user access type?')) {

        // }
    };

    onConfirmUserAccessChange = () => {
        const { confirmModalEventData, projectUsers } = this.state;
        const { myProjectStore } = this.props;

        const targetId = confirmModalEventData.target.id;
        const targetValue = confirmModalEventData.target.value;
        if (targetId === "") {
            myProjectStore.accessTypeSelected = targetValue;
        }
        else {
            for (let i = 0; i < projectUsers.length; i++) {
                if (projectUsers[i].hasOwnProperty(targetId)) {
                    projectUsers[i][targetId] = targetValue;
                }
            }
            this.setState({
                projectUsers: [...projectUsers],
            });
        }

    }

    openUserAccessModal = (title, event) => {
        const eventObj = {
            'target': {
                'id': event.target.id,
                'value': event.target.value
            }
        }
        this.setState({
            userAccessModalVisible: true,
            userAccessModalTitle: title,
            confirmModalEventData: eventObj
        });
    }

    closeUserAccessModal = (isYesClicked) => {
        this.setState({
            userAccessModalVisible: false,
            userAccessModalTitle: ''
        });
        if (isYesClicked) {
            this.onConfirmUserAccessChange();
        } else {

        }
        this.setState({ confirmModalEventData: '' });
    }

    updateUserHandler = event => {
        event.preventDefault();
        event.preventDefault();
        let {projectUsers}  = {...this.state};
        const { myProjectStore } = this.props;
        const {projectName, ownerName, description} = this.state
        let validationFlag = false;
        let emails = [];
        for (let i = 0; i < projectUsers.length; i++) {
            emails.push(projectUsers[i]['email_user' + i]);
        }

        if(projectName.trim() === '' || ownerName.trim() === '' || description.trim() === ''){
            validationFlag = true;
        }

        if (!validationFlag) {
            this.setState({
                editBtnLoader: true,
            });

            myProjectStore.saveNewProject(projectUsers, 'EDIT').then(response => {
                if (response && !response.error && response.resultCode === "OK") {
                    this.setState({
                        editBtnLoader: false,
                    });

                    this.showUserNotification('projectAddition');
                    const { userEmailList } = myProjectStore;
                    let uniqueList = emails.filter(function (obj) {
                        return userEmailList.indexOf(obj) === -1;
                    });
                    if (emails.length > 0 && uniqueList.length > 0) {
                        this.mailUsersOnCreateOrUpdateProject(emails);
                    }
                    this.addFileToS3(myProjectStore.projectId);
                } else {
                    this.setState({
                        editBtnLoader: false,
                    });
                    const { errormessage } = myProjectStore;
                    this.showWarningNotification('error', errormessage);
                }
            });
        }
        else{
            this.setState({
                projectName : projectName.trim() === '' ? projectName.trim() : projectName,
                ownerName : ownerName.trim() === '' ? ownerName.trim() : ownerName,
                description : description.trim() === '' ? description.trim() : description,
            })
            this.showWarningNotification('error', 'Please fill all the mandatory fields');
        }
    };
    validateEmail(email) {
        let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    }

    mailUsersOnCreateOrUpdateProject(emails) {
        let option = SessionStorage.read('option_selected');
        if (option === 'sales') {
            window.location.href =
                'mailto:sambit.banerjee@accenture.com?subject=User%20List&body=Hi%20Sambit,%20%0D%0A%0D%0APlease find updated user list for deal%20' +
                this.state.projectName +
                '%0D%0A%0D%0A' +
                emails.join(', ');
        } else {
            window.location.href =
                'mailto:sambit.banerjee@accenture.com?subject=User%20List&body=Hi%20Sambit,%20%0D%0A%0D%0APlease find updated user list for project%20' +
                this.state.projectName +
                '%0D%0A%0D%0A' +
                emails.join(', ');
        }
    }
    getTemplateFileDetails() {
        const { myProjectStore } = this.props;
        myProjectStore.getTemplateDetails().then(response => {
            if (response && !response.error && response.resultCode === 'OK') {
                this.setState({
                    templateFileVisible: true,
                });
            } else if (response.resultCode === 'KO') {
                this.showErrorNotification("Error", response.errorDescription);
            }
        });
    }

    downloadProjectTemplate = event => {
        const { myProjectStore } = this.props;
        this.setState({
            downloadBtn: true,
        });
        const url = event.target.getAttribute('data-url');
        const fileName = event.target.id;
        myProjectStore.downloadTemplate(url, fileName);
    };

    deleteFile(event) {
        this.openFileDeleteModal('Are you sure you want to delete this file?', event);
        // if (window.confirm('Are you sure you want to delete this file?')) {

        // }
    }

    onConfirmFileDeletehandler = () => {
        const { myProjectStore } = this.props;
        const { confirmModalEventData } = this.state;
        const fileName = confirmModalEventData.target.id;
        myProjectStore.deleteFile(fileName);
        this.getTemplateFileDetails();
    }

    openFileDeleteModal = (title, event) => {
        const eventObj = {
            'target': {
                'id': event.target.id,
                'value': event.target.value
            }
        }
        this.setState({
            fileDeleteModalVisible: true,
            fileDeleteModalTitle: title,
            confirmModalEventData: eventObj
        });
    }

    closeFileDeleteModal = (isYesClicked) => {
        this.setState({
            fileDeleteModalVisible: false,
            fileDeleteModalTitle: ''
        });
        if (isYesClicked) {
            this.onConfirmFileDeletehandler();
        } else {

        }
        this.setState({ confirmModalEventData: '' });
    }

    resetFile(event) {
        event.preventDefault();
        this.setState({
            file: null,
            displayFile: null,
        });
    }
    // resetFileName = () => {
    //     this.setState({
    //         file: null,
    //         displayFile: null,
    //     });
    // }
    isEnabled() {
        if (
            (this.state.accountName !== '' && this.state.accountName !== null) &&
            (!RegExp(/[<>!'"[\]]/).test(this.state.projectName) && this.state.projectName !== '') &&
            (!RegExp(/[<>!'"[\]]/).test(this.state.ownerName) && this.state.ownerName !== '') &&
            (!RegExp(/[<>!'"[\]]/).test(this.state.description) && this.state.description !== '') &&
            this.state.dateValue !== null &&
            (this.state.addUser !== true || this.state.email !== '')
        ) {
            return false;
        }
        return true;
    }

    handleOptionChange = (selectedOption) => {
        const { myProjectStore, adminStore } = this.props;
        let userList = [];
        
        this.setState({ accountName: selectedOption}, () => { 
            if(this.state.userTypeSelected === 'Non-Accenture'){
                userList = this.filterUser()
                if(this.state.accountName === null || this.state.accountName === ''){
                    userList =  [{
                        userEmail: 'Please select Account Name first, before adding Non Accenture User ID'
                    }]
                }
                this.setState({
                    userDetails: userList
                })
            }           
            myProjectStore.accountName = this.state.accountName;
        });
    }

    getUsers(userType) {
        this.setState({
            loader: false,
            userTypeSelected: userType
        }, () => {
            this.fetchUsers(this.state.usersType, userType);
        })

    }

    closeAddUserModal = () => {
        this.setState({
            addUserModalVisible: false
        }, () => {
            this.fetchUsers(this.state.usersType, this.state.userTypeSelected);
        })
    }

    onEndDateChange = (value) => {
        const { myProjectStore } = this.props;
        let formattedDate = this.formatDate(value);
        myProjectStore.endDt = formattedDate
        let fieldValidations = this.validateFields();
        this.setState({
            projectEndDate: value,
            enableAddButton: fieldValidations
        })
    }
    validateUserExistenceInTool = () => {
        const { myProjectStore } = this.props;
        let userID = myProjectStore.emailId
        let userList = this.state.userDetails
        let result = userList.filter(user =>
            user.userEmail === userID
        )
        if (result.length > 0) {
            return true
        } else {
            return false
        }
    }

    validateFields = () => {
        const { myProjectStore } = this.props;
        if (DashBoardUtils.isEmailValid(myProjectStore.emailId) && myProjectStore.accessTypeSelected !== '' && myProjectStore.endDt !== '') {
            return true
        } else {
            return false
        }
    }
    render() {
        const enabled = this.isEnabled();
        const { myProjectStore } = this.props;
        const {
            accountName,
            projectName,
            ownerName,
            description,
            projectUsers,
            templateFileVisible,
            editBtnLoader,
            userDetails,
            accountNamesList,
            isAccountNamesLoading
        } = this.state;
        const { editProjectId, templateArray } = myProjectStore;
        const eId = myProjectStore.emailId;
        const accessType = myProjectStore.accessTypeSelected;
        const option = SessionStorage.read('option_selected');
        const isConvert = SessionStorage.read('convertToProject');
        return (
            <div className="container-fluid my-project-body newProject" style={{ backgroundColor: "#5A5A5A !important" }}>
                <Menu />
                <div className="page-off-menu">
                    <div className="row breadcrumb-row">
                        <div className="col-sm-10">
                            {/* <div>
                            <label className="page-header-label">
                                {isConvert === 'true'
                                    ? 'CONVERT DEAL TO PROJECT'
                                    : editProjectId
                                        ? option === 'delivery' ? 'UPDATE PROJECT' : 'UPDATE DEAL'
                                        : option === 'delivery' ? 'NEW PROJECT' : 'NEW DEAL'}
                            </label>
                        </div> */}
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li
                                            className="breadcrumb-item"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => this.redirectHandler('home')}
                                        >
                                            Home
                  </li>
                                        {option === 'sales'
                                            ? <li
                                                className="breadcrumb-item active"
                                                style={{ cursor: 'pointer' }}
                                                aria-current="page"
                                                onClick={() => this.redirectHandler('sales-home')}
                                            >
                                                Opportunity Home{' '}
                                            </li>
                                            : <li
                                                className="breadcrumb-item active"
                                                style={{ cursor: 'pointer' }}
                                                aria-current="page"
                                                onClick={() => this.redirectHandler('Delivery')}
                                            >
                                                Program Delivery Home{' '}
                                            </li>
                                        }
                                        {/* <li
                                            className="breadcrumb-item"
                                            style={{ cursor: 'pointer' }}
                                            onClick={option === 'delivery' ? ()=> this.redirectHandler('Delivery') : ()=> this.redirectHandler('sales')}
                                        >
                                            {isConvert === 'true'
                                                ? 'Sales'
                                                : option === 'delivery' ? 'Delivery' : 'Sales'}
                                        </li> */}
                                        <li
                                            className="breadcrumb-item"
                                            style={{ cursor: 'pointer' }}
                                            aria-current="page"
                                            onClick={() => this.redirectHandler('myproject')}
                                        >
                                            {isConvert === 'true'
                                                ? 'My Opportunities'
                                                : option === 'delivery' ? 'My Projects' : 'My Opportunities'}
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            {isConvert === 'true'
                                                ? 'Converting Opportunity to Project'
                                                : editProjectId
                                                    ? this.state.projectName
                                                    : option === 'delivery' ? 'New project' : 'New Opportunity'}
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                        <div className="col-sm-2 text-right">
                            <span
                                onClick={() => this.redirectHandler('myproject')}
                                style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}
                            >
                                <img src={cross} alt="cross" className="cross" data-tip="" data-for="cancel_tooltip" />
                            </span>
                            <ReactTooltip id="cancel_tooltip" className="tooltip-class">
                                <span>Cancel</span>
                            </ReactTooltip>
                        </div>
                    </div>

                    <div className="deals-projects-main">
                        {/* Replaced 'class' with 'className' as a valid DOM property */}
                        <form>
                            <div className="row page-header-row">
                                <div className="col-sm-6" style={{ paddingLeft: "0px" }}>
                                    <div className="col-sm-8 page-header-label"
                                        style={{ paddingLeft: "0px" }}
                                    >
                                        {isConvert === 'true'
                                            ? 'Converting Opportunity to Project'
                                            : editProjectId
                                                ? option === 'delivery'
                                                    ? 'Update Project Details'
                                                    : 'Update Opportunity Details'
                                                : option === 'delivery'
                                                    ? 'Create New Project'
                                                    : 'Create New Opportunity'}
                                    </div>
                                </div>
                                <div className="col-sm-6" style={{ paddingRight: "0px" }}>
                                    {
                                    editProjectId
                                        ? <button
                                            type="button"
                                            disabled={((SessionStorage.read('accessType') === 'Write') && enabled) || (SessionStorage.read('accessType') === 'Read') || (editBtnLoader)}
                                            className="btn btn-primary float-right"
                                            style={{
                                                // fontWeight: 'bold',
                                                fontSize: '14px',
                                                width: '200px',
                                            }}
                                            onClick={
                                                isConvert === 'true'
                                                    ? this.onConvert
                                                    : this.updateUserHandler
                                            }
                                        >
                                            {isConvert === 'true'
                                                ? 'Convert Opportunity to Project'
                                                : option === 'delivery'
                                                    ? ' Update Project Details'
                                                    : ' Update Opportunity Details'}
                                            {editBtnLoader && <i className="fa fa-spinner fa-spin" />}
                                        </button>
                                        : <button
                                            type="button"
                                            disabled={(enabled || editBtnLoader)}
                                            className={
                                                (enabled || editBtnLoader) ?
                                                    "btn btn-primary disableHov float-right" :
                                                    "btn btn-primary enableHov float-right"
                                            }
                                            // style={
                                            //     enabled
                                            //         ? {
                                            //             // fontWeight: 'bold',
                                            //             fontSize: '14px',
                                            //             width: '200px',
                                            //             backgroundColor: '#595959',
                                            //             borderColor: '#595959'
                                            //         }
                                            //         : {
                                            //             // fontWeight: 'bold',
                                            //             fontSize: '14px',
                                            //             width: '200px',
                                            //             backgroundColor: '#00B0F0',
                                            //             borderColor: '#00B0F0'
                                            //         }
                                            // }
                                            onClick={
                                                isConvert === 'true'
                                                    ? this.onConvert
                                                    : this.submitProjectHandler
                                            }
                                        >
                                            {isConvert === 'true'
                                                ? 'Convert to Project'
                                                : option === 'delivery'
                                                    ? 'Create Project'
                                                    : 'Create Opportunity'}
                                                       {editBtnLoader && <i className="fa fa-spinner fa-spin" />}
                                       
                                        </button>
                                        
                                        }
                                </div>
                            </div>
                            {/* {enabled
                        ? <div className="row">
                            <div style={{ marginLeft: '1.2%' }}>
                                <p>Please fill all mandatory fields marked with *</p>
                            </div>
                            <div style={{ marginLeft: '25%' }}>
                                <p>
                                    {' '}
                    Only users having access to valuecockpit can be added to the deal
                  </p>
                            </div>
                        </div>
                        : <div className="row">

                            <div style={{ marginLeft: '51%' }}>
                                <p>
                                    {' '}
                    Only users having access to valuecockpit can be added to the deal
                  </p>
                            </div>
                        </div>
                        } */}
                            <div className="row main-form">
                                <div className="col-sm-4">
                                    <div className="col form-group_newProject">
                                        <label htmlFor="accountInput" className="required-label">
                                            Account Name&nbsp;
                                        </label>

                                        <Select
                                            size={1}
                                            id="selectAccountNameDropdown"
                                            isSearchable
                                            isClearable
                                            isDisabled={editProjectId ? true : false}
                                            className="accName-input"
                                            value={this.state.accountName}
                                            onChange={this.handleOptionChange}
                                            styles={defaultStyle}
                                            noOptionsMessage={() => "Requested Account name is not available in the list, please reach out to Admin to get it enabled."}
                                            options={
                                                accountNamesList && accountNamesList.constructor === Array
                                                    ? accountNamesList
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
                                            placeholder={isAccountNamesLoading ? <i className="fa fa-spinner fa-spin"></i> : "Select Account Name"}
                                        />
                                    </div>
                                    <div className="col form-group_newProject">
                                        <label htmlFor="projectInput" className="required-label">
                                            {option === 'delivery' ? 'Project Name ' : 'Opportunity Name '}
                                        </label>
                                        <input
                                            type="text"
                                            maxLength="100"
                                            className="form-control form-input"
                                            autoComplete="off"
                                            id="projectInput"
                                            placeholder={option === 'delivery' ? 'Project Name' : 'Opportunity Name'}
                                            value={projectName}
                                            onChange={this.onChangeFormFieldHandler}
                                            required
                                        /><span style={{ color: '#ffffff' }}><small>{this.state.projectNameError}</small></span>
                                    </div>
                                    <div className="col form-group_newProject">
                                        <label htmlFor="ownerInput" className="required-label">
                                            Owner Name&nbsp;
                </label>
                                        <input
                                            type="text"
                                            className="form-control form-input"
                                            id="ownerInput"
                                            autoComplete="off"
                                            maxLength="100"
                                            placeholder="Owner Name"
                                            value={ownerName}
                                            onChange={this.onChangeFormFieldHandler}
                                            required
                                        /><span style={{ color: '#ffffff' }}><small>{this.state.ownerNameError}</small></span>
                                    </div>
                                    <div className="col form-group_newProject">
                                        <label htmlFor="ownerInput" className="required-label">Start Date&nbsp;</label>
                                        <div
                                            className="input-group"
                                            style={{ width: '570px' }}
                                        >
                                            <DatePicker
                                                value={this.state.dateValue}
                                                selected={this.state.dateValue}
                                                onChange={this.handleChange}
                                                dateFormat="dd-MMM-yyyy"
                                                showMonthDropdown
                                                showYearDropdown
                                                useShortMonthInDropdown
                                                fixedHeight
                                                className="form-control form-input datepicker-input"
                                                required={true}
                                            />
                                            <div
                                                style={{
                                                    marginLeft: '-32px',
                                                    zIndex: '1',
                                                    fontSize: '22px',
                                                    color: '#ffffff',
                                                }}
                                            >
                                                <img src={calender} alt="calender" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col form-group_newProject">
                                        <label htmlFor="ownerInput" className="required-label">
                                            Description&nbsp;
                </label>
                                        <textarea
                                            type="text"
                                            maxLength="250"
                                            rows="4"
                                            className="form-control form-input"
                                            style={{ resize: "none" }}
                                            id="descriptionInput"
                                            placeholder={
                                                option === 'delivery'
                                                    ? 'Write a short description of your project (max 250 Characters)'
                                                    : 'Write a short description of your opportunity (max 250 Characters)'
                                            }
                                            onChange={this.onChangeFormFieldHandler}
                                            required
                                            value={description}
                                        />
                                        <span style={{ color: '#ffffff' }}><small>{this.state.descriptionError}</small></span>
                                        <label className="subText">{description.length} / 250 character(s)</label>
                                    </div>

                                    {/* {editProjectId &&
                                <div key={Math.random()} className="col form-group_newProject">
                                    <label htmlFor="ownerInput">Previous files</label>
                                    {editProjectId && templateFileVisible
                                        ? templateArray.map((template, index) => (
                                            <div
                                                className="row"
                                                style={{
                                                    backgroundColor: '#767676',
                                                    fontSize: '16px',
                                                    height: '36px',
                                                    margin: '5px 0',
                                                    borderRadius: '4px',
                                                    paddingTop: '5px',
                                                }}
                                            >
                                                <div className="col-sm-9">
                                                    {template.fileName}
                                                </div>
                                                <div className="col-sm-3">
                                                    <button
                                                        key={Math.random()}
                                                        type="button"
                                                        className="btn"
                                                        onClick={this.downloadProjectTemplate}
                                                    >
                                                        <i
                                                            data-url={template.url}
                                                            id={template.fileName}
                                                            style={{ color: '#ffffff', fontSize: '18px' }}
                                                            className="fa fa-arrow-down"
                                                        />
                                                    </button>
                                                    <button
                                                        key={Math.random()}
                                                        type="button"
                                                        className="btn"
                                                        onClick={this.deleteFile}
                                                    >
                                                        <i
                                                            data-url={template.url}
                                                            index={index}
                                                            id={template.fileName}
                                                            style={{ color: '#ffffff', fontSize: '18px' }}
                                                            className="fa fa-trash"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                        : <div
                                            className="row"
                                            style={{
                                                backgroundColor: '#767676',
                                                height: '36px',
                                                margin: '0.2%',
                                                borderRadius: '4px',
                                                paddingTop: '5px',
                                                paddingLeft: '10px',
                                            }}
                                        >
                                            <h6>No file to download</h6>
                                        </div>}
                                </div>} */}
                                </div>
                                <div className="col-sm-8" style={{ paddingLeft: "0px" }}>
                                    <div>
                                        <S3BucketUpload
                                            fileName={this.state.file}
                                            addFileToS3={this.addFileToS3}
                                            resetFile={this.resetFile}
                                            displayFile={this.state.displayFile}
                                            // resetFileName={this.resetFileName}
                                            onChange={this.onChange}
                                        />
                                    </div>

                                    {(this.state.loader === false) ?
                                        <div>

                                            <div className="divLeftFloat" style={{marginRight:'13px'}}>
                                                <span className="radio-item">
                                                    <input type="radio" id="internalUser" checked={this.state.userTypeSelected === 'Accenture'} value="Accenture" name="userType" onClick={(event) => this.getUsers(event.target.value)} />
                                                    <label for="internalUser"> Accenture IDs </label>
                                                </span>
                                                <span className="radio-item">
                                                    <input type="radio" id="externalUser" checked={this.state.userTypeSelected === 'Non-Accenture'} value="Non-Accenture" name="userType" onClick={(event) => this.getUsers(event.target.value)} />
                                                    <label for="externalUser"> Non-Accenture IDs </label>
                                                </span>
                                              
                                            </div>


                                                <div>
                                                    <ProjectUser
                                                        page='NewProject'
                                                        projectUsers={projectUsers}
                                                        eId={eId}
                                                        accessType={accessType}
                                                        userDetails={userDetails}
                                                        addUserHandler={this.addUserHandler}
                                                        deleteUserHandler={this.deleteUserHandler}
                                                        onUserEmailChangeHandler={this.onUserEmailChangeHandler}
                                                        onUserAccessChangeHandler={this.onUserAccessChangeHandler}
                                                        onEndDateChange={this.onEndDateChange}
                                                        formattedProjectEndDate={this.state.projectEndDate}
                                                        emailSelected={this.state.email}
                                                        enableAddButton={this.state.enableAddButton}
                                                        userTypeSelected={this.state.userTypeSelected}
                                                    />
                                                </div>
                                                {(this.state.addUserModalVisible) ? <NewUserRegistrationModal eId={eId} selectedAccountName={this.state.accountName} addUserModalVisible={this.closeAddUserModal}
                                                    accountNamesList={accountNamesList} userTypeSelected={this.state.userTypeSelected}
                                                ></NewUserRegistrationModal> : ''}
                                            </div> : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                            </div>
                                    }



                                </div>
                            </div>
                        </form>
                    </div>
                        <ModalConvertConfirm
                            visible={this.state.modalVisible}
                            error={this.state.errMsg}
                            onCancelClick={this.onCancelClick}
                            onRenameClick={this.onRenameClick}
                            onReplaceClick={this.onReplaceClick}
                            renameLoader={this.state.renameLoader}
                            replaceLoader={this.state.replaceLoader}
                        />
                        {/* custom confirm modal components here */}
                        <CustomConfirmModal
                            ownClassName={'user-access-delete'}
                            isModalVisible={this.state.userAccessModalVisible}
                            modalTitle={this.state.userAccessModalTitle}
                            closeConfirmModal={this.closeUserAccessModal}
                        />
                        <CustomConfirmModal
                            ownClassName={'user-delete-modal'}
                            isModalVisible={this.state.userDeleteModalVisible}
                            modalTitle={this.state.userDeleteModalTitle}
                            closeConfirmModal={this.closeUserDeleteModal}
                        />
                        <CustomConfirmModal
                            ownClassName={'file-delete-modal'}
                            isModalVisible={this.state.fileDeleteModalVisible}
                            modalTitle={this.state.fileDeleteModalTitle}
                            closeConfirmModal={this.closeFileDeleteModal}
                        />
                    </div>
                </div>
        );
    }
}

export default withRouter(NewProject);
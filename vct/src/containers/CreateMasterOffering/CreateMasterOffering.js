import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import Menu from '../../components/Menu/Menu';
import MasterOffering from '../../components/MasterOffering/MasterOffering';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import close from '../../assets/menu/close.svg';
import cross from '../../assets/newDealsIcons/cross.svg';
import ReactTooltip from 'react-tooltip';
import Storage from '@aws-amplify/storage';
import '../../components/MasterOffering/masterOffering.css';
import { SetS3Config } from '../Login/Login';
var SessionStorage = require('store/storages/sessionStorage');

const env = process.env.REACT_APP_BASE_URL;
@inject('myProjectStore', 'adminStore')
@observer
class CreateMasterOffering extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offeringName: '',
      description: '',
      ownerName: '',
      industrySelected: '',
      masterMarked: false,
      saveInprogress: false,
      isValid: false,
      loader: false,
      projectId: null,
      offeringData: {},
      open: false,
      offeringNameError: '',
      descriptionError: '',
      ownerNameError: '',
      projectUsers: [],
      userDetails: [],
      file: null,
      displayFile: null,
      userDeleteModalVisible: false,
      userDeleteModalTitle: '',
      userAccessModalVisible: false,
      userAccessModalTitle: '',
    };
    this.redirectHandler = this.redirectHandler.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.saveMasterOffering = this.saveMasterOffering.bind(this);
    this.handleMasterCheck = this.handleMasterCheck.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    /* file functions start*/
    this.addFileToS3 = this.addFileToS3.bind(this);
    this.resetFile = this.resetFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.onChange = this.onChange.bind(this);
    /* file functions end */
    /* add user functions start*/
    this.addUserHandler = this.addUserHandler.bind(this);
    this.deleteUserHandler = this.deleteUserHandler.bind(this);
    this.onUserEmailChangeHandler = this.onUserEmailChangeHandler.bind(this);
    this.onUserAccessChangeHandler = this.onUserAccessChangeHandler.bind(this);
    this.onConfirmUserDeletehandler = this.onConfirmUserDeletehandler.bind(this);
    /* add user functions end */
  }
  componentDidMount() {
    const { myProjectStore, adminStore } = this.props;
    const { editProjectId } = myProjectStore;
    const usersType = "AssignOffering";
    myProjectStore.emailId = ""
    let projectName = '';
    if (editProjectId !== null && editProjectId !== '') {
      const { projectDetails } = myProjectStore;
      const projectDataLength = projectDetails.length;
      for (let i = 0; i < projectDataLength; i++) {
        if (Number(projectDetails[i].projectId) === Number(editProjectId)) {
          projectName = projectDetails[i].projectName;
          this.setState({
            offeringName: projectDetails[i].projectName,
            ownerName: projectDetails[i].ownerName,
            description: projectDetails[i].description,
            industrySelected: { label: projectDetails[i].industry, value: projectDetails[i].industry },
            masterMarked: projectDetails[i].isMaster === "Y" ? true : false,
            projectId: projectDetails[i].projectId,
            offeringData: projectDetails[i].isMaster === "Y" ? true : false,
          });
        }
      }
    }

    if (editProjectId) {
      SessionStorage.write('projectId', editProjectId);
      SessionStorage.write('selectedEditProjectName', projectName);
      myProjectStore.getProjectUsers(editProjectId).then(response => {
        if (response && !response.error && response.resultCode === 'OK') {
          this.setState({
            projectUsers: myProjectStore.projectUsersList,
            initialUsersList: [...myProjectStore.initialUsersList],
          });
        } else if (response && response.resultCode === 'KO') {
          this.showErrorNotification(response.errorDescription, 'Error', 'error')
        }
      });
    }

    adminStore.fetchUsers(usersType,'Accenture').then(response => {
      // if (response.error) {
      //   return {
      //     error: true
      //   }
      // } else {
      if (response && !response.error && response.data.resultCode === 'OK') {
        this.setState({
          userDetails: adminStore.userDetails,
        });
      } else if (response && response.data.resultCode === 'KO') {
        this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
      }
      // }
    });

  }

  /* add image and user functions start */
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
          if (res.error) {
            return {
              error: true
            }
          } else {
            history.push('my-deals');
          }
        }).catch(e => {
          this.showNotification();
          history.push('my-deals');
        });
    } else {
      history.push('my-deals');
    }
  }

  resetFile(event) {
    event.preventDefault();
    this.setState({
      file: null,
      displayFile: null,
    });
  }

  deleteFile(event) {
    this.openFileDeleteModal('Are you sure you want to delete this file?', event);
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

  onChange(file) {
    this.setState({
      displayFile: URL.createObjectURL(file),
      file: file,
    });
  }
  /* add image and user functions end */
  /* add user functions start */

  addUserHandler = event => {
    const { myProjectStore } = this.props;
    event.preventDefault();
    this.setState({
      addUser: true,
    });
    const { projectUsers } = this.state;
    if(myProjectStore.emailId.indexOf('@accenture.com')!== -1){
      if (projectUsers.length === 0) {
        const userDetail = {
          email_user0: myProjectStore.emailId,
          access_user0: myProjectStore.accessTypeSelected,
          delete_index: 0,
        };
        projectUsers.push(userDetail);
        this.setState({
          projectUsers: projectUsers,
        });
      } else {
        if (projectUsers.some((proj, index) => projectUsers[index][`email_user${index}`] === this.state.email)) {
          this.showEmailChangedNotification(`${this.state.email} user added already`);
          myProjectStore.emailId = ""
          return;
        } else {
          const lastIndex = projectUsers.length;
          const userDetail = {
            ['email_user' + lastIndex]: myProjectStore.emailId,
            ['access_user' + lastIndex]: myProjectStore.accessTypeSelected,
            delete_index: lastIndex,
          };
          projectUsers.push(userDetail);
          this.setState({
            projectUsers: projectUsers,
          });
        }
      }
      myProjectStore.emailId = "";
      myProjectStore.accessTypeSelected = "Read";
    }else{
      this.showMsgNotification('error','User should contain @accenture.com')
    }    
  };

  deleteUserHandler = event => {
    event.preventDefault();
    this.openUserDeleteModal('Are you sure you want to delete this user?', event);
  };

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

  onUserEmailChangeHandler = (item, event) => {
    const { projectUsers } = this.state;
    let targetValue = "";
    const { myProjectStore } = this.props;
    if (item !== null) {
      targetValue = item;
    } else {
      targetValue = "";
    }
    myProjectStore.emailId = targetValue;
    this.setState({
      email: targetValue === "" ? "" : targetValue,
      enableAddButton: targetValue !== "" ? true : false
    });
    /* let msg = '';
    if (targetValue) {
      msg = `You selected ${targetValue}`;
      this.showEmailChangedNotification(msg);
    } else {
      msg = 'Selection Cleared'
    } */
    
    myProjectStore.emailId = targetValue === "" ? "" : targetValue
  };

  mailUsersOnCreateOrUpdateProject(emails) {
    window.location.href =
      'mailto:sambit.banerjee@accenture.com?subject=User%20List&body=Hi%20Sambit,%20%0D%0A%0D%0APlease find updated user list for offering%20' +
      this.state.offeringName +
      '%0D%0A%0D%0A' +
      emails.join(', ');
  }

  onUserAccessChangeHandler = event => {
    event.preventDefault();
    this.openUserAccessModal('Are you sure you want to edit user access type?', event);
  };

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
      if (oldIndex !== i) {
        delete projectUsers[i][`email_user${oldIndex}`];
        delete projectUsers[i][`access_user${oldIndex}`];
      }
    }
    return projectUsers;
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

  showMsgNotification(type, msg) {
    type = type.toLowerCase();
    switch (type) {
        case 'success':
            toast.info(<NotificationMessage
                title="Success"
                bodytext={msg}
                icon="success"
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
            break;


        case 'error':
            toast.error(<NotificationMessage
                title="Error"
                bodytext={msg}
                icon="error"
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
            break;

        default:
            break;
    }
}

  /* add user functions end */
  handleFieldChange = (event) => {
    let errors = '';
    switch (event.target.id) {
      case 'offeringName':
        errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
        this.setState(
          {
            offeringName: event.target.value,
            offeringNameError: errors,
          },
          () => {
            //this.isValid();
          }
        );
        break;
      case 'description':
        errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
        this.setState(
          {
            description: event.target.value,
            descriptionError: errors,
          },
          () => {
            //this.isValid();
          }
        );
        break;
      case 'owner':
        errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
        this.setState(
          {
            ownerName: event.target.value,
            ownerNameError: errors,
          },
          () => {
            //this.isValid();
          }
        );
        break;
      // case 'selectIndustryDropdown':
      //   this.setState(
      //     {
      //       industrySelected: event.target.value,
      //     },
      //     () => {
      //       this.isValid();
      //     }
      //   );
      //   break;
      default:
        console.log('');
        break;
    }
  };
  handleOptionChange = (selectedOption) => {
    this.setState(
      {
        industrySelected: selectedOption,
      },
      () => {
        //this.isValid();
      }
    );
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
      default:
        break;
    }
  }

  handleMasterCheck = (e) => {
    if (this.state.offeringData && e.target.checked === false) {
      this.setState({
        open: true
      });
      var element = document.getElementById('masterOffering'),
        rect = element.getBoundingClientRect(),
        modal = document.getElementById('masterContainer');

      modal.style.margin = 0;
      modal.style.top = rect.top + 10 + 'px';
      modal.style.left = '30%';
    }
    this.setState({
      masterMarked: e.target.checked,
      isValid: true
    });
  };

  handleClose = (e) => {
    if (e.currentTarget.id === "yes") {
      this.setState({
        masterMarked: false,
      });
    } else {
      this.setState({
        masterMarked: true,
      });
    }
    this.setState({
      open: false
    });
  }
  saveMasterOffering() {
    const { myProjectStore } = this.props;
    let emails = [];
    const { projectUsers } = this.state;
    let userType = SessionStorage.read('userType')
    this.setState({
      loader: true,
    });
    if (!this.isValid()) {
      this.setState({
        loader: false,
      });
      this.showErrorNotification(
        'Please fill all the mandatory fields',
        'Error',
        'error'
      );
    } else {
      for (let i = 0; i < projectUsers.length; i++) {
        emails.push(projectUsers[i]['email_user' + i]); // }
      }
      const {offeringName , description, ownerName} = this.state;
      let saveMasterOffering = {...this.state};
      saveMasterOffering.offeringName = offeringName.trim();
      saveMasterOffering. description = description.trim();
      saveMasterOffering.ownerName = ownerName.trim();
      myProjectStore
        .saveNewProject(saveMasterOffering, 'OFFERING')
        .then((response) => {
          if (response && !response.error &&
            myProjectStore.masterOfferingObj.resultCode === 'OK' &&
            myProjectStore.editProjectId !== null && myProjectStore.editProjectId !== "" && this.state.offeringData === true && this.state.masterMarked === false) {
            this.showErrorNotification(
              'Master Offering Unmarked',
              'Success',
              'success'
            );
            this.setState({
              loader: false,
            });
            this.addFileToS3(myProjectStore.projectId);
            this.redirectHandler('myproject');
          } else if (response &&
            myProjectStore.masterOfferingObj.resultCode === 'OK' &&
            myProjectStore.editProjectId !== null && myProjectStore.editProjectId !== "" && this.state.masterMarked === true && userType !== 'O') {
            this.showErrorNotification(
              'Master Offering Marked',
              'Success',
              'success'
            );
            this.setState({
              loader: false,
            });
            this.addFileToS3(myProjectStore.projectId);
            this.redirectHandler('myproject');
          }
          else if (
            response &&
            myProjectStore.editProjectId !== null && myProjectStore.editProjectId !== "" &&
            myProjectStore.masterOfferingObj.resultCode === 'OK' && this.state.masterMarked === false
          ) {
            this.showErrorNotification(
              'Master Offering updated',
              'Success',
              'success'
            );
            this.setState({
              loader: false,
            });
            this.addFileToS3(myProjectStore.projectId);
            this.redirectHandler('myproject');
          }
          else if (
            response &&
            myProjectStore.masterOfferingObj.resultCode === 'OK'
          ) {
            this.showErrorNotification(
              'Master Offering Created',
              'Success',
              'success'
            );
            if (emails.length > 0) {
              this.mailUsersOnCreateOrUpdateProject(emails);
            }
            this.addFileToS3(myProjectStore.projectId);
            this.redirectHandler('myproject');
          } else if (myProjectStore.masterOfferingObj.resultCode === 'KO') {
            this.showErrorNotification(
              myProjectStore.masterOfferingObj.errorDescription,
              'Error',
              'error'
            );

          }
          this.setState({
            loader: false,
          });
        });
    }
  }

  isValid() {
    if (
      (this.state.offeringName.trim() !== '' && !RegExp(/[<>!'"[\]]/).test(this.state.offeringName)) &&
      (this.state.description.trim() !== '' && !RegExp(/[<>!'"[\]]/).test(this.state.description)) &&
      (this.state.ownerName.trim() !== '' && !RegExp(/[<>!'"[\]]/).test(this.state.ownerName)) &&
      this.state.industrySelected !== ''
    ) {
      return true
    }
    else {
      const {offeringName , description, ownerName} = this.state;
      this.setState({
        offeringName : offeringName.trim() === '' ? offeringName.trim() : offeringName,
        description : description.trim() === '' ? description.trim() : description,
        ownerName : ownerName.trim() === '' ? ownerName.trim() : ownerName,
      })
      return false;
    }
  }

  showErrorNotification = (message, title, type) => {
    if (type === 'error') {
      toast.error(
        <NotificationMessage title={title} bodytext={message} icon={type} />,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    }
    if (type === 'success') {
      toast.info(
        <NotificationMessage title={title} bodytext={message} icon={type} />,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    }
  };

  render() {
    const { myProjectStore } = this.props;
    const { projectUsers, userDetails } = this.state;
    const { editProjectId } = myProjectStore;
    const isNew = this.props.location.newOffering;
    const option = SessionStorage.read('option_selected');
    const isConvert = SessionStorage.read('convertToProject');
    const accessType = myProjectStore.accessTypeSelected;
    const eId = myProjectStore.emailId;
    return (

      <Fragment>
        <Menu />
        <div className="container-fluid " id="createMasterOffering" style={{ paddingRight: '0px' }}>

          <div className="row breadcrumb-row" >
            <div className="col-sm-10">
              {/* <div>
              <label className="page-header-label">
                {isConvert === 'true' ? (
                  'CONVERT DEAL TO PROJECT'
                ) : editProjectId ? option === 'sales' ? (
                  'UPDATE MASTER OFFERING'
                ) : (
                  ''
                ) : option === 'sales' ? (
                  'NEW MASTER OFFERING'
                ) : (
                  ''
                )}
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
                    {option === 'sales' ? (
                      <li
                        className="breadcrumb-item active"
                        style={{ cursor: 'pointer' }}
                        aria-current="page"
                        onClick={() => this.redirectHandler('sales-home')}
                      >
                        Opportunity Home{' '}
                      </li>
                    ) : (
                        <li
                          className="breadcrumb-item active"
                          style={{ cursor: 'pointer' }}
                          aria-current="page"
                          onClick={() => this.redirectHandler('delivery')}
                        >
                          Program Delivery Home{' '}
                        </li>
                      )}
                    {/* <li
                    className="breadcrumb-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.redirectHandler('sales')}
                  >
                    {isConvert === 'true' ? (
                      'Delivery'
                    ) : option === 'delivery' ? (
                      'Delivery'
                    ) : (
                      'Sales'
                    )}
                  </li> */}
                    <li
                      className="breadcrumb-item"
                      style={{ cursor: 'pointer' }}
                      aria-current="page"
                      onClick={() => this.redirectHandler('myproject')}
                    >
                      {isConvert === 'true' ? (
                        'My Projects'
                      ) : option === 'delivery' ? (
                        'My Projects'
                      ) : (
                            'My Opportunities'
                          )}
                    </li>
                    <li
                      className="breadcrumb-item"
                      style={{ cursor: 'pointer' }}
                      aria-current="page"
                      onClick={() => this.redirectHandler('myproject')}
                    >
                      {option === 'sales' ? (editProjectId !== "" ? this.state.offeringName : "Create Master Offering") : 'Create Master Offering'}
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
                <img src={cross} className="cross" alt="close" data-tip="" data-for="cancel_tooltip" />
              </span>
              <ReactTooltip id="cancel_tooltip" className="tooltip-class">
                <span>Cancel</span>
              </ReactTooltip>
            </div>
          </div>

          <MasterOffering
            masterOfferingData={this.state}
            onClose={() => {
              this.redirectHandler('myproject');
            }}
            projectUsers={projectUsers}
            eId={eId}
            accessType={accessType}
            userDetails={userDetails}
            addUserHandler={this.addUserHandler}
            deleteUserHandler={this.deleteUserHandler}
            onUserEmailChangeHandler={this.onUserEmailChangeHandler}
            onUserAccessChangeHandler={this.onUserAccessChangeHandler}
            emailSelected={this.state.email}
            file={this.state.file}
            addFileToS3={this.addFileToS3}
            resetFile={this.resetFile}
            displayFile={this.state.displayFile}
            onChange={this.onChange}
            handleFieldChange={this.handleFieldChange}
            handleOptionChange={this.handleOptionChange}
            saveMasterOffering={this.saveMasterOffering}
            handleMasterCheck={this.handleMasterCheck}
            saveInprogress={this.state.saveInprogress}
            newOffering={isNew}
            open={this.state.open}
            handleClose={this.handleClose}
            ownerNameError={this.state.ownerNameError}
            offeringNameError={this.state.offeringNameError}
            descriptionError={this.state.descriptionError}
            ownClassName={'user-delete-modal'}
            userDeleteModalVisible={this.state.userDeleteModalVisible}
            userDeleteModalTitle={this.state.userDeleteModalTitle}
            closeConfirmModal={this.closeUserDeleteModal}
            userAccessModalVisible={this.state.userAccessModalVisible}
            userAccessModalTitle={this.state.userAccessModalTitle}
            closeUserAccessModal={this.closeUserAccessModal}
            enableAddButton={this.state.enableAddButton}
          />
        </div>
      </Fragment>
    );
  }
}

export default withRouter(CreateMasterOffering);

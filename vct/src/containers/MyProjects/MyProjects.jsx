import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import 'moment-timezone';
import Moment from 'moment';
import Storage from '@aws-amplify/storage';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';

import './MyProjects.css';
import Menu from '../../components/Menu/Menu';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import ConcurrentLoginModal from '../../components/ConcurrentLoginModal/ConcurrentLoginModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { SetS3Config } from '../Login/Login';
import Logo from '../../assets/logo/logo.png';
import copyIcon from '../../assets/project/viewDeals/deal-copy-icon.svg';
import sortAzIcon from '../../assets/project/viewDeals/sort-w-alpha.svg';
import sortDateIcon from '../../assets/project/viewDeals/sort-w-date.svg';
import ConvertIcon from '../../assets/project/viewDeals/deal-convert-icon.svg';
import EditIcon from '../../assets/project/viewDeals/pencil-edit-icon.svg';
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
var SessionStorage = require('store/storages/sessionStorage');
const env = process.env.REACT_APP_BASE_URL;
@inject('myProjectStore', 'reviewValueDriverStore')
@observer
class MyProjects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectCreated: false,
      projectLoaded: false,
      noProject: false,
      modalVisible: false,
      deleteProjectDetails: {},
      file: null,
      sortListBy: 'date',
      isLoading: false,
      copyName: '',
      concurrentModalVisible: false,
      copyLoading:false,
      copyMapId:""
    };
    this.startProjectHandler = this.startProjectHandler.bind(this);
    this.editProjectHandler = this.editProjectHandler.bind(this);
    this.deleteProjectHandler = this.deleteProjectHandler.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.redirectHandler = this.redirectHandler.bind(this);
    this.getLogo = this.getLogo.bind(this);
    this.createMasterOfferingHandler = this.createMasterOfferingHandler.bind(
      this
    );
    this.editOfferingHandler = this.editOfferingHandler.bind(this);
    this.copyOfferingHandler = this.copyOfferingHandler.bind(this);
    this.onConvertClick = this.onConvertClick.bind(this);
  }

  componentWillMount() {
    const { myProjectStore } = this.props;
    myProjectStore.projectDetails = [];
    this.setState({
      isLoading: true,
    });
    this.getProjectDetails();
  }

  componentWillReceiveProps() {
    const { myProjectStore } = this.props;
    myProjectStore.projectDetails = [];
    this.setState({
      isLoading: true,
    });
    this.getProjectDetails();
  }

  getProjectDetails() {
    const { myProjectStore } = this.props;
    myProjectStore.getProjectLists().then(response => {
      if (response && response.resultCode === 'OK') {
        // console.log("test for projId", response.resultObj['Deal'][0]['projectId'], typeof response.resultObj['Deal'][0]['projectId']);
        this.setState({
          projectLoaded: true,
          isLoading: false,
        });
      }
      if (response && response.resultCode === 'KO') {
        if (response.errorDescription.includes('Status Code: 403')) {
          myProjectStore.getProjectLists().then(res => {
            if (res.resultCode === 'OK') {
              this.setState({
                projectLoaded: true,
                isLoading: false,
              });
            } else {
              this.setState({
                noProject: true,
              });
            }
          });
        } else {
          this.showErrorNotification(response.errorDescription);
          this.setState({
            noProject: true
          });
        }
      }
    });
  }

  // componentDidUpdate (prevProps) {
  //   const {myProjectStore} = this.props;
  //   if (prevProps.myProjectStore.projectCreated !== this.props.myProjectStore.projectCreated) {
  //     this.getProjectDetails();
  //   }
  // }

  componentDidMount() {

  }

  getBucketName() {
    // eslint-disable-next-line default-case
    switch (env) {
      case 'production':
        return 'https://prodb.valuecockpit-accenture.net';
      case 'preprod':
        return 'https://preprod.valuecockpit-accenture.net';
      case 'staging':
        return 'https://uat.valuecockpit.accenture.com';
      case 'development':
        return 'https://dev-valuecockpit.accenture.com';
      case 'dev2':
        return 'https://dev2-valuecockpit.accenture.com';
      case 'local':
        return 'https://dev-valuecockpit.accenture.com';
      case 'productionb':
        return 'https://valuecockpit.accenture.com';
      case 'training':
        return 'https://training.valuecockpit.accenture.com';
    }
  }

  getLogo(projectId) {
    const bucketName = this.getBucketName();
    const imageUrl = 'vroimages/4499/test1.png';
    SetS3Config(bucketName);
    return Storage.get(imageUrl);
  }

  getLogoUrl(projID) {
    this.getLogo(projID).then(function (result) {
      return result;
    })
  }
  startProjectHandler(event) {
    const { myProjectStore, history } = this.props;
    SessionStorage.write('convertToProject', false);
    myProjectStore.editProjectId = false;
    history.push('/new-deal');
  }

  createMasterOfferingHandler(event) {
    const { myProjectStore, history } = this.props;
    SessionStorage.write('convertToProject', false);
    myProjectStore.masterOffering = true;
    myProjectStore.editProjectId = '';
    history.push({
      pathname: '/create-master',
      newOffering: true,
    });
  }
  /* edit deal/project */
  editProjectHandler = (pId, mapId, accessType, tenant) => {
    const { myProjectStore, history } = this.props;
    myProjectStore.editProjectId = pId;
    myProjectStore.tenantId = tenant
    SessionStorage.write('convertToProject', false);
    SessionStorage.write('mapId', mapId);
    SessionStorage.write('accessType', accessType);
    history.push('/new-deal');
  };

  /*  edit offering */
  editOfferingHandler = (pId, mapId, accessType, master, tenant) => {
    const { myProjectStore, history } = this.props;
    myProjectStore.editProjectId = pId;
    myProjectStore.isMaster = master;
    SessionStorage.write('offeringTenantId', tenant)
    SessionStorage.write('convertToProject', false);
    SessionStorage.write('mapId', mapId);
    SessionStorage.write('accessType', accessType);
    history.push({
      pathname: '/create-master',
      newOffering: false,
    });
  };

  /* create a copy for offering */
  copyOfferingHandler = (copyMapId, pType, tenant) => {
    const { myProjectStore } = this.props;
    this.setState({
      copyName: pType,
      copyLoading:true,
      copyMapId:copyMapId
    });
    SessionStorage.write('offeringTenantId', tenant)
    myProjectStore.projectCreated = false;
    myProjectStore
      .copyOfferingOrDeal({
        mapId: copyMapId,
        userId: SessionStorage.read('userId')
      })
      .then(response => {
        if (response && !response.error) {
          if (response.data.resultCode === 'OK') {
            myProjectStore.projectCreated = true;
            this.showNotification('projectCopySuccess');
            // this.refreshPage();
            this.setState({
              isLoading: true,
              copyLoading:false
            });
            this.getProjectDetails();
          } else if (response.data.resultCode === 'KO') {
            myProjectStore.projectCreated = false;
            this.setState({
              copyLoading:false
            })
            this.showNotification('projectCopyFailure');
          }
          else{
            this.setState({
              copyLoading:false
            })
          }
          
        }
      });
  };

  deleteProjectHandler() {
    const { deleteProjectDetails } = this.state;
    const { myProjectStore } = this.props;
    myProjectStore
      .deleteProject({
        mapId: deleteProjectDetails.mapId,
        userId: SessionStorage.read('userId'),
        projectId: deleteProjectDetails.projectId,
      })
      .then(response => {
        if (response && !response.error && response.resultCode === 'OK') {
          this.showNotification('projectDeletionSuccess');
          // this.refreshPage();
          this.setState({
            isLoading: true,
          });
          this.getProjectDetails();
        } else {
          this.showNotification('projectDeletionFailure');
        }
      });
    this.setState({
      modalVisible: false,
    });
  }

  openDeleteModal = projectDetails => {
    this.setState({
      modalVisible: true,
      deleteProjectDetails: { ...projectDetails },
    }, () => {
      ReactTooltip.rebuild();
    });
  };

  modalCloseHandler = () => {


    this.setState({
      modalVisible: false,
    }, () => {
      ReactTooltip.rebuild();
    });



  };
  redirectHandler(type) {
    const { history } = this.props;
    // eslint-disable-next-line default-case
    switch (type) {
      case 'home':
        history.push('/home');
        break;
      case 'sales':
        history.push('/home');
        break;
      case 'sales-home':
        history.push('/sales-home');
        break;
      case 'delivery':
        history.push('/delivery');
        break;
    }
  }

  redirectProjectDashboard(pId, mapId, accessType, isMaster, type, tenant) {
    const { myProjectStore, history, reviewValueDriverStore } = this.props;
    myProjectStore.selectedProjectId = pId;
    for (let i = 0; i < myProjectStore.projectDetails.length; i++) {
      if (myProjectStore.projectDetails[i].projectId === pId) {
        SessionStorage.write('projectName', myProjectStore.projectDetails[i].projectName);
      }
    }
    reviewValueDriverStore.resetVdtTreeVariables();

    SessionStorage.write('accessType', accessType);
    SessionStorage.write('mapId', mapId);
    SessionStorage.write('isMaster', isMaster);
    SessionStorage.write('projType', type);
    SessionStorage.write('tenantId', tenant);
    SessionStorage.write('VDTmode', 'ALL');
    history.push('/value-drivers');
  }

  showNotification(type) {
    const { deleteProjectDetails } = this.state;
    let option = SessionStorage.read('option_selected');
    // eslint-disable-next-line default-case
    switch (type) {
      case 'projectDeletionSuccess':
        toast.info(
          <NotificationMessage
            title="Success"
            bodytext={
              option === 'sales'
                ? deleteProjectDetails.projectType === 'offering'
                  ? 'Master Offering deleted successfully'
                  : 'Opportunity deleted successfully'
                : 'Project deleted successfully'
            }
            icon="success"
          />,
          {
            position: toast.POSITION.BOTTOM_RIGHT,
          }
        );
        break;
      case 'projectDeletionFailure':
        toast.error(
          <NotificationMessage
            title="Error"
            bodytext={'Sorry! Unable to delete project'}
            icon="error"
          />,
          {
            position: toast.POSITION.BOTTOM_RIGHT,
          }
        );
        break;
      case 'projectCopySuccess':
        toast.info(
          <NotificationMessage
            title="Success"
            bodytext={`Copy of ${option === 'sales'
              ? (this.state.copyName === 'offering' ? "Offering" : "Opportunity") : "Project"} Created Successfully`
            }
            icon="error"
          />,
          {
            position: toast.POSITION.BOTTOM_RIGHT,
          }
        );
        break;
      case 'projectCopyFailure':
        toast.error(
          <NotificationMessage
            title="Error"
            bodytext={`Error occured while creating copy of ${option === 'sales'
              ? (this.state.copyName === 'offering' ? " an Offering" : " a Deal") : " a Project"}`
            }
            icon="error"
          />,
          {
            position: toast.POSITION.BOTTOM_RIGHT,
          }
        );
        break;
    }
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

  sortAndSendListToggle = (e, sort_type, option) => {
    const { myProjectStore } = this.props;
    if (myProjectStore && myProjectStore.projectDetails && myProjectStore.projectDetails.length > 0) {
      let sortedProjectList = [];
      let storeDealsArray = [...myProjectStore.projectDealDetails];
      let storeOfferingsArray = [...myProjectStore.projectOfferingDetails];
      let storeMasterOfferingsArray = [...myProjectStore.projectMasterOfferingDetails];
      let storeProjectsArray = [...myProjectStore.projectDetails];
      if (sort_type === 'az') {
        this.setState({
          sortListBy: 'az',
        });

        if (option === "sales") {
          storeDealsArray = storeDealsArray.sort(
            this.compareValues('projectName', 'asc')
          );
          storeOfferingsArray = storeOfferingsArray.sort(
            this.compareValues('projectName', 'asc')
          );
          storeMasterOfferingsArray = storeMasterOfferingsArray.sort(
            this.compareValues('projectName', 'asc')
          );
        }
        else {
          storeProjectsArray = storeProjectsArray.sort(
            this.compareValues('projectName', 'asc')
          );
        }
        sortedProjectList = option === "sales" ? [...storeMasterOfferingsArray, ...storeOfferingsArray, ...storeDealsArray]
          : [...storeProjectsArray];
        myProjectStore.projectDetails = sortedProjectList;

      } else if (sort_type === 'date') {
        this.setState({
          sortListBy: 'date',
        });
        if (option === "sales") {
          storeDealsArray = storeDealsArray.sort(
            this.compareValues('creationDate', 'desc')
          );
          storeOfferingsArray = storeOfferingsArray.sort(
            this.compareValues('creationDate', 'desc')
          );
          storeMasterOfferingsArray = storeMasterOfferingsArray.sort(
            this.compareValues('creationDate', 'desc')
          );
        }
        else {
          storeProjectsArray = storeProjectsArray.sort(
            this.compareValues('creationDate', 'desc')
          );
        }
        sortedProjectList = option === "sales" ? [...storeMasterOfferingsArray, ...storeOfferingsArray, ...storeDealsArray]
          : [...storeProjectsArray];
        myProjectStore.projectDetails = sortedProjectList;
      } else {
        this.setState({
          sortListBy: 'date',
        });
      }
    }
  };

  compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
      const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === 'desc' ? comparison * -1 : comparison;
    };
  }

  refreshPage() {
    window.location.reload();
  }

  onConvertClick = (mapId, projType, tenantId) => {
    const { history, myProjectStore } = this.props;
    SessionStorage.write('convertToProject', true);
    SessionStorage.write('mapId', mapId);
    myProjectStore.getProjectId();
    // SessionStorage.write('option_selected', 'delivery');
    myProjectStore.tenantId = tenantId
    SessionStorage.write('accessType', projType);
    history.push('/new-deal');
  };

  checkForCopyAccess(project) {
    let userType = SessionStorage.read('userType')
    switch (userType) {
      case 'A':
        return true
      case 'O':
        return (project.accessType === 'Write')
      case 'IL':
        return (project.accessType === 'Write')
      case 'C':
        return (project.accessType === 'Write')
      case 'U':
        return false
      case 'EU':
        return false
      case 'D':
        return false
    }
  }

  checkForExternalUser = () => {
    const userType = SessionStorage.read('userType');
    if (userType && userType === 'EU') {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const { myProjectStore } = this.props;
    const { isLoading, sortListBy, deleteProjectDetails,copyLoading,copyMapId } = this.state;
    const { projectDetails } = myProjectStore;
    let option = SessionStorage.read('option_selected');
    let userType = SessionStorage.read('userType');
    let resourcePath = this.getBucketName();
    // this.getLogoFroms3();
    return (
      <div className="container-fluid">
        <Menu />
        <div className="page-off-menu">
          <div className="row breadcrumb-row">
            <div className="col-sm-12">

              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li
                    className="breadcrumb-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.redirectHandler('home')}
                  >
                    Home
                  </li>
                  {SessionStorage.read("userType") === "EU" ? "" : (option === 'sales'
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
                      onClick={() => this.redirectHandler('delivery')}
                    >
                      Program Delivery Home{' '}
                    </li>)}

                  {option === 'sales'
                    ? <li
                      className="breadcrumb-item active"
                      aria-current="page"
                    >
                      My Opportunities
                      </li>
                    : <li
                      className="breadcrumb-item active"
                      aria-current="page"
                    >
                      My Projects
                      </li>}
                </ol>
              </nav>

            </div>
          </div>
          <div className="deals-projects-main">
            <div className="row page-header-row">
              <div className="col-sm-3">
                {option === 'sales'
                  ? <label className="page-header-label">My Opportunities</label>
                  : <label className="page-header-label">My Projects</label>}
              </div>
              <div className="col-sm-9">
                {userType === 'A' || userType === 'C' || userType === 'O' || userType === 'IL' || userType === 'EU' ?
                  <div className="row" style={{ height: 'inherit' }}>
                    <div className="col-sm-12 btn-row">
                      {userType === 'EU' ? '' :
                        <div className="cr-de-btn-div">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={this.startProjectHandler}
                          >
                            {option === 'sales'
                              ? 'Create New Opportunity'
                              : 'Create New Project'}
                          </button>
                        </div>
                      }

                      {(userType === 'A' || userType === 'O' || userType === 'IL') && option === 'sales' ?
                        <div className="cr-offer-btn-div">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={this.createMasterOfferingHandler}
                          >
                            {option === 'sales' ? 'Create Master Offering' : ''}
                          </button>
                        </div>
                        : ''
                      }
                      {option === 'sales' || option === 'delivery'
                        ? <div className="sorting-wrapper-div">
                          {sortListBy === 'az'
                            ? <div>
                              <div
                                className="sort-svg"
                                data-tip
                                data-for="tool_sort_az"
                                data-place="left"
                                onClick={e =>
                                  this.sortAndSendListToggle(e, 'date', option)}
                              >
                                <img src={sortAzIcon} alt="sort alphabetically" />
                              </div>
                              <ReactTooltip id="tool_sort_az">
                                <span>Sort Alphabetically</span>
                              </ReactTooltip>
                            </div>
                            : sortListBy === 'date'
                              ? <div>
                                <div
                                  className="sort-svg"
                                  data-tip
                                  data-for="tool_sort_date"
                                  data-place="left"
                                  onClick={e =>
                                    this.sortAndSendListToggle(e, 'az', option)}
                                >
                                  <img className="sortTimestamp-dimensions" src={sortDateIcon} alt="sort by date" />
                                </div>
                                <ReactTooltip id="tool_sort_date">
                                  <span>Sort by Timestamp</span>
                                </ReactTooltip>
                              </div>
                              : ''}
                        </div>
                        : ''}
                    </div>

                  </div>
                  : ''
                }
              </div>
            </div>
            {isLoading ?
              <div className="row loading">
                {/* Loading... */}
                <i className="fa fa-spinner fa-spin" style={{ fontSize: '25px' }} />
              </div>
              :
              <div className="row projects-list-main">
                <div className="col-sm-12 text-center">
                  {!projectDetails &&
                    <i
                      className="fa fa-spinner fa-spin"
                      style={{ fontSize: '48px', color: '#ffffff' }}
                    />}
                  {this.state.noProject || (projectDetails && projectDetails.length === 0) ?
                    // option==='sales'?
                    <h3 style={{ color: '#ffffff' }}>
                      {' '}
                      {option === 'sales'
                        ? 'No Opportunities to display'
                        : 'No Projects to display'}
                      {' '}
                      <br />
                      {this.checkForExternalUser() ? '' :
                        option === 'sales'
                          ? 'Please create a new Opportunity'
                          : 'Please create a new Project'
                      }
                    </h3>
                    : ''
                  }
                </div>
                {projectDetails &&
                  projectDetails.map(
                    (project, index) =>

                      project.accountName !== 'Demo Account' &&
                      project.projectName !== 'Demo Project' &&
                      <div
                        className="col-sm-3 project-card-main"
                        key={Math.random()}
                        id={'project_' + project.projectId}
                      >
                        <div className="project-card" style={{ height: '320px', position: 'relative' }}>

                          {project.isMaster === 'Y' ?
                            <div className="master-label" style={{ position: 'absolute' }}>
                              <label>
                                {'Master'}
                              </label>
                            </div>
                            : ''
                          }
                          {project.projectType === 'offering' && project.isMaster === 'N' ?
                            <div className="offering-label" style={{ position: 'absolute' }}>
                              <label>
                                {'Offering'}
                              </label>
                            </div>
                            : ''
                          }
                          <div className="row project-icons-row">
                            <div className="col-sm-12">
                              {/* convert icon */}
                              {(option === 'sales' ? ((project.projectType !== 'offering' && this.checkForCopyAccess(project)) ?
                                <span>
                                  <img
                                    src={ConvertIcon}
                                    id={'convert_deal_' + index}
                                    alt="convert"
                                    className=""
                                    data-tip data-for='convert_tooltip_icon'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => this.onConvertClick(project.mapId, project.accessType, project.tenantId)}
                                  /></span> : '')
                                : '')
                              }
                              {/* copy icon */}
                              {this.checkForCopyAccess(project) ?
                                <span>
                                  <img
                                    src={copyIcon}
                                    alt="copy"
                                    className=""
                                    id={'copy_project_' + index}
                                    data-tip data-for='copy_tooltip_icon'
                                    style={{ cursor: ((copyLoading && (copyMapId===project.mapId))?"progress":'pointer'),opacity:((copyLoading && (copyMapId===project.mapId))?"0.5":"unset") }}
                                    onClick={(copyLoading && (copyMapId===project.mapId))?()=>{}:
                                    () =>
                                      this.copyOfferingHandler(
                                        project.mapId,
                                        project.projectType,
                                        project.tenantId,

                                      )
                                    }
                                  />
                            
                                </span> : ''}
                              {/* edit icon */}
                              {this.checkForExternalUser() ?
                                <span></span> :  // adding empty span to adjust the height of card for external user
                                <span className="edit-deal-icon">
                                  <img
                                    src={EditIcon}
                                    alt="edit"
                                    id={'edit_project_' + index}
                                    data-tip data-for='edit_tooltip_icon'
                                    style={{ cursor: 'pointer' }}
                                    onClick={
                                      (userType === 'A' || userType === 'O' || userType === 'C' || userType === 'U' || userType === 'IL') &&
                                        (project.projectType === 'offering')
                                        ? () =>
                                          this.editOfferingHandler(
                                            project.projectId,
                                            project.mapId,
                                            project.accessType,
                                            project.isMaster
                                          )
                                        : () =>
                                          this.editProjectHandler(
                                            project.projectId,
                                            project.mapId,
                                            project.accessType,
                                            project.tenantId
                                          )
                                    }
                                  />
                                </span>
                              }
                              {/* delete icon */}
                              {this.checkForExternalUser() ?
                                '' : project.projectType === 'offering' && (userType === 'A' || userType === 'O' || userType === 'IL')
                                  ? project.accessType === 'Write' &&
                                  <span>
                                    <img
                                      src={trashIcon}
                                      alt="delete"
                                      className=""
                                      data-tip data-for='delete_tooltip_icon'
                                      id={`delete_project_${index}`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        this.openDeleteModal(project)}
                                    />
                                  </span>
                                  : project.projectType !== 'offering' && (userType !== 'A' || userType !== 'O' || userType === 'IL')
                                    ? project.accessType === 'Write' &&
                                    <span>
                                      <img
                                        src={trashIcon}
                                        alt="delete"
                                        className=""
                                        data-tip data-for='delete_tooltip_icon'
                                        id={`delete_project_${index}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                          this.openDeleteModal(project)}
                                      />
                                    </span>
                                    : ''}
                            </div>
                          </div>
                          <div className="not-hover-card"
                          >


                            <div className="project-info-wrapper" style={{ height: '170px' }}>
                              <div style={{ height: '145px' }}>
                                <div className="row project-logo-row">
                                  <img
                                    src={`${resourcePath}/vroimages/${project.projectId}/public/test1.png`}
                                    id="appLogo"
                                    className="mx-auto d-block"
                                    height="40%"
                                    width="40%"
                                    alt="project"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `${Logo}`; e.target.style = 'height:80%; width:80%' }}
                                  />

                                </div>
                                <div className="row project-name-row">
                                  <div
                                    className="pr-name"
                                    onClick={this.popOptionHandler}
                                  >
                                    {project.projectName}
                                  </div>

                                </div>
                              </div>
                              <div className="project-date-row row">
                                <div className="col-sm-12 pr-0">
                                  <div className="pr-date-div">
                                    <span className="pr-date-block">
                                      <span>Date : &nbsp;
                          {project.creationDate === null
                                          ? ''
                                          : Moment(project.creationDate).format(
                                            'DD-MMM-YYYY'
                                          )}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>
                            <div className="project-details-row" style={{ height: '117px' }}>
                              {project.projectType === 'offering' ?
                                <div className="details-wrapper">

                                  <div className="row">

                                    Owner: {project.ownerName}
                                  </div>
                                  <div className="row">
                                    Industry: {project.industry}

                                  </div>
                                </div>
                                :
                                <div className="details-wrapper">
                                  <div className="row">
                                    Account: {project.accountName}

                                  </div>
                                  <div className="row">

                                    Owner: {project.ownerName}
                                  </div>
                                </div>

                              }
                            </div>

                          </div>
                          <div className="on-hover-card">

                            <div className="project-descr-row row"
                              id={'project_description_' + index}
                              onClick={() =>
                                this.redirectProjectDashboard(
                                  project.projectId,
                                  project.mapId,
                                  project.accessType,
                                  project.isMaster,
                                  project.projectType,
                                  project.tenantId
                                )}
                              style={{ cursor: 'pointer', height: '288px', overflowWrap: 'anywhere' }}
                            >{project.description}
                            </div>
                          </div>
                        </div>
                      </div>
                  )}
                <ReactTooltip id="convert_tooltip_icon">
                  <span>Convert</span>
                </ReactTooltip>
                <ReactTooltip id="copy_tooltip_icon">
                  <span>Copy</span>
                </ReactTooltip>
                <ReactTooltip id="edit_tooltip_icon">
                  <span>Edit</span>
                </ReactTooltip>
                <ReactTooltip id="delete_tooltip_icon">
                  <span>Delete</span>
                </ReactTooltip>
              </div>

            }
          </div>
        </div>

        <DeleteModal
          title={
            option === 'sales'
              ? deleteProjectDetails.projectType === 'offering'
                ? 'This master offering will be deleted and data will be erased. This action is irreversible. Do you want to continue?'
                : 'This Opportunity will be deleted and data will be erased. This action is irreversible. Do you want to continue?'
              : 'This project will be deleted and data will be erased. This action is irreversible. Do you want to continue?'
          }
          visible={this.state.modalVisible}
          modalCloseHandler={this.modalCloseHandler}
          deleteProjectHandler={this.deleteProjectHandler}
        />
        <ConcurrentLoginModal
          title={
            'User session expired as concurrent login identified on a different browser/system'
          }
          visible={this.state.concurrentModalVisible}
          modalCloseHandler={this.modalCloseHandler}
          deleteProjectHandler={this.deleteProjectHandler}
          props={this.props}
        />
      </div>
    );
  }
}

export default withRouter(MyProjects);
import React, { Component, Fragment } from "react";
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import HomeMenu from '../../components/HomeMenu/HomeMenu';
import Menu from "../../components/Menu/Menu";
import manuallyIco from '../../assets/project/manuallySetKPI.svg';
import captureIco from '../../assets/project/reviewVDT.svg';
import defineIco from '../../assets/project/setKpi.svg';
import publishIco from '../../assets/project/publishDashboard.svg';
import deiverypublishIco from '../../assets/project/deliverypublishDashboard.svg';
import developIco from '../../assets/project/developVDT.svg';
import projectIco from '../../assets/ProjectCentreTree.png';
import ReactTooltip from 'react-tooltip';

import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
var SessionStorage = require('store/storages/sessionStorage');

@inject('myProjectStore', "publishDashboardStore")
@observer
class ProjectMenu extends Component {
  constructor(props) {
    super(props);
    this.angle = 0;
    this.endAngle = 0;
    this.increase = 0;
    this.state = {
      popMenuStatus: false,
      buttons: false,
      count: 0,
      radius: 0,
      selectedOption: false,
      projectName: false,
      actualProjectName: false,
      demoDeal: "",
      loadingresponse: false,
      tablueInprogress: false
    };

    this.redirectHandler = this.redirectHandler.bind(this);
    this.publishDashboardHandler = this.publishDashboardHandler.bind(this)
    this.move = this.move.bind(this);
  }
  componentDidMount() {
    const { myProjectStore, publishDashboardStore } = this.props;
    const { selectedProjectId, projectDetails } = myProjectStore;
    // myProjectStore.fetchDemoDeal()
    for (let i = 0; i < projectDetails.length; i++) {
      if (projectDetails[i].projectId === selectedProjectId) {
        SessionStorage.write('projectName', projectDetails[i].projectName)
        this.setState({
          projectName: projectDetails[i].projectName,
          actualProjectName: projectDetails[i].projectName
        })
      }
    }
    if (SessionStorage.read("projectName") !== '') {
      this.setState({
        projectName: SessionStorage.read("projectName")
      })
    }

    this.setState({
      buttons: Array.from(document.querySelectorAll(".project-button")),
      count: Array.from(document.querySelectorAll(".project-button")).length,
      increase: (Math.PI * 2) / Array.from(document.querySelectorAll(".project-button")).length,
      radius: 170,
      demoDeal: (myProjectStore.demoDealName !== "" ? myProjectStore.demoDealName : SessionStorage.read("demoDealName"))
    });

    // publiash dashboard
    // publishDashboardStore.getTableauToken()
    // .then((response) => {
    //     this.setState({
    //         token: response
    //     })
    //     this.getDashboardUrl();
    // })
    this.getDashboardUrl();

  }
  publishDashboardHandler = (event) => {
    event.preventDefault();
    // const { keyCallOutsList } = this.state;
    const { publishDashboardStore } = this.props;

    // const mapId = SessionStorage.read('mapId')
    // let keyCallOut = {}
    // let keyCallOutList = []
    this.setState({
      publishDashboard: true,
      loadingresponse: true,
      tablueInprogress: true
    })
    // for (let i = 0; i < keyCallOutsList.length; i++) {
    //     keyCallOut = {
    //         // "kcId" :"123" ,
    //         "mapId": SessionStorage.read('mapId'),
    //         "keyCallOuts": keyCallOutsList[i]["details" + i.toString()]
    //     }
    //     keyCallOutList.push(keyCallOut)
    // }

    // publishDashboardStore.keyCallouts = keyCallOutList; 

    publishDashboardStore.publishDashboard()
      .then((response) => {
        this.setState({
          publishDashboard: false,

        })
        if (response && !response.error && response.resultCode === 'OK') {
          this.setState({
            tableData: false,
            showDashboard: true,
            // showFiles: false,
            bodyClass: false,
            loadingresponse: false,
            tablueInprogress: false
          })
          window.open(this.state.tableauUrl)
        } else {

          this.showNotification('publishError', response.errorDescription)
          this.setState({
            loadingresponse: false,
            tablueInprogress: false
          })
        }
      })
  }

  showNotification(type, message) {
    switch (type) {

      case 'publishError':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={message}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      default:
        console.log("Nothing to show");
        break;
    }
  }


  getDashboardUrl() {
    const mapId = SessionStorage.read('mapId')
    const { token } = this.state;
    // const url = "https://tableau.valuecockpit.accenture.com/trusted/"+token+"/views/ValueCockpitDashboards/BenefitsSummaryF?map_id="+mapId+"&:embed=yes&:refresh=yes"
    // eslint-disable-next-line default-case
    switch (process.env.REACT_APP_BASE_URL) {
      case 'production':
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
      case 'staging':
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesUAT/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryUAT/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }

        break;
      case "development":
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
        case "training":
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
      case 'local':
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/trusted/d6epmGMTSQq76zMv3FHpYA==:jTjnDo_1HDsA4X0ZVuETtO3R/views/ValueDeliveryDEV/BenefitSummary/general.user/be905271-f7d6-4b43-8ff3-c70a14085a17?:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
            // tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
      case 'preprod':
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesPreProd/BenefitSummary?:iid=2&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryPreProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
      case 'productionb':
        if (SessionStorage.read('option_selected') === 'sales') {
          this.setState({
            tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesProdB/BenefitSummary?:iid=3&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        } else {
          this.setState({
            tableauUrl: ' https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryProdB/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
          })
        }
        break;
    }
  }

  redirectMenuHandler(type) {
    const { history } = this.props;
    // eslint-disable-next-line default-case
    switch (type) {
      case 'home':
        history.push('/home');
        break;
      case 'sales':
        history.push('/home');
        break;
      case 'delivery':
        history.push('/home');
        break;
      case 'myproject':
        history.push('/my-deals');
        break;
      case 'sales-home':
        history.push('/sales-home');
        break;
    }
  }

  move = (e) => {
    const { buttons, count, increase } = this.state;
    const n = buttons.indexOf(e.target);
    this.endAngle = (((n) % count) + 1) * increase;
    this.showSelectedOption(e.target.id);
    this.turn();
  };

  turn = () => {
    if (Math.abs(this.endAngle - this.angle) > 1 / 8) {
      const sign = this.endAngle > this.angle ? 1 : -1;
      this.angle = this.angle + sign / 8;
      setTimeout(this.turn, 30);
    } else {
      // if(this.endAngle===0 && this.angle===0){
      //   this.angle = this.angle + 1 / 8;
      //   this.endAngle = (-1.2566370614359172)
      //   setTimeout(this.turn, 30);
      // }else{
      this.angle = this.endAngle;
      // }

    }

    this.setAngle();
  };

  setAngle() {
    const { buttons, increase, radius } = this.state;
    buttons.forEach((button, i) => {

      button.style.top =
        (Math.sin(-Math.PI / 3 + i * increase - this.angle) * radius) +
        (Number((Math.sin(-Math.PI / 3 + i * increase - this.angle) * radius).toPrecision(3)) === (169)
          ? (13) : 0)
        + "px";
      button.style.left =
        (Math.cos(-Math.PI / 3 + i * increase - this.angle) * radius) +
        ((Math.cos(-Math.PI / 3 + i * increase - this.angle) * radius) === (-155.30272779924218) ? (-9) : 0)
        + "px";

    });

  }

  redirectHandler(e) {
    const { history } = this.props;
    // eslint-disable-next-line default-case
    switch (e.target.id) {
      case "develope_VDT":
        history.push('/value-drivers');
        break;
      case 'sales':
        history.push('/home');
        break;
      case 'sales-home':
        history.push('/sales-home');
        break;

      case "businessCase":
        history.push("/business-case");
        break;
      case "captureActuals":
        history.push("/capture-actuals");
        break;
      case "defineInitiatives":
        // history.push("/defineInitiatives");
        break;
      case "defineWorkstream":
        history.push("/workstream-home");
        break;
      case "publish_dashboard":
        history.push("/publish-dashboards");
        break;
      case 'add_Initiative_information':
        history.push("/add-initiative-infomation");
        break;
    }
  }

  showSelectedOption(type) {
    // eslint-disable-next-line default-case
    switch (type) {
      case "businessCase":
        this.setState({ selectedOption: 'businessCase' });
        break;
      case "captureActuals":
        this.setState({ selectedOption: 'captureActuals' });
        break;
      case "defineInitiatives":
        this.setState({ selectedOption: 'defineInitiatives' });
        break;
      case "addInitiativeInformation":
        this.setState({ selectedOption: 'addInitiativeInformation' });
        break;
      case "publishDashboard":
        this.setState({ selectedOption: 'publishDashboard' });
        break;
      case "developeVDT":
        this.setState({ selectedOption: 'developeVDT' });
        break;
    }
  }

  render() {
    const { increase, radius, selectedOption, projectName, tablueInprogress } = this.state;
    const demoUser = SessionStorage.read('demoUser');
    const option = SessionStorage.read('option_selected')
    const calculateProjectName = (projectName) => {
      if (projectName) {
        return projectName.slice(0, 31);
      }
    }
    const calculateActualProjectName = (projectName) => {
      if (projectName) {
        return projectName;
      }
    }
    // const calculateProjectNameForToolTip = (demoUser, projectName) => {
    //   return JSON.parse(demoUser) === true ? 'Demo Project' : calculateProjectName(projectName);
    // }
    const getTooltipData = (demoUser, projectName) => {
      return `${JSON.parse(demoUser) === true ? 'Demo Project' : calculateActualProjectName(projectName)} `;
    }
    return (console.log("projectName", projectName),
      <div className="container-fluid project-home"
        style={{
          overflowY: 'hidden',
          cursor: (tablueInprogress ? "progress" : "pointer")
        }}>
        <Menu />
        <div className="row">
          <div className="col-sm-6">
            <div>
              <label className="page-header-label"> {option === "sales" ? 'MY OPPORTUNITIES' : 'MY PROJECTS'}</label>
            </div>
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectMenuHandler('home')}>Home</li>
                  {option === 'sales' ?
                    <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectMenuHandler('sales-home')}>Sales Home </li>
                    : ""}
                  {
                    option === "sales" ?
                      <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectMenuHandler('sales')}>Opportunity</li> :
                      <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectMenuHandler('delivery')}>Delivery</li>
                  }	{
                    !JSON.parse(demoUser) &&
                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectMenuHandler('myproject')}>{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                  }
                  {
                    option === "sales" ?
                      <li className="breadcrumb-item active" aria-current="page">{JSON.parse(demoUser) === true ? 'Demo Opportunity' : projectName}</li> :
                      <li className="breadcrumb-item active" aria-current="page">{JSON.parse(demoUser) === true ? 'Demo Project' : projectName}</li>
                  }

                </ol>
              </nav>
            </div>
          </div>
          <div className="col-sm-6 text-right">
            {JSON.parse(demoUser) === true ?
              <span onClick={() => this.redirectMenuHandler('sales')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                &times;
       </span>
              :
              <span onClick={() => this.redirectMenuHandler('myproject')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                &times;
            </span>
            }
            {/* <span onClick={() => this.redirectMenuHandler('myproject')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
              &times;
            </span> */}
          </div>
        </div>

        <div className="row" style={{ height: "420px" }}>
          <div className="col-sm-4"></div>
          <div className="col-sm-4">
            <div className="project-menu">
              <div className="center2">
                <div className="row justify-content-center" style={{ zIndex: '9999', width: '170px', position: 'absolute', paddingTop: '40%' }}>
                  <div className="col-sm-12 text-center" style={{ fontSize: '16px', height: '40px', overflowWrap: 'break-word' }}
                    // data-tip={calculateProjectNameForToolTip(demoUser, projectName)}
                    data-tip={getTooltipData(demoUser, projectName)}
                  >
                    {
                      option === "sales" ?

                        JSON.parse(demoUser) === true ? (this.state.demoDeal) : calculateProjectName(projectName) :
                        JSON.parse(demoUser) === true ? 'Demo Project' : calculateProjectName(projectName)
                    }

                    <ReactTooltip />
                  </div>
                </div>
                <img
                  src={projectIco}
                  alt="Get Started"
                  height="190px"
                  width="170px"
                  style={{ marginLeft: "-35%", marginTop: "-12%" }}
                />




                <div
                  className="project-button"
                  style={{
                    top: Math.sin(-Math.PI / 3 + 1 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 3 + 1 * increase) * radius + "px",
                    backgroundImage: `url(${developIco})`
                  }}
                  id="developeVDT"
                  onClick={this.move}
                ></div>
                <div
                  className="project-button"
                  style={{
                    top: (Math.sin(-Math.PI / 3 + 2 * increase) * radius) + 13 + "px",
                    left: Math.cos(-Math.PI / 3 + 2 * increase) * radius + "px",
                    backgroundImage: `url(${manuallyIco})`
                  }}
                  id="businessCase"
                  onClick={this.move}
                ></div>


                {option !== 'sales'
                  ?
                  <Fragment>

                    <div
                      className="project-button"
                      style={{
                        top: Math.sin(-Math.PI / 3 + 3 * increase) * radius + "px",
                        left: Math.cos(-Math.PI / 3 + 3 * increase) * radius + "px",
                        backgroundImage: `url(${defineIco})`
                      }}
                      id="defineInitiatives"
                      onClick={this.move}
                    ></div>
                    <div
                      className="project-button"
                      style={{
                        top: Math.sin(-Math.PI / 3 + 4 * increase) * radius + "px",
                        left: (Math.cos(-Math.PI / 3 + 4 * increase) * radius) + (-9) + "px",
                        backgroundImage: `url(${captureIco})`
                      }}
                      id="captureActuals"
                      onClick={this.move}
                    ></div>
                  </Fragment> : ''}
                {option === 'sales' ? <div
                  className="project-button"
                  style={{
                    top: Math.sin(-Math.PI / 3 + 3 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 3 + 3 * increase) * radius + "px",
                    backgroundImage: `url(${publishIco})`
                  }}
                  id="publishDashboard"
                  onClick={this.move}
                ></div> :
                  <div
                    className="project-button"
                    style={{
                      top: Math.sin(-Math.PI / 3 + 5 * increase) * radius + "px",
                      left: Math.cos(-Math.PI / 3 + 5 * increase) * radius + "px",
                      backgroundImage: `url(${deiverypublishIco})`
                    }}
                    id="publishDashboard"
                    onClick={this.move}
                  ></div>}

              </div>
            </div>
          </div>
          {selectedOption && <div className="col-sm-3">
            <HomeMenu
              type={selectedOption}
              loadingresponse={this.state.loadingresponse}
              tablueInprogress={this.state.tablueInprogress}
              redirectHandler={this.redirectHandler}
              publishDashboardHandler={this.publishDashboardHandler} />
          </div>}
        </div>
      </div>
    );
  }
}

export default withRouter(ProjectMenu);

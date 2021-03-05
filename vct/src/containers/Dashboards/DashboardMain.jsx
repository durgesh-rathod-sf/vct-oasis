import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import Menu from '../../components/Menu/Menu';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import './DashboardMain.css';
import DashboardNavbar from './DashboardNavbar';
var SessionStorage = require('store/storages/sessionStorage')

@inject("publishDashboardStore")
@observer
class DashboardMain extends Component {
    constructor(props) {
        super(props);
        this.setSelectedTab = this.setSelectedTab.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);
        this.state = {
            selectedTab: '',
            loadingresponse: false,
            showNav: false,
        }
    }
    componentDidMount() {
        this.getDashboardUrl();
        this.publishDashboardHandler();
    }
    showNotification(type) {
        switch (type) {
            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Failed to publish. Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }
    getDashboardUrl() {
        const mapId = SessionStorage.read('mapId')
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
            case 'local':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/trusted/d6epmGMTSQq76zMv3FHpYA==:jTjnDo_1HDsA4X0ZVuETtO3R/views/ValueDeliveryDEV/BenefitSummary/general.user/be905271-f7d6-4b43-8ff3-c70a14085a17?:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId

                    })
                }
                break;
        }
    }

    publishDashboardHandler = () => {

        const { publishDashboardStore } = this.props;
        this.setState({
            publishDashboard: true,
            loadingresponse: true,
            tablueInprogress: true
        })
        publishDashboardStore.publishDashboard()
            .then((response) => {
                this.setState({
                    publishDashboard: false,

                })
                if (response && publishDashboardStore.url!=="") {
                    this.setState({
                        tableData: false,
                        showDashboard: true,
                        // showFiles: false,
                        bodyClass: false,
                        loadingresponse: false,
                        tablueInprogress: false,
                        showNav: true
                    })
                    // window.open(this.state.tableauUrl)
                } else {

                    this.showNotification('publishError')
                    this.setState({
                        loadingresponse: false,
                        tablueInprogress: false,
                        showNav: false
                    })
                }
            })
    }

    publishDashboardIcon = (event) => {
        event.preventDefault();
        const { publishDashboardStore } = this.props;
        // this.setState({
        //     publishDashboard: true,
        //     loadingresponse: true,
        //     tablueInprogress: true
        // })
         publishDashboardStore.publishDashboard()
            .then((response) => {
                this.setState({
                    publishDashboard: false,

                })
                if (response) {
                    this.setState({
                        tableData: false,
                        showDashboard: true,
                        // showFiles: false,
                        bodyClass: false,
                        // loadingresponse: false,
                        tablueInprogress: false
                    })
                    window.open(this.state.tableauUrl)
                } else {

                    this.showNotification('publishError')
                    this.setState({
                        // loadingresponse: false,
                        tablueInprogress: false
                    })
                }
            })
    }
    setSelectedTab(val) {
        this.setState({
            setSelectedTab: val
        });
    }

    redirectHandler(type) {
        const { history } = this.props;
        switch (type) {
            case 'home':
                history.push('/');
                break;
            case 'sales':
                history.push('/home');
                break;
            case 'myproject':
                history.push('my-deals');
                break;
            case "delivery-home":
                history.push('/delivery');
                break;
            case "sales-home":
                history.push('/sales-home');
                break;
        }
    }
    render() {
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected');
       

        return (
            <div className={'container-fluid no-project-body workstream-home'}>
                <Menu />
                <div className="ws-main-wrapper">
                    <div className="breadcrumb-row row" data-html2canvas-ignore="true">
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>

                                    {option === 'sales' ?
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('sales-home')}>Opportunity Home </li>
                                        : <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('delivery-home')}>Program Delivery Home </li>
                                    }
                                    {
                                        !JSON.parse(demoUser) &&
                                        <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')}>{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                                    }
                                    <li className="breadcrumb-item" aria-current="page">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Publish Dashboard</li>
                                </ol>
                            </nav>

                        </div>
                    </div>
                    <div className="ws-header-main">
                        <div className="row page-name-row">
                            <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                        </div>
                        <ProjectNavbar
                            activePage="publish_dashboard"
                            publishDashboardHandler={this.publishDashboardHandler}
                            publishDashboardIcon={this.publishDashboardIcon}
                            loadingresponse={this.state.loadingresponse}
                        />
                        {!this.state.loadingresponse ?
                            <DashboardNavbar selectedTab={this.setSelectedTab} publishDashboardIcon={this.publishDashboardIcon}
                                loadingresponse={this.state.loadingresponse}></DashboardNavbar>
                            :
                            <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                            </div>

                        }



                    </div>
                </div>

            </div>

        )
    }
}

export default withRouter(DashboardMain);
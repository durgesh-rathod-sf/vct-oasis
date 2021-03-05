import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';

import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import Menu from '../../components/Menu/Menu';
import DefineWorkstreamNavbar from '../WorkstreamNavbar/DefineWorkstreamNavbar';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import './DefineWorkstreamHome.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject("publishDashboardStore")
@observer
class DefineWorkstreamHome extends Component {
    constructor(props) {
        super(props);

        this.setSelectedWorkstreamTab = this.setSelectedWorkstreamTab.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);

        this.state = {
            selectedWorkstreamTab: '',
            loadingresponse: false
        }
    }
    componentDidMount() {
        this.getDashboardUrl();
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
    setSelectedWorkstreamTab(val) {
        this.setState({
            selectedWorkstreamTab: val
        });
    }

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
            // case 'projectMenu':
            //     history.push('/deal');
            //     break;
            case 'myproject':
                history.push('my-deals');
                break;
            case "delivery-home":
                history.push('/delivery');
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
                                    {/* {option === "sales" ?
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales</li> :
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Delivery</li>
                                    } */}
                                    {
                                        !JSON.parse(demoUser) &&
                                        <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')}>{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                                    }
                                    <li className="breadcrumb-item" aria-current="page">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Define Workstreams</li>
                                </ol>
                            </nav>

                        </div>
                    </div>
                    <div className="ws-header-main">
                        <div className="row page-name-row">
                            <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                            {/* <img src={Polygon} height="31px" alt={JSON.parse(demoUser) ? 'Demo Project' : pname} width="31px" /> */}
                        </div>
                        <ProjectNavbar
                            activePage="define_workstream"
                            publishDashboardHandler={this.publishDashboardHandler}
                            loadingresponse={this.state.loadingresponse}
                        />
                        <div className="tab-content-outer-wrapper">
                            <DefineWorkstreamNavbar selectedWorkstreamTab={this.setSelectedWorkstreamTab}></DefineWorkstreamNavbar>
                        </div>


                    </div>
                </div>
                {/* <div className="row">
                    <div className="col-sm-6">
                        
                        <div>
                            
                        </div>
                    </div>
                    <div className="col-sm-6 text-right">
                        <span onClick={() => this.redirectHandler('projectMenu')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                            &times;
                        </span>
                    </div>
                </div> */}


            </div>

        )
    }
}

export default withRouter(DefineWorkstreamHome);
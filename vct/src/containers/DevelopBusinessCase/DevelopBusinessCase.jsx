import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import Menu from '../../components/Menu/Menu';
import DevelopBusinessCaseNavbar from "../DevelopBusinessCaseNavbar/DevelopBusinessCaseNavbar";
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject('kpiBenefitsStore', "publishDashboardStore")
@observer
class DevelopBusinessCase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPage: '',
            loadingresponse: false
        }
        this.redirectHandler = this.redirectHandler.bind(this);
        this.setSelectedPage = this.setSelectedPage.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);
    }
    componentDidMount() {
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
                if (response && !response.error  && response.resultCode === 'OK') {
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
    redirectHandler(type) {
        const { history } = this.props;
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case "sales-home":
                history.push('/sales-home');
                break;
            case "delivery-home":
                history.push('/delivery');
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
            default:
              
                break;
        }
    }
    setSelectedPage(val) {
        this.setState({
            selectedPage: val
        })
    }

    render() {
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected')
        return (
            <div className='container-fluid no-project-body' >
                <Menu />
                <div className="page-off-menu">
                    <div className="row breadcrumb-row">
                        <div className="col-sm-12">

                            <div>
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
                                        <li className="breadcrumb-item active" aria-current="page">Develop Business Case</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                        {/* <div className="col-sm-2 text-right">
                        <span onClick={() => this.redirectHandler('projectMenu')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                            &times;
                        </span>
                    </div> */}
                    </div>

                    {/* <div>
                            <label className="page-header-label">{JSON.parse(demoUser) ? 'Demo Deal' : pname}</label> {" "}
                           </div> */}
                    {/* <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} /> */}

                    <div className="dbc-main">
                        <div className="row page-name-row">
                            <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                        </div>
                        <ProjectNavbar
                            activePage="develop_business_case"
                            publishDashboardHandler={this.publishDashboardHandler}
                            loadingresponse={this.state.loadingresponse}
                        />
                        <DevelopBusinessCaseNavbar selectedPage={this.setSelectedPage} />
                    </div>
                </div>
            </div >
        )
    }
}

export default withRouter(DevelopBusinessCase);

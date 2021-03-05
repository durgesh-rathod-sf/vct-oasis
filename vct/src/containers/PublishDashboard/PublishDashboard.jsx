import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import DashboardLogo from "../../assets/Dashboard_Icon_new.png";
import Menu from '../../components/Menu/Menu';
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import DashboardTable from '../../components/DashboardTable/DashboardTable';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import KeyCalloutDetials from '../KeyCallOutDetails/KeyCallOutDetails';
import DashboardNavbar from '../Dashboards/DashboardNavbar';

var SessionStorage = require('store/storages/sessionStorage');

@inject('myProjectStore')
@inject('publishDashboardStore')
@observer
class PublishDashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viz: false,
            templateUpload: false,
            tableData: false,
            activeTab: false,
            publishDashboard: false,
            showDashboard: false,
            downloadFlag: false,
            uploadError: '',
            keyCallOutsList: [],
            bodyClass: false,
            showFiles: true,
            kpiNames: [],
            kpiDetails: {},
            templateArray: false,
            fileArrayLength: 0,
            fileUploadSuccess: false,
            tableauUrl: '',
            token: '',
            loadingDealToProject: false,
            loadingresponse: false
        }
        this.redirectHandler = this.redirectHandler.bind(this);
        this.templateUploadHandler = this.templateUploadHandler.bind(this);
        this.tabChangeHandler = this.tabChangeHandler.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);
        this.downloadTemplateHandler = this.downloadTemplateHandler.bind(this);
        this.cancelUploadHandler = this.cancelUploadHandler.bind(this);
        this.refreshHandler = this.refreshHandler.bind(this);
        this.onConvertClick = this.onConvertClick.bind(this);
        this.addKeyCallOutHandler = this.addKeyCallOutHandler.bind(this);
        this.deleteUserHandler = this.deleteUserHandler.bind(this);
        // this.showPrevFiles = this.showPrevFiles.bind(this);
        this.getDashboardUrl = this.getDashboardUrl.bind(this);
    }

    componentDidMount() {
        const { publishDashboardStore } = this.props
        // this.showPrevFiles();
        let keyCallOut = {}
        const { keyCallOutsList } = this.state
        // publishDashboardStore.fetchKeyCallouts()
        //     .then((response) => {
        //         response.data.resultObj.map((key, index) => {
        //             keyCallOut = {
        //                 "kcId": key.kcId,
        //                 ["details" + index.toString()]: key.keyCallOuts,
        //                 "delete_index": index
        //             }
        //             keyCallOutsList.push(keyCallOut);
        //             return true;
        //         })
        //     })
        publishDashboardStore.getTableauToken()
            .then((response) => {
                if (!response.error && response.resultCode === 'OK') {
                    this.setState({
                        token: response
                    })
                    this.getDashboardUrl();
                }else if(response && response.resultCode === 'KO'){
                    this.showErrorNotification(response.errorDescription);
                }

            })
        this.getDashboardUrl();
    }

    onConvertClick = () => {
        const { myProjectStore, history } = this.props;
        this.setState({
            loadingDealToProject: true
        })
        if (myProjectStore.projectDetails.length > 0) {
            myProjectStore.getProjectId()
            SessionStorage.write("convertToProject", true);
            SessionStorage.write("option_selected", "delivery")
            history.push("/new-deal")
        } else {
            myProjectStore.getProjectLists()
                .then((result) => {
                    if(result && result.resultCode === 'OK'){

                        myProjectStore.getProjectId()
                        SessionStorage.write("convertToProject", true);
                        SessionStorage.write("option_selected", "delivery")
                        this.setState({
                            loadingDealToProject: false
                        })
                        history.push("/new-deal")
                    }else if (result && result.resultCode === 'KO') {
                        this.showErrorNotification(result.errorDescription);
                    }
                })
        }

    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            // case 'projectMenu':
            //     history.push('/deal');
            //     break;
            case 'myproject':
                history.push('my-deals');
                break;
            case 'sales':
                history.push('/home');
                break;
            case "sales-home":
                history.push('/sales-home');
                break;
        }
    }

    refreshHandler = (event) => {
        document.getElementById('iframeid').src += '';
    }

    onKeyCalloutChangeHandler = (event) => {
        event.preventDefault();
        const { keyCallOutsList } = this.state;
        const targetId = event.target.id;
        const targetValue = event.target.value;
        for (let i = 0; i < keyCallOutsList.length; i++) {
            if (keyCallOutsList[i].targetId === '' || keyCallOutsList[i].targetId !== '') {
                if (i.toString() === targetId.slice(-1)) {
                    keyCallOutsList[i][targetId] = targetValue
                    this.setState({
                        keyCallOutsList: keyCallOutsList
                    })
                }
            }
        }

    }
    addKeyCallOutHandler = (event) => {
        event.preventDefault();
        // let keyCallOutsList=[]
        const { keyCallOutsList } = this.state;
        if (keyCallOutsList.length === 0) {
            const keyCallOut = {
                'details0': '',
                'delete_index': 0

            }
            keyCallOutsList.push(keyCallOut)
            this.setState({
                keyCallOutsList: keyCallOutsList
            })
        } else {
            const lastIndex = keyCallOutsList.length
            const keyCallOut = {
                ['details' + lastIndex]: '',
                'delete_index': lastIndex

            }
            keyCallOutsList.push(keyCallOut)
            this.setState({
                keyCallOutsList: keyCallOutsList
            })
        }
    }

    templateUploadHandler = (event) => {
        const { publishDashboardStore } = this.props;
        const file = event.target.files[0]
        this.setState({
            templateUpload: true,
            bodyClass: true,
        })
        publishDashboardStore.uploadTemplate(file)
            .then((response) => {
                this.setState({
                    templateUpload: false,
                })
                document.getElementById("file").value = "";
                if (response.resultCode === 'OK') {
                    this.setState({
                        tableData: publishDashboardStore.kpiData,
                        kpiData: publishDashboardStore.kpiData,
                        kpiNames: this.getKpiNamesArray(publishDashboardStore.kpiData),
                        activeTab: publishDashboardStore.kpiNames[0],
                        kpiName: publishDashboardStore.kpiNames[0],
                        kpiIndex: 0,
                        fileUploadSuccess: true
                    })
                    let kpiDetails = {
                        "kpiUnit": this.state.kpiData[0].kpiUnit,
                        "kpiType": this.state.kpiData[0].kpiType,
                        "kpiFrequency": this.state.kpiData[0].kpiFrequency
                    }
                    this.setState({
                        kpiDetails: kpiDetails
                    })
                    this.showNotification('fileUploadSuccess')
                } else if(response.resultCode === 'KO') {
                    this.setState({
                        uploadError: response.errorDescription,
                        bodyClass: false
                    })
                    this.showNotification('fileUploadFailure')
                    document.getElementById("file").value = "";
                }
            })
    }

    getKpiNamesArray(kpiData) {
        const kpiArr = [];
        const kpiNameArr = [];
        const { publishDashboardStore } = this.props
        const verifyOtherKpiDetails = (kpiArr, kpiObj) => {
            for (let x of kpiArr) {
                if (x.kpiName === kpiObj.kpiName &&
                    x.kpiFrequency === kpiObj.kpiFrequency &&
                    x.kpiType === kpiObj.kpiType &&
                    x.kpiUnit === kpiObj.kpiUnit) {
                    return false;
                }
            }
            return true;
        }

        for (let kpiObj of kpiData) {
            if (kpiArr.length === 0 || verifyOtherKpiDetails(kpiArr, kpiObj)) {
                kpiArr.push(kpiObj);
            }
        }
        publishDashboardStore.kpiData = kpiArr
        for (let obj of kpiArr) {
            if (kpiNameArr.indexOf(obj.kpiName) === -1) {
                kpiNameArr.push(obj.kpiName);
            }
        }
        return kpiNameArr;
    }

    tabChangeHandler = (event) => {
        let kpiDetails = {}
        const targetValue = event.currentTarget.getAttribute('value');
        const { kpiData } = this.state;
        this.setState({
            kpiName: targetValue,
            kpiIndex: event.currentTarget.getAttribute('id'),
            activeTab: targetValue
        })
        kpiData && kpiData.map((kpi) => {
            if (kpi.kpiName === targetValue) {
                kpiDetails = {
                    "kpiUnit": kpi.kpiUnit,
                    "kpiType": kpi.kpiType,
                    "kpiFrequency": kpi.kpiFrequency
                }
            }
        })
        this.setState({
            kpiDetails: kpiDetails
        })
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
        const { keyCallOutsList } = this.state;
        const { publishDashboardStore } = this.props;

        const mapId = SessionStorage.read('mapId')
        let keyCallOut = {}
        let keyCallOutList = []
        this.setState({
            publishDashboard: true,
            loadingresponse: true
        })
        for (let i = 0; i < keyCallOutsList.length; i++) {
            keyCallOut = {
                // "kcId" :"123" ,
                "mapId": SessionStorage.read('mapId'),
                "keyCallOuts": keyCallOutsList[i]["details" + i.toString()]
            }
            keyCallOutList.push(keyCallOut)
        }

        publishDashboardStore.keyCallouts = keyCallOutList;

        publishDashboardStore.publishDashboard()
            .then((response) => {
                this.setState({
                    publishDashboard: false
                })
                if (response && response.resultCode === 'OK') {
                    this.setState({
                        tableData: false,
                        showDashboard: true,
                        // showFiles: false,
                        bodyClass: false,
                        loadingresponse: false
                    })
                    window.open(this.state.tableauUrl)
                } else {

                    this.showErrorNotification(response.errorDescription)
                    this.setState({
                        loadingresponse: false
                    })
                }
            })
    }

    downloadTemplateHandler = (event) => {
        event.preventDefault();
        this.setState({
            downloadFlag: true
        })
        const { publishDashboardStore } = this.props;
        publishDashboardStore.downloadTemplate()
            .then((response) => {
                if (response && !response.error && response.resultCode === 'OK') {
                    this.setState({
                        downloadFlag: false
                    })
                }else if(response && response.resultCode === 'KO'){
                    this.showErrorNotification(response.errorDescription);
                }
            })
    }

    cancelUploadHandler = (event) => {
        const { publishDashboardStore } = this.props
        publishDashboardStore.cancelUpload()
            .then((response) => {
                if (response && !response.error && response.resultCode === 'OK') {
                    this.showNotification('cancelUpload')
                    publishDashboardStore.resetData()
                    this.setState({
                        tableData: false,
                        showDashboard: false,
                    })
                } else {
                    this.showErrorNotification(response.errorDescription);
                }
            })
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

    showNotification(type) {
        switch (type) {
            case 'fileUploadSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully uploaded template'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'fileUploadFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={this.state.uploadError}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Failed to publish. Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'cancelUpload':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'File deleted successfully'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'cancelUploadFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! File not deleted. Please try again'}
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

    deleteUserHandler = (event) => {
        event.preventDefault();
        const { keyCallOutsList } = this.state;
        keyCallOutsList.splice(this.getIndex(event.target.id), 1);
        const updatedProjectUsers = this.resetDeleteIndices(keyCallOutsList);
        this.setState({
            keyCallOutsList: updatedProjectUsers
        });
    }
    resetDeleteIndices(keyCallOutsList) {
        for (let i = 0; i < keyCallOutsList.length; i++) {
            const oldIndex = keyCallOutsList[i]['delete_index'];
            keyCallOutsList[i]['delete_index'] = i;
            keyCallOutsList[i][`details${keyCallOutsList[i][`delete_index`]}`] = keyCallOutsList[i][`details${oldIndex}`];

        }
        return keyCallOutsList;
    }
    getIndex(targetId) {
        return Number(targetId[targetId.length - 1]);
    }
    // async showPrevFiles() {
    //     const { publishDashboardStore } = this.props;
    //     publishDashboardStore.showPrevFiles()
    //         .then((response) => {
    //             if (response) {
    //                 this.setState({
    //                     fileArrayLength: response.length
    //                 });
    //             }
    //             this.setState({
    //                 templateArray: response,
    //                 resultObj: response,
    //             });
    //         })

    // }

    downloadFile = (event) => {
        const { publishDashboardStore } = this.props;
        this.setState({
            downloadBtn: true
        })
        const url = event.target.getAttribute('data-url')
        const fileName = event.target.id
        publishDashboardStore.downloadFile(url, fileName);
    }

    render() {
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected')
        const { tableData, activeTab, publishDashboard, showFiles, loadingDealToProject, loadingresponse } = this.state

        return (
            <div className={'container-fluid no-project-body'}>
                <Menu />
                <div className="row">
                    <div className="col-sm-6">
                        <div>
                            <label className="page-header-label">{pname}</label> {" "}
                            {/* <img src={Polygon} height="31px" alt={JSON.parse(demoUser) ? 'Demo Project' : pname} width="31px" /> */}
                        </div>
                        <div>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    {option === 'sales' ?
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('sales-home')}>Sales Home </li>
                                        : ""
                                    }
                                    {option === "sales" ?
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales</li> :
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Delivery</li>
                                    }
                                    {
                                        !JSON.parse(demoUser) &&
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')} >{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                                    }
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('projectMenu')} aria-current="page">{JSON.parse(demoUser) === true ? 'Demo Opportunity' : pname}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Publish Dashboards</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className="col-sm-6 text-right">
                        <span onClick={() => this.redirectHandler('projectMenu')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                            &times;
                        </span>
                    </div>
                </div>

                <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} />
                <ProjectNavbar activePage="publish_dashboard" />
                <DashboardNavbar activePage="publish_dashboard" />
                {showFiles &&
                    <div className="row">
                        <div className="w-100"></div>
                        <div className="col-sm-12" style={{ textAlign: "center", marginTop: "50px" }}>
                            <img src={DashboardLogo} id="delivery"
                                onClick={loadingresponse ? () => { } : this.publishDashboardHandler}
                                //  onClick={this.redirectHandler}

                                alt="Valuecockpit Delivery"
                                style={{
                                    cursor: (loadingresponse ? "wait" : "pointer"),
                                    height: "225px", background: "bottom", border: "0px"
                                }}
                                className="file uploadBtn btn btn-light"
                            />
                            {/* {option === "sales" ? (SessionStorage.read('projType') === 'offering' ? "" :
                                <button style={{ width: '158px', lineHeight: "18px", borderRadius: "5px", fontWeight: '500', margin: '1%', cursor: loadingDealToProject ? 'wait' : 'pointer' }}
                                    disabled={SessionStorage.read("accessType") === "Read" || loadingDealToProject ? true : false}
                                    onClick={this.onConvertClick}
                                >Convert Deal to Project</button>)
                                : ""} */}
                        </div>
                    </div>
                }

                <div className="row">
                    {tableData &&
                        <div className="col-sm-8">
                            <DashboardTable
                                tabChangeHandler={this.tabChangeHandler}
                                publishDashboardHandler={this.publishDashboardHandler}
                                tableData={tableData}
                                activeTab={activeTab}
                                publishDashboard={publishDashboard}
                                cancelUpload={this.cancelUploadHandler}
                                kpiDetails={this.state.kpiDetails}
                                kpiNames={this.state.kpiNames}
                                kpiData={this.state.kpiData}
                                kpiName={this.state.kpiName}
                                kpiIndex={this.state.kpiIndex}

                            />
                        </div>
                    }
                    <div className={tableData ? "col-sm-4" : ''} style={{ paddingTop: '1%', marginLeft: tableData ? '' : '65%' }}>
                        {tableData &&

                            <KeyCalloutDetials
                                onKeyCalloutChangeHandler={this.onKeyCalloutChangeHandler}
                                keyCallOutsList={this.state.keyCallOutsList}
                                addKeyCallOutHandler={this.addKeyCallOutHandler}
                                deleteUserHandler={this.deleteUserHandler}
                            />
                        }
                        {/* {showFiles &&
                            <div style={{ marginBottom: '3%', marginTop: '5%' }}>
                                <DashboardDocuments
                                    templateArray={this.state.templateArray}
                                    downloadFile={this.downloadFile} />
                            </div>
                        } */}
                    </div>
                </div>

                {/* {showDashboard &&
                    <div className="row justify-content-center" style={{ marginTop: '50px' }}>
                        <button className="btn btn-light" style={{ width: '400px', fontWeight: '500' }}>
                            <a style={{ color: '#000000', textDecoration: 'none' }}
                                href={'https://tableau.valuecockpit.accenture.com/#/views/ValueCockpitIntegrationv9Extract/HomePage?Map%20Id=' + mapId + '&:iid=36'}
                                rel="noopener noreferrer" target="_blank"
                            >
                                SEE DASHBOARD
                             {" "}<i className="fa fa-long-arrow-right"></i>
                            </a>
                        </button>
                    </div>} */}
            </div>
        )
    }
}

export default withRouter(PublishDashboard);
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter, NavLink } from "react-router-dom";
import { toast } from 'react-toastify';

import { routes } from '../../constants';
import Menu from '../../components/Menu/Menu';
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ExportModal from '../../components/ExportModal/ExportModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import Polygon from '../../assets/project_card_icon.svg';

import './ReviewValueDriverTree.css';
import html2canvas from 'html2canvas';
var SessionStorage = require('store/storages/sessionStorage');

@inject('reviewValueDriverStore', 'valueDriversStore', 'setKpiTargetStore')
@observer
class ReviewValueDriverTree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueRender: false,
            visible: false,
            frequencyErrorFlag: false,
            businessFrequency: false,
            kpiCollectionTemplateBtn: false,
            operationalFrequencyCnt: 0,
            noFrequencies: true,
            defaultResponse: [],
            defaultBusinessKpi: [],
            defaultOperationalKpi: [],
            overflowValue: 'auto'
        }
        this.redirectHandler = this.redirectHandler.bind(this);
        this.exportHandler = this.exportHandler.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);
        this.generateXlsHandler = this.generateXlsHandler.bind(this);
        this.generatePPTHandler = this.generatePPTHandler.bind(this);
        this.generateKPITemplate = this.generateKPITemplate.bind(this);
        this.saveKPIFrequency = this.saveKPIFrequency.bind(this);
        this.setBusinessFrequency = this.setBusinessFrequency.bind(this);
        this.frequencyChangeHandler = this.frequencyChangeHandler.bind(this);
    }

    componentDidMount() {
        this.setState({
            frequencyErrorFlag: false
        })
        this.getFrequencies();
    }

    getFrequencies() {
        const { reviewValueDriverStore, setKpiTargetStore } = this.props;
        reviewValueDriverStore.getSelectedKpi()
            .then((response) => {
                if (response && !response.error && response.resultCode === 'OK') {
                    setKpiTargetStore.getFrequencies()
                        .then((response) => {
                            if (response && !response.error && response.resultCode === 'OK') {
                                const { operationKpiIds } = reviewValueDriverStore
                                const { operationalKpi } = setKpiTargetStore
                                const { businessKpi } = setKpiTargetStore
                                if (businessKpi.length > 0) {
                                    this.setState({
                                        businessFrequency: businessKpi[0].kpiFrequency,
                                        noFrequencies: false,
                                        defaultResponse: [...setKpiTargetStore.getFrequenciesResponse]
                                    }, () => {
                                        const defaultBusinessKpi = [];
                                        const defaultOperationalKpi = [];
                                        for (let x of this.state.defaultResponse) {
                                            if (x.kpiType === "Business") {
                                                defaultBusinessKpi.push(x);
                                            }
                                            else {
                                                defaultOperationalKpi.push(x);
                                            }
                                        }
                                        this.setState({
                                            defaultBusinessKpi: [...defaultBusinessKpi],
                                            defaultOperationalKpi: [...defaultOperationalKpi]
                                        });
                                    })
                                }
                                for (let i = 0; i < operationKpiIds.length; i++) {
                                    for (let j = 0; j < operationalKpi.length; j++) {
                                        if (Number(operationKpiIds[i].kpiId) === Number(operationalKpi[j].txnId)) {
                                            operationKpiIds[i].frequency = operationalKpi[j].kpiFrequency
                                        }
                                    }
                                }
                                reviewValueDriverStore.operationKpiIds = operationKpiIds
                                this.setState({
                                    valueRender: response
                                })
                            }else if(response && response.resultCode === 'KO'){
                                this.showErrorNotification(response.errorDescription);
                            }else {
                                this.showErrorNotification('Sorry! Something went wrong');
                            }
                        })
                    if (reviewValueDriverStore.getFrequencyMessage === 'Data retrieved partially') {
                        this.showSuccessNotification('treeFetchError')
                    }
                }else if(response && response.resultCode === 'KO'){
                    this.showErrorNotification(response.errorDescription);
                }else{
                    this.showErrorNotification('Sorry!Something went wrong');
                }
            })
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

    setBusinessFrequency = (event) => {
        const bFrequency = event.target.value;
        this.setState({
            businessFrequency: bFrequency
        })
    }

    saveKPIFrequency = (event) => {
        const select = document.querySelectorAll('.frequency')
        const { businessFrequency, defaultBusinessKpi, defaultOperationalKpi } = this.state
        let frequencySet = [];
        for (let i = 0; i < select.length; ++i) {
            if (select[i].value !== 'false') {
                const frequeny = {
                    txnId: select[i].id,
                    frequency: select[i].value
                }
                frequencySet.push(frequeny)
            }
        }
        if (!businessFrequency) {
            this.showSuccessNotification('selectBFrequencyError')
        }
        if (frequencySet.length > 0 && businessFrequency) {
            const { reviewValueDriverStore } = this.props;
            this.checkIfFrequenciesChanged(defaultBusinessKpi, businessFrequency, "Business");
            this.checkIfFrequenciesChanged(defaultOperationalKpi, frequencySet, "Operational");
            reviewValueDriverStore.setKpiFrequency(frequencySet, businessFrequency)
                .then((response) => {
                    if (response && !response.error && response.resultCode === 'OK') {
                        this.getFrequencies();
                        this.showSuccessNotification('saveFrequency');
                        this.setState({
                            kpiCollectionTemplateBtn: true,
                        });
                    } else if(response && response.resultCode === 'KO'){
                        this.showErrorNotification(response.errorDescription)
                    }
                })
        } else {
            this.showSuccessNotification('selectFrequencyError')
        }
    }

    checkIfFrequenciesChanged(defaultKpi, updatedKpi, type) {
        let businessCount = 0;
        const { reviewValueDriverStore } = this.props;
        if (type === "Business") {
            for (let kpiObj of defaultKpi) {
                if (kpiObj.kpiFrequency && kpiObj.kpiFrequency !== updatedKpi && businessCount === 0) {
                    if (!window.confirm('Changing frequency will lead to loss of existing Target Values. Please confirm')) {
                        this.setState({
                            businessFrequency: kpiObj.kpiFrequency
                        });
                    }
                    businessCount++;
                }
            }
            businessCount = 0;
        }
        else {
            for (let kpiObj of defaultKpi) {
                for (let freqObj of updatedKpi) {
                    if (kpiObj.txnId === Number(freqObj.txnId)) {
                        freqObj['kpiId'] = Number(freqObj.txnId);
                        if (kpiObj.kpiFrequency && kpiObj.kpiFrequency !== freqObj.frequency) {
                            if (!window.confirm('Changing frequency will lead to loss of existing Target Values. Please confirm')) {
                                freqObj.frequency = kpiObj.kpiFrequency;
                            }
                        }
                    }
                }
            }
            reviewValueDriverStore.operationKpiIds = [...updatedKpi];
        }
    }
    exportHandler = (event) => {
        this.setState({
            visible: true,
        })
    }

    modalCloseHandler = () => {
        this.setState({
            visible: false,
        })
    }

    generateXlsHandler = (event) => {
        const { valueDriversStore } = this.props;
        valueDriversStore.generateXls();
    }

    generatePPTHandler = (event) => {
        const { valueDriversStore } = this.props;
        valueDriversStore.generatePPT();
        this.setState({
            overflowValue: 'visible'
        }, () => {
            // this.savePPT();
        })
    }

    savePPT() {
        const PptxGenJS = require('pptxgenjs');
        html2canvas(document.body, { scale: 2, y: -100 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            var pptx = new PptxGenJS();
            var slide = pptx.addNewSlide();
            slide.addImage({ data: `'${imgData}'`, sizing: { type: 'cover', w: 13.5, h: 8 } });
            pptx.save('samplePPT');
            this.modalCloseHandler();
            this.setState({
                overflowValue: 'auto'
            })
        });
    }

    generateKPITemplate = (event) => {
        const { reviewValueDriverStore } = this.props;
        reviewValueDriverStore.generateKPITemplate()
    }

    showSuccessNotification(type) {
        // eslint-disable-next-line default-case
        switch (type) {
            case 'saveFrequency':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully uploaded frequencies for KPI'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'treeFetchError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={"One or More KPI's are not having relevant Business/Operational KPI's"}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'selectFrequencyError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please select frequency for Operational KPIs'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'selectBFrequencyError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please select frequencies for Business KPIs'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;

            case 'saveFrequencyFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Frequencies not saved'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
        }

    }

    frequencyChangeHandler = (event) => {
        const kpiId = event.target.id
        const frequency = event.target.value
        const { reviewValueDriverStore } = this.props;
        const { operationKpiIds } = reviewValueDriverStore;
        for (let i = 0; i < operationKpiIds.length; i++) {
            if (Number(operationKpiIds[i].kpiId) === Number(kpiId)) {
                operationKpiIds[i].frequency = frequency
            }
        }
        let { operationalFrequencyCnt } = this.state
        this.setState({
            operationalFrequencyCnt: operationalFrequencyCnt + 1
        })
    }

    render() {
        const pname = SessionStorage.read('projectName');
        let option = SessionStorage.read('option_selected');
        const demoUser = SessionStorage.read('demoUser')
        const { reviewValueDriverStore } = this.props;
        const { businessFrequency, kpiCollectionTemplateBtn, noFrequencies, overflowValue } = this.state
        const {
            strategicObjectives,
            branchTree,
            operationKpiIds
        } = reviewValueDriverStore
        return (
            <div className={branchTree.length > 0 ? 'container-fluid my-project-body' : 'container-fluid no-project-body'}>
                <Menu />
                <div className="row" data-html2canvas-ignore={true}>
                    <div className="col-sm-6">
                        <div>
                            <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                            <img src={Polygon} height="31px" alt={JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname} width="31px" />
                        </div>
                        <div>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    {
                                        !JSON.parse(demoUser) &&
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')} >My Projects</li>
                                    }
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('projectMenu')} aria-current="page">{JSON.parse(demoUser) ? 'Demo Project' : pname}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Review Value Driver Tree</li>
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

                <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} data-html2canvas-ignore={true} />
                <div data-html2canvas-ignore={true}>
                    <ProjectNavbar activePage="review_value_driver_tree" />
                </div>

                <div className="row" data-html2canvas-ignore={true}>
                    <div className="col-sm-8 project-note">
                        Graphical representation of the selected value drivers and KPIs. To make edits go back {" "}
                        <NavLink to={routes.VALUEDRIVERS} style={{ fontWeight: '600', textDecoration: 'none', color: '#ffffff' }} >Develop Value Drivers</NavLink>
                    </div>
                    <div className="col-sm-4">
                        <button
                            type="button"
                            className="btn btn-light float-right export-button"
                            onClick={this.exportHandler}
                        >
                            EXPORT SCREEN
                        </button>
                    </div>
                </div>

                <div className="row justify-content-end" style={{ marginTop: '5%' }} data-html2canvas-ignore={true}>
                    <div className="col-sm-6">
                        {
                            <button
                                type="submit"
                                className="btn btn-light generate-kpi-button"
                                onClick={this.generateKPITemplate}
                                disabled={!kpiCollectionTemplateBtn && noFrequencies}
                            >
                                GENERATE KPI DATA COLLECTION TEMPLATE
                        </button>
                        }
                        <button
                            type="submit"
                            className="btn btn-light float-right"
                            style={{ fontWeight: 'bold' }}
                            onClick={this.saveKPIFrequency}
                            disabled={SessionStorage.read('accessType') === 'Read'}
                        >
                            SAVE KPI FREQUENCY
                        </button>
                    </div>
                </div>

                <div style={overflowValue === 'auto' ? { overflowX: 'auto', marginTop: '2%' } : { marginTop: '2%' }} id="pptVdt">
                    <div className="row rvdt-header align-self-center ">
                        <ReviewValueDriverTreeHeader />
                    </div>
                    {
                        branchTree.length > 0 ?
                            (
                                <div>
                                    <div className="row position-static">
                                        <select className="form-control" onChange={this.setBusinessFrequency} value={businessFrequency} style={{ width: '120px', marginLeft: '795px', fontSize: '15px' }}>
                                            <option value="false" disabled>Set all</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Fortnightly">Fortnightly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Half yearly">Half yearly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" style={{ height: '400px' }} id="vdt">
                                        <ValueDriverTreeNew
                                            strategicObjectives={strategicObjectives}
                                            branchTree={branchTree}
                                            frequencyChangeHandler={this.frequencyChangeHandler}
                                            operationKpiIds={operationKpiIds}
                                        />
                                    </div>
                                </div>
                            ) :
                            <div className="row justify-content-center" style={{ height: '50px' }}>
                                <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4>
                            </div>
                    }
                </div>
                <div data-html2canvas-ignore={true}>
                    <ExportModal
                        visible={this.state.visible}
                        generateXlsHandler={this.generateXlsHandler}
                        generatePPTHandler={this.generatePPTHandler}
                        modalCloseHandler={this.modalCloseHandler}
                    />
                </div>
            </div>
        );
    }
}

export default withRouter(ReviewValueDriverTree);

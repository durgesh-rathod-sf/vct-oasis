import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { withRouter } from "react-router-dom";
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
// import routes from '../../constants/routes';
import Menu from '../../components/Menu/Menu';
import Polygon from '../../assets/project_card_icon.svg';

import ManuallyExportModel from '../../components/ManuallyExportModel/ManuallyExportModel';
import ManuallySearchKpis from '.././ManuallySearchKpis/ManuallySearchKpis';
import ManuallyAddKpis from '.././ManuallyAddKpis/ManuallyAddKpis';
import SelectedKpitable from '../SelectedKpiTable/SlectedKpiTable';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import './ManuallySelectKpis.css';
var SessionStorage = require('store/storages/sessionStorage');
// import VDTTable from '../../components/Table/VDTTable';

@inject('manuallySearchKpisStore')
@observer
class ManuallySelectKpis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isdisplay: false,
            addKpisVisible: false,
            tableData: [],
            visible: false,
            priority: 'high',
            isDisplayManuallySearchKpis: false,
            changeKpiType: false,
            callEditApi: false,
            onEditKpi: false
        }
        this.manuallySearchKpisHandler = this.manuallySearchKpisHandler.bind(this);
        this.manuallyAddKpisHandler = this.manuallyAddKpisHandler.bind(this);
        this.exportHandler = this.exportHandler.bind(this);
        this.generateSelectedTable = this.generateSelectedTable.bind(this);
        this.addkpiToVDTHandler = this.addkpiToVDTHandler.bind(this);
        this.displayManuallySearchKpis = this.displayManuallySearchKpis.bind(this);
        this.deleteVDTHandler = this.deleteVDTHandler.bind(this);

    }

    manuallySearchKpisHandler(event) {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedKpis = []
        this.setState({
            tableData: [],
            isdisplay: true,
            addKpisVisible: false,
        })
    }

    manuallyAddKpisHandler(event) {
        this.setState({ addKpisVisible: true, isdisplay: false, onEditKpi: false })
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
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.generateXls();
    }

    generatePPTHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.generatePPT();
    }
    generateSelectedTable = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.generateSelectedTable();

    }
    addkpiToVDTHandler() {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.addKpiToVDT()
            .then((response) => {
                if (response.error) {
                    return {
                        error: true
                    }
                } else {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.showSuccessNotification();
                        window.location.reload();

                    }
                }

            })

    }

    deleteVDTHandler() {
        const { manuallySearchKpisStore } = this.props;
        if (window.confirm("are you sure you wanted to deleted selected kpi(s)")) {

            manuallySearchKpisStore.deleteVDT()
                .then((response) => {
                    if (response.error) {
                        return {
                            error: true
                        }
                    } else {
                        const { data } = response;
                        if (data.resultCode === 'OK') {
                            this.showDeleteNotification();
                            window.location.reload();

                        }
                    }

                })

        }




    }
    selectVDTHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        const { selectedVDT } = manuallySearchKpisStore;
        const { priority } = this.state;
        const tableData = manuallySearchKpisStore.selectedKpis
        const kpiDataLength = tableData.length;
        const target = event.target;
        const targetId = target.id.split('_')
        if (target.checked) {
            for (let i = 0; i < kpiDataLength; i++) {
                if (Number(tableData[i].kpiId) === Number(targetId[1])) {
                    // const check = priority === 'high' ? (valueDriversStore.highKpiDetails[i].selected = true) 
                    // : (valueDriversStore.lowKpiDetails[i].selected = true)                    
                    const selectedKPI = {
                        kpiId: tableData[i].kpiId,
                        subIndustry: tableData[i].subIndustry,
                        functionalArea: tableData[i].functionalArea,
                        projectScenario: tableData[i].projectScenario,
                        priority: priority,
                        strategicObjective: tableData[i].strategicObjective,
                        financialLever: tableData[i].financialLever,
                        businessObjective: tableData[i].businessObjective,
                        valueDriver: tableData[i].valueDriver,
                        kpiName: tableData[i].kpiName,
                        kpiUnit: tableData[i].kpiUnit,
                        expectedKpiTrend: tableData[i].expectedKpiTrend,
                        kpiType: tableData[i].kpiType,
                        category: tableData[i].category,
                        kpiDescription: tableData[i].kpiDescription,
                        kpiFormula: tableData[i].kpiFormula,
                        dataInputUnit: tableData[i].dataInputUnit,
                        selected: true,
                    }
                    manuallySearchKpisStore.selectedVDT.push(selectedKPI)
                }
            }
        } else {
            for (let i = 0; i < selectedVDT.length; i++) {
                if (Number(selectedVDT[i].kpiId) === Number(targetId[1])) {
                    // const check = priority === 'high' ? (manuallySearchKpisStore.highKpiDetails[i].selected = false) :(manuallySearchKpisStore.lowKpiDetails[i].selected === false)                 
                    selectedVDT.splice(i, 1)
                    manuallySearchKpisStore.selectedVDT = selectedVDT
                    i--;
                }
                else if (selectedVDT[i].selected === false) {
                    selectedVDT.splice(i, 1)
                    manuallySearchKpisStore.selectedVDT = selectedVDT
                }
            }
        }
    }

    showSuccessNotification() {
        toast.info(<NotificationMessage
            title="Success"
            bodytext={'Successfully saved data'}
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showDeleteNotification() {
        toast.info(<NotificationMessage
            title="Success"
            bodytext={'Deleted Successfully'}
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    componentDidMount() {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedVDT = []
        this.generateSelectedTable();
        this.setState({
            isDisplayManuallySearchKpis: true
        })
    }
    componentWillUnmount() {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.strategicName = '';
        manuallySearchKpisStore.financialName = '';
        manuallySearchKpisStore.businessName = '';
        manuallySearchKpisStore.valueDriversName = '';
        manuallySearchKpisStore.kpiName = '';
        manuallySearchKpisStore.kpiUnitName = '';
        manuallySearchKpisStore.kpiCategoryName = '';
        manuallySearchKpisStore.kpiDescriptionName = '';
        manuallySearchKpisStore.kpiTrendName = '';
        manuallySearchKpisStore.kpiTypeName = '';
        manuallySearchKpisStore.kpiFormulaName = '';
        manuallySearchKpisStore.dataInputUnit = '';
        this.setState({
            callEditApi: false
        })
    }

    displayManuallySearchKpis() {
        this.setState({
            isDisplayManuallySearchKpis: true

        })
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'projectMenu':
                history.push('/project');
                break;
            case 'myproject':
                history.push('my-projects');
                break;
        }
    }

    changeKpiTypeHandler = (event) => {
        if (!this.state.changeKpiType) {
            this.setState({
                changeKpiType: false
            })
        }
    }

    editKpiHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.kpiId = event.kpiId;
        manuallySearchKpisStore.businessName = event.businessObjective;
        manuallySearchKpisStore.strategicName = event.strategicObjective;
        manuallySearchKpisStore.financialName = event.financialLever;
        manuallySearchKpisStore.valueDriversName = event.valueDriver;
        manuallySearchKpisStore.kpiName = event.kpiName;
        manuallySearchKpisStore.kpiUnitName = event.kpiUnit;
        manuallySearchKpisStore.kpiCategoryName = event.category;
        manuallySearchKpisStore.kpiDescriptionName = event.kpiDescription;
        manuallySearchKpisStore.kpiTrendName = event.expectedKpiTrend;
        manuallySearchKpisStore.kpiTypeName = event.kpiType;
        manuallySearchKpisStore.kpiFormulaName = event.kpiFormula;
        manuallySearchKpisStore.dataInputUnit = event.dataInputUnit;
        // manuallySearchKpisStore.=event.businessObjective;
        this.setState({ addKpisVisible: true, isdisplay: false, callEditApi: true, onEditKpi: true })
    }



    cancelVDTHandler = (event) => {
        if (window.confirm("are you sure you want to cancel")) {
            event.preventDefault();
            window.location.reload();
        }
    }

    render() {
        const { manuallySearchKpisStore } = this.props;
        const { addKpisVisible } = this.state;
        const { selectedKpis, kpiDetails } = manuallySearchKpisStore;
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected');
        return (
            //  <div >
            <div className={selectedKpis.length > 0 || kpiDetails.length > 0 ? 'container-fluid my-project-body' : 'container-fluid no-project-body'}>
                <Menu />
                <div className="row">
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
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('projectMenu')} aria-current="page">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Manually Select KPIs</li>
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
                <ProjectNavbar activePage="manually_select_kpi" />

                <div className="row">
                    <div className="col-sm-6">
                        <div className="col-sm-6" style={{ fontSize: '0.8rem', paddingBottom: '20px', color: '#ffffff' }}>
                            Select the filters to find KPIs
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <button
                            type="submit"
                            className="btn btn-light float-right"
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '200px',
                                backgroundColor: 'transparent',
                                color: '#ffffff'
                            }}
                            onClick={this.exportHandler}
                        >
                            EXPORT SCREEN
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <button
                            className="btn btn-light"
                            style={{ fontWeight: '600', width: '350px' }}
                            onClick={this.manuallySearchKpisHandler}
                        >MANUALLY SEARCH KPIS</button>
                        <button
                            className="btn btn-light"
                            style={{ fontWeight: '600', width: '350px', marginLeft: '25px' }}
                            onClick={this.manuallyAddKpisHandler}>MANUALLY ADD KPIS</button>
                    </div>
                </div>
                <div className="col-sm-12" style={{ fontSize: '0.8rem', paddingTop: '24px', paddingBottom: '12px', color: '#ffffff' }}>"Note: Every Operational KPI selected should have a related Business KPI selected as well. The strategic objective, business objective and financial objective is same for the Operational KPI and its related Business KPI"</div>
                {this.state.isdisplay &&
                    <ManuallySearchKpis
                        displayManuallySearchKpis={this.displayManuallySearchKpis}
                        changeKpiTypeHandler={this.changeKpiTypeHandler}
                        cancelVDTHandler={this.cancelVDTHandler}
                    />}
                {
                    addKpisVisible && <ManuallyAddKpis
                        changeKpiTypeHandler={this.changeKpiTypeHandler}
                        callEditApi={this.state.callEditApi}
                        cancelKpiHandler={this.cancelKpiHandler}
                        onEditKpi={this.state.onEditKpi}
                    />
                }
                {
                    !this.state.isdisplay && !addKpisVisible && this.state.isDisplayManuallySearchKpis &&
                    <SelectedKpitable
                        selectedKpis={selectedKpis}
                        selectVDTHandler={this.selectVDTHandler}
                        addkpiToVDTHandler={this.addkpiToVDTHandler}
                        changeKpiTypeHandler={this.changeKpiTypeHandler}
                        editKpiHandler={this.editKpiHandler}
                        deleteVDTHandler={this.deleteVDTHandler}


                    />
                }

                <ManuallyExportModel
                    visible={this.state.visible}
                    generateXlsHandler={this.generateXlsHandler}
                    generatePPTHandler={this.generatePPTHandler}
                    modalCloseHandler={this.modalCloseHandler}
                />

            </div>
        )
    }
}

export default withRouter(ManuallySelectKpis);
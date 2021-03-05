import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { withRouter } from "react-router-dom";
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import '../ManuallySelectKpis/ManuallySelectKpis.css';

import ManuallySearchKpiTable from '../../components/Table/ManuallySearchKpiTable';


@inject('manuallySearchKpisStore', 'valueDriversStore')
@observer
class ManuallySearchKpis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedStrategicObjective: '',
            financialObjective: '',
            businessObjective: '',
            valueDriverObjective: '',
            projectScenario: false,
            displayManuallySearchKpis: false,
            tableData: []
        }
        this.strategicClickHandler = this.strategicClickHandler.bind(this);
        this.financialClickHandler = this.financialClickHandler.bind(this);
        this.businessClickHandler = this.businessClickHandler.bind(this);
        this.valueDriverClickHandler = this.valueDriverClickHandler.bind(this);
        this.searchKpisHandler = this.searchKpisHandler.bind(this);
        this.saveVDTHandler = this.saveVDTHandler.bind(this);
        this.addkpiToVDTHandler = this.addkpiToVDTHandler.bind(this)

    }

    componentDidMount() {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.getStrategicObjectives();
        manuallySearchKpisStore.getFinancialObjectives();
        manuallySearchKpisStore.getBusinessObjectives();
        manuallySearchKpisStore.getValueDriverObjectives();
        //  manuallySearchKpisStore.searchKpis();

    }
    priorityHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        const targetId = event.target.id;
        // eslint-disable-next-line default-case
        switch (targetId) {
            case 'high':
                this.setState({
                    priority: targetId,
                    highKpiDetails: true,
                    lowKpiDetails: false,
                    selectedFlag: false,
                    tableData: manuallySearchKpisStore.highKpiDetails
                });
                break;
            case 'low':
                if (manuallySearchKpisStore.lowKpiDetails.length === 0) {
                    manuallySearchKpisStore.generateKPI('low')
                        .then((response) => {
                            if (response.error) {
                                return {
                                    error: true
                                }
                            } else {
                                this.setState({
                                    priority: targetId,
                                    highKpiDetails: false,
                                    lowKpiDetails: true,
                                    selectedFlag: false,
                                    tableData: manuallySearchKpisStore.lowKpiDetails
                                });
                            }

                        })
                } else {
                    this.setState({
                        priority: targetId,
                        highKpiDetails: false,
                        lowKpiDetails: true,
                        selectedFlag: false,
                        tableData: manuallySearchKpisStore.lowKpiDetails
                    });
                }
                break;
            case 'selected':
                this.sortVDTData();
                this.setState({
                    priority: event.target.id,
                    highKpiDetails: false,
                    lowKpiDetails: false,
                    selectedFlag: true,
                });
                break;
        }
    }

    sortVDTData() {
        const { manuallySearchKpisStore } = this.props;
        const { selectedKpis } = manuallySearchKpisStore;
        let highPriorityRecords = []
        let lowPriorityRecords = []
        for (let i = 0; i < selectedKpis.length; i++) {
            selectedKpis[i].priority === 'high' ?
                highPriorityRecords.push(selectedKpis[i])
                : lowPriorityRecords.push(selectedKpis[i]);
        }
        const mergedArray = highPriorityRecords.concat(lowPriorityRecords)
        manuallySearchKpisStore.selectedKpis = mergedArray;
        this.setState({
            tableData: mergedArray
        })

    }
    saveVDTHandler() {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.saveVDT()
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

    addkpiToVDTHandler() {
        // event.preventDefault();
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
                        this.props.displayManuallySearchKpis();
                        window.location.reload();
                        // history.push('/manually-select-kpis')
                    }
                }

            })
    }
    showSuccessNotification() {
        toast.info(<NotificationMessage
            title="Success"
            bodytext={'Successfully saved data'}
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }
    strategicClickHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedStrategicObjective = event.target.value;
        // testing
        manuallySearchKpisStore.selectedFinancialObjective = "";
        manuallySearchKpisStore.selectedBusinessObjective = "";
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        //testing
        manuallySearchKpisStore.getFinancialObjectives();
        this.setState({
            selectedStrategicObjective: event.target.value,
            financialObjective: '',
            businessObjective: '',
            valueDriverObjective: '',
            projectScenario: true
        })
    }

    financialClickHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedFinancialObjective = event.target.value;
        // testing
        manuallySearchKpisStore.selectedBusinessObjective = "";
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        //testing

        manuallySearchKpisStore.getBusinessObjectives();
        this.setState({
            financialObjective: event.target.value,
            businessObjective: '',
            valueDriverObjective: '',
            projectScenario: true

        })
    }

    businessClickHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedBusinessObjective = event.target.value;
        // testing
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        // testing
        manuallySearchKpisStore.getValueDriverObjectives();
        this.setState({
            businessObjective: event.target.value,
            valueDriverObjective: '',
            projectScenario: true

        })
    }

    valueDriverClickHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.selectedValueDriverObjective = event.target.value;
        this.setState({
            valueDriverObjective: event.target.value,
            projectScenario: true
        })

    }

    async searchKpisHandler() {
        const { manuallySearchKpisStore } = this.props;
        await manuallySearchKpisStore.searchKpis();

        this.setState({
            // highKpiDetails: true,
            // generateKPI: false,
            tableData: manuallySearchKpisStore.kpiDetails
        })
    }

    selectVDTHandler = (event) => {
        const { manuallySearchKpisStore } = this.props;
        const { selectedVDT } = manuallySearchKpisStore;
        const { priority, tableData } = this.state;
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
                        subIndustry: manuallySearchKpisStore.selectedIndustry,
                        functionalArea: manuallySearchKpisStore.selectedFunctionalArea,
                        projectScenario: manuallySearchKpisStore.selectedScenario,
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
                if (Number(tableData[i].kpiId) === Number(targetId[1])) {
                    // const check = priority === 'high' ? (manuallySearchKpisStore.highKpiDetails[i].selected = false) :(manuallySearchKpisStore.lowKpiDetails[i].selected === false)                 
                    selectedVDT.splice(i, 1)
                    manuallySearchKpisStore.selectedVDT = selectedVDT
                }
            }
        }
    }
    render() {
        const { manuallySearchKpisStore } = this.props;
        const { strategicObjective, financialLever, businessObjective, valueDriver } = manuallySearchKpisStore
        const { tableData } = this.state
        return (
            <div className={tableData.length > 0 ? 'container-fluid my-project-body' : ''}>
                {/* <div className='container-fluid no-project-body'>  */}
                <div className="row" style={{ marginTop: '20px' }}>
                    <div className="col-sm-3">
                        <p style={{ color: '#ffffff' }}>Strategic Objective</p>
                        <select className="form-control" value={this.state.selectedStrategicObjective} onChange={this.strategicClickHandler}>
                            <option value="" selected>Select Strategic Objective</option>
                            {strategicObjective && strategicObjective.map((strategic, index) => (
                                <option key={Math.random()} value={strategic}>{strategic}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-sm-3">
                        <p style={{ color: '#ffffff' }}>Financial Objective</p>
                        <select value={this.state.financialObjective} onChange={this.financialClickHandler} className="form-control">
                            <option value="" selected>Select Financial Objective</option>
                            {financialLever && financialLever.map((financial, index) => (
                                <option key={Math.random()} value={financial}>{financial}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-sm-3">
                        <p style={{ color: '#ffffff' }}>Business Objective</p>
                        <select value={this.state.businessObjective} onChange={this.businessClickHandler} className="form-control">
                            <option value="" selected>Select Business Objective</option>
                            {businessObjective && businessObjective.map((business, index) => (
                                <option key={Math.random()} value={business}>{business}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-sm-3">
                        <p style={{ color: '#ffffff' }}>Value Driver</p>
                        <select value={this.state.valueDriverObjective} onChange={this.valueDriverClickHandler} className="form-control">
                            <option value="" selected>Select Value Driver</option>
                            {valueDriver && valueDriver.map((valuedriver, index) => (
                                <option key={Math.random()} value={valuedriver}>{valuedriver}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row" style={{ marginTop: '3%' }}>
                    <div className="col-sm-12">
                        <button
                            type="submit"
                            className="btn btn-light float-right"
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '200px'
                            }}
                            disabled={this.state.projectScenario ? false : true}
                            onClick={this.searchKpisHandler}
                        >
                            SEARCH KPIS
                                {this.state.searchKPI &&
                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff' }}></i>}
                        </button>
                    </div>
                    <div className="row" style={{ paddingTop: '3%' }}>
                        {tableData.length > 0 && <ManuallySearchKpiTable
                            tableData={this.state.tableData}
                            priorityHandler={this.priorityHandler}
                            priority={this.priority}
                            selectVDTHandler={this.selectVDTHandler}
                            displayManuallySearchKpis={this.props.displayManuallySearchKpis}
                            // selectedKpiIds={selectedKpiIds}
                            addkpiToVDTHandler={this.addkpiToVDTHandler}
                            changeKpiTypeHandler={this.props.changeKpiTypeHandler}
                            cancelVDTHandler={this.props.cancelVDTHandler}
                        />}
                    </div>
                </div>

            </div>
        )
    }

}

export default withRouter(ManuallySearchKpis);
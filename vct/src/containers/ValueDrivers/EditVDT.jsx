import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
// import ManuallyAddKpisInput from '../../components/ManuallyAddKpisInput/ManuallyAddKpisInput';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import "react-datepicker/dist/react-datepicker.css";
import '../MyProjects/MyProjects.css';
import ReactTooltip from 'react-tooltip'
var SessionStorage = require('store/storages/sessionStorage');

@inject('myProjectStore', 'saveVDTStore')
@observer
class EditVDT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectUsers: [],
            tableData: [],
            kpiDetails: {},
            strategicObjective: props.saveVDTStore.strategicObjective,
            financialObjective: props.saveVDTStore.financialObjective,
            businessObjective: props.saveVDTStore.businessObjective,
            cmt_growth_pillar: props.saveVDTStore.cmt_growth_pillar,
            solution_type: props.saveVDTStore.solution_type,
            cmt_sub_industry: props.saveVDTStore.cmt_sub_industry,
            kpiId: props.saveVDTStore.kpiId,
            valueDriver: props.saveVDTStore.valueDriver,
            OperationalKpi: props.saveVDTStore.OperationalKpi,
            OperationalKpiDescription: props.saveVDTStore.OperationalKpiDescription,
            operationalKpiFormula: props.saveVDTStore.operationalKpiFormula,
            operationalKpiUnit: props.saveVDTStore.operationalKpiUnit,
            operationalKpitrend: props.saveVDTStore.operationalKpitrend,
            kpiCalculationType: props.saveVDTStore.kpiCalculationType,
            onEditKpi: props.onEditKpi
        }
        this.addUserHandler = this.addUserHandler.bind(this);
        this.deleteUserHandler = this.deleteUserHandler.bind(this);
        this.onUserEmailChangeHandler = this.onUserEmailChangeHandler.bind(this);
        this.onUserAccessChangeHandler = this.onUserAccessChangeHandler.bind(this);
        this.onChangeFormFieldHandler = this.onChangeFormFieldHandler.bind(this);
        this.updateUserHandler = this.updateUserHandler.bind(this);
        this.saveVDTHandler = this.saveVDTHandler.bind(this);
        this.cancelVDTHandler = this.cancelVDTHandler.bind(this);
    }

    componentDidMount() {

    }

    handleChange = (value) => {
        this.setState({
            dateValue: value,
        });

        const { myProjectStore } = this.props;
        myProjectStore.startDate = this.state.dateValue;
    }

    addUserHandler = (event) => {
        event.preventDefault();
        const { projectUsers } = this.state;
        if (projectUsers.length === 0) {
            const userDetail = {
                'email_user0': '',
                'access_user0': '',
                'delete_index': 0,
            }
            projectUsers.push(userDetail)
            this.setState({
                projectUsers: projectUsers
            })
        } else {
            const lastIndex = projectUsers.length
            const userDetail = {
                ['email_user' + lastIndex]: '',
                ['access_user' + lastIndex]: '',
                'delete_index': lastIndex,
            }
            projectUsers.push(userDetail)
            this.setState({
                projectUsers: projectUsers
            })
        }
    }

    onChangeFormFieldHandler = (event) => {

        const { saveVDTStore } = this.props;
        const tempKpiDetails = {
            strategicObjective: saveVDTStore.strategicObjective,
            financialObjective: saveVDTStore.financialObjective,
            businessObjective: saveVDTStore.businessObjective,
            cmt_growth_pillar: saveVDTStore.cmtGrowthPillar,
            solution_type: saveVDTStore.solutionType,
            cmt_sub_industry: saveVDTStore.cmtSubIndustry,
            kpiId: saveVDTStore.kpiId,
            valueDriver: saveVDTStore.valueDriver,
            OperationalKpi: saveVDTStore.OperationalKpi,
            OperationalKpiDescription: saveVDTStore.OperationalKpiDescription,
            operationalKpiFormula: saveVDTStore.operationalKpiFormula,
            operationalKpiUnit: saveVDTStore.operationalKpiUnit,
            operationalKpitrend: saveVDTStore.operationalKpitrend,
            kpiCalculationType: saveVDTStore.kpiCalculationType

        }
        // eslint-disable-next-line default-case
        switch (event.target.id) {

            case 'strategicInput':
                tempKpiDetails.strategicObjective = event.target.value;
                this.setState({
                    strategicObjective: event.target.value,
                })
                break;
            case 'financialInput':

                tempKpiDetails.financialObjective = event.target.value;
                this.setState({
                    financialObjective: event.target.value
                })
                break;
            case 'businessInput':
                tempKpiDetails.businessObjective = event.target.value;
                this.setState({
                    businessObjective: event.target.value
                })
                break;
            case 'valueDriversInput':

                tempKpiDetails.valueDriver = event.target.value;
                this.setState({
                    valueDriver: event.target.value
                })

                break;
            case 'kpiNameInput':

                tempKpiDetails.OperationalKpi = event.target.value;
                this.setState({
                    OperationalKpi: event.target.value
                })

                break;
            case 'kpiUnitInput':

                tempKpiDetails.operationalKpiUnit = event.target.value;
                this.setState({
                    operationalKpiUnit: event.target.value
                })

                break;
            // case 'kpiCategoryInput':

            //     tempKpiDetails.kpiCategoryName = event.target.value;
            //     this.setState({
            //         kpiCategoryName: event.target.value
            //     })

            //     break;
            case 'kpiDescriptionInput':

                tempKpiDetails.OperationalKpiDescription = event.target.value;
                this.setState({
                    OperationalKpiDescription: event.target.value
                })

                break;
            case 'kpiTrendInput':

                tempKpiDetails.operationalKpitrend = event.target.value;
                this.setState({
                    operationalKpitrend: event.target.value
                })

                break;

            case 'kpi_calculation_type':

                tempKpiDetails.kpiCalculationType = event.target.value;
                this.setState({
                    kpiCalculationType: event.target.value
                })

                break;
            // case 'kpiTypeInput':

            //     tempKpiDetails.kpiTypeName = event.target.value;
            //     this.setState({
            //         kpiTypeName: event.target.value
            //     })
            //     if (tempKpiDetails.kpiTypeName === "Business") {
            //         this.setState({
            //             valueDriversName: '-'
            //         })
            //     }
            //     else {
            //         this.setState({
            //             valueDriversName: ''
            //         })
            //     }
            //     break;
            case 'kpiFormulaInput':

                tempKpiDetails.operationalKpiFormula = event.target.value;
                this.setState({
                    operationalKpiFormula: event.target.value
                })

                break;
            // case 'dataInputUnit':

            //     tempKpiDetails.dataInputUnit = event.target.value;
            //     this.setState({
            //         dataInputUnit: event.target.value
            //     })

            //     break;
        }
        // manuallySearchKpisStore.setKpiDetails(tempKpiDetails);
        this.setState({
            kpiDetails: tempKpiDetails
        })
    }

    deleteUserHandler = (event) => {
        event.preventDefault();
        const targetId = event.target.id.split("_");
        const { projectUsers } = this.state;
        for (let i = 0; i < projectUsers.length; i++) {
            if (Number(targetId[1]) === projectUsers[i]['delete_index']) {
                projectUsers.splice(i, 1)
                this.setState({
                    projectUsers: projectUsers
                })
            }
        }
    }

    onUserEmailChangeHandler = (event) => {
        event.preventDefault();
        const { projectUsers } = this.state;
        const targetId = event.target.id;
        const targetValue = event.target.value;
        for (let i = 0; i < projectUsers.length; i++) {
            if (projectUsers[i].targetId === '' || projectUsers[i].targetId !== '') {
                projectUsers[i][targetId] = targetValue
                this.setState({
                    projectUsers: projectUsers
                })
            }
        }
    }

    onUserAccessChangeHandler = (event) => {
        event.preventDefault();
        const { manuallySearchKpisStore } = this.props;
        const { projectUsers } = this.state;
        const targetId = event.target.id;
        const targetValue = event.target.value;
        for (let i = 0; i < projectUsers.length; i++) {
            if (projectUsers[i][targetId] === '' || projectUsers[i][targetId] !== '') {
                projectUsers[i][targetId] = targetValue
                this.setState({
                    projectUsers: projectUsers
                })
            }
        }
        manuallySearchKpisStore.projectUsers = this.state.projectUsers
    }

    updateUserHandler = (event) => {
        event.preventDefault();
        const { projectUsers } = this.state;
        const { myProjectStore } = this.props;
        myProjectStore.updateUsers(projectUsers);
        this.showUserNotification();

    }

    saveVDTHandler = (event) => {
        event.preventDefault();
        const { saveVDTStore } = this.props;
        console.log(this.state);
        saveVDTStore.setNewKpiDetails(this.state);

        if (this.validatefields()) {
            // if (this.props.callEditApi) {
            saveVDTStore.updateVDT()
                .then((response) => {
                    if (!response.error) {
                        const { data } = response;
                        if (data.resultCode === 'OK') {
                            this.props.getVDTlist()
                            this.showSuccessNotification();
                            // window.location.reload();
                            saveVDTStore.isEditCalled = false;
                        }else if(data.resultCode === 'KO') {
                            this.props.getVDTlist()
                            this.showErrorNotification(data.errorDescription);
                            // window.location.reload();
                            saveVDTStore.isEditCalled = false;
                        }else {
                            this.props.getVDTlist()
                            this.showErrorNotification(data.message);
                            // window.location.reload();
                            saveVDTStore.isEditCalled = false;
                        }
                    }
                })

        }
        else {
            alert("please enter all mandatory fields")
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
    showErrorNotification(msg) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={msg}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    validatefields() {


        if ((this.state.strategicObjective !== "" && this.state.strategicObjective !== undefined) &&
            (this.state.financialObjective !== "" && this.state.financialObjective !== undefined) &&
            (this.state.businessObjective !== "" && this.state.businessObjective !== undefined) &&
            (this.state.valueDriver !== "" && this.state.valueDriver !== undefined) &&
            (this.state.OperationalKpi !== "" && this.state.OperationalKpi !== undefined) &&
            (this.state.operationalKpiUnit !== "" && this.state.operationalKpiUnit !== undefined) &&
            (this.state.OperationalKpiDescription !== "" && this.state.OperationalKpiDescription !== undefined) &&
            (this.state.operationalKpitrend !== "" && this.state.operationalKpitrend !== undefined)) {


            return true;
        }
        return false;
    }

    // validateValueDrivers() {
    //     if (this.state.kpiTypeName === 'Operational') {
    //         return this.state.valueDriversName !== "" && this.state.valueDriversName !== undefined;
    //     }
    //     return true;
    // }
    cancelVDTHandler = (event) => {
        const { saveVDTStore } = this.props;
        event.preventDefault();
        if (window.confirm("are you sure you want to cancel")) {
            event.preventDefault();
            // window.location.reload();
            saveVDTStore.isEditCalled = false;
        }
    }

    render() {
        const {
            strategicObjective,
            financialObjective,
            businessObjective,
            // cmt_growth_pilla,
            // solution_type,
            // cmt_sub_industry,
            valueDriver,
            OperationalKpi,
            OperationalKpiDescription,
            operationalKpiFormula,
            operationalKpiUnit,
            operationalKpitrend,
            kpiCalculationType,

        } = this.state;

        console.log(this.props.saveVDTStore);
        console.log(this.state);
        const getTooltipData = () => {
            return `Please enter Formula in below format without spaces <br />
             Ex: {(Operand1)*(Operand2)}/{(Operand3)+(Operand4)}`;
        }

        return (
            <div className="container-fluid my-project-body">
                {/* <div> */}
                <form onSubmit={this.saveVDTHandler}>
                    <div className="row">
                        <div className="col-sm-6">

                            <div className="col form-group required">
                                <label htmlFor="strategicInput" className="control-label">Strategic Objectives </label>
                                <input type="text"
                                    className="form-control"
                                    id="strategicInput"
                                    value={strategicObjective}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="financialInput" className="control-label">Financial Objectives </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="financialInput"
                                    value={financialObjective}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="businessInput" className="control-label">Business Objectives </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="businessInput"

                                    value={businessObjective}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className={"col form-group required"}>
                                <label htmlFor="valueDriversInput" className="control-label">Value Drivers</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="valueDriversInput"
                                    value={valueDriver}
                                    onChange={this.onChangeFormFieldHandler}
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiNameInput" className="control-label">KPI Name </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiNameInput"

                                    value={OperationalKpi}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>



                        </div>
                        <div className="col-sm-6">
                            <div className="col form-group required">
                                <label htmlFor="kpiUnitInput" className="control-label">KPI Unit </label>
                                <select
                                    // class="mdb-select md-form" multiple
                                    type="text"
                                    className="form-control"
                                    id="kpiUnitInput"
                                    value={operationalKpiUnit}
                                    onChange={this.onChangeFormFieldHandler}
                                    required

                                >
                                    <option value="" selected disabled>Select KPI Unit</option>
                                    <option value="#/$">#/$</option>
                                    <option value="%">%</option>
                                    <option value="#">#</option>
                                    <option value="$">$</option>


                                </select>

                            </div>
                            {/* <div className="col form-group required">
                                <label htmlFor="kpiCategoryInput" className="control-label">KPI Category </label>
                                <input type="text"
                                    className="form-control"
                                    id="kpiCategoryInput"

                                    value={kpiCategoryName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div> */}
                            <div className="col form-group required">
                                <label htmlFor="kpiDescriptionInput" className="control-label">KPI Description </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiDescriptionInput"

                                    value={OperationalKpiDescription}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiTrendInput" className="control-label" >Expected KPI trend </label>
                                {/* <input
                                    type="text"
                                    className="form-control"
                                    id="kpiTrendInput"

                                    value={operationalKpitrend}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                /> */}
                                <select
                                    // class="mdb-select md-form" multiple
                                    type="text"
                                    className="form-control"
                                    id="kpiTrendInput"
                                    value={operationalKpitrend}
                                    onChange={this.onChangeFormFieldHandler}
                                    required

                                >
                                    {/* <option value="" selected disabled>Select KPI Trend</option> */}
                                    <option value="Increase">Increase</option>
                                    <option value="Decrease">Decrease</option>
                                </select>
                            </div>
                            {/* <div className="col form-group required">
                                <label htmlFor="kpiTypeInput" className="control-label">KPI Type </label>
                                <select
                                    // class="mdb-select md-form" multiple
                                    type="text"
                                    className="form-control"
                                    id="kpiTypeInput"
                                    value={kpiTypeName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required

                                >
                                    <option value="" selected disabled>Select KPI Type</option>
                                    <option value="Business">Business</option>
                                    <option value="Operational">Operational</option>


                                </select>
                            </div> */}
                            <div className="col form-group required"
                            >
                                <label data-tip={getTooltipData()} htmlFor="kpiFormulaInput" className="control-label">KPI Formula </label>
                                <ReactTooltip type="light" html={true} />
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiFormulaInput"
                                    value={operationalKpiFormula}
                                    // onChange={this.onChangeFormFieldHandler}
                                    required
                                    style={{ pointerEvents: this.props.callEditApi ? 'none' : '' }}
                                    disabled={this.state.onEditKpi}
                                    placeholder="Ex: {(Operand1)*(Operand2)}/{(Operand3)+(Operand4)}"
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpi_calculation_type" className="control-label">Target Calculation Type</label>
                                <select
                                    // class="mdb-select md-form" multiple
                                    type="text"
                                    className="form-control"
                                    id="kpi_calculation_type"
                                    value={kpiCalculationType}
                                    onChange={this.onChangeFormFieldHandler}
                                    required

                                >
                                    <option value="" selected disabled>Select Target Calculation Type</option>
                                    <option value="Absolute Value">Absolute Value</option>
                                    <option value="Relative Improvement">Relative Improvement</option>
                                    <option value="Absolute Improvement">Absolute Improvement</option>



                                </select>

                            </div>

                            {/* <div className="col form-group required">
                                <label htmlFor="dataInput" className="control-label">Data Input Unit </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="dataInputUnit"
                                    value={dataInputUnit}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                    style={{ pointerEvents: this.props.callEditApi ? 'none' : '' }}
                                    disabled={this.state.onEditKpi}
                                />
                            </div> */}
                            <div className="col-sm-6" >
                                {/* <ManuallyAddKpisInput
                                    projectUsers={projectUsers}
                                    addUserHandler={this.addUserHandler}
                                    deleteUserHandler={this.deleteUserHandler}
                                    onUserEmailChangeHandler={this.onUserEmailChangeHandler}
                                    onUserAccessChangeHandler={this.onUserAccessChangeHandler}
                                    saveVDTHandler={this.saveVDTHandler}
                                    callEditApi={this.props.callEditApi}
                                    cancelVDTHandler={this.cancelVDTHandler}
                                /> */}
                                <div className="container" style={{ paddingLeft: '0px' }}>
                                    <div className="col-sm-12" style={{ paddingTop: '2%' }}>
                                        <button
                                            className="btn btn-light float-right"
                                            onClick={this.saveVDTHandler} style={{ fontWeight: '600' }}
                                            // disabled={SessionStorage.read('accessType') === 'Read'}
                                            disabled={SessionStorage.read("demoUser") === "true" ? true : false}
                                        >
                                            Save
                    </button>
                                        <button
                                            className="btn btn-light float-right"
                                            onClick={this.cancelVDTHandler} style={{ marginLeft: '2%', marginRight: '2%', fontWeight: '600' }}

                                        >
                                            Cancel
                </button>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </form>

            </div>
        );
    }
}

export default withRouter(EditVDT)
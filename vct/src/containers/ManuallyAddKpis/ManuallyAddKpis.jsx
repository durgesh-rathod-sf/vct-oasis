import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ManuallyAddKpisInput from '../../components/ManuallyAddKpisInput/ManuallyAddKpisInput';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import "react-datepicker/dist/react-datepicker.css";
import '../MyProjects/MyProjects.css';
import ReactTooltip from 'react-tooltip'

@inject('myProjectStore', 'manuallySearchKpisStore')
@observer
class ManuallyAddKpis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectUsers: [],
            tableData: [],
            kpiDetails: {},
            strategicName: props.manuallySearchKpisStore.strategicName,
            financialName: props.manuallySearchKpisStore.financialName,
            businessName: props.manuallySearchKpisStore.businessName,
            valueDriversName: props.manuallySearchKpisStore.valueDriversName,
            kpiName: props.manuallySearchKpisStore.kpiName,
            kpiUnitName: props.manuallySearchKpisStore.kpiUnitName,
            kpiCategoryName: props.manuallySearchKpisStore.kpiCategoryName,
            kpiDescriptionName: props.manuallySearchKpisStore.kpiDescriptionName,
            kpiTrendName: props.manuallySearchKpisStore.kpiTrendName,
            kpiTypeName: props.manuallySearchKpisStore.kpiTypeName,
            kpiFormulaName: props.manuallySearchKpisStore.kpiFormulaName,
            dataInputUnit: props.manuallySearchKpisStore.dataInputUnit,
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

        const { manuallySearchKpisStore } = this.props;
        const tempKpiDetails = {
            strategicName: manuallySearchKpisStore.strategicName,
            financialName: manuallySearchKpisStore.financialName,
            businessName: manuallySearchKpisStore.businessName,
            valueDriversName: manuallySearchKpisStore.valueDriversName,
            kpiName: manuallySearchKpisStore.kpiName,
            kpiUnitName: manuallySearchKpisStore.kpiUnitName,
            kpiCategoryName: manuallySearchKpisStore.kpiCategoryName,
            kpiDescriptionName: manuallySearchKpisStore.kpiDescriptionName,
            kpiTrendName: manuallySearchKpisStore.kpiTrendName,
            kpiTypeName: manuallySearchKpisStore.kpiTypeName,
            kpiFormulaName: manuallySearchKpisStore.kpiFormulaName,
            dataInputUnit: manuallySearchKpisStore.dataInputUnit
        }
        // eslint-disable-next-line default-case
        switch (event.target.id) {

            case 'strategicInput':
                tempKpiDetails.strategicName = event.target.value;
                this.setState({
                    strategicName: event.target.value,
                })
                break;
            case 'financialInput':

                tempKpiDetails.financialName = event.target.value;
                this.setState({
                    financialName: event.target.value
                })
                break;
            case 'businessInput':
                tempKpiDetails.businessName = event.target.value;
                this.setState({
                    businessName: event.target.value
                })
                break;
            case 'valueDriversInput':

                tempKpiDetails.valueDriversName = event.target.value;
                this.setState({
                    valueDriversName: event.target.value
                })

                break;
            case 'kpiNameInput':

                tempKpiDetails.kpiName = event.target.value;
                this.setState({
                    kpiName: event.target.value
                })

                break;
            case 'kpiUnitInput':

                tempKpiDetails.kpiUnitName = event.target.value;
                this.setState({
                    kpiUnitName: event.target.value
                })

                break;
            case 'kpiCategoryInput':

                tempKpiDetails.kpiCategoryName = event.target.value;
                this.setState({
                    kpiCategoryName: event.target.value
                })

                break;
            case 'kpiDescriptionInput':

                tempKpiDetails.kpiDescriptionName = event.target.value;
                this.setState({
                    kpiDescriptionName: event.target.value
                })

                break;
            case 'kpiTrendInput':

                tempKpiDetails.kpiTrendName = event.target.value;
                this.setState({
                    kpiTrendName: event.target.value
                })

                break;
            case 'kpiTypeInput':

                tempKpiDetails.kpiTypeName = event.target.value;
                this.setState({
                    kpiTypeName: event.target.value
                })
                if (tempKpiDetails.kpiTypeName === "Business") {
                    this.setState({
                        valueDriversName: '-'
                    })
                }
                else {
                    this.setState({
                        valueDriversName: ''
                    })
                }
                break;
            case 'kpiFormulaInput':

                tempKpiDetails.kpiFormulaName = event.target.value;
                this.setState({
                    kpiFormulaName: event.target.value
                })

                break;
            case 'dataInputUnit':

                tempKpiDetails.dataInputUnit = event.target.value;
                this.setState({
                    dataInputUnit: event.target.value
                })

                break;
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
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.setKpiDetails(this.state);

        if (this.validatefields()) {
            if (this.props.callEditApi) {
                manuallySearchKpisStore.updateVDT()
                    .then((response) => {
                        if (!response.error) {
                            const { data } = response;
                            if (data.resultCode === 'OK') {
                                this.showSuccessNotification();
                                window.location.reload();

                            }
                        }
                    })
            }
            else {
                manuallySearchKpisStore.saveVDT()
                    .then((response) => {
                        // if (response.error) {
                        //     return {
                        //         error: true
                        //     }
                        // } else {
                            const { data } = response;
                            if (data.resultCode === 'OK') {
                                this.showSuccessNotification();
                                window.location.reload();

                            }
                        // }

                    })
            }
        }
        else {
            // alert("please enter all mandatory fields")
            this.showNotification("error", "please enter all mandatory fields")
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
    showNotification(type, message) {
        switch (type) {
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                console.log("Default");
                break;
        }
    }
    validatefields() {
        if ((this.state.strategicName !== "" && this.state.strategicName !== undefined) && (this.state.financialName !== "" && this.state.financialName !== undefined) && (this.state.businessName !== "" && this.state.businessName !== undefined) &&
            (this.validateValueDrivers()) &&
            (this.state.kpiName !== "" && this.state.kpiName !== undefined) && (this.state.kpiUnitName !== "" && this.state.kpiUnitName !== undefined) &&
            (this.state.kpiCategoryName !== "" && this.state.kpiCategoryName !== undefined) && (this.state.kpiDescriptionName !== "" && this.state.kpiDescriptionName !== undefined) && (this.state.kpiTrendName !== "" && this.state.kpiTrendName !== undefined) &&
            (this.state.kpiTypeName !== "" && this.state.kpiTypeName !== undefined)) {
            return true;
        }
        return false;
    }

    validateValueDrivers() {
        if (this.state.kpiTypeName === 'Operational') {
            return this.state.valueDriversName !== "" && this.state.valueDriversName !== undefined;
        }
        return true;
    }
    cancelVDTHandler = (event) => {
        event.preventDefault();
        if (window.confirm("are you sure you want to cancel")) {
            event.preventDefault();
            window.location.reload();
        }
    }

    render() {
        const {
            strategicName,
            financialName,
            businessName,
            valueDriversName,
            kpiName,
            kpiUnitName,
            kpiCategoryName,
            kpiDescriptionName,
            kpiTrendName,
            kpiTypeName,
            kpiFormulaName,
            dataInputUnit,
            projectUsers,
        } = this.state

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
                                    value={strategicName}
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
                                    value={financialName}
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

                                    value={businessName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className={kpiTypeName === "Business" ? "col form-group" : "col form-group required"}>
                                <label htmlFor="valueDriversInput" className="control-label">Value Drivers</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="valueDriversInput"
                                    value={valueDriversName}
                                    onChange={this.onChangeFormFieldHandler}
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiNameInput" className="control-label">KPI Name </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiNameInput"

                                    value={kpiName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiUnitInput" className="control-label">KPI Unit </label>
                                <select
                                    // class="mdb-select md-form" multiple
                                    type="text"
                                    className="form-control"
                                    id="kpiUnitInput"
                                    value={kpiUnitName}
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


                        </div>
                        <div className="col-sm-6">
                            <div className="col form-group required">
                                <label htmlFor="kpiCategoryInput" className="control-label">KPI Category </label>
                                <input type="text"
                                    className="form-control"
                                    id="kpiCategoryInput"

                                    value={kpiCategoryName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiDescriptionInput" className="control-label">KPI Description </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiDescriptionInput"

                                    value={kpiDescriptionName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
                                <label htmlFor="kpiTrendInput" className="control-label" >Expected KPI trend </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiTrendInput"

                                    value={kpiTrendName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                />
                            </div>
                            <div className="col form-group required">
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
                            </div>
                            <div className="col form-group required"
                            >
                                <label data-tip={getTooltipData()} htmlFor="kpiFormulaInput" className="control-label">KPI Formula </label>
                                <ReactTooltip type="light" html={true} />
                                <input
                                    type="text"
                                    className="form-control"
                                    id="kpiFormulaInput"
                                    value={kpiFormulaName}
                                    onChange={this.onChangeFormFieldHandler}
                                    required
                                    style={{ pointerEvents: this.props.callEditApi ? 'none' : '' }}
                                    disabled={this.state.onEditKpi}
                                    placeholder="Ex: {(Operand1)*(Operand2)}/{(Operand3)+(Operand4)}"
                                />
                            </div>
                            <div className="col form-group required">
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
                            </div>
                            <div className="col-sm-6" >
                                <ManuallyAddKpisInput
                                    projectUsers={projectUsers}
                                    addUserHandler={this.addUserHandler}
                                    deleteUserHandler={this.deleteUserHandler}
                                    onUserEmailChangeHandler={this.onUserEmailChangeHandler}
                                    onUserAccessChangeHandler={this.onUserAccessChangeHandler}
                                    saveVDTHandler={this.saveVDTHandler}
                                    callEditApi={this.props.callEditApi}
                                    cancelVDTHandler={this.cancelVDTHandler}
                                />
                            </div>

                        </div>
                    </div>

                </form>

            </div>
        );
    }
}

export default withRouter(ManuallyAddKpis)
import React, { Component, Fragment } from "react";
import { observer, inject } from "mobx-react";
import { toast } from "react-toastify";
import { withRouter } from "react-router-dom";
import './NewManuallySearchKpiTable.css';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage";
//import '../ManuallySelectKpis/ManuallySelectKpis.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject("manuallySearchKpisStore", "valueDriversStore", "editVDTStore", "reviewValueDriverStore")
@observer
class NewManuallySearchKpis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStrategicObjective: "",
      selectedFinancialObjective: "",
      selectedBusinessObjective: "",
      selectedValueDriver: "",
      selectedOperationalKpi: "",
      financialObjective: "",
      businessObjective: "",
      valueDriverObjective: "",
      operationalKpi: "",
      kpiTrend: "",
      kpiCalculationType: "",
      kpiDescription: "",
      kpiFormula: "",
      kpiUnit: "",
      projectScenario: false,
      displayManuallySearchKpis: false,
      tableData: [],
      OthersSelected: false,
      stratergictextBoxNeeded: false,
      FinancialTextBoxNeeded: false,
      BusinessTextBoxNeeded: false,
      valueTextBoxNeeded: false,
      OperationalTextBoxNeeded: false,
      textBoxRow: true,
      hideOnfirstLoad: true,
      ShowkpiForm: false
    };
    this.strategicChangeHandler = this.strategicChangeHandler.bind(this);
    this.financialChangeHandler = this.financialChangeHandler.bind(this);
    this.businessChangeHandler = this.businessChangeHandler.bind(this);
    this.valueDriverChangeHandler = this.valueDriverChangeHandler.bind(this);
    this.searchKpisHandler = this.searchKpisHandler.bind(this);
    this.saveVDTHandler = this.saveVDTHandler.bind(this);
    this.addkpiToVDTHandler = this.addkpiToVDTHandler.bind(this);
    this.OperationalkpiChangeHandler = this.OperationalkpiChangeHandler.bind(this);
    this.kpiTrendChangeHandler = this.kpiTrendChangeHandler.bind(this);
    this.kpiCalcualtionTypeChangeHandler = this.kpiCalcualtionTypeChangeHandler.bind(this);
    this.kpiDescriptionChangeHandler = this.kpiDescriptionChangeHandler.bind(this);
    this.kpiFormulaChangeHandler = this.kpiFormulaChangeHandler.bind(this);
    this.kpiUnitChangeHandler = this.kpiUnitChangeHandler.bind(this);
    this.formValidationCheck = this.formValidationCheck.bind(this);
    this.callKPIForm = this.callKPIForm.bind(this);



  }

  componentDidMount() {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.getStrategicObjectives();
    manuallySearchKpisStore.selectedStrategicObjective = "";
    manuallySearchKpisStore.selectedFinancialObjective = "";
    manuallySearchKpisStore.selectedBusinessObjective = "";
    manuallySearchKpisStore.selectedValueDriverObjective = "";
    manuallySearchKpisStore.selectedOperationalKpi = "";

  }
  formValidationCheck() {
    return true;
  }
  priorityHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    const targetId = event.target.id;
    // eslint-disable-next-line default-case
    switch (targetId) {
      case "high":
        this.setState({
          priority: targetId,
          highKpiDetails: true,
          lowKpiDetails: false,
          selectedFlag: false,
          tableData: manuallySearchKpisStore.highKpiDetails
        });
        break;
      case "low":
        if (manuallySearchKpisStore.lowKpiDetails.length === 0) {
          manuallySearchKpisStore.generateKPI("low").then(response => {
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
            // }

          });
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
      case "selected":
        this.sortVDTData();
        this.setState({
          priority: event.target.id,
          highKpiDetails: false,
          lowKpiDetails: false,
          selectedFlag: true
        });
        break;
    }
  };

  sortVDTData() {
    const { manuallySearchKpisStore } = this.props;
    const { selectedKpis } = manuallySearchKpisStore;
    let highPriorityRecords = [];
    let lowPriorityRecords = [];
    for (let i = 0; i < selectedKpis.length; i++) {
      selectedKpis[i].priority === "high"
        ? highPriorityRecords.push(selectedKpis[i])
        : lowPriorityRecords.push(selectedKpis[i]);
    }
    const mergedArray = highPriorityRecords.concat(lowPriorityRecords);
    manuallySearchKpisStore.selectedKpis = mergedArray;
    this.setState({
      tableData: mergedArray
    });
  }
  saveVDTHandler() {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.saveVDT().then(response => {
      if (response.error) {
        return {
          error: true
        }
      } else {
        const { data } = response;
        if (data.resultCode === "OK") {
          this.showSuccessNotification();
          window.location.reload();
        }
      }
    });
  }

  cancelVDTHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    event.preventDefault();
    if (window.confirm("Are you sure you want to cancel ?")) {
      manuallySearchKpisStore.navigateToEdit = false;
    }
  };

  addkpiToVDTHandler(event) {
    event.preventDefault();
    const { manuallySearchKpisStore, editVDTStore, reviewValueDriverStore } = this.props;
    const kpiDetails = {
      kpi_id: manuallySearchKpisStore.kpiId,
      map_id: SessionStorage.read("mapId"),
      cmt_growth_pillar: editVDTStore.selectedGrowthPillar.length !== 0 ? editVDTStore.selectedGrowthPillar : reviewValueDriverStore.selectedGrowthPillar.value,
      solution_type: editVDTStore.selectedSolutionType.length !== 0 ? editVDTStore.selectedSolutionType : reviewValueDriverStore.selectedSolutiontype.value,
      cmt_sub_industry: editVDTStore.selectedSubIndustry.length !== 0 ? editVDTStore.selectedSubIndustry : reviewValueDriverStore.selectedIndustry.value,
      strategic_objective: manuallySearchKpisStore.selectedStrategicObjective,
      financial_objective: manuallySearchKpisStore.selectedFinancialObjective,
      business_objective: manuallySearchKpisStore.selectedBusinessObjective,
      value_driver: manuallySearchKpisStore.selectedValueDriverObjective,
      operational_kpi: manuallySearchKpisStore.selectedOperationalKpi,
      operational_kpi_description: `${this.state.kpiDescription}`,
      operational_kpi_formula: `${this.state.kpiFormula}`,
      operational_kpi_unit: `${
        this.state.kpiUnit !== undefined ? this.state.kpiUnit : "#"
        }`,
      target_calculation_type: `${this.state.kpiCalculationType}`,
      kpi_trend: `${this.state.kpiTrend}`
    };

    manuallySearchKpisStore.newAddKpiToVDT(kpiDetails).then(response => {
      if (response.error) {
        return {
          error: true
        }
      } else {
        const { data } = response;
        if (data.resultCode === "OK") {
          this.props.getVDTlist()
          this.showSuccessNotification();
          manuallySearchKpisStore.navigateToEdit = false;

        } else {
          this.showFailureNotification(data.message);
        }
      }
    });
    //We need to Call Edit api i guess


  }
  showFailureNotification(text) {
    toast.error(<NotificationMessage title="Failed" bodytext={text} />, {
      position: toast.POSITION.BOTTOM_RIGHT
    });
  }
  showSuccessNotification() {
    toast.info(
      <NotificationMessage
        title="Success"
        bodytext={"Successfully saved data"}
      />,
      {
        position: toast.POSITION.BOTTOM_RIGHT
      }
    );
  }
  callKPIForm() {
    const { manuallySearchKpisStore } = this.props;
    const { selectedStrategicObjective, selectedFinancialObjective, selectedBusinessObjective,
      selectedValueDriverObjective, selectedOperationalKpi } = manuallySearchKpisStore;
    if (selectedStrategicObjective !== "" && selectedFinancialObjective !== "" && selectedBusinessObjective !== "" &&
      selectedValueDriverObjective !== "" && selectedOperationalKpi !== "") {
      this.setState({
        ShowkpiForm: true
      })
    }
    else {
      this.setState({
        ShowkpiForm: false
      })
    }

  }
  strategicChangeHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.selectedStrategicObjective = event.target.value;

    if (event.target.id === "") {
      if (event.target.value !== "Others") {
        // testing
        manuallySearchKpisStore.selectedFinancialObjective = "";
        manuallySearchKpisStore.selectedBusinessObjective = "";
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        manuallySearchKpisStore.selectedOperationalKpi = "";

        //testing
        manuallySearchKpisStore.getFinancialObjectives();

        this.setState({
          selectedStrategicObjective: event.target.value,
          selectedFinancialObjective: "",
          selectedBusinessObjective: "",
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          financialObjective: "",
          businessObjective: "",
          valueDriverObjective: "",
          OthersSelected: false,

          textBoxRow: true
        });
      } else {
        this.setState({
          selectedStrategicObjective: event.target.value,
          selectedFinancialObjective: "",
          selectedBusinessObjective: "",
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          stratergictextBoxNeeded: false,
          textBoxRow: false,
          FinancialTextBoxNeeded: false,
          BusinessTextBoxNeeded: false,
          valueTextBoxNeeded: false,
          OperationalTextBoxNeeded: false
        });

      }
    }
    this.callKPIForm();
  };

  financialChangeHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.selectedFinancialObjective = event.target.value;
    if (event.target.id === "") {
      if (event.target.value !== "Others") {
        // testing
        manuallySearchKpisStore.selectedBusinessObjective = "";
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        //testing
        manuallySearchKpisStore.selectedOperationalKpi = "";

        manuallySearchKpisStore.getBusinessObjectives();

        this.setState({
          selectedFinancialObjective: event.target.value,
          selectedBusinessObjective: "",
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          businessObjective: "",
          valueDriverObjective: "",
          operationalKpi: "",
          textBoxRow: true
          //projectScenario: true
        });
      } else {
        this.setState({
          selectedFinancialObjective: event.target.value,
          selectedBusinessObjective: "",
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          stratergictextBoxNeeded: true,
          textBoxRow: false,
          FinancialTextBoxNeeded: false,
          BusinessTextBoxNeeded: false,
          valueTextBoxNeeded: false,
          OperationalTextBoxNeeded: false
        });
      }
    }

    this.callKPIForm();
  };

  businessChangeHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.selectedBusinessObjective = event.target.value;
    if (event.target.id === "") {
      if (event.target.value !== "Others") {
        // testing
        manuallySearchKpisStore.selectedValueDriverObjective = "";
        // testing

        manuallySearchKpisStore.getValueDriverObjectives();

        //manuallySearchKpisStore.getValueDriverObjectives();
        this.setState({
          selectedBusinessObjective: event.target.value,
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          valueDriverObjective: "",
          operationalKpi: "",
          textBoxRow: true
          //projectScenario: true
        });
      } else {
        this.setState({
          selectedBusinessObjective: event.target.value,
          selectedValueDriver: "",
          selectedOperationalKpi: "",  //remove the financial obj
          stratergictextBoxNeeded: true,
          textBoxRow: false,
          FinancialTextBoxNeeded: true,
          BusinessTextBoxNeeded: false,
          valueTextBoxNeeded: false,
          OperationalTextBoxNeeded: false
        });
      }
    }

    this.callKPIForm();
  };

  valueDriverChangeHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.selectedValueDriverObjective = event.target.value;
    if (event.target.id === "") {
      if (event.target.value !== "Others") {
        manuallySearchKpisStore.selectedOperationalKpi = "";
        manuallySearchKpisStore.getOperationalKpiObjectives();

        this.setState({
          selectedValueDriver: event.target.value,
          selectedOperationalKpi: "",
          operationalKpi: "",
          textBoxRow: true
        });
      } else {
        this.setState({
          selectedValueDriver: event.target.value,
          selectedOperationalKpi: "",
          stratergictextBoxNeeded: true,
          textBoxRow: false,
          FinancialTextBoxNeeded: true,
          BusinessTextBoxNeeded: true,
          valueTextBoxNeeded: false,
          OperationalTextBoxNeeded: false
        });
      }
    }

    this.callKPIForm();
  };

  OperationalkpiChangeHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    manuallySearchKpisStore.selectedOperationalKpi = event.target.value;
    if (event.target.id === "") {
      if (event.target.value !== "Others") {
        this.searchKpisHandler();
        this.setState({
          selectedOperationalKpi: event.target.value,
          OperationalTextBoxNeeded: true,


        });
      } else {
        manuallySearchKpisStore.kpiId = ""
        this.setState({
          selectedOperationalKpi: event.target.value,
          stratergictextBoxNeeded: true,
          textBoxRow: false,
          FinancialTextBoxNeeded: true,
          BusinessTextBoxNeeded: true,
          valueTextBoxNeeded: true,
          OperationalTextBoxNeeded: false,

          kpiTrend: '',
          kpiUnit: '',
          kpiDescription: '',
          kpiFormula: ''

        });
      }
    }

    this.callKPIForm();
  };

  kpiTrendChangeHandler = event => {
    this.setState({
      kpiTrend: event.target.value
    });
  };
  kpiCalcualtionTypeChangeHandler = event => {
    this.setState({
      kpiCalculationType: event.target.value
    });
  }
  kpiDescriptionChangeHandler = event => {

    this.setState({
      kpiDescription: event.target.value
    });

  };
  kpiFormulaChangeHandler = event => {
    this.setState({
      kpiFormula: event.target.value
    });
  };
  kpiUnitChangeHandler = event => {
    this.setState({
      kpiUnit: event.target.value
    });
  };

  async searchKpisHandler() {
    const { manuallySearchKpisStore } = this.props;
    let KPIArray = await manuallySearchKpisStore.searchKPI();
    if (KPIArray !== undefined) {
      this.setState({
        kpiTrend: KPIArray[0].kpi_trend,
        kpiDescription: KPIArray[0].operational_kpi_description,
        kpiFormula: KPIArray[0].operational_kpi_formula,
        kpiUnit: KPIArray[0].operational_kpi_unit,
        kpiCalculationType: KPIArray[0].calculation_type
      });
    }
  }

  selectVDTHandler = event => {
    const { manuallySearchKpisStore } = this.props;
    const { selectedVDT } = manuallySearchKpisStore;
    const { priority, tableData } = this.state;
    const kpiDataLength = tableData.length;
    const target = event.target;
    const targetId = target.id.split("_");
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
            selected: true
          };
          manuallySearchKpisStore.selectedVDT.push(selectedKPI);
        }
      }
    } else {
      for (let i = 0; i < selectedVDT.length; i++) {
        if (Number(tableData[i].kpiId) === Number(targetId[1])) {
          // const check = priority === 'high' ? (manuallySearchKpisStore.highKpiDetails[i].selected = false) :(manuallySearchKpisStore.lowKpiDetails[i].selected === false)
          selectedVDT.splice(i, 1);
          manuallySearchKpisStore.selectedVDT = selectedVDT;
        }
      }
    }
  };
  render() {
    const { manuallySearchKpisStore } = this.props;
    // console.log(manuallySearchKpisStore);
    const {
      strategicObjective,
      financialLever,
      businessObjective,
      valueDriver,
      operationalKpi
    } = manuallySearchKpisStore;

    return (
      <div className="col-sm-12 vdt-table">
        <Fragment>
          <div className="table-responsive">
            {
              <table className="table">
                <thead style={{ whiteSpace: "nowrap" }}>
                  <tr style={{ textAlign: "center" }}>
                    <th>Strategic Objectives</th>
                    <th>Financial Objectives</th>
                    <th>Business Objectives</th>
                    <th>Value Driver</th>
                    <th>Operational KPI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="col">
                        <select
                          className="form-control"
                          value={this.state.selectedStrategicObjective}
                          onChange={this.strategicChangeHandler}
                        //hidden={!this.state.stratergictextBoxNeeded && !this.state.textBoxRow}
                        >
                          <option value="" defaultValue disabled>
                            Select Strategic Objective*
                          </option>

                          {strategicObjective &&
                            strategicObjective.map((strategic, index) => (
                              <option
                                key={Math.random()}
                                value={strategic.strategic_objective}
                              >
                                {strategic.strategic_objective}
                              </option>
                            ))}
                          <option key={Math.random()} value="Others">
                            Others
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="col" hidden={this.state.hideOnfirstLoad && this.state.selectedStrategicObjective === ""}>
                        <select
                          className="form-control"
                          value={this.state.selectedFinancialObjective}
                          onChange={this.financialChangeHandler}
                          // isDisabled={this.state.financialLoader}

                          hidden={
                            !this.state.stratergictextBoxNeeded &&
                            !this.state.textBoxRow
                          }
                        >
                          <option value="" defaultValue disabled>
                            Select Financial Objective*
                         </option>
                          {financialLever &&
                            financialLever.map((financialLever, index) => (
                              <option
                                key={Math.random()}
                                value={financialLever.financial_objective}
                              >
                                {financialLever.financial_objective}
                              </option>
                            ))}
                          <option key={Math.random()} value="Others">
                            Others
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="col" hidden={this.state.hideOnfirstLoad && this.state.selectedFinancialObjective === ""}>
                        <select
                          className="form-control"
                          value={this.state.selectedBusinessObjective}
                          onChange={this.businessChangeHandler}
                          hidden={
                            !this.state.FinancialTextBoxNeeded &&
                            !this.state.textBoxRow
                          }
                        >
                          <option value="" defaultValue disabled>
                            Select Business Objective*
                          </option>
                          {businessObjective &&
                            businessObjective.map(
                              (businessObjective, index) => (
                                <option
                                  key={Math.random()}
                                  value={businessObjective.business_objective}
                                >
                                  {businessObjective.business_objective}
                                </option>
                              )
                            )}
                          <option key={Math.random()} value="Others">
                            Others
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="col" hidden={this.state.hideOnfirstLoad && this.state.selectedBusinessObjective === ""}>
                        <select
                          className="form-control"
                          value={this.state.selectedValueDriver}
                          onChange={this.valueDriverChangeHandler}
                          hidden={
                            !this.state.BusinessTextBoxNeeded &&
                            !this.state.textBoxRow
                          }
                        >
                          <option value="" defaultValue disabled>
                            Select Value Driver*
                          </option>
                          {valueDriver &&
                            valueDriver.map((valuedriver, index) => (
                              <option
                                key={Math.random()}
                                value={valuedriver.value_driver}
                              >
                                {valuedriver.value_driver}
                              </option>
                            ))}
                          <option key={Math.random()} value="Others">
                            Others
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="col" hidden={this.state.hideOnfirstLoad && this.state.selectedValueDriver === ""}>
                        <select
                          className="form-control"
                          value={this.state.selectedOperationalKpi}
                          onChange={this.OperationalkpiChangeHandler}
                          hidden={
                            !this.state.valueTextBoxNeeded &&
                            !this.state.textBoxRow
                          }
                        >
                          <option value="" defaultValue disabled>
                            Select Operational KPI*
                          </option>
                          {operationalKpi &&
                            operationalKpi.map((operationalKpi, index) => (
                              <option
                                key={Math.random()}
                                value={operationalKpi.operational_kpi}
                              >
                                {operationalKpi.operational_kpi}
                              </option>
                            ))}
                          <option key={Math.random()} value="Others">
                            Others
                          </option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  <tr hidden={this.state.textBoxRow}>
                    <td>
                      <div className="col">
                        <div className="col form-group required">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add Stratergic Objective"
                            onChange={this.strategicChangeHandler}
                            id="stratergicObjectiveTextField"
                            hidden={this.state.stratergictextBoxNeeded}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="col">
                        <div className="col form-group required">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add Financial Objective"
                            onChange={this.financialChangeHandler}
                            id="FinancialObjectiveTextField"
                            hidden={this.state.FinancialTextBoxNeeded}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="col">
                        <div className="col form-group required">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add Business Objective"
                            onChange={this.businessChangeHandler}
                            id="businessObjectiveTextField"
                            hidden={this.state.BusinessTextBoxNeeded}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="col">
                        <div className="col form-group required">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add Value Driver"
                            onChange={this.valueDriverChangeHandler}
                            id="valueDriverTextField"
                            hidden={this.state.valueTextBoxNeeded}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="col">
                        <div className="col form-group required">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add Operational KPI"
                            onChange={this.OperationalkpiChangeHandler}
                            id="operationalKpiTextField"
                            hidden={this.state.OperationalTextBoxNeeded}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            }
            <Fragment>
              <form className="col-sm-12" hidden={(this.state.ShowkpiForm === true
                // && this.state.selectedOperationalKpi!==""
              ) ? false : true} >
                <div className="form-group row">
                  <label
                    htmlFor="kpi_description"
                    className="offset-2 col-2 col-form-label"
                    style={{ paddingRight: "0px" }}
                  >
                    KPI Description*
                  </label>
                  <div className="col-5">
                    <input
                      value={this.state.kpiDescription || ''}
                      id="kpi_description"
                      name="kpi_description"
                      placeholder="KPI description"
                      type="text"
                      className="form-control"
                      onChange={this.kpiDescriptionChangeHandler}

                    />
                  </div>
                </div>
                <div className="form-group row">
                  <label
                    htmlFor="kpi_formula"
                    className="offset-2 col-2 col-form-label"
                  >
                    KPI Formula
                  </label>
                  <div className="col-5">
                    <input
                      value={this.state.kpiFormula || ''}
                      id="kpi_formula"
                      name="kpi_formula"
                      placeholder="KPI Formula"
                      type="text"
                      className="form-control"
                      onChange={this.kpiFormulaChangeHandler}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <label
                    htmlFor="kpi_trend"
                    className="offset-2 col-2 col-form-label"
                  >
                    KPI Trend*
                  </label>
                  <div className="col-2">
                    <select
                      value={this.state.kpiTrend || ''}
                      id="kpi_trend"
                      name="kpi_trend"
                      placeholder="KPI Trend"
                      className="form-control"
                      onChange={this.kpiTrendChangeHandler}
                    >
                      <option value="" defaultValue disabled>
                        Select KPI Trend
                      </option>
                      <option value="Increase">Increase</option>
                      <option value="Decrease">Decrease</option>
                    </select>
                  </div>
                </div>
                <div className="form-group row">
                  <label
                    htmlFor="kpi_trend"
                    className="offset-2 col-2 col-form-label"
                  >
                    KPI Unit*
                  </label>
                  <div className="col-2">
                    <select
                      value={this.state.kpiUnit || ''}
                      id="kpi_unit"
                      name="kpi_unit"
                      placeholder="KPI Unit"
                      className="form-control"
                      onChange={this.kpiUnitChangeHandler}

                    >
                      <option value="" disabled>
                        Select KPI Unit
                      </option>
                      <option value="#/$" defaultValue>#/$</option>
                      <option value="%">%</option>
                      <option value="#">#</option>
                      <option value="$">$</option>
                    </select>
                  </div>
                </div>
                <div className="form-group row">
                  <label
                    htmlFor="kpi_calculation_type"
                    className="offset-2 col-2 col-form-label"
                  >
                    Target Calculation Type*
                  </label>
                  <div className="col-2">
                    <select
                      value={this.state.kpiCalculationType || ''}
                      id="kpi_calculation_type"
                      name="kpi_calculation_type"
                      placeholder="KPI CalculationType"
                      className="form-control"
                      onChange={this.kpiCalcualtionTypeChangeHandler}
                    >
                      <option value="" defaultValue disabled>
                        Select KPI Target Calcualtion Type
                      </option>
                      <option value="Absolute Value">Absolute Value</option>
                      <option value="Relative Improvement">Relative Improvement</option>
                      <option value="Absolute Improvement">Absolute Improvement</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-12" style={{ marginTop: "2%" }} >
                  <button
                    className="btn btn-light float-right"
                    onClick={this.cancelVDTHandler}
                    style={{ marginLeft: "2%", fontWeight: "600" }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-light float-right"
                    onClick={this.addkpiToVDTHandler}
                    style={{ fontWeight: "600" }}
                    disabled={SessionStorage.read("demoUser") === "true" ? true :
                      !(manuallySearchKpisStore.selectedStrategicObjective !== "" &&
                        manuallySearchKpisStore.selectedFinancialObjective !== "" &&
                        manuallySearchKpisStore.selectedBusinessObjective !== "" &&
                        manuallySearchKpisStore.selectedValueDriverObjective !== "" &&
                        manuallySearchKpisStore.selectedOperationalKpi !== "" &&
                        this.state.kpiDescription !== "" &&
                        this.state.kpiFormula !== "" &&
                        this.state.kpiTrend !== "" &&
                        this.state.kpiUnit !== "")

                      // SessionStorage.read("demoUser") === "true" ? true : false
                    }
                  >
                    ADD KPI
                  </button>
                </div>
              </form>
            </Fragment>
            <div className="col-sm-12" style={{ marginTop: "2%" }} hidden={(this.state.ShowkpiForm === true
              //  && this.state.selectedOperationalKpi!==""
            ) ? true : false} >
              <button
                className="btn btn-light float-right"
                onClick={this.cancelVDTHandler}
                style={{ marginLeft: "2%", fontWeight: "600" }}
              >
                Cancel
                  </button>
            </div>
          </div>
        </Fragment>
      </div>
    );
  }
}

export default withRouter(NewManuallySearchKpis);

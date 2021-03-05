import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';

@inject('editVDTStore')
@observer
class EditValueDriverTable extends Component {
    constructor(props) {
        super(props);
        this.selectVDTHandler = this.selectVDTHandler.bind(this);
    }

    componentDidMount() {
        const { editVDTStore } = this.props
        editVDTStore.selectedKPIIds = []
        editVDTStore.selectedKPItoDelete = []
    }
    selectVDTHandler = (event) => {
        const { editVDTStore } = this.props;
        const { selectedVDT } = editVDTStore;
        const kpiDataLength = selectedVDT.length;
        const target = event.target;
        const targetId = target.id.split('_');
        if (target.checked) {
            for (let i = 0; i < kpiDataLength; i++) {
                if (Number(selectedVDT[i].kpi_id) === Number(targetId[0])) {
                    const selectedKPI = {
                        kpiId: (selectedVDT[i].kpi_id).toString(),
                        strategicObjective: selectedVDT[i].strategic_objective,
                        financialObjective: selectedVDT[i].financial_objective,
                        businessObjective: selectedVDT[i].business_objective,
                        valueDriver: selectedVDT[i].value_driver,
                        kpiName: selectedVDT[i].operational_kpi,
                        kpiDescription: selectedVDT[i].operational_kpi_description,
                        selected: true,

                    }
                    editVDTStore.selectedKPI.push(selectedKPI);
                    editVDTStore.selectedKPItoDelete.push(selectedKPI);
                }
            }
        }
        else {
            // const selectedKPI ={
            // kpiId: (selectedVDT[i].kpi_id).toString(),
            // strategicObjective: selectedVDT[i].strategic_objective,
            // financialObjective:selectedVDT[i].financial_objective,
            // businessObjective: selectedVDT[i].business_objective,
            // valueDriver: selectedVDT[i].value_driver,
            // kpiName:selectedVDT[i].operational_kpi,
            // kpiDescription: selectedVDT[i].operational_kpi_description,
            // selected: true,

            // }                    
            const result = editVDTStore.selectedKPI.filter(kpi => kpi.kpiId !== targetId[0]);
            editVDTStore.selectedKPI = [...result];
            editVDTStore.selectedKPItoDelete = [...result]
            //editVDTStore.selectedKPItoDelete.push(selectedKPI);                    
        }
    }


    render() {
        const { editVDTStore } = this.props;
        let selectedVDT = editVDTStore.selectedVDT;
        const { findWhenSelected } = editVDTStore;
        if (editVDTStore.cancelSelected && findWhenSelected) {
            selectedVDT = [];
        }
        return (
            <div className="row" style={{ marginTop: '2%' }}>
                <div className="col-sm-12 vdt-table">
                    <div className="table-responsive">
                        <table className="table" style={{ width: '100%' }}>
                            <thead style={{ whiteSpace: 'nowrap' }}>
                                <tr>
                                    <th>Strategic Objectives</th>
                                    <th>Financial Objective</th>
                                    <th>Business Objectives</th>
                                    <th>Value Driver</th>
                                    <th>Operational KPI</th>
                                    <th>KPI Description</th>
                                </tr>
                            </thead>
                            <tbody>

                                {findWhenSelected && selectedVDT && selectedVDT.map((kpi) =>
                                    <Fragment key={kpi.kpi_id}>
                                        <tr>
                                            < td >
                                                <input
                                                    id={kpi.kpi_id}
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    style={{ width: "1%", height: "14px" }}
                                                    value=""
                                                    onChange={this.selectVDTHandler}
                                                />
                                                {kpi.strategic_objective}
                                            </td>
                                            <td>{kpi.financial_objective}</td>
                                            <td>{kpi.business_objective}</td>
                                            <td>{kpi.value_driver}</td>
                                            <td>{kpi.operational_kpi}</td>
                                            <td>{kpi.operational_kpi_description}</td>
                                        </tr>
                                    </Fragment>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        )
    }
}

export default withRouter(EditValueDriverTable)

import React, { Fragment } from 'react';
import './Table.css';
import ReactTooltip from 'react-tooltip'
var SessionStorage = require('store/storages/sessionStorage');

const ManuallySearchKpiTable = (props) => {
    const { tableData, cancelVDTHandler, priority, addkpiToVDTHandler, selectVDTHandler, changeKpiTypeHandler } = props;
    const getTooltipData = (description, formula) => {
        return `${description} <br /> KPI Formula: ${formula}`;
    }
    return (
        <Fragment>
            <div
                className={tableData.length > 0 ? 'container-fluid my-project-body' : ''}>
                <div className="col-sm-12 vdt-table" style={{ marginLeft: '1%' }}>
                    <div className="table-responsive">
                        <table className="table">
                            <thead style={{ whiteSpace: 'nowrap' }}>
                                <tr>
                                    <th>Strategic Objectives</th>
                                    <th>Financial Objectives</th>
                                    <th>Business Objectives</th>
                                    <th>Value Drivers</th>
                                    <th>Suggested KPIs</th>
                                    <th>KPI Category</th>
                                    <th>KPI Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData && tableData.map((kpi, index) => (
                                    <tr key={Math.random()}>

                                        <td className={`
                                            ${kpi.priority === 'high' && priority === 'selected' ? 'high' : ''}
                                            ${kpi.priority === 'low' && priority === 'selected' ? 'low' : ''}
                                        `}>
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    {kpi.selected ?
                                                        (<input
                                                            id={'kpi_' + kpi.kpiId}
                                                            onChange={selectVDTHandler}
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            defaultChecked
                                                            value=""
                                                        />) :
                                                        (<input
                                                            id={'kpi_' + kpi.kpiId}
                                                            onChange={selectVDTHandler}
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            value=""
                                                        />)}
                                                    {kpi.strategicObjective}
                                                </label>
                                            </div>
                                        </td>
                                        <td>{kpi.financialLever}</td>
                                        <td>{kpi.businessObjective}</td>
                                        <td>{kpi.valueDriver}</td>
                                        <td data-tip={getTooltipData(kpi.kpiDescription, kpi.kpiFormula)}>{kpi.kpiName}
                                            <ReactTooltip type="light" html={true} />
                                        </td>
                                        <td>{kpi.category}</td>
                                        <td>
                                            <select value={kpi.kpiType} id={'kpiType_' + kpi.kpiId} onChange={changeKpiTypeHandler}>
                                                <option value="Business">Business</option>
                                                <option value="Operational">Operational</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-sm-12" style={{ marginTop: '2%' }}>
                    <button
                        className="btn btn-light float-right"
                        onClick={cancelVDTHandler} style={{ marginLeft: '2%', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-light float-right"
                        onClick={addkpiToVDTHandler} style={{ fontWeight: '600' }}
                        disabled={SessionStorage.read('accessType') === 'Read'}
                    >
                        ADD KPI TO VDT
                    </button>
                </div>
            </div>
        </Fragment>
    );
}

export default ManuallySearchKpiTable;
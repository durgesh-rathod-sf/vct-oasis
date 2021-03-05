import React, { Fragment } from 'react';
import './Table.css';
import ReactTooltip from 'react-tooltip'
var SessionStorage = require('store/storages/sessionStorage');


const VDTTable = (props) => {
    const { tableData, priority, selectVDTHandler, saveVDTHandler, changeKpiTypeHandler } = props;
    const getTooltipData = (description, formula) => {
        return `${description} <br /> KPI Formula: ${formula}`;
    }
    return (
        <Fragment>

            <div>
                <div className="col-sm-12 vdt-table">
                    <div className="table-responsive">
                        {
                            <table className="table">
                                <thead style={{ whiteSpace: 'nowrap' }}>
                                    <tr>
                                        <th>Strategic Objectives</th>
                                        <th>Financial Objectives</th>
                                        <th>Business Objectives</th>
                                        <th>Business KPI</th>
                                        <th>Value Driver</th>
                                        <th>Operational KPI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length > 0 ? tableData.map((kpi, index) => (
                                        <tr key={Math.random()} className={kpi.kpiType === 'Operational' ? 'operational-row' : ''} >
                                            <td className={`
                                            ${kpi.priority.toLowerCase() === 'high' && priority === 'selected' ? 'high' : ''}
                                            ${kpi.priority.toLowerCase() === 'low' && priority === 'selected' ? 'low' : ''}
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
                                                {
                                                    kpi.kpiType === 'Business' ?
                                                        (<select value={kpi.kpiType} id={'kpiType_' + kpi.kpiId} onChange={changeKpiTypeHandler}>
                                                            <option value="Business">Business</option>
                                                        </select>)
                                                        :
                                                        (
                                                            <select value={kpi.kpiType} id={'kpiType_' + kpi.kpiId} onChange={changeKpiTypeHandler}>
                                                                <option value="Business">Business</option>
                                                                <option value="Operational">Operational</option>
                                                            </select>
                                                        )
                                                }

                                            </td>
                                        </tr>
                                    )) :
                                        <tr>
                                            <td><h6>No data to display</h6></td>
                                        </tr>
                                    }
                                </tbody>
                            </table>}
                    </div>
                </div>
                <div className="col-sm-12">
                    {
                        tableData.length > 0 && <button
                            className="btn btn-light float-right"
                            onClick={saveVDTHandler} style={{ fontWeight: '600' }}
                            disabled={SessionStorage.read('accessType') === 'Read'}
                        >
                            Save VDT
                    </button>
                    }

                </div>
            </div>
        </Fragment>
    );
}

export default VDTTable;
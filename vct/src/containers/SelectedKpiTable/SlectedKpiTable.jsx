import React, { Fragment } from 'react';
import '../../components/Table/Table.css';
import './SelectedKpiTable.css';
import editIcon from '../../assets/project/pencil.svg';
import ReactTooltip from 'react-tooltip'
var SessionStorage = require('store/storages/sessionStorage');

const SelectedKpitable = (props) => {
    const { selectedKpis, deleteVDTHandler, addkpiToVDTHandler, selectVDTHandler, changeKpiTypeHandler, editKpiHandler } = props;
    const tableData = selectedKpis;
    const getTooltipData = (description, formula) => {
        return `${description} <br /> KPI Formula: ${formula}`;
    }
    return (
        <Fragment>
            <div className={tableData.length === undefined ? '' : tableData.length > 5 ? 'container-fluid my-project-body' : 'container-fluid no-project-body'}>
                {/* <div> */}
                <div className='row' style={{ marginTop: '3%' }}>
                    {/* <div className="col-sm-12">
                    <button className={priority === 'high' ? 'btn btn-light shadow active-btn high-priority-filter-btn' : 'btn btn-light high-priority-filter-btn'} id="high" onClick={priorityHandler} >High Priority</button>
                    <button className={priority === 'low' ? 'btn btn-light shadow active-btn low-priority-filter-btn' : 'btn btn-light low-priority-filter-btn'} id="low" onClick={priorityHandler}>Low Priority</button>
                    <button className={priority === 'selected' ? 'btn btn-light shadow active-btn select-filter-btn' : 'btn btn-light select-filter-btn'} id="selected" onClick={priorityHandler}>Selected</button>
                </div> */}
                    <div className="col-sm-12 vdt-table" >
                        <div className="table-responsive">
                            <table className="table">
                                <thead style={{ whiteSpace: 'nowrap' }}>
                                    <tr>
                                        <th>Strategic Objectives</th>
                                        <th>Financial Objectives</th>
                                        <th>Business Objectives</th>
                                        <th>Value Drivers</th>
                                        <th>Selected KPIs</th>
                                        <th></th>
                                        <th>KPI Category</th>
                                        <th>KPI Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length > 0 ? tableData.map((kpi, index) => (
                                        <tr key={Math.random()} className={kpi.kpiType === 'Operational' ? 'operational-row' : ''}>


                                            <td className={`
                                            ${kpi.priority === 'HIGH' ? 'high' : ''}
                                            ${kpi.priority === 'LOW' ? 'low' : ''}
                                        `}>
                                                <div className="form-check">
                                                    <label className="form-check-label">
                                                        <input
                                                            id={'kpi_' + kpi.kpiId}
                                                            onChange={selectVDTHandler}
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            // checked={kpi.selected}
                                                            defaultChecked={kpi.selected}
                                                            value=""
                                                        />
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
                                            <td>
                                                <button
                                                    className="btn btn-primary-outline"
                                                    onClick={editKpiHandler.bind(this, kpi)}
                                                    disabled={SessionStorage.read('accessType') === 'Read'}
                                                >
                                                    <img src={editIcon} height="31px" alt="edit" width="31px" />
                                                </button></td>
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
                                            <td><h5>No data to display</h5></td>
                                        </tr>}
                                </tbody>
                            </table>
                            {
                                tableData.length > 0 ?
                                    <div className="col-sm-12">

                                        <button
                                            className="btn btn-light float-right"
                                            disabled={SessionStorage.read('accessType') === 'Read'}
                                            onClick={addkpiToVDTHandler} style={{ fontWeight: '600' }}>
                                            Save VDT
                                        </button>

                                        <button
                                            className="btn btn-light float-right"
                                            disabled={SessionStorage.read('accessType') === 'Read'}
                                            onClick={deleteVDTHandler} style={{ marginRight: '2%', fontWeight: '600' }}>
                                            Delete KPI
                            </button>
                                    </div> : ''
                            }


                        </div>
                    </div>

                </div>
            </div>
        </Fragment>
    );
}

export default SelectedKpitable;
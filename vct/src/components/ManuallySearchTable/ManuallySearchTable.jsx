import React, {Fragment} from 'react';
import './ManuallySearchTable.css';
import ReactTooltip from 'react-tooltip'

const ManuallySearchTable = (props) => {
    const { tableData, priorityHandler, priority, selectVDTHandler, addKPIVDTHandler, changeKpiTypeHandler} = props;
    const getTooltipData = (description, formula) => {
        return `${description} <br /> KPI Formula: ${formula}`;
    }    
    return(   
            <Fragment>                
                <div className={tableData.length > 0 ? 'container-fluid my-project-body': ''}> 
                
                    <div className="col-sm-12 vdt-table" style={{marginTop:'20px'}}>
                        <div className="table-responsive">
                        <table className="table">
                            <thead style={{whiteSpace: 'nowrap'}}>
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
                                    {tableData && tableData.map((kpi, index) =>(
                                        <tr key={Math.random()}>                                            
                                            <td className={`
                                                ${kpi.priority === 'selected' && priority === 'selected' ? 'selected' : ''}
                                                ${kpi.priority === 'selected' && priority === 'selected' ? 'selected' : ''}
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
                                                        />) }                                                    
                                                        {kpi.strategicObjective}
                                                    </label>
                                                </div>
                                            </td>
                                            <td>{kpi.financialLever}</td>
                                            <td>{kpi.businessObjective}</td>
                                            <td>{kpi.valueDriver}</td>
                                            <td data-tip={getTooltipData(kpi.kpiDescription, kpi.kpiFormula)}>{kpi.kpiName}
                                            <ReactTooltip type="light" html={true}/>
                                            </td>
                                            <td>{kpi.category}</td>
                                            <td>
                                                <select value={kpi.kpiType} id={'kpiType_'+kpi.kpiId} onChange={changeKpiTypeHandler}>                                                                                            
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
                    <div className="col-sm-12">
                        <button 
                            className="btn btn-light float-right" 
                            onClick={addKPIVDTHandler} style={{fontWeight: '600'}}                            
                        >
                            Save VDT
                        </button>
                    </div>
                </div>       
            </Fragment>
    );
}

export default ManuallySearchTable;
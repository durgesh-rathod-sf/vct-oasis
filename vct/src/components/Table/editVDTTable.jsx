import React, { Fragment } from 'react';
import './Table.css';
import ReactTooltip from 'react-tooltip'
import NewManuallySearchKpiTable from '../../components/Table/NewManuallySearchKpiTable';
var SessionStorage = require('store/storages/sessionStorage');

const EditVDTTable = (props) => {

    const { listVDT, getVDTlist, editvdtHandler, selectVDTHandler, saveSelectedVDTTxnsHandler, manuallySearchButton, manuallySearchButton1 } = props;
    //let text11 = manuallySearchButton1 == false ? manuallySearchButton=false:manuallySearchButton=true



    //storeVariable1 == false ? storeVariable2=true:storeVariable2=false
    //console.log(manuallySearchButton1)

    const getTooltipData = (description, formula) => {
        return `${description} <br /> KPI Formula: ${formula}`;
    }
    // console.log(manuallySearchButton);
    return (
        <Fragment>
            {(manuallySearchButton && manuallySearchButton1 !== false) ? <NewManuallySearchKpiTable getVDTlist={getVDTlist} /> : <div>
                <div className="col-sm-12 vdt-table">
                    <div className="table-responsive">
                        {
                            <table className="table" style={{ width: "100%", marginBottom: "3%" }}>
                                <thead style={{ whiteSpace: 'nowrap' }}>
                                    <tr>
                                        <th></th>
                                        <th>Strategic Objective</th>
                                        <th>Financial Objective</th>
                                        <th>Business Objective</th>
                                        <th>Value Lever</th>
                                        <th>Operational KPI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listVDT && listVDT.length > 0 ? listVDT.map((kpi, index) => (
                                        <tr key={Math.random()} className={kpi.kpiType === 'Operational' ? 'operational-row' : ''} >
                                            <td style={{ width: '73px' }}
                                            //     className={`
                                            //     ${kpi.priority.toLowerCase() === 'high' && priority === 'selected' ? 'high' : ''}
                                            //     ${kpi.priority.toLowerCase() === 'low' && priority === 'selected' ? 'low' : ''}
                                            // `}
                                            >
                                                <div className="form-check">
                                                    <label className="form-check-label">
                                                        {kpi.selected}
                                                        {kpi.selected ?
                                                            (<input
                                                                id={'kpi_' + kpi.kpiId}
                                                                onChange={selectVDTHandler}
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                defaultChecked
                                                                style={{ width: "40%", height: "15px" }}
                                                                value=""
                                                            />) :
                                                            (<input
                                                                id={'kpi_' + kpi.kpiId}
                                                                onChange={selectVDTHandler}
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                style={{ width: "40%", height: "15px" }}
                                                                value=""
                                                            />)}

                                                    </label>
                                                    <i className="fa fa-pencil" id={kpi.userId + ' ' + kpi.userEmail} onClick={editvdtHandler.bind(this, kpi)} style={{ cursor: "pointer" }} ></i>
                                                </div>
                                            </td>
                                            <td> {kpi.strategicObjective}</td>
                                            <td>{kpi.financialObjective}</td>
                                            <td>{kpi.businessObjective}</td>
                                            <td>{kpi.valueDriver}</td>
                                            <td data-tip={getTooltipData(kpi.opKpiDesc, kpi.opKpiFormula)}>{kpi.opKpi}
                                                <ReactTooltip type="light" html={true} />
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
                        listVDT && listVDT.length > 0 && <button
                            className="btn btn-light float-right"
                            onClick={saveSelectedVDTTxnsHandler} style={{ fontWeight: '600' }}
                            // disabled={SessionStorage.read('accessType') === 'Read'}
                            disabled={SessionStorage.read("demoUser") === "true" ? true : false}
                        >
                            Save VDT
                    </button>
                    }

                </div>
            </div>}

        </Fragment>
    );
}

export default EditVDTTable;
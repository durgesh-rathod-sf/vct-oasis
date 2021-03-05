import React, { Fragment } from 'react';

const DashboardTable = (props) => {
    const { tabChangeHandler, kpiDetails, activeTab, kpiData, publishDashboardHandler, publishDashboard, cancelUpload, kpiName, kpiNames, kpiIndex } = props
    const getThousandSeparatedValue = (value) => {
        if (value) {
            return `${value.toLocaleString(navigator.language, { minimumFractionDigits: 0 })}`;
        }
        return '';
    }
    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-4" style={{ marginRight: '-1%', marginTop: '3%', paddingRight: '1%' }}>
                    {kpiNames && kpiNames.map((kpi, index) => (
                        <div className="border header-row" style={{ padding: '0px' }}>
                            <button title={kpi} className={(activeTab === kpi && Number(kpiIndex) === Number(index)) ? "btn btn-light" : "btn"} style={{ width: '100%', paddding: '0px' }} onClick={tabChangeHandler}
                                value={kpi} id={`${index}`}>
                                    <span className="pull-left">
                                        {kpiName === kpi ? kpi : kpi.substr(0,30)}
                                    </span>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="col-sm-6" style={{ border: '1px', marginTop: '3%' }}>
                    <div>
                        <div className="border row">
                            <div className="col-sm-3 border-right header-row" style={{ padding: '1%', color: '#000' }} >KPI Type</div>
                            <div className="col-sm-9" > {kpiDetails.kpiType}</div>
                        </div>
                        <div className="border row">
                            <div className="col-sm-3 border-right header-row" style={{ padding: '1%', color: '#000' }}  >KPI Unit</div>

                            <div className="col-sm-9" > {kpiDetails.kpiUnit}</div>
                        </div>
                        <div className="border row">
                            <div className="col-sm-3 border-right header-row" style={{ padding: '1%', color: '#000' }}  >Frequency</div>

                            <div className="col-sm-9" > {kpiDetails.kpiFrequency}</div>
                        </div>
                    </div>
                    < div style={{ border: '1px'}}>
                        <div className="row header-row" style={{paddingLeft:'0px'}}  >
                            <div className="col-sm-6 border-right" style={{ color: '#000', textAlign: 'center' }}>
                                Actual Date
                        </div>
                            <div className="col-sm-6 border-right" style={{ color: '#000', textAlign: 'center' }}>
                                Actual Value
                            </div>
                        </div>
                        {kpiData && kpiData.map((kpi, index) => (
                            kpiName === kpi.kpiName && kpi.reportedValue !== "null" ?
                                (<div>
                                    <div className="border row">
                                        <div className="col-sm-6 border-right text-center">{kpi.reportedDate}</div>
                                        <div className="col-sm-6 border-right text-center">{getThousandSeparatedValue(Math.round(kpi.reportedValue * 100) / 100)}</div>
                                    </div>
                                </div>) :
                                ""
                        ))
                        }
                    </div>
                </div>
                <div className="row col-sm-12" style={{ marginLeft: '30%' }}>
                    <button className="btn btn-light" onClick={cancelUpload} style={{ width: '250px', fontWeight: '500', margin: '1%' }}>
                        CANCEL UPLOAD
                    </button>
                    <button className="btn btn-light" onClick={publishDashboardHandler} style={{ width: '250px', fontWeight: '500', margin: '1%' }}>
                        PUBLISH TO DASHBOARD
                        {" "}
                        {publishDashboard && <i className="fa fa-spinner fa-spin"></i>}
                    </button>
                </div>
            </div>
        </Fragment >
    );
}

export default DashboardTable;
import React from 'react';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
import { inject ,observer } from 'mobx-react';
import Charts from "./Charts"
import { toJS } from "mobx";
import Card from './Card';
import DashboardFilter from "../Dashboards/DashboardFilter/DashboardFilter"



@inject('publishDashboardStore', 'netBenefitOverviewStore','dashboardNetBenefitStore')
@observer
class NetBenefitOverviewDashboard extends React.Component {

    constructor(props) {
        super();
        this.state = {
            selectedInnerPage: "benefitOverview",
            selectedObjective: "Financial Objective",
            apiError: false

        }

    }


    getNetBenefitOverview = () => {
        const {dashboardNetBenefitStore} = this.props;
        dashboardNetBenefitStore.initDashboard();
    }


    componentDidMount() {
        const {dashboardNetBenefitStore} = this.props;
        dashboardNetBenefitStore.resetDashboard()
        this.getNetBenefitOverview();

    }

   
    render() {
        const { dashboardNetBenefitStore} = this.props;
        let lisOfFilters = toJS(dashboardNetBenefitStore.filters);
        const { showSpinner, axis, selectedInnerPage, kpiType, listOfKpi, selectedObjective, benefitEndDate, benefitStartDate, actualVsTargetBenefits, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, actualVsTargetTotalBenefits, expectedTotalBenefitFinalYear, expectedTotalBenefitCurrentYear, actualTotalBenefit, expectedBenefitFinalYear, expectedBenefitCurrentYear, actualBenefit } = this.state;
        return (
            <div className="pl-3 pr-3 position-relative w-100">

                <div className="row">

                {lisOfFilters && <div className="col-lg-3 col-xl-2 mt-3">
                    <DashboardFilter
                    filters={Object.values(lisOfFilters)}
                    filterChange={(opt, filter) => { dashboardNetBenefitStore.onFilterChanged(opt, filter) }}></DashboardFilter>
                </div>}
                   
                    {this.props.dashboardNetBenefitStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">

                                {
                                   dashboardNetBenefitStore.totalcharts && Object.values(dashboardNetBenefitStore.totalcharts).map((total, ix) => <div key={`total${ix}`} className="col-lg-4 col-md-6 pl-lg-0"><Card total={total} page="valueArchitecting" netBenefitClass= "netBenefitClass" /></div>)
                                }

                            </div>


                            <div className="form-group row">
                                {
                                   dashboardNetBenefitStore.charts && Object.values(dashboardNetBenefitStore.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0" key={`chart${ix}`}>
                                            <Charts chart={chart} />
                                        </div>)
                                }
                            </div>
                        </div>

                        : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div> }


                </div>
            </div>
        );
    }
}

export default NetBenefitOverviewDashboard;
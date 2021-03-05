import React from 'react';
import DashBoardUtils from './DashboardUtils';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
import Charts from "./Charts"
import Card from './Card'
import { inject, observer } from 'mobx-react';
import { toJS } from "mobx";
import InvestmentOverviewDeliveryStore from '../../stores/Dashboard/InvestmentOverviewDeliveryStore';
import DashboardFilter from "../Dashboards/DashboardFilter/DashboardFilter"

@inject('investmentOverviewDeliveryStore')
@observer
class InvestmentOverviewDashboardDelivery extends React.Component {
    data = null;
    yearsSelected = [];
    defaultObj = ["Cost Category"]
    constructor(props) {
        super();
        this.state = {
        }
    }
    componentDidMount() {
        const { investmentOverviewDeliveryStore } = this.props;
        investmentOverviewDeliveryStore.resetDashboard(); 
        investmentOverviewDeliveryStore.initDashboard(investmentOverviewDeliveryStore.filters['FilterView'].value);
        
    }



    frequencyChanged = (chartData ,key) => {
        const { investmentOverviewDeliveryStore } = this.props;
        investmentOverviewDeliveryStore.frequencyChanged(chartData ,key);
    }

    render() {
        const { investmentOverviewDeliveryStore } = this.props;
        let lisOfFilters = toJS(investmentOverviewDeliveryStore.filters);
       
        return (
            <div  className="pl-3 pr-3 position-relative w-100">

                <div className="row">

                    {lisOfFilters && <div className="col-lg-3 col-xl-2 mt-3" >
                        <DashboardFilter
                            filters={Object.values(lisOfFilters)}
                            filterChange={(opt, filter) => { investmentOverviewDeliveryStore.onFilterChanged(opt, filter) }}></DashboardFilter>
                    </div>}

                    {investmentOverviewDeliveryStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">

                                {
                                    investmentOverviewDeliveryStore.totalcharts && Object.values(investmentOverviewDeliveryStore.totalcharts).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0" ><Card  total={total} /></div>)
                                }

                            </div>


                            <div  className="form-group row">
                                {
                                  investmentOverviewDeliveryStore.charts && Object.values(investmentOverviewDeliveryStore.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0"  key={`chart${ix}`}>
                                            <Charts keys ={`graph${ix}`} 
                                                chart={chart} disableButton= {chart.label.includes("Periodic") ? investmentOverviewDeliveryStore.frequencyType : ""}
                                                frequencyType = {chart.label.includes("Periodic") ? investmentOverviewDeliveryStore.frequencyTypeLocalTemp : ""} 
                                                frequencyChanged ={this.frequencyChanged} frequencyChangeIcon={chart.label.includes("Periodic") && investmentOverviewDeliveryStore.filters.FilterType.value.length > 0? true : false}
                                                toggleFrequencyIcon = {investmentOverviewDeliveryStore.frequencyIcon} />
                                        </div>)
                                }
                            </div>
                        </div>

                        : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}


                </div>
            </div>
        );
    }
}

export default InvestmentOverviewDashboardDelivery;
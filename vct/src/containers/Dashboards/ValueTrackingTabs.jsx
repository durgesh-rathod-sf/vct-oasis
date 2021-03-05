import React, { Fragment } from "react";
import "./ValueTrackingTabs.css";
import project_overview from "../../assets/publishDashboard/project_overview.svg"
import benefit_overview from "../../assets/publishDashboard/benefit_overview.svg"
import investment_overview from "../../assets/publishDashboard/investment_overview.svg"
import keyInsights_overview from "../../assets/publishDashboard/keyInsights_overview.svg"
import net_benefit from "../../assets/publishDashboard/net_benefit.svg"
import degree_icon from "../../assets/publishDashboard/degree_icon.svg"
import BenefitOverviewDashboardVT from './BenefitOverviewDashboardVT';
import KpiOverviewDashboard from "./KpiOverviewDashboard";
import InvestmentOverviewDashboardDelivery from "./InvestmentOverviewDashboardDelivery";
import ProjectOverviewDashboard from "./ProjectOverviewDashboard";
import DashboardView from './360DashboardViewValueTracking';
import DashboardWorkstreamOverview from "./DashboardWorkstreamOverview/DashboardWorkstreamOverview";

// let axisValues = {
//   x: {

//     type:  'category',
//     categories: ['2019', '2020', '2021', '2022','2023','2024'],
//     tick: {
//       centered: true
//     }
//     // tick: {
//     //     values:['2019-01-01', '2014-01-02', '2015-01-03', '2016-01-04','2017-01-05']
//     // }

//   }
// }

export default class ValueTrackingTabs extends React.Component {
  pages = ['projectOverview', 'workstreamOverview', 'benifitsOverview', 'keyInsights'];
  constructor(props) {
    super();
    this.state = {
      selectedInnerPage: "projectOverview",
      listOfKpi: {},
      selectedKpi: "All",
      actualVsTargetTotalBenefits: [],
      actualVsTargetTotalKpiTillDates: [],
      expectedTotalBenefitFinalYear: 0,
      expectedTotalBenefitCurrentYear: 0,
      benefitEndDate: '',
      benefitStartDate: '',
      actualTotalBenefit: 0,
      actualVsTargetBenefits: [],
      actualVsTargetKpiTillDates: [],
      expectedBenefitFinalYear: 0,
      expectedBenefitCurrentYear: 0,
      actualBenefit: 0,
      axis: {}

    }
  }

  componentDidMount() {

  }



  handleClick(type) {
    this.setState({
      selectedInnerPage: type
    });
    //this.props.selectedPage(type)
  }

  render() {
    const { selectedInnerPage } = this.state;
    return (
      <Fragment>
        <div id="valueTrackingDashboard" style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid rgba(255, 255, 255, 0.5)" }}>
          <ul className="nav nav-tabs tab_menu" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.5) !important" }}>
            <li className={selectedInnerPage === 'projectOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('projectOverview')}><div><img src={project_overview} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "54px" }}>Project Overview</span></div></li>
            <li className={selectedInnerPage === 'workstreamOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('workstreamOverview')}><img src={project_overview} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "68px" }}>Workstream Overview</span></li>
            <li className={selectedInnerPage === 'kpiOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('kpiOverview')} ><img src={net_benefit} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "54px" }}>KPI Overview</span></li>
            <li className={selectedInnerPage === 'investmentOverView' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('investmentOverView')} ><img src={investment_overview} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "63px" }}>Investment Overview</span></li>
            <li className={selectedInnerPage === 'benifitsOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('benifitsOverview')}><img src={benefit_overview} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "54px" }}>Benefit Overview</span></li>
            <li className={selectedInnerPage === 'keyInsights' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('keyInsights')}><img src={keyInsights_overview} alt="" /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "45px" }}>Key Insights</span></li>
            <li className={selectedInnerPage === '360degreeView' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('360degreeView')}><img src={degree_icon} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "70px" }}></span></li>
          </ul>
          {/* <div className="Icon_menu" style={{width : "20%"}}>
            </div> */}
        </div>



        {selectedInnerPage && selectedInnerPage === "kpiOverview" ?
          <KpiOverviewDashboard /> : ""}
        {selectedInnerPage && selectedInnerPage === "investmentOverView" ?
          <InvestmentOverviewDashboardDelivery /> : ""}

        {selectedInnerPage && selectedInnerPage === "workstreamOverview" ?

          <DashboardWorkstreamOverview />: ""}

        {selectedInnerPage && selectedInnerPage === "keyInsights" ?
          <div style={{ width: "100%", position: "relative" }}>

            <div style={{ display: "flex", justifyContent: "center", fontSize: "24px" }}>Coming soon.....</div>
          </div> : ""}
        

        {selectedInnerPage && selectedInnerPage === "benifitsOverview" ?
          <BenefitOverviewDashboardVT /> : ""}


        {selectedInnerPage && selectedInnerPage === "projectOverview" ?
          <ProjectOverviewDashboard /> : ""}
        {selectedInnerPage && selectedInnerPage === "360degreeView" ?
          <DashboardView /> : ""}
      </Fragment>
    );

  }
}
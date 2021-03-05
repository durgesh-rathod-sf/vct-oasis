import React, { Fragment } from "react";
import "./ValueArchitectTabs.css";
import project_overview from "../../assets/publishDashboard/project_overview.svg"
import benefit_overview from "../../assets/publishDashboard/benefit_overview.svg"
import investment_overview from "../../assets/publishDashboard/investment_overview.svg"
import keyInsights_overview from "../../assets/publishDashboard/keyInsights_overview.svg"
import degree_icon from "../../assets/publishDashboard/degree_icon.svg"
import net_benefit from "../../assets/publishDashboard/net_benefit.svg"
//import InvestmentOverviewDashboard from "./InvestmentOverviewDashboard"
import NetBenefitOverviewDashboard from "./NetBenefitOverviewDashboard"
import InvestmentOverviewDashboard from "./InvestmentOverviewDashboard"
import BenefitsOverviewDashboard from "./BenefitsOverviewDashboard";
import DashboardView from './360DashboardViewValueArchitecting';
var SessionStorage = require('store/storages/sessionStorage'); 
export default class ValueArchitectingTabs extends React.Component {

  constructor(props) {
    super();
    this.state = {
      selectedInnerPage: "benefitsOverview",
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
        <div id="valueArchitectDashboard" style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid rgba(255, 255, 255, 0.5)"}}>
          <ul className="nav nav-tabs tab_menu" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.5) !important" }}>
            <li className={selectedInnerPage === 'benefitsOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('benefitsOverview')}><img src={benefit_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "54px" }}>Benefit Overview</span></li>
            <li className={selectedInnerPage === 'investmentOverView' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('investmentOverView')} ><img src={investment_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "63px" }}>Investment Overview</span></li>
            <li className={selectedInnerPage === 'netBenefitsOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('netBenefitsOverview')}><img src={keyInsights_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "70px" }}>Net Benefit Overview</span></li>
            <li className={selectedInnerPage === '360degreeView' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('360degreeView')}><img src={degree_icon} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "70px" }}></span></li>
          </ul>
        </div>

        {/* {selectedInnerPage && (selectedInnerPage != "netBenefitsOverview" && selectedInnerPage != "investmentOverView")?
          <div style={{ width: "100%", position: "relative" }}>

          <div style={{ display: "flex", justifyContent: "center", fontSize: "24px" }}>Coming soon.....</div>
        </div> : ""} */}

        {selectedInnerPage && selectedInnerPage === "benefitsOverview" ?
          // SessionStorage.read('option_selected') === 'sales'?
          <BenefitsOverviewDashboard /> 
        //   :
        //    <div style={{ width: "100%", position: "relative" }}>

        //   <div style={{ display: "flex", justifyContent: "center", fontSize: "24px" }}>Coming soon.....</div>
        // </div>
        :""}

        {selectedInnerPage && selectedInnerPage === "investmentOverView" ?
          <InvestmentOverviewDashboard /> : ""}
        
        {selectedInnerPage && selectedInnerPage === "netBenefitsOverview" ?
          <NetBenefitOverviewDashboard /> : ""}
       {selectedInnerPage && selectedInnerPage === "360degreeView" ?
          <DashboardView /> : ""}
      </Fragment>
    );

  }
}

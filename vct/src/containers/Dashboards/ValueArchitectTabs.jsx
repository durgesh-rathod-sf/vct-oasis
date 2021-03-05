import React, { Fragment } from "react";
import "./ValueArchitectTabs.css";
import project_overview from "../../assets/publishDashboard/project_overview.svg"
import benefit_overview from "../../assets/publishDashboard/benefit_overview.svg"
import investment_overview from "../../assets/publishDashboard/investment_overview.svg"
import keyInsights_overview from "../../assets/publishDashboard/keyInsights_overview.svg"
import net_benefit from "../../assets/publishDashboard/net_benefit.svg"
import benifitsOverviewDashboard from "./benifitsOverviewDashboard";


export default class ValueArchitectTabs extends React.Component {

  constructor(props) {
    super();
    this.state = {
      selectedInnerPage: "benifitsOverview",
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
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {

  }



  handleClick = (type) => {
    this.setState({
      selectedInnerPage: type
    });
    //this.props.selectedPage(type)
  }

  render() {
    const { selectedInnerPage } = this.state;
    return (
      <Fragment>
        <div id="valueArchitectDashboard" className="d-flex align-items-center">
          <ul className="nav nav-tabs tab_menu" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.5) !important" }}>
            <li className={selectedInnerPage === 'benifitsOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('benifitsOverview')}><img src={benefit_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "54px" }}>Benefit Overview</span></li>
            <li className={selectedInnerPage === 'investmentOverView' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('investmentOverView')} ><img src={investment_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "63px" }}>Investment Overview</span></li>
            <li className={selectedInnerPage === 'netBenefitsOverview' ? "active" : "disabled"} data-toggle="tab" onClick={() => this.handleClick('netBenefitsOverview')}><img src={keyInsights_overview} /><span style={{ display: "inline-flex", wordBreak: "break-word", marginLeft: "15px", width: "70px" }}>Net Benefits Overview</span></li>
            <li></li>

          </ul>
        </div>

        {/* {selectedInnerPage && selectedInnerPage != "kpiOverview" ?
          <div style={{ width: "100%", position: "relative" }}>
 </div> : ""} */}
        {selectedInnerPage && selectedInnerPage === "benifitsOverview" ?
          <benifitsOverviewDashboard />
          : ""}

        
      </Fragment>
    );

  }
}

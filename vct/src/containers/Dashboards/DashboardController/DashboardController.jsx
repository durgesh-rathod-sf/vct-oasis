import React, { Component } from 'react';
import './DashboardController.css';
import { inject, observer } from 'mobx-react';
import DashboardFilter from '../DashboardFilter/DashboardFilter';
import Icons from '../../common/Icon';
import DashboardLayout from '../DashboardLayout/DashboardLayout';


@inject('dashboardBenefitOverviewStore', 'dashboardInvestmentOverviewStore', 'dashboardNetBenefitStore',
  'dashboardKPIOverviewStore', 'dashboardProjectOverviewStore', 'dashboardWorkstreamOverviewStore',
  'dashboardInvestmentTrackingOverviewStore', 'dashboardBenefitTrackingOverviewStore',
  'publishDashboardStore')
@observer
class DashboardController extends Component {

  tabsValueTrack = [
    {
      title: 'Project Overview',
      id: 'Project-Overview',
      icon: 'ProjectOverview',
      store: 'dashboardProjectOverviewStore'
    },
    {
      title: 'Workstream Overview',
      id: 'Workstream-Overview',
      icon: 'WorkstreamOverview',
      store: 'dashboardWorkstreamOverviewStore'
    },
    {
      title: 'KPI Overview',
      id: 'KPI-Overview',
      icon: 'KpiOverview',
      store: 'dashboardKPIOverviewStore'
    },
    {
      title: 'Investment Overview',
      id: 'Investment-Overview',
      icon: 'InvestmentOverview',
      store: 'dashboardInvestmentTrackingOverviewStore'
    },
    {
      title: 'Benefit Overview',
      id: 'Benefit-Overview',
      icon: 'BenefitOverview',
      store: 'dashboardBenefitTrackingOverviewStore'
    }, {
      title: 'Key Insights',
      id: 'Key-Insights',
      icon: 'KeyInsights'
    }
  ]
  tabsValueArch = [
    {
      title: 'Benefit Overview',
      id: 'Benefit-Overview',
      icon: 'BenefitOverview',
      store: 'dashboardBenefitOverviewStore'
    },
    {
      title: 'Investment Overview',
      id: 'Investment-Overview',
      icon: 'InvestmentOverview',
      store: 'dashboardInvestmentOverviewStore'
    },
    {
      title: 'Net Benefit Overview',
      id: 'Net-Benefit-Overview',
      icon: 'NetBenefit',
      store: 'dashboardNetBenefitStore'
    }
  ]

  tabs = [];
  constructor(props) {
    super(...arguments);
    this.tabs = (props.valueArch) ? this.tabsValueArch : this.tabsValueTrack;
    this.selectTab = this.selectTab.bind(this);
    this.state = {
      selectedTab: this.tabs[0]

    }
  }
  async componentDidMount() {

    if (this.props[this.state.selectedTab.store].resetDashboard != null) {
      this.props[this.state.selectedTab.store].resetDashboard();
      this.forceUpdate();
    }
    await this.props.publishDashboardStore.publishDashboard();
    //this.forceUpdate();
    await this.selectTab(this.tabs[0])
  }

  async selectTab(tab) {
    if (tab.store) {
      this.setState({
        selectedTab: tab
      });
      // if (this.props[tab.store].resetDashboard)
      //  this.props[tab.store].resetDashboard();
      await this.props[tab.store].initDashboard();
      this.forceUpdate();
      this.props.selectedPage(tab.id);// For future, for maintaining URL state
    }

  }
  getSelectedStore() {
    return this.props[this.state.selectedTab.store];
  }
  renderTab(tab) {
    return (
      <div key={tab.id} className={(this.state.selectedTab.id === tab.id) ? "iconTab activated" : "iconTab"} onClick={() => this.selectTab(tab)}>
        <img src={Icons.Dashboard[tab.icon]} alt={tab.title} />
        <div>{tab.title}</div>
      </div>
    )
  }

  render() {
    const selectedStore = this.getSelectedStore()
    return (
      <div className="tab-content-outer-wrapper " id="mainDashboards">

        <div className="row" >
          {selectedStore.filters && <div className="col-2" style={{ borderRight: "1px solid #999" }}>
            <DashboardFilter
              filters={Object.values(selectedStore.filters)}
              filterChange={(opt, filter) => { selectedStore.onFilterChanged(opt, filter) }}></DashboardFilter>
          </div>}
          <div className="col">
            <div className="row" style={{ marginLeft: "10px" }}>
              {this.tabs.map(tab => this.renderTab(tab))}
            </div>
            {<DashboardLayout totalcharts={Object.values(selectedStore.totalcharts)} charts={Object.values(selectedStore.charts)}></DashboardLayout>}
          </div>
        </div>
      </div>
    );
  }
}
export default DashboardController;

import React, { Component } from 'react';
import './DashboardLayout.css';

import TotalChart from '../../common/TotalChart';
import Chart from '../../common/Chart';
import TableChart from '../../common/TableChart';
import ProjectPlan from '../../common/ProjectPlan';

class DashboardLayout extends Component {
  renderChart(chart) {
    if (chart.type === 'Table') {
      return <TableChart chart={chart}></TableChart>
    } else if (chart.type === 'ProjectPlan') {
      return <ProjectPlan chart={chart}></ProjectPlan>
    } else {
      return <Chart chart={chart}></Chart>
    }


  }


  render() {

    return (
      <div className="dashboard">
        <div key="totals" className="row m-0" style={{ height: "150px" }}>
          {
            this.props.totalcharts && this.props.totalcharts.map((total, ix) => <div key={`total${ix}`} className="col p-0" style={{ display: "flex" }} ><TotalChart total={total}></TotalChart></div>)
          }
        </div>
        <div key="charts" className="row m-0" style={{ height: "400px" }}>
          {
            this.props.charts && this.props.charts.map((chart, ix) =>
              <div key={`chart${ix}`} className="col p-0" style={{ display: "flex" }} >
                {this.renderChart(chart)}
              </div>)
          }
        </div>
      </div>
    );
  }
}

export default DashboardLayout;

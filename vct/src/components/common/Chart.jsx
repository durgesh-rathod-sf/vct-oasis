import React, { Component } from 'react';
import './Chart.css';
// import the core library.
import ReactEchartsCore from 'echarts-for-react/lib/core';

// then import echarts modules those you have used manually.
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/custom';
import 'echarts/lib/chart/tree';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip'
import { toJS } from 'mobx';
import DashBoardUtils from '../../stores/Dashboard/DashboardUtils';
class Chart extends Component {
  echarts_react;
  _theme="dark";
  getOption() {
    if (this.props.chart && this.props.chart.data) {
      const data = toJS(this.props.chart.data);
      data.series && data.series.forEach(serie => {
        if (serie.label && serie.label.normal && serie.label.normal.formatterFn) {
          serie.label.normal.formatter = DashBoardUtils[serie.label.normal.formatterFn]
        }

        if (serie.renderItemFn) {
          serie.renderItem = DashBoardUtils[serie.renderItemFn]
        }
      });

      if (this.echarts_react) {
        this.echarts_react.getEchartsInstance().resize();
      }

      return data;
    }
  }
  render() {
    return (
      <div className="panel">
        <div className="titlePanel">{this.props.chart.label}</div>
        <ReactEchartsCore ref={(e) => { this.echarts_react = e; }}
          echarts={echarts} notMerge={true}
          option={this.getOption()} theme={this._theme}></ReactEchartsCore>
      </div>


    );
  }
}

export default Chart;

import React, { Component } from 'react';
import './Chart.css';
import ReactEchartsCore from 'echarts-for-react/lib/core';
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
import DashBoardUtils from './DashboardUtils';

class Charts extends Component {
  echarts_react;
  _theme = "dark";
  dataPopulated = false;



  getOption() {
    if (this.props.chart && this.props.chart.data) {
      const data = toJS(this.props.chart.data);
      this.dataPopulated = false;
      data.series && data.series.forEach(serie => {

        if (serie.data && serie.data.length > 0) {
          this.dataPopulated = true;
        }
        if (serie.label && serie.label.normal && serie.label.normal.formatterFn) {
          serie.label.normal.formatter = DashBoardUtils[serie.label.normal.formatterFn]
        }

        if (serie.renderItemFn) {
          serie.renderItem = DashBoardUtils[serie.renderItemFn]
        }
        if (serie.data && serie.data.length > 0) {
          this.dataPopulated = true;
        }
      });

      if (this.echarts_react && this.dataPopulated) {
        // this.echarts_react.getEchartsInstance().resize();
      }
      return data;
    }
  }




  componentWillUnmount() {
    //this.graph = this.graph.destroy();
    //this.echarts_react = this.echarts_react.current.destroy();
  }

  render() {
    return (
      <div className="panel" id="chartComp">
        <div className="titlePanel">{this.props.chart.label}</div>
        {(this.props.chart.displayTip && this.props.chart.displayTip.position === 'top') ? <div className="displayTip"> <p>{this.props.chart.displayTip.message}</p>
        </div> : ''
        }
        <ReactEchartsCore ref={(e) => { this.echarts_react = e; }}
          echarts={echarts} notMerge={true}
          lazyUpdate={true}
          option={this.getOption()} theme={this._theme}></ReactEchartsCore>
        {
          this.props.frequencyChangeIcon && this.props.disableButton !== "" && this.dataPopulated ?
            <div className=""><button
              disabled={this.props.disableButton === "Yearly" ? true : false}
              key={this.props.key} onClick={() => this.props.frequencyChanged(this.props.chart.data, this.props.keys)}>{this.props.toggleFrequencyIcon ? '+' : '-'}</button> Frequency Type: {this.props.frequencyType}</div>
            : ""
        }
        {(this.props.chart.displayTip && this.props.chart.displayTip.position === 'bottom') ? <div className="displayTip"> <p>{this.props.chart.displayTip.message}</p>
        </div> : ''
        }
      </div >


    );
  }
}

export default Charts;

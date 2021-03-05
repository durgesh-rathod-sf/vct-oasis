import React, { Component } from 'react';
import './TotalChart.css';
import Icons from '../../components/common/Icon';

class TotalChart extends Component {



  render() {
    return (
      <div className={this.props.total.className + " panel totalChart"}>
        <div className="titlePanel">{this.props.total.label}</div>
        <div className="totalValue">{this.props.total.value}</div>
        <div className="totalSubValue">{this.props.total.subvalue}</div>
        <img src={Icons.Dashboard[this.props.total.icon]} alt={this.props.total.label} ></img>
      </div>

    );
  }
}

export default TotalChart;

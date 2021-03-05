import React, { Component } from 'react';
import './TableChart.css';
import Icons from '../../components/common/Icon';

class TableChart extends Component {

  cellRenderer = {
    circle(cellValue) {
      return <div className="circle m-2" title={cellValue.value}></div>
    }
  }



  renderCell(cellValue) {
    if (cellValue['renderer']) {
      const renderer = cellValue['renderer'];
      return this.cellRenderer[renderer](cellValue)
    } else {
      return cellValue;
    }
  }

  render() {
    return (
      <div className=" panel totalChart">
        <div className="titlePanel">{this.props.chart.label}</div>
        <p></p>
        {this.props.chart.data && <table className="m-2">
          <thead><tr>
            {this.props.chart.data.headers.map(h => <th>{h}</th>)}
          </tr></thead>
          <tbody>
            {this.props.chart.data.data.map(record => <tr>{
              record.map((cell) => <td>{this.renderCell(cell)}</td>)
            }</tr>)}
          </tbody>
        </table>}
      </div>

    );
  }
}

export default TableChart;

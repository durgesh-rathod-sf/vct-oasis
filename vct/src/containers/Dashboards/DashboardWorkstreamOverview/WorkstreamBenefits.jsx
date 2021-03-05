import React, { Component } from 'react';
import './DashboardWorkstreamOverview.css';
import ReactTooltip from 'react-tooltip';
// import Icons from '../../components/common/Icon';

import { inject, observer } from 'mobx-react';
@inject('dashboardWorkstreamOverviewStore')
class WorkstreamBenefits extends Component {
  constructor(props) {
    super(props);
    this.state = {
       }
       this.onWorkstreamClick=this.onWorkstreamClick.bind(this);   

}

  // cellRenderer = {
  
    circle(cellValue) {
      return <div><div className={`circle ${cellValue.value.status} ${cellValue.isSelected?"selected":""}`} 
       onClick={(e)=>this.onWorkstreamClick(e,(cellValue.isSelected ? "All" : cellValue.value.Workstream),3)}
        // title=
        data-place="top" data-for={`circle_${cellValue.value.Workstream}`}
        data-tip=""
        />
            <ReactTooltip id={`circle_${cellValue.value.Workstream}`}>
            {/* {`Workstream: ${cellValue.value.Workstream}\nActual Benefits: ${cellValue.value.actualBenefits}\nExpected Benefits: ${cellValue.value.expectedBenefits}\nStatus: ${this.decodeStatus(cellValue.value.status)}`} */}
           <div> Workstream: {cellValue.value.Workstream}</div>
           <div>Actual Benefits: {cellValue.value.actualBenefits}</div>
           <div>Expected Benefits: {cellValue.value.expectedBenefits}</div>
           <div>Status: {this.decodeStatus(cellValue.value.status)}</div>
                </ReactTooltip>
          
        </div>
    }
  
  // }
  onWorkstreamClick(e,wsName,cellIndex){
    //const {dashboardWorkstreamOverviewStore}=this.props;
    // if (!cellValue['renderer']) {
      // console.log(`ws selected => ${cellValue}`)
      this.props.getWs(e,wsName,cellIndex);
    // }
  }


  decodeStatus = (status) => {
    let value = "";
    switch (status) {
        case "CMP_WITHIN_DUE_DT":
            value = "Completed within due date";
            break;
        case "CMP_AFTER_DUE_DT":
            value = "Completed after due date"
            break;
        case "DELAYED":
            value = "Delayed"
            break;
        case "INPROGRESS":
            value = "In Progress"
            break;
        case "NOT_STARTED":
            value = "Not started"
            break;
        case null:
            value = "Not started"
            break;
        default:
            break;
    }
    return value;
}
  renderCell(cellValue,cellIndex) {
    if (cellValue['renderer']) {
      // const renderer = cellValue['renderer'];
      return this.circle(cellValue)
    } else {
      let result = ((cellIndex===0 && cellValue["value"].length > 9) ? `${cellValue["value"].substr(0,9)}...` : cellValue["value"])
      return result;
    }
  }


  render() {

    //const { dashboardWorkstreamOverviewStore } = this.props;
    return (
      <div className=" panel totalChart" id="wsBenefits">
        <div className="titlePanel">{this.props.chart.label}</div>
        <p></p>
        {(this.props.chart.data && this.props.chart.data.data) ?
          <div style={{ overflowY: "auto" }}>
            <table className="m-2" style={{ width: "97%" }}>
              <thead><tr>
                {this.props.chart.data.headers.map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {this.props.chart.data.data.map((record,recIndex) => <tr key={recIndex}>{
                  record.map((cell,cellIndex) =>
                    <td key = {`${cell}_${cellIndex}`} className={`${(cell['renderer']) ? "" : `${(cell.isSelected)?"selected clickable":"clickable"}`} `} 
                      onClick={cell['renderer']?()=>{}:(e)=>this.onWorkstreamClick(e,(cell.isSelected ? "All" : record[0].value),cellIndex)}
                      >{this.renderCell(cell,cellIndex)}</td>)
                }</tr>)}
              </tbody>
            </table>
          </div>
          :""
        }
        <div>
        {this.props.chart.data.statusArr && this.props.chart.data.statusArr.map((record, recIndex) =>(
            
          <span style={{margin:"8% 0% 0% 3%"}} key={recIndex}>
            <div className={`rect ${record}`}/>{` ${this.decodeStatus(record)}`}
         <br/>
            </span>
          ))}
        
        </div>
      </div>

    );
  }
}

export default WorkstreamBenefits;

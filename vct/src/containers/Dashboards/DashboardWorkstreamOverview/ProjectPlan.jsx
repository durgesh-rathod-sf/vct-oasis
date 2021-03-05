import React, { Component } from 'react';
//import './ProjectPlan.css';
import ReactEcharts from "echarts-for-react";
import echarts from "echarts";
import * as _ from "lodash"


var TOP_CHART = 60;
var BOTTOM_CHART = 80;
var WIDTH_FIRST_COLUMN = 120;
var WIDTH_SECOND_COLUMN = 120;
//var HEIGHT_RATIO = 0.6;
var DIM_ACTIVITY = "Activity";
var DIM_DELIVERABLE = "Deliverable";
var DIM_STATUS = "Status";
var DIM_TIME_STARTTIME = "Deliverable Start Time";
var DIM_TIME_ENDTIME = "Deliverable End Time";
var DIM_OWNER = "Owner"
var DIM_START = "Deliverable Start Date";
var DIM_END = "Deliverable End Date";


class ProjectPlan extends Component {

  static _lastActivity = "";
  static _planningBarColors = {
    "Not Started": "#bbb",
    "In Progress": "#4e79a7",
    "Delayed": "#e15759",
    "Completed within due date": "#339933",
    "Completed after due date": "#59a14f",
    
  };
  static _currentStatuses = [];
  static _excludeDeliverable = [];

  _cartesianXBounds = [];
  _cartesianYBounds = [];
  _rawData;
  _autoDataZoomAnimator;
  _theme = "dark";

  _chartOptions = {};

  constructor() {
    super();
    this._rawData = {
      "projectPlan":
      {
        "dimensions": [
          'index',
          { name: DIM_ACTIVITY, type: "ordinal" },
          { name: DIM_DELIVERABLE, type: "ordinal" },
          { name: DIM_STATUS, type: "ordinal" },
          { name: DIM_TIME_STARTTIME, type: "time" },
          { name: DIM_TIME_ENDTIME, type: "time" },
          { name: DIM_OWNER, type: "ordinal" },
          { name: DIM_START, type: "ordinal" },
          { name: DIM_END, type: "ordinal" },
        ],
        "data": []/*[
                    ["A1.1","D1.1.1","Completed after due date",1496890500000,1573430400000], 
                    ["A1.1","D1.1.2","In Progress",1496904000000,1496919600000],
                    ["A1.1","D1.1.3","Not Started",1496919600000,1606829694560],
                    ["A1.1","D1.1.1","Completed",1496890500000,1496904000000], 
                    ["A1.1","D1.1.2","In Progress",1496904000000,1496919600000],
                    ["A1.1","D1.1.1","Delayed",1496890500000,1496904000000], 
                    ["A1.1","D1.1.2","In Progress",1496904000000,1496919600000],
                    ["A1.1","D1.1.3","Not Started",1496919600000,1496923200000],
                    ["A2.1","D2.1.1","In Progress",1496890500000,1496923200000],
                    ["A2.1","D2.1.2","In Progress",1496890500000,1496923200000],
                    ["A2.1","D2.1.3","In Progress",1496890500000,1496904000000], 
                    ["A3.1","D3.1.2","Not Started",1496904000000,1496919600000],
                    
                    ["A4.1","D4.1.1","Completed",1496890500000,1496904000000], 
                    ["A4.1","D4.1.2","Not Started",1496904000000,1496919600000],
                    ["A4.1","D4.1.3","Not Started",1496919600000,1496923200000]
                ]*/
      }
    };

    // We must order by Activity/Deliverable???
    // We can work is lodash library to order as we need

    // In this case apply a Reverse to change the row order
    /*this._rawData.projectPlan.data = this._rawData.projectPlan.data.reverse();
    // And remove the entry Activity to be presented only one time
    this._rawData.projectPlan.data.forEach((item, index, arr) => {
      if (index !== 0 && item[0] === arr[index - 1][0]) {
        arr[index - 1][0] = '';
      }
      return item;
    });*/
  }

  render() {
    return (
      <div className="panel totalChart">
        <div className="titlePanel">{this.props.chart.label}</div>
        {(this.props.chart.data && this.props.chart.data.length > 0) ?
        <ReactEcharts
          theme={this._theme}
          option={this.getGanttChartOption()}
        ></ReactEcharts>
     : ""}
      </div>
    );
  }

  getGanttChartOption() {
    this._rawData.projectPlan.data = this.props.chart.data
    this._rawData.projectPlan.data = this._rawData.projectPlan.data.slice().reverse();
    this._rawData.projectPlan.data.forEach((item, index, arr) => {
      if (index !== 0 && item[0] === arr[index - 1][0]) {
        arr[index - 1][0] = '';
      }
      return item;
    });
    ProjectPlan._excludeDeliverable = this.props.excludeDeliverables
    this.getBasicChartOption();
    this.addZoomOption();
    this.addAxisX();
    this.addAxisY();
    this.addSeriesAndLegends();
    return this._chartOptions;
  }

  getBasicChartOption() {
    this._chartOptions = {
      tooltip: {
      },
      animation: false,
      backgroundColor: 'transparent',
      //            title: {
      //                text: 'Project Plan',
      //                left: 'center'
      //            },
      grid: {
        show: true,
        top: TOP_CHART,
        bottom: BOTTOM_CHART - 20,
        left: WIDTH_FIRST_COLUMN + WIDTH_SECOND_COLUMN,
        right: 20,
        backgroundColor: 'transparent',
        borderWidth: 0,
        height:"50%",
        // containLabel: true
      },
      toolbox: {
        show: true,
        // showTitle: false,
        top: TOP_CHART - 60,
        // orient: 'vertical',
        right: 10,
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            title: {
              zoom: 'Zoom in',
              back: 'Zoom out'
            },
          },
          restore: {
            title: 'Restore',
          },
          saveAsImage: {
            title: 'Save as image',
            type: 'png',
            backgroundColor: 'gray'
          }
        }
      },
      color: []
    }
  }

  addZoomOption() {
    this._chartOptions.dataZoom = [
      /** HORIZONTAL SCROLL + ZOOM **/
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
        height: 10,
        bottom: BOTTOM_CHART+35 ,
        // BOTTOM_CHART - (20 * 2),
        start: 0,
        end: 100,   // Horizontal Scroll Covered in Porcentage
        handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        showDetail: false
      }, {
        type: 'inside',
        id: 'insideX',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
        start: 0,
        end: 100, // Horizontal Scroll Covered in Porcentage
        zoomOnMouseWheel: false,
        moveOnMouseMove: true
      }
      /** VERTICAL SCROLL **/
      ,
      {
        show: true,
        yAxisIndex: 0,
        filterMode: 'empty',
        //width: 30,
        // height: '80%',
        showDetail: false,
        showDataShadow: false,
        right: 10,
        width: 10,
        top: TOP_CHART,
        bottom: BOTTOM_CHART+44 ,
        //start: 45,
        start: ((this._rawData.projectPlan.data.length * 100) / 45),
        end: 100,
        handleSize: 0
      }
    ]
  }

  addAxisX() {
    this._chartOptions.xAxis = {
      type: 'time',
      position: 'bottom',
      axisTick: { show: false },
      splitLine: { show: false },

      axisLine: {
        show: false
      },
      axisLabel: {
        rotate: 90,
        inside: false,
        padding:10,
        // align: 'top',
        fontSize: 10,
        formatter: (function (value) {
          const date = new Date(value);
          //console.log(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        })
      }
    }
  }

  addAxisY() {
    this._chartOptions.yAxis = [
      {
        axisTick: { show: false },
        splitLine: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
        min: 0,
        max: this._rawData.projectPlan.data.length
      },
      {
        name: 'Deliverable',
        nameLocation: 'start',
        nameTextStyle: {
          fontWeight: 'bold'
        },
        position: 'left',
        offset: 95,
        axisLine: {
          onZero: false,
          show: false
        },
        axisTick: {
          length: 70,
          inside: true,
        },
        axisLabel: {
          inside: true
        },
        inverse: true,
        encode: 1    // Data Column Origin
      },
      {
        name: 'Activity',
        nameLocation: 'start',
        nameTextStyle: {
          fontWeight: 'bold'
        },
        position:'left',
        offset: 205,
        axisLine: {
          onZero: false,
          show: false
        },
        axisTick: {
          length: 100,
          inside: true,
        },
        axisLabel: {
          inside: true
        },
        inverse: true,
        encode: 1   // Data Column Origin
      }
    ]
  }

  addSeriesAndLegends() {
    this._chartOptions.series = [];

    this._chartOptions.color.push("transparent");
    this._chartOptions.series.push(
      {
        id: 'Activity',
        name: 'Activity',
        type: 'custom',
        renderItem: this.renderAxisActivityLabelItem,
        dimensions: this._rawData.projectPlan.dimensions,
        encode: {
          x: -1, // Then this series will not controlled by x.
          y: 0,
          tooltip: ['-', DIM_ACTIVITY]
        },
        data: echarts.util.map(this._rawData.projectPlan.data, function (item, index, arr) {
          return [index].concat(item);
        })
      }
    );

    this._chartOptions.color.push("transparent");
    this._chartOptions.series.push(
      {
        id: 'Deliverables',
        name: 'Deliverables',
        type: 'custom',
        renderItem: this.renderAxisLabelItem,
        dimensions: this._rawData.projectPlan.dimensions,
         encode: {
          x: -1, // Then this series will not controlled by x.
          y: 0, //[DIM_ACTIVITY, DIM_DELIVERABLE],
          tooltip: ['-', DIM_DELIVERABLE, DIM_STATUS]//[DIM_DELIVERABLE, DIM_STATUS, DIM_TIME_STARTTIME, DIM_TIME_ENDTIME]
        },
        data: echarts.util.map(this._rawData.projectPlan.data, function (item, index) {
          return [index].concat(item);
        })
      }
    );

    let groupedByStatus = _.groupBy(this._rawData.projectPlan.data, function (data) {
      return data[2];
    });

    var arrayStatusAvailable = Object.keys(groupedByStatus);
    let arrayStatusAvailableLegend = [];
    let arrayStatusAvailableLoop = arrayStatusAvailable.map(status =>{
        if(status !== "-"){
          arrayStatusAvailableLegend.push(status);
        }
        return true})

    ProjectPlan._currentStatuses = arrayStatusAvailableLegend
        
    this._chartOptions.legend = {
      left: 'left',
      bottom: 0,
      height:"200px",
      // top:250,
      type: 'scroll',
      orient: 'vertical',
      position:'bottom',
      data: arrayStatusAvailableLegend
    }

    arrayStatusAvailableLegend.forEach((statusName) => {
      // this._chartOptions.color.push(JSON.parse(JSON.stringify(ProjectPlan._planningBarColors[statusName])));
      this._chartOptions.series.push({
        id: statusName,
        name: statusName,
        type: 'custom',
        renderItem: this.renderGanttItem,
        dimensions: this._rawData.projectPlan.dimensions,
        itemStyle: {
          normal: {
              color: ProjectPlan._planningBarColors[statusName]
          }
      },
        encode: {
          x: [DIM_TIME_STARTTIME, DIM_TIME_ENDTIME],
          y: DIM_ACTIVITY,
          tooltip: [DIM_DELIVERABLE, DIM_START,DIM_END, DIM_OWNER,]
        },
        data: echarts.util.map(this._rawData.projectPlan.data, function (item, index) {
          if (item[2] == statusName) {
            return [index].concat(item);
          }

        })
      });
    });

  };

  renderAxisActivityLabelItem(params, api) {
    var y = api.coord([0, api.value(0)])[1];
    console.log(api.value(1));
    if (y < params.coordSys.y + 5) {
      return;
    }
    return {
      type: 'group',
      position: [
        10,
        y
      ],
      children: [{
        type: 'text',
        style: {
          // padding:5,
          x: 2,
          y: -3,
          text: (api.value(1)!==null ? api.value(1).length > 9 ? `${api.value(1).substr(0,9)}...` : api.value(1) : ""),
          textVerticalAlign: 'bottom',
          textAlign: 'left',
          textFill: '#fff' //'#000' //'#fff'
        }
      }]
    };
  }


  renderAxisLabelItem(params, api) {
    var y = api.coord([0, api.value(0)])[1];
    if (y < params.coordSys.y + 5) {
      return;
    }
    return {
      type: 'group',
      position: [
        WIDTH_FIRST_COLUMN,
        y
      ],
      children: [{
        type: 'text',
        style: {
          x: -5,
          y: -3,
          text: (api.value(2)!== null ? api.value(2).length > 9 ? `${api.value(2).substr(0,9)}...` : api.value(2) : ""),
          textVerticalAlign: 'bottom',
          textAlign: 'left',
          textFill: '#fff' //'#000' //'#fff'
        }
      }]
    };
  }


  renderGanttItem(params, api) {
    //console.log("renderGanttItem: " + api.value(0) + " " + api.value(1) + " " + api.value(2) + " " + api.value(3) + " " + api.value(4) + " " + api.value(5) + " ");
    var status = api.value(3);
    var deliverableName = api.value(2);
    if(ProjectPlan._currentStatuses.indexOf(status) !== -1 && ProjectPlan._excludeDeliverable.indexOf(deliverableName) === -1)
      {
        var categoryIndex = api.value(0); // api.value(DIM_CATEGORY_INDEX);
        var startTime = api.coord([api.value(4), categoryIndex]);
        var endTime = api.coord([api.value(5), categoryIndex]);

        //console.log("renderGanttItem: categoryIndex(" + categoryIndex + ")  startTime(" + startTime + ") endTime(" + endTime + ")");
        var barLength = endTime[0] - startTime[0];
        var barHeight =  20
        // api.size([0, 1])[1] * HEIGHT_RATIO;
        var x = startTime[0];
        var y = startTime[1] - (barHeight);

        //console.log("renderGanttItem: x, y(" + x + ", " + y + ")  width, height(" + barLength + ", " + barHeight + ")");
        var rectNormal = ProjectPlan.clipRectByRect(params, {
          x: x, y: y, width: barLength, height: (barHeight-1)
        });

        //console.log("renderGanttItem - rectNormal: " + rectNormal);

        return {
          type: 'group',

          children:[{
            type: 'rect',
            ignore: !rectNormal,
            shape: rectNormal,
            style: api.style({ fill: ProjectPlan._planningBarColors[status] })
          }]
        }
      }
  }

  static clipRectByRect(params, rect) {
    return echarts.graphic.clipRectByRect(rect, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });
  }

}
export default ProjectPlan;


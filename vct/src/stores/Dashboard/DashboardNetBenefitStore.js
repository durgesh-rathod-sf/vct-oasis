import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow, toJS } from "mobx";
import { toast } from 'react-toastify';
 import React from 'react';
 import NotificationMessage from "../../components/NotificationMessage/NotificationMessage";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "../../containers/Dashboards/DashboardUtils";
var SessionStorage = require('store/storages/sessionStorage')


export default class DashBoardNetBenefitStore {

  @observable filters = {};
  @observable totalcharts = {};
  @observable charts = {};
  @observable loader = false;
  // @observable initDashboard 
  // @observable onFilterChanged
  constructor() {
    makeObservable(this,
      {
        filters: observable,
        totalcharts: observable,
        charts: observable,
        loader :observable,
        initDashboard: action,
        onFilterChanged: action
      });
  }

  filters = {
    FilterView: {
      value: null,
      label: "Select View",
      id: "FilterView",
      isMulti: false,
      options: []
    }, FilterVDT: {
      value: null,
      label: "Select VDT Element",
      id: "FilterVDT",
      isMulti: true,
      options: []

    }, FilterYear: {
      label: "Select Year",
      id: "FilterYear",
      isMulti: true,
      options: []
    }, FilterChartType: {
      value: { value: "Absolute Value", label: "Absolute Value" },
      label: "Select Chart Type",
      id: "FilterChartType",
      isMulti: false,
      options: [
        { value: "Absolute Value", label: "Absolute Value" },
        { value: "Percentage", label: "Percentage" },
        /*{ value: "Low", label: "Sensitivity (Low)" },
        { value: "High", label: "Sensitivity (High)" }*/
      ]
    },
  };
  charts = {
    GrossBenefits: {

      label: 'Net Benefits',

      data: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          //formatter: 'Category : {b0}<br />Net Benefit : {c0}'
          formatter: function (params) {
            if (params[1].seriesName !== 'totals') {
              let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value).split("$")[1];
              x = params[1].seriesName === 'Percentage' && x.includes("(") ? `(${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x.split("(")[1].split(")")[0])})` : x;
              return `Category : ${params[1].name}<br />${ params[1].seriesName === 'Percentage' ? 'NB Percent' : 'Net Benefit'} : ${params[1].seriesName === 'Percentage' ? ` ${x}%` : `$ ${x}`} `;
            }
          }
        },
        grid: {
          y2: 95,
          width: "85%"
        },

        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            rotate: 90,
            fontSize: 10,
            rich: {
              height: '0'
            }
            ,
            formatter: function (value) {
              let x = `${(value.length > 15) ? `${value.substr(0, 14)}...` : (value)}`;
              return x;
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            // fontSize: 10,
            formatter: function (value) {
              let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
              return x;
            }
          },
        },
        series: [{

          data: [],
          type: 'bar'
        }]
      }
    },
    GrossBenefitsOverTime: {
      label: 'Net Benefit Over Time ($)',
      data: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          //formatter: 'Year : {b0}<br />Net Benefit : {c0}'
          formatter: function (params) {
            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value).split("$")[1];
            return `Year : ${params[0].axisValue}<br />${ params[0].seriesName === 'Percentage' ? 'NB Percent' : 'Net Benefit'} : ${params[0].seriesName === 'Percentage' ? `${x}%` : `$ ${x}`} `;
          }
        },
        xAxis: {
          type: 'category',
          axisLabel: { fontSize: 10, },
          data: []
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            // fontSize: 10,
            formatter: function (value) {
              let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
              return x;
            }
          },
        },
        grid: {
          y2: 95,
          width: "85%"

        },
        series: [{
          data: [],
          type: 'line'
        }]
      }
    }
  };
  totalcharts = {
    NetBenefits:
    {
      label: 'TOTAL NET BENEFITS',
      value: '',
      icon: 'benefits'
    },
    NetValue: {
      label: 'NET PRESENT VALUE',
      value: '',
      icon: 'currency_dash'
    },
    PaybackPeriod: {
      label: 'PAYBACK PERIOD',
      value: '',
      icon: 'variance_dash'
    }

  };
  dbData = [];
 

  createSructure(data) {

    let ResultArr = [];
    let newObj = {}
    data && data.map((dataObj) => {
      dataObj && dataObj.objectiveDetailList.map((eachObj) => {
        eachObj && eachObj.benefitOvertimeList.map((eachYearObj) => {
          newObj = {
            "objective": dataObj.objective,
            "objective_detail": eachObj.elementName,
            "benefit_value": eachYearObj.netBenefit,
            "year": eachYearObj.year,
            "totalNetBenefit_Objective": eachObj.totalNetBenefit,
            "totalNetBenefits": dataObj.totalNetBenefits,
            "netPresentValue": dataObj.netPresentValue,
            "payBackPeriod": dataObj.payBackPeriod
            // "financial_objective": "NEW FO 01",
          }
          ResultArr.push(newObj);
        })
      })

    })
    let valueDriver = [];
    let financialObjective = [];
    let businessObjective = [];
    let opkpi = [];
    let workStream = [];
    ResultArr.length > 0 && ResultArr.map((data, index) => {
      if (data.objective === "Value Driver") {
        valueDriver.push(data)
      }
      else if (data.objective === "Business Objective") {
        businessObjective.push(data)
      }
      else if (data.objective === "Financial Objective") {
        financialObjective.push(data)
      }
      else if (data.objective === "Operational KPI") {
        opkpi.push(data)
      }
      else if (data.objective === "Work Stream") {
        workStream.push(data)
      }
    });

    ResultArr = [];
    if (valueDriver.length > 0 || financialObjective.length > 0 || businessObjective.length > 0 || opkpi.length > 0 || workStream.length > 0) {

      if (financialObjective.length > 0) {
        financialObjective = _.sortBy(financialObjective, 'objective_detail');
        financialObjective.map((data, index) => {
          ResultArr.push(data);
        })
      }
      if (businessObjective.length > 0) {
        businessObjective = _.sortBy(businessObjective, 'objective_detail');
        businessObjective.map((data, index) => {
          ResultArr.push(data);
        })
      }
      if (valueDriver.length > 0) {
        valueDriver = _.sortBy(valueDriver, 'objective_detail');
        valueDriver.map((data, index) => {
          ResultArr.push(data);
        })
      }
      if (opkpi.length > 0) {
        opkpi = _.sortBy(opkpi, 'objective_detail');
        opkpi.map((data, index) => {
          ResultArr.push(data);
        })
      }
      if (workStream.length > 0) {
        workStream = _.sortBy(workStream, 'objective_detail');
        workStream.map((data, index) => {
          ResultArr.push(data);
        })
      }
    }


    return ResultArr;

  }

  @action
  resetDashboard() {
    this.filters.FilterView.options = [];
    this.filters.FilterView.value = null;
    this.filters.FilterVDT.options = [];
    this.filters.FilterVDT.value = null;
    this.filters.FilterYear.options = [];
    this.filters.FilterYear.value = null;
    this.filters.FilterChartType.value = this.filters.FilterChartType.options[0];

    this.totalcharts.NetBenefits.value = '';
    this.totalcharts.NetValue.value = '';
    this.totalcharts.PaybackPeriod.value = '';

    this.charts.GrossBenefits.data.series = [];
    this.charts.GrossBenefitsOverTime.data.series = [];

    this.dbData = null;

  }

  @action 
  showNotification = (message, title, type) => {
      if (type === 'error') {
          toast.error(<NotificationMessage
              title={title}
              bodytext={message}
              icon={type}
          />, {
              position: toast.POSITION.BOTTOM_RIGHT
          });
      }
      if (type === 'success') {
          toast.info(<NotificationMessage
              title={title}
              bodytext={message}
              icon={type}
          />, {
              position: toast.POSITION.BOTTOM_RIGHT
          });
      }

  }




  @action
  initDashboard = flow(function* () {
    // const mapId = localStorage.getItem('mapId');
    this.loader = true;
    let dashboardHelper = new DashboardHelper();
    dashboardHelper.getNetBenefitOver(SessionStorage.read('mapId'))
      .then(res => {
        if (res && res.data.resultCode === "OK" && res.data.errorDescription === null) {

          this.dbData = this.createSructure(res.data.resultObj);
          console.log("db data in", this.dbData);
          this.populateViewFilter(this.dbData, this.filters);
          this.populateFilter(this.dbData, this.filters);
          this.updateCharts();
          this.loader = false;
        }
        else {
          this.loader = false;
          this.showNotification(res.data.errorDescription, "Error", "error");
          return res;
         
        }

      }).catch((e)=>{
        this.loader = false;
        this.showNotification("Sorry! SOmething went wrong", "Error", "error");
        return e.response;
      });

    // if(res && res.data.resultCode === "OK"){

    //   this.dbData = this.createSructure(res.data.resultObj);
    //   console.log("db data in", this.dbData);
    //   this.populateViewFilter(this.dbData, this.filters);
    //   this.populateFilter(this.dbData, this.filters);
    //   this.updateCharts();
    // }
    console.log("db data", this.dbData);

    //this.dbData = yield DashboardHelper.getNetBenefits(SessionStorage.read('mapId'));

    console.log("db data", this.dbData)

  })


  populateViewFilter(dbData, filters) {
    filters.FilterView.options.replace(_.uniq(dbData.map(a => a.objective)).map(objective => { return { value: objective, label: objective } }))
    filters.FilterView.value = filters.FilterView.options[0];
  }

  populateFilter(dbData, filters) {
    const viewData = _.filter(dbData, { objective: filters.FilterView.value.value });
    filters.FilterYear.options = _.uniq(viewData.map(a => a.year)).map(y => { return { value: y, label: `Year ${y}` } })
    filters.FilterYear.value = filters.FilterYear.options; //Select all

    filters.FilterVDT.options = _.uniq(viewData.map(a => a.objective_detail)).map(f_obj => { return { value: f_obj, label: f_obj } })
    filters.FilterVDT.value = filters.FilterVDT.options; // Select all

  }

  @action
  onFilterChanged(selectedOption, filter) {
    console.log("Filter changed!!!");

    if (filter.id === 'FilterYear') {
      selectedOption = _.sortBy(selectedOption, 'value');
    }
    if (filter.id === 'FilterVDT') {
      selectedOption = _.sortBy(selectedOption, 'value');
    }
    filter.value = selectedOption;

    this.filters[filter.id] = Object.assign({}, filter);
    if (filter.id === 'FilterView')
      this.populateFilter(this.dbData, this.filters);
    this.updateCharts();
    //this.charts = makeAutoObservable(this.charts);

  }

  updateCharts() {
    this.totalcharts = this.populateTotalCharts(this.dbData, this.filters, this.totalcharts);
    this.charts = this.populateGrossBenefitChart(this.dbData, this.filters, this.charts);
    this.charts = this.populateGrossBenefitOverTimeChart(this.dbData, this.filters, this.charts);
  }


  /**
  * Updates Gross Benefit Chart according to filter values and backend data
  * @param {*} dbData Initial data obtained from backend
  * @param {*} filters Filters object
  * @param {*} charts Chart object
  */
  populateTotalCharts(dbData, filters, charts) {
    // First of all filter data according to filter dropdown values
    const filteredData = this.filterData(dbData, filters);
    // Then calculate totals
    charts.NetBenefits.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(this.getNetBenefit(filteredData));
    charts.NetValue.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(this.getNetValue(filteredData));
    charts.PaybackPeriod.value = (this.getPaybackPeriod(filteredData));
    charts.NetBenefits.unroundedValue =DashBoardUtils.currencyFormatterNoRound(this.getNetBenefit(filteredData));
    charts.NetValue.unroundedValue = DashBoardUtils.currencyFormatterNoRound(this.getNetValue(filteredData));
    charts.PaybackPeriod.unroundedValue = (this.getPaybackPeriod(filteredData));

    return charts;
  }

  /**
   *  Calculates the total benefit value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getNetBenefit(filteredData) {
    return _.sumBy(filteredData, 'benefit_value');
  }
  /**
   *  Calculates the total cost reduction value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getNetValue(filteredData) {
    return (filteredData !== undefined && filteredData.length > 0) ? filteredData[0].netPresentValue : 0; //TODO
  }
  /**
   *  Calculates the total revenue value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getPaybackPeriod(filteredData) {
    return (filteredData !== undefined && filteredData.length > 0) ? filteredData[0].payBackPeriod : ''; //TODO 
  }

  filterData(dbData, filters) {
    if (filters.FilterVDT.value == null || filters.FilterYear.value == null) return [];
    return dbData.filter(record => {
      return ((record.objective === filters.FilterView.value.value) &&  //Objetive selected
        (filters.FilterVDT.value.map(f => f.value).indexOf(record.objective_detail) !== -1) && // VDT Selected
        (filters.FilterYear.value.map(f => f.value).indexOf(record.year) !== -1)) // Year selected
    })
  }

  /**
   * Updates Gross Benefit Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateGrossBenefitChart(dbData, filters, charts) {
    const filteredData = this.filterData(dbData, filters);
    let totals = []
    let acc_totals = []
    let formatterFn = 'currencyFormatter';
    console.log("filteredData", filteredData)

    if (filteredData !== [] && filteredData.length && filteredData.length > 0) {
      charts.GrossBenefits.data.xAxis.data = (filters.FilterYear.value) ? [...filters.FilterVDT.value.map(f => f.label), 'Grand Total'] : [];
      charts.GrossBenefits.data.series = [];
      charts.GrossBenefits.data.grid.width = '85%';
      charts.GrossBenefits.data.grid.left = 50;
      _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
        let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
        // acc_totals.push(_.sum(totals));
        //  acc_totals.push(totals);
        acc_totals.push(_.sum(totals));
        totals.push(_.sumBy(filterVDTData, 'benefit_value'))
      })
      // Grand total
      const grandTotal = _.sum(totals)
      totals.push(grandTotal);
      acc_totals.push(0);

      if (filters.FilterChartType.value.value === 'Percentage') {
        formatterFn = 'percentageFormatter';
        totals = DashBoardUtils.getPercentage(totals, grandTotal)
        acc_totals = DashBoardUtils.getPercentage(acc_totals, grandTotal)
      }
    }
    else {
      charts.GrossBenefits.data.grid.width = undefined;
      //charts.GrossBenefits.data.grid.left = 10;
      charts.GrossBenefits.data.xAxis.data = [];
      charts.GrossBenefits.data.grid.height = undefined;
      //charts.GrossBenefits.data.grid.width = undefined;
      charts.GrossBenefits.data.grid.left = 50;
      charts.GrossBenefits.data.series = [];
    }




    charts.GrossBenefits.data.series.push({
      name: 'totals',
      type: 'bar',
      stack: 'benefit',
      itemStyle: {
        barBorderColor: 'rgba(0,0,0,0)',
        color: 'rgba(0,0,0,0)'
      },
      emphasis: {
        itemStyle: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
        }
      },
      data: acc_totals
    });
    charts.GrossBenefits.data.series.push({
      type: 'bar',
      name: filters.FilterChartType.value.value,
      stack: 'benefit',
      itemStyle: {
        color: '#77bef7'
      },
      /*label: {
        normal: {
          show: true,
          formatterFn,
          // color: '#fff'
        }
      },*/
      data: totals
    })





    if (filters.FilterChartType.value.value === 'High' || filters.FilterChartType.value.value === 'Low') {
      const sensitivityData = (filters.FilterChartType.value.value === 'Low') ? DashBoardUtils.getSentivityData(totals, 0.90) : DashBoardUtils.getSentivityData(totals, 1.10)

      charts.GrossBenefits.data.series.push({
        type: 'custom',
        renderItemFn: 'renderSensitivity',
        z: 100,
        data: _.zip(charts.GrossBenefits.data.xAxis.data, totals, sensitivityData, acc_totals)
      })

    }


    return charts;
  }
  /**
   * Updates Gross Benefit Over time Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateGrossBenefitOverTimeChart(dbData, filters, charts) {
    const filteredData = this.filterData(dbData, filters);
    const showTotals = true;
    let formatterFn = 'currencyFormatter';
    console.log("filteredData2", filteredData)
    if (filteredData !== [] && filteredData.length && filteredData.length > 0) {
      charts.GrossBenefitsOverTime.data.xAxis.data = (filters.FilterYear.value) ? filters.FilterYear.value.map(f => f.label) : [];
      charts.GrossBenefitsOverTime.data.series = [];
      charts.GrossBenefitsOverTime.data.grid.width = '85%';
      charts.GrossBenefitsOverTime.data.grid.left = 50;
      if (showTotals) {
        let totals = _(filteredData).groupBy('year').map(a => _.sumBy(a, 'benefit_value')).value();
        if (filters.FilterChartType.value.value === 'Percentage') {
          formatterFn = 'percentageFormatter';
          totals = DashBoardUtils.getPercentage(totals, _.sum(totals))
        }

        charts.GrossBenefitsOverTime.data.series.push({
          type: 'line',
          name: filters.FilterChartType.value.value,
          itemStyle: {
            color: '#77bef7'
          },
          /*label: {
            normal: {
              show: true,
              formatterFn,
              // color: '#fff'
            }
          },*/
          data: totals
        })

      } else {
        _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
          let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
          charts.GrossBenefitsOverTime.data.series.push({
            name: filters.FilterChartType.value.value,
            type: 'line',
            itemStyle: {
              color: '#77bef7'
            },
            label: {
              normal: {
                show: true,
                formatterFn,
                // color: '#fff'
              }
            },
            data: filterVDTData.map(d => d.benefit_value)
          })
        })
      }

    }
    else {
      charts.GrossBenefitsOverTime.data.grid.width = undefined;
      //charts.GrossBenefitsOverTime.data.grid.left = 10;
      charts.GrossBenefitsOverTime.data.xAxis.data = [];
      charts.GrossBenefitsOverTime.data.series = [];
      charts.GrossBenefitsOverTime.data.grid.height = undefined;
     // charts.GrossBenefitsOverTime.data.grid.width = undefined;
      charts.GrossBenefitsOverTime.data.grid.left = 50;
    }
    return charts;

  }

}
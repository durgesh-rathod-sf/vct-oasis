import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow } from "mobx";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "./DashboardUtils";


export default class DashboardInvestmentTrackingOverviewStore {
  filters = {
    FilterView: {
      value: { value: "Cost Category", label: "Cost Category" },
      label: "Select View",
      id: "FilterView",
      isMulti: false,
      options: []
    }, FilterElem: {
      value: { value: "all", label: "(All)" },
      label: "Select Element/Category",
      id: "FilterElem",
      isMulti: true,
      options: []

    }, FilterYear: {
      value: { value: "all", label: "(All)" },
      label: "Select Year",
      id: "FilterYear",
      isMulti: true,
      options: []
    }
  };
  charts = {
    Investment: {

      label: 'Investment ($)',
      data: {
        backgroundColor: 'transparent',
        tooltip: {
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        legend: {
          data: ['Capex', 'Opex']
        },
        series: [{
          data: [],
          type: 'bar'
        }]
      }
    },
    InvestmentOverTime: {
      label: 'Investment Over Time ($)',
      data: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        legend: {
          data: ['Capex', 'Opex']
        },
        series: [{
          data: [],
          type: 'line'
        },
        ]
      }
    }
  };
  totalcharts = {
    TotalInvestment:
    {
      label: 'TOTAL INVESTMENT',
      value: '$ 156K',
      icon: 'Currency'
    },
    TotCapex: {
      label: 'TOTAL Capex',
      value: '$ 130K',
      icon: 'TotCapex'
    },
    TotOpex: {
      label: 'TOTAL Opex',
      value: '$ 26K',
      icon: 'TotOpex'
    }

  };
  dbData = [];
  constructor() {
    makeObservable(this,
      {
        filters: observable,
        totalcharts: observable,
        charts: observable,
        initDashboard: action,
        onFilterChanged: action
      });
  }


  initDashboard() {
    const mapId = SessionStorage.read('mapId');
    this.dbData = [];



    //this.populateViewFilter(this.dbData, this.filters);
    // this.populateFilter(this.dbData, this.filters)
    //this.filters = initfilters;
    this.updateCharts();
    //this.filters = makeAutoObservable(this.filters);//, initfilters);
  }


  populateViewFilter(dbData, filters) {
    filters.FilterView.options.replace(_.uniq(dbData.map(a => a.objective)).map(objective => { return { value: objective, label: objective } }))
    filters.FilterView.value = filters.FilterView.options[0];
  }

  populateFilter(dbData, filters) {
    const viewData = _.filter(dbData, { objective: filters.FilterView.value.value });
    filters.FilterYear.options = _.uniq(viewData.map(a => a.year)).map(y => { return { value: y, label: `Year ${y}` } })
    filters.FilterYear.value = filters.FilterYear.options; //Select all

    filters.FilterElem.options = _.uniq(viewData.map(a => a.Objective_detail)).map(f_obj => { return { value: f_obj, label: f_obj } })
    filters.FilterElem.value = filters.FilterElem.options; // Select all

  }

  onFilterChanged(selectedOption, filter) {
    console.log("Filter changed!!!");

    filter.value = selectedOption;
    this.filters[filter.id] = Object.assign({}, filter);
    if (filter.id === 'FilterView')
      this.populateFilter(this.dbData, this.filters);
    this.updateCharts();
    //this.charts = makeAutoObservable(this.charts);

  }

  updateCharts() {
    //this.totalcharts = this.populateTotalCharts(this.dbData, this.filters, this.totalcharts);
    this.charts = this.populateInvestmentChart(this.dbData, this.filters, this.charts);
    this.charts = this.populateInvestmentOverTimeChart(this.dbData, this.filters, this.charts);
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
    charts.GrossBenefits.value = DashBoardUtils.currencyFormatter(this.getTotalBenefit(filteredData));
    charts.CostReduction.value = DashBoardUtils.currencyFormatter(this.getTotalCostReduction(filteredData));
    charts.RevenueUplift.value = DashBoardUtils.currencyFormatter(this.getTotalRevenueUplift(filteredData));

    return charts;
  }

  /**
   *  Calculates the total benefit value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getTotalBenefit(filteredData) {
    return _.sumBy(filteredData, 'benefit_value');
  }
  /**
   *  Calculates the total cost reduction value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getTotalCostReduction(filteredData) {
    return _.sumBy(_.filter(filteredData, d => d.financial_objective != null && d.financial_objective.toLowerCase().indexOf('cost') !== -1), 'benefit_value');
  }
  /**
   *  Calculates the total revenue value
   * @param {*} filteredData Array of filtered records
   * @returns total amount
   */
  getTotalRevenueUplift(filteredData) {
    return _.sumBy(_.filter(filteredData, d => d.financial_objective != null && d.financial_objective.toLowerCase().indexOf('revenue') !== -1), 'benefit_value');
  }

  filterData(dbData, filters) {
    if (filters.FilterElem.value == null || filters.FilterYear.value == null) return [];
    return dbData.filter(record => {
      return ((record.objective === filters.FilterView.value.value) &&  //Objetive selected
        (filters.FilterElem.value.map(f => f.value).indexOf(record.Objective_detail) !== -1) && // VDT Selected
        (filters.FilterYear.value.map(f => f.value).indexOf(record.year) !== -1)) // Year selected
    })
  }

  /**
   * Updates Gross Benefit Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateInvestmentChart(dbData, filters, charts) {
    const filteredData = null;//this.filterData(dbData, filters);
    let totalsCapex = [3000000, 1500000]
    let totalsOpex = [0, 1500000]
    let acc_totals = [0, 3000000]
    let formatterFn = 'currencyFormatter';


    if (filteredData !== []) {
      charts.Investment.data.xAxis.data = ['100G', 'Spectrum', 'Grand Total'];

      /*_.uniqBy(filteredData, 'Objective_detail').forEach(vdt => {
        let filterVDTData = _.filter(filteredData, { Objective_detail: vdt.Objective_detail });
        acc_totals.push(_.sum(totals));
        totals.push(_.sumBy(filterVDTData, 'benefit_value'))
      })*/
      // Grand total

      totalsCapex.push(_.sum(totalsCapex));
      totalsOpex.push(_.sum(totalsOpex));
      acc_totals.push(0);


    }



    charts.Investment.data.series = [
      {
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
      }, {
        name: 'Capex',
        type: 'bar',
        stack: 'benefit',
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
        data: totalsCapex
      }, {
        name: 'Opex',
        type: 'bar',
        stack: 'benefit',
        itemStyle: {
          color: '#999'
        },
        label: {
          normal: {
            show: true,
            formatterFn,
            // color: '#fff'
          }
        },
        data: totalsOpex
      }]

    return charts;
  }
  /**
   * Updates Gross Benefit Over time Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateInvestmentOverTimeChart(dbData, filters, charts) {
    const filteredData = null;//s.filterData(dbData, filters);
    const totalCapex = [1500000, 1500000, 1500000, 0, 0, 0]
    const totalOpex = [500000, 500000, 500000, 0, 0, 0]
    let formatterFn = 'currencyFormatter';
    if (filteredData !== []) {
      charts.InvestmentOverTime.data.xAxis.data = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];//(filters.FilterYear.value) ? filters.FilterYear.value.map(f => f.label) : [];
      charts.InvestmentOverTime.data.series = [
        {
          name: 'Capex',
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
          data: totalCapex
        }, {
          name: 'Opex',
          type: 'line',
          itemStyle: {
            color: '#999'
          },
          label: {
            normal: {
              show: true,
              formatterFn,
              // color: '#fff'
            }
          },
          data: totalOpex
        }];
    }
    return charts;

  }

}
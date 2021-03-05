import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow } from "mobx";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "./DashboardUtils";


export default class DashboardBenefitTrackingOverviewStore {
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
        { value: "Low", label: "Sensitivity (Low)" },
        { value: "High", label: "Sensitivity (High)" }
      ]
    },
  };
  charts = {
    GrossBenefits: {

      label: 'Gross Benefit',
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
        series: []
      }
    },
    GrossBenefitsOverTime: {
      label: 'Gross Benefit Over Time ($)',
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
        series: []
      }
    }
  };
  totalcharts = {
    GrossBenefits:
    {
      label: 'TOTAL GROSS BENEFITS',
      value: '',
      icon: 'GrossBenefits'
    },
    RevenueUplift: {
      label: 'TOTAL REVENUE UPLIFT',
      value: '',
      icon: 'RevenueUplift'
    },
    CostReduction: {
      label: 'TOTAL COST REDUCTION',
      value: '',
      icon: 'CostReduction'
    }

  };
  dbData = [];

  api = new DashboardHelper();

  constructor() {
    makeObservable(this,
      {
        filters: observable,
        totalcharts: observable,
        charts: observable,
        resetDashboard: action,
        initDashboard: action,
        onFilterChanged: action
      });
  }

  resetDashboard() {
    this.filters.FilterView.options = [];
    this.filters.FilterView.value = null;
    this.filters.FilterVDT.options = [];
    this.filters.FilterVDT.value = null;
    this.filters.FilterYear.options = [];
    this.filters.FilterYear.value = null;
    this.filters.FilterChartType.value = this.filters.FilterChartType.options[0];

    this.totalcharts.GrossBenefits.value = '';
    this.totalcharts.CostReduction.value = '';
    this.totalcharts.RevenueUplift.value = '';

    this.charts.GrossBenefits.data.series = [];
    this.charts.GrossBenefitsOverTime.data.series = [];

  }
  initDashboard = flow(function* () {
    const mapId = SessionStorage.read('mapId');
    this.dbData = yield this.api.getBenefitOverview(mapId);



    this.populateViewFilter(this.dbData, this.filters);
    this.populateFilter(this.dbData, this.filters)
    //this.filters = initfilters;
    this.updateCharts();
    //this.filters = makeAutoObservable(this.filters);//, initfilters);
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


    if (filteredData !== []) {
      charts.GrossBenefits.data.xAxis.data = (filters.FilterYear.value) ? [...filters.FilterVDT.value.map(f => f.label), 'Grand Total'] : [];
      charts.GrossBenefits.data.series = [];

      _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
        let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
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




    charts.GrossBenefits.data.series.push({
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
    if (filteredData !== []) {
      charts.GrossBenefitsOverTime.data.xAxis.data = (filters.FilterYear.value) ? filters.FilterYear.value.map(f => f.label) : [];
      charts.GrossBenefitsOverTime.data.series = [];
      if (showTotals) {
        let totals = _(filteredData).groupBy('year').map(a => _.sumBy(a, 'benefit_value')).value();
        if (filters.FilterChartType.value.value === 'Percentage') {
          formatterFn = 'percentageFormatter';
          totals = DashBoardUtils.getPercentage(totals, _.sum(totals))
        } 

        charts.GrossBenefitsOverTime.data.series.push({
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
          data: totals
        })

      } else {
        _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
          let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
          charts.GrossBenefitsOverTime.data.series.push({
            type: 'line',
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
    return charts;

  }

}
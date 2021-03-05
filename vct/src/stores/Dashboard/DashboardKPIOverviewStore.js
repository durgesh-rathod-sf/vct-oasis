import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow } from "mobx";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "./DashboardUtils";


export default class DashboardKPIOverviewStore {
  filters = {
    FilterKPI: {
      value: null,
      label: "Select KPI",
      id: "FilterKPI",
      isMulti: false,
      options: []
    }, FilterKPIType: {
      value: [
        { value: 'Financial', label: `Financial` },
        { value: 'Non Financial', label: `Non Financial` }
      ],
      label: "KPI Type",
      id: "FilterKPIType",
      isMulti: true,
      options: [
        { value: 'Financial', label: `Financial` },
        { value: 'Non Financial', label: `Non Financial` }
      ]
    }
  };
  charts = {
    KPITillDate: {
      label: 'Actual vs Target Value of KPI till date',
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
        legend:{
          data: ["Baseline", "KPI Actual", "KPI Target"]
        },
        series: [{
          data: [],
          type: 'bar'
        }]
      }
    },
    KPIOverTime: {
      label: 'Actual vs Target Benefits Over Time ($)',
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
        legend:{
          data: ["Actual Benefit", "Target Benefit"]
        },
        series: [{
          data: [],
          type: 'line'
        }]
      }
    }
  };
  totalcharts = {
    ExpectedBenefitsFinal:
    {
      label: 'EXPECTED BENEFITS',
      value: '',
      subvalue: '',
      icon: 'GrossBenefits'
    },
    ExpectedBenefits:
    {
      label: 'EXPECTED BENEFITS',
      value: '',
      subvalue: '',
      icon: 'GrossBenefits'
    },
    ActualBenefits: {
      label: 'ACTUAL BENEFITS',
      value: '$391',
      subvalue: '',
      icon: 'Currency'
    },
    BenefitVariance: {
      label: 'BENEFIT VARIANCE',
      value: '',
      subvalue: '',
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
        initDashboard: action,
        onFilterChanged: action
      });
  }


  initDashboard = flow(function* () {
    const mapId = localStorage.getItem('mapId');
    this.dbData = yield this.api.getKpiOverview(mapId);

    this.populateKPIFilter(this.dbData, this.filters);

    this.updateCharts();
    //this.filters = makeAutoObservable(this.filters);//, initfilters);
  })

  populateKPIFilter(dbData, filters) {
    filters.FilterKPI.options.replace([
      { value: 'all', label: `(All)` }, ...dbData.kpiList.map(kpi => { return { value: kpi.kpiId, label: kpi.kpiName } })]);
    filters.FilterKPI.value = filters.FilterKPI.options[0];
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
    this.charts = this.populateKPITillDateChart(this.dbData, this.filters, this.charts);
    this.charts = this.populateKPIBenefitOverTimeChart(this.dbData, this.filters, this.charts);
  }


  /**
  * Updates Gross Benefit Chart according to filter values and backend data
  * @param {*} dbData Initial data obtained from backend
  * @param {*} filters Filters object
  * @param {*} charts Chart object
  */
  populateTotalCharts(dbData, filters, charts) {
    // First of all filter data according to filter dropdown values
    // const filteredData = this.filterData(dbData, filters);
    // Then calculate totals
    charts.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(dbData.expectedTotalBenefitFinalYear)
    charts.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(dbData.expectedTotalBenefitCurrentYear)
    charts.ActualBenefits.value = DashBoardUtils.currencyFormatter(dbData.actualTotalBenefit)
    charts.BenefitVariance.value = DashBoardUtils.currencyFormatter(dbData.actualTotalBenefit - dbData.expectedTotalBenefitCurrentYear);
    charts.BenefitVariance.className = (dbData.actualTotalBenefit > dbData.expectedTotalBenefitCurrentYear) ? 'green' : 'red'
    charts.ExpectedBenefitsFinal.subvalue = DashBoardUtils.monthFormatter(dbData.benefitEndDate)
    charts.ExpectedBenefits.subvalue = DashBoardUtils.monthFormatter(dbData.benefitStartDate)
    charts.ActualBenefits.subvalue = DashBoardUtils.monthFormatter(dbData.benefitStartDate)
    charts.BenefitVariance.subvalue = DashBoardUtils.monthFormatter(dbData.benefitStartDate)

    return charts;
  }


  filterData(dbData, filters, property, totalProperty) {
    if (filters.FilterKPI.value == null) return [];
    if (filters.FilterKPI.value.value === 'all') return dbData[totalProperty];
    const kpi = dbData.kpiList.find((k => k.kpiId === filters.FilterKPI.value.value))
    return kpi[property];

  }

  /**
   * UpdatesKPITillDate Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateKPITillDateChart(dbData, filters, charts) {
    const filteredData = this.filterData(dbData, filters, 'actualVsTargetKpiTillDates', 'actualVsTargetTotalKpiTillDates');
    // let totals = []
    // let acc_totals = []
    let formatterFn = 'currencyFormatter';


    if (filteredData !== []) {
      charts.KPITillDate.data.xAxis.data = filteredData.map(f => {
        return new Date(dbData.benefitStartDate).getFullYear() + f.frequency
      });
      charts.KPITillDate.data.series = [
        {
          name: 'KPI Actual',
          type: 'bar',
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
          data: _.map(filteredData, 'kpiActual')
        },
        {
          name: 'KPI Target',
          type: 'line',
          itemStyle: {
            color: '#ccc'
          },
          label: {
            normal: {
              show: true,
              formatterFn,
              // color: '#fff'
            }
          },
          data: _.map(filteredData, 'kpiTarget')
        },
        {
          name: 'Baseline',
          type: 'line',
          itemStyle: {
            color: '#acac00'
          },
          label: {
            normal: {
              show: true,
              formatterFn,
              // color: '#fff'
            }
          },
          data: _.map(filteredData, 'baseline')
        }
      ];
    }
    return charts;
  }
  /**
   * Updates Gross Benefit Over time Chart according to filter values and backend data
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateKPIBenefitOverTimeChart(dbData, filters, charts) {
    const filteredData = this.filterData(dbData, filters, 'actualVsTargetBenefits', 'actualVsTargetTotalBenefits');
    // let totals = []
    // let acc_totals = []
    let formatterFn = 'currencyFormatter';


    if (filteredData !== []) {
      charts.KPIOverTime.data.xAxis.data = filteredData.map(f => {
        return new Date(dbData.benefitStartDate).getFullYear() + f.frequency
      });
      charts.KPIOverTime.data.series = [
        {
          name: 'Actual Benefit',
          type: 'bar',
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
          data: _.map(filteredData, 'actualBenefit')
        },
        {
          name: 'Target Benefit',
          type: 'line',
          itemStyle: {
            color: '#ccc'
          },
          label: {
            normal: {
              show: true,
              formatterFn,
              // color: '#fff'
            }
          },
          data: _.map(filteredData, 'targetBenefit')
        }
      ];
    }
    return charts;
  }

}
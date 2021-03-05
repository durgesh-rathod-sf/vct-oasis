import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow } from "mobx";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "./DashboardUtils";
import ValueDriversDropdownHelper from "../../helpers/ValueDriversDropdownHelper/ValueDriversDropdownHelper";


export default class DashboardProjectOverviewStore {
  filters = null;
  charts = {
    ValueDriverTree: {

      label: 'VALUE DRIVER TREE',
      data: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: []
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
      value: '',
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
  valueDriversDropdownHelper = new ValueDriversDropdownHelper();
  constructor() {
    makeObservable(this,
      {
        filters: observable,
        totalcharts: observable,
        charts: observable,
        initDashboard: action
      });
  }


  initDashboard = flow(function* () {
    const mapId = localStorage.getItem('mapId');
    const tree = yield this.valueDriversDropdownHelper.getSelectedKpis(mapId);
    this.dbData = yield this.api.getKpiOverviewMock(mapId);
    this.dbData.treeData = tree.data.resultObj;
    this.updateCharts();
  })


  updateCharts() {
    this.totalcharts = this.populateTotalCharts(this.dbData, this.filters, this.totalcharts);
    this.charts = this.populateValueDriverTreeChart(this.dbData, this.filters, this.charts);
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



  /**
   * Updates ValueDriverTreeChart
   * @param {*} dbData Initial data obtained from backend
   * @param {*} filters Filters object
   * @param {*} charts Chart object
   */
  populateValueDriverTreeChart(dbData, filters, charts) {


    const traverse = (node) => {
      if (node.length) { //KPI Leave
        return node.map(n => { return { name: n.opKpi, collapsed: false } });
      } else {
        const keys = Object.keys(node)
        return keys.map(k => {
          return { name: k, collapsed: false, children: traverse(node[k]) }
        });
      }


    }
    const data = traverse(dbData.treeData)[0];


    charts.ValueDriverTree.data.series = [
      {
        type: 'tree',
        data: [data],
        top: '1%',
        left: '5%',
        bottom: '1%',
        right: '10%',
        symbolSize: 12,
        label: {
          position: 'top',
          verticalAlign: 'middle',
          align: 'center',
          color: '#fff',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'top',
            verticalAlign: 'middle',
            align: 'center'
          }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ];

    return charts;
  }


}
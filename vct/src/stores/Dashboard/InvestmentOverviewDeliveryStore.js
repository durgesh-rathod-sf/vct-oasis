import { observable, action, flow, toJS ,makeObservable} from "mobx";
import { toast } from 'react-toastify';
 import React from 'react';
 import NotificationMessage from "../../components/NotificationMessage/NotificationMessage";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import * as _ from "lodash"
import DashBoardUtils from "../../containers/Dashboards/DashboardUtils";
import moment from 'moment';
var SessionStorage = require('store/storages/sessionStorage')




export default class InvestmentOverviewDeliveryStore {
    @observable filters = {};
    @observable totalcharts = {};
    @observable charts = {};
    @observable loader = false;
    @observable filterOptions = [];
    @observable responseKO = {};

    constructor() {
        makeObservable(this,
          {
            filters: observable,
            totalcharts: observable,
            charts: observable,
            loader :observable,
            filterOptions :observable,
            responseKO:observable,
            initDashboard: action,
            onFilterChanged: action
          });
      }

    filters = {
        FilterView: {
            value: { value: "Cost Category", label: "Cost Category" },
            label: "Select View",
            id: "FilterView",
            isMulti: false,
            options: [{ value: "Cost Category", label: "Cost Category" },
            { value: "Work Stream", label: "Work Stream" },
            { value: "Financial Objective", label: "Financial Objective" },
            { value: "Business Objective", label: "Business Objective" },
            { value: "Value Driver", label: "Value Driver" },
            { value: "Operational KPI", label: "Operational KPI" }]
        }, FilterType: {
            value: [{ value: "Capex", label: "Capex" },
            { value: "Opex", label: "Opex" }],
            label: "Investment Type",
            id: "FilterType",
            isMulti: true,
            options: [{ value: "Capex", label: "Capex" },
            { value: "Opex", label: "Opex" }]

        }
    };

    charts = {
        InvestmentTillDate: {

            label: 'Breakdown of Investment Till Date ($)',

            data: {
                backgroundColor: 'transparent',
                tooltip: {
                    axisPointer: {
                        type: 'shadow'
                    },
                    // // position: function (pos, params, dom, rect, size) {
                    // //     // fixed at top
                    // //     var obj = {top: 80};
                    // //     obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    // //     return obj;
                    // // },
                    // position: ['50%', '50%'],
                    formatter: function (params) {
                        console.log("params", params);
                        let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value).split("$")[1];
                        return `Category : ${params.name}<br />${params.seriesName} : ${x}`;
                    }
                },
                grid: {
                    containLabel: true,
                    height: '80%',
                    //  (this.charts.GrossBenefits.data.series.data.length > 0 ? 260 : 200),
                    //   260,
                    width: '90%',
                    //   left:10

                },

                xAxis: {
                    type: 'category',
                    data: [],
                    axisLabel: {
                        rotate: 0,
                        fontSize: 10,
                        rich: {
                            height: '0'
                        },
                        formatter: function (value) {
                            let x = `${(value.length > 16) ? `${value.substr(0, 15)}...` : (value)}`;
                            return x;
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: function (value) {
                            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(value).split("$")[1];
                            return x;
                        }
                    },
                },
                legend: {
                    left: '0%',
                    data: [{
                        name: 'Actual Investment',
                        icon: 'roundRect'
                    },
                    {
                        name: 'Target Investment',
                        icon: 'roundRect',

                    }
                    ]
                },
                series: [{

                    data: [],
                    type: 'bar'
                }]
            }
        },
        InvestmentOverTime: {
            displayTip: {
                position: 'bottom',
                message: 'Drill down the graph and view the values only at cadence equal to the KPI\'s frequency as entered in the tool'
            },
            label: 'Periodic View of Investment ($)',
            data: {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    //formatter: 'Year : {b0}<br />Net Benefit : {c0}'
                    formatter: function (params) {

                        let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value)
                        let y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value)
                        return ` Year: ${params[0].name}<br/ >${params[0].seriesName}: ${x}<br/ >${params[1].seriesName}: ${y}`;
                        // let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params && params.value).split("$")[1];
                        // return `Year : ${params && params.name}<br />${params.seriesName} : ${x}`;
                    }
                },
                grid: {
                    containLabel: true,
                    height: '80%',
                    //  (this.charts.GrossBenefits.data.series.data.length > 0 ? 260 : 200),
                    //   260,
                    width: '90%',
                    //   left:10

                },
                xAxis: {
                    type: 'category',
                    data: [],
                    axisLabel: {
                        rotate: 0,
                        fontSize: 10,
                        rich: {
                            height: '0'
                        },
                        formatter: function (value) {
                            let x = `${(value.length > 16) ? `${value.substr(0, 15)}...` : (value)}`;
                            return x;
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: function (value) {
                            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(value).split("$")[1];
                            return x;
                        }
                    },
                },
                legend: {
                    left: '0%',
                    data: [{
                        name: 'Actual Investment',
                        icon: 'roundRect'
                    },
                    {
                        name: 'Target Investment',
                        icon: 'roundRect',

                    }
                    ]
                },
                series: [{
                    data: [],
                    type: 'line'
                }]
            }
        }
    };

    totalcharts = {
        ExpectedBenefits:
        {
            label: 'TARGET INVESTMENTS',
            value: '',
            icon: 'benefits',
            subvalue: ''
        },
        TargetInvestments:
        {
            label: 'TARGET INVESTMENTS',
            value: '',
            icon: 'benefits',
            subvalue: ''
        },
        ActualInvestments: {
            label: 'ACTUAL INVESTMENT',
            value: '',
            icon: 'currency_dash',
            subvalue: ''
        },
        InvestmentVariance: {
            label: 'INVESTMENT VARIANCE',
            value: '',
            icon: 'variance_dash',
            subvalue: '',
            positive: true
        }

    };
    dbData = [];
    responseData = [];
    frequencyType = "";
    frequencyTypeLocalTemp = "";
    frequencyIcon = true;

    @action
    resetDashboard() {

        this.filters.FilterView.value = { value: "Cost Category", label: "Cost Category" };

        this.filters.FilterType.value = [{ value: "Capex", label: "Capex" },
        { value: "Opex", label: "Opex" }];


        this.totalcharts.ExpectedBenefits.value = '';
        this.totalcharts.TargetInvestments.value = '';
        this.totalcharts.ActualInvestments.value = '';
        this.totalcharts.InvestmentVariance.value = '';

        this.charts.InvestmentTillDate.data.series = [];
        this.charts.InvestmentOverTime.data.series = [];
        this.charts.InvestmentTillDate.data.xAxis.data = [];
        this.charts.InvestmentOverTime.data.xAxis.data = [];
        this.dbData = null;

    }

    endDate = '';


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
    initDashboard = flow(function* (objType) {
        this.getInvestmentOverviewDeliveryData("Cost Category");
    })
    getInvestmentOverviewDeliveryData = (objType) => {
        this.loader = true;
        let dashboardHelper = new DashboardHelper();
        dashboardHelper.getInvestmentOverviewDelivery(SessionStorage.read('mapId'), objType)
            .then(res => {
                if (res && res.data.resultCode === "OK" && res.data.errorDescription === null) {
                    this.responseData = res.data.resultObj;
                    this.endDate = res.data.resultObj && res.data.resultObj[0].endDate;
                    this.dbData = this.frameViewData(res.data.resultObj && res.data.resultObj[0]);
                    console.log("db data in", this.dbData);
                    this.updateCharts();
                    this.loader = false;
                } else if (res && res.data && (res.data.resultCode === "KO" || res.data.resultCode === "OK") && res.data.errorDescription !== null) {
                    this.updateCharts();
                    this.loader = false;
                    this.responseKO = res;
                    this.showNotification(res.data.errorDescription, "Error", "error");
                }
                else {
                    this.updateCharts();
                    this.loader = false;
                    this.showNotification(res.data.errorDescription, "Error", "error");

                }

            }).catch((e) => {
                this.loader = false;
                 this.showNotification("Sorry! Something went wrong", "Error", "error");
                this.responseKO = e.respone;
            })

    }

    frameViewData = (dataObj) => {

        let resultArr = [];
        let newObj = {};
        let newPeriodObj = {};
        let elementObj = [];
        let objList = [];
        let periodicList = [];
        dataObj && dataObj.objectiveDetailList.length > 0 && dataObj.objectiveDetailList.map((eachObj) => {
            newObj = {
                "objective": dataObj.objectiveType,
                "objective_detail": eachObj.elementName,
                "capexActualInv": eachObj.capexDetails.actualInvestment,
                "capexTargetInv": eachObj.capexDetails.targetInvestment,
                "opexActualInv": eachObj.opexDetails.actualInvestment,
                "opexTargetInv": eachObj.opexDetails.targetInvestment,
            }
            objList.push(newObj)
        })
        dataObj && dataObj.periodicInvestmentViewList.length > 0 && dataObj.periodicInvestmentViewList.map((periodicObj) => {
            newPeriodObj = {
                "frequency": periodicObj.frequency,
                "frequencyType": periodicObj.frequencyType,
                "endDate": periodicObj.endDate,
                "periodicCapexActualInv": periodicObj.capexDetails.actualInvestment,
                "periodicCapexTargetInv": periodicObj.capexDetails.targetInvestment,
                "periodicOpexActualInv": periodicObj.opexDetails.actualInvestment,
                "periodicOpexTargetInv": periodicObj.opexDetails.targetInvestment
            }
            periodicList.push(newPeriodObj)
        })
        let totalInvestmentDetails = {
            "totalCapexTotalActualInvestmentsTillDate": dataObj.totalCapexDetails.totalActualInvestmentsTillDate,
            "totalCapexTotalTargetInvestments": dataObj.totalCapexDetails.totalTargetInvestments,
            "totalCapexTotalTargetInvestmentsTillDate": dataObj.totalCapexDetails.totalTargetInvestmentsTillDate,
            "totalOpexTotalActualInvestmentsTillDate": dataObj.totalOpexDetails.totalActualInvestmentsTillDate,
            "totalOpexTotalTargetInvestments": dataObj.totalOpexDetails.totalTargetInvestments,
            "totalOpexTotalTargetInvestmentsTillDate": dataObj.totalOpexDetails.totalTargetInvestmentsTillDate
        }
        this.frequencyType = periodicList.length > 0 && periodicList[0].frequencyType;
        this.frequencyTypeLocalTemp = periodicList.length > 0 && periodicList[0].frequencyType;

        resultArr.push(objList);
        resultArr.push(periodicList);
        resultArr.push(totalInvestmentDetails);

        return resultArr;
    }




    updateCharts() {
        this.totalcharts = this.populateTotalCharts(this.dbData, this.filters, this.totalcharts);
        this.charts = this.populateInvestmentTillDateChart(this.dbData, this.filters, this.charts);
        this.charts = this.populatePeroidicInvestmentOverTimeChart(this.dbData, this.filters, this.charts);
        this.chartsYearly = this.charts;
        this.frequencyIcon = true;
        //this.frequencyType = periodicList.length> 0 && periodicList[0].frequencyType;
        this.frequencyTypeLocalTemp = this.frequencyType;
    }

    populateTotalCharts(dbData, filters, charts) {

        let totalTargetInvestment = 0;
        let TargetInvestmentTillDate = 0;
        let ActualInvestmentTillDate = 0;
        let investmentVariance = 0;
        let typeFilterOptions = [];
        typeFilterOptions = filters.FilterType.value;
        // this.filterOptions = [];
        let currentMonth = '';
        let currentYear = '';
        let targetYear = '';
        // typeFilterOptions.map(opt => {
        //     this.filterOptions.push(opt.value)
        // })

        let filterValues = []
        filters.FilterType.value && filters.FilterType.value.map(each => {
            filterValues.push(each.value);
        })

        console.log("filter values", filterValues)
        if (filters.FilterType.value && filters.FilterType.value.length > 0) {
            if (dbData !== null && dbData && dbData.length > 1 && dbData[2].totalCapexTotalTargetInvestments !== undefined && dbData[2].totalOpexTotalTargetInvestments !== undefined) {
                if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {

                    totalTargetInvestment = dbData[2].totalCapexTotalTargetInvestments + dbData[2].totalOpexTotalTargetInvestments;
                    TargetInvestmentTillDate = dbData[2].totalCapexTotalTargetInvestmentsTillDate + dbData[2].totalOpexTotalTargetInvestmentsTillDate;
                    ActualInvestmentTillDate = dbData[2].totalCapexTotalActualInvestmentsTillDate + dbData[2].totalOpexTotalActualInvestmentsTillDate;


                } else if (filterValues && filterValues.includes('Opex')) {
                    totalTargetInvestment = dbData[2].totalOpexTotalTargetInvestments;
                    TargetInvestmentTillDate = dbData[2].totalOpexTotalTargetInvestmentsTillDate;
                    ActualInvestmentTillDate = dbData[2].totalOpexTotalActualInvestmentsTillDate;
                } else if (filterValues && filterValues.includes('Capex')) {

                    totalTargetInvestment = dbData[2].totalCapexTotalTargetInvestments;
                    TargetInvestmentTillDate = dbData[2].totalCapexTotalTargetInvestmentsTillDate;
                    ActualInvestmentTillDate = dbData[2].totalCapexTotalActualInvestmentsTillDate;
                }
                investmentVariance = ActualInvestmentTillDate - TargetInvestmentTillDate;
            }

            charts.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(totalTargetInvestment);
            charts.TargetInvestments.value = DashBoardUtils.currencyFormatter(TargetInvestmentTillDate);
            charts.ActualInvestments.value = DashBoardUtils.currencyFormatter(ActualInvestmentTillDate);
            charts.InvestmentVariance.value = DashBoardUtils.currencyFormatter(investmentVariance);
            // if (investmentVariance < 0) {
            //     charts.InvestmentVariance.value = '(' + DashBoardUtils.currencyFormatter(investmentVariance) + ')';
            // }
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            if (dbData !== null && dbData && dbData.length > 1) {
                currentMonth = monthNames[new Date().getMonth()];
                currentYear = new Date().getFullYear();
                targetYear = dbData && dbData[0].length > dbData[0].endDate;
                if (this.endDate) {
                    charts.TargetInvestments.subvalue = 'By ' + currentMonth + ' ' + currentYear;
                    charts.ActualInvestments.subvalue = 'By ' + currentMonth + ' ' + currentYear;
                    charts.InvestmentVariance.subvalue = 'By ' + currentMonth + ' ' + currentYear;
                    charts.ExpectedBenefits.subvalue = 'By ' + monthNames[new Date(this.endDate).getMonth()] + ' ' + (new Date(this.endDate).getFullYear());
                }
                else {
                    charts.TargetInvestments.subvalue = "";
                    charts.ActualInvestments.subvalue = "";
                    charts.InvestmentVariance.subvalue = "";
                }
            } else {
                // charts.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(totalTargetInvestment);
                // charts.TargetInvestments.value = DashBoardUtils.currencyFormatter(TargetInvestmentTillDate);
                // charts.ActualInvestments.value = DashBoardUtils.currencyFormatter(ActualInvestmentTillDate);
                // charts.InvestmentVariance.value = DashBoardUtils.currencyFormatter(investmentVariance);
                charts.ExpectedBenefits.subvalue = '';
                charts.TargetInvestments.subvalue = '';
                charts.ActualInvestments.subvalue = '';
                charts.InvestmentVariance.subvalue = '';

            }


        }
        else {
            charts.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(totalTargetInvestment);
            charts.TargetInvestments.value = DashBoardUtils.currencyFormatter(TargetInvestmentTillDate);
            charts.ActualInvestments.value = DashBoardUtils.currencyFormatter(ActualInvestmentTillDate);
            charts.InvestmentVariance.value = DashBoardUtils.currencyFormatter(investmentVariance);
            charts.ExpectedBenefits.subvalue = '';
            charts.TargetInvestments.subvalue = '';
            charts.ActualInvestments.subvalue = '';
            charts.InvestmentVariance.subvalue = '';
        }

        return charts;
    }


    @action
    onFilterChanged(selectedOption, filter) {
        if (filter !== undefined && filter.id === 'FilterView') {
            filter.value = selectedOption;
            this.filters[filter.id].value = Object.assign({}, filter.value);
            this.getInvestmentOverviewDeliveryData(filter.value.value);
        }
        if (filter.id === 'FilterType') {
            this.filters[filter.id].value = Object.assign([], filter.value);
            this.updateCharts();
        }
    }

    populateInvestmentTillDateChart(dbData, filters, charts) {
        const filteredData = dbData && dbData[0];
        let totals = [];
        let formatterFn = 'currencyFormatter';
        let actualInvestSum = 0;
        let targetInvestSum = 0;

        if (filteredData !== undefined && filteredData && filteredData.length > 0) {
            charts.InvestmentTillDate.data.xAxis.data = [];
            charts.InvestmentTillDate.data.series = [];
            let filterValues = []
            filters.FilterType.value && filters.FilterType.value.map(each => {
                filterValues.push(each.value);
            })

            _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
                let FilterTypeData = _.filter(filteredData, { objective_detail: vdt.objective_detail });

                let totalCapex = _.sumBy(FilterTypeData, 'capexActualInv');
                let totalOpex = _.sumBy(FilterTypeData, 'opexActualInv');
                let totalCapexTarget = _.sumBy(FilterTypeData, 'capexTargetInv');
                let totalOpexTarget = _.sumBy(FilterTypeData, 'opexTargetInv');
                if (filters.FilterType.value && filters.FilterType.value.length > 0) {
                    charts.InvestmentTillDate.data.grid.height = '80%';
                    charts.InvestmentTillDate.data.grid.width = '90%';
                    charts.InvestmentTillDate.data.grid.left = 10;
                    charts.InvestmentTillDate.data.xAxis.data = [...filteredData.map(f => f.objective_detail)];
                    if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {
                        actualInvestSum = totalCapex + totalOpex;
                        targetInvestSum = totalCapexTarget + totalOpexTarget;
                    } else if (filterValues && filterValues.includes('Capex')) {
                        actualInvestSum = totalCapex;
                        targetInvestSum = totalCapexTarget;
                    } else if (filterValues && filterValues.includes('Opex')) {
                        actualInvestSum = totalOpex;
                        targetInvestSum = totalOpexTarget;
                    }
                    totals.push({ 'actualInvestment': actualInvestSum, 'targetInvestment': targetInvestSum })
                } else {

                    charts.InvestmentTillDate.data.grid.height = undefined;
                    charts.InvestmentTillDate.data.grid.width = undefined;
                    charts.InvestmentTillDate.data.grid.left = 40;

                }
            })
        } else {
            charts.InvestmentTillDate.data.xAxis.data = [];
            charts.InvestmentTillDate.data.grid.height = undefined;
            charts.InvestmentTillDate.data.grid.width = undefined;
            charts.InvestmentTillDate.data.grid.left = 40;
            charts.InvestmentTillDate.data.series = [];
        }

        let rotateXAxis = false;
        charts.InvestmentTillDate.data.xAxis.data && charts.InvestmentTillDate.data.xAxis.data.map(element => {
            if (element.length > 12) {
                charts.InvestmentTillDate.data.xAxis.axisLabel.rotate = 90
            }
        })

        // if (selectedData.length > 10 || rotateXAxis) {
        //     charts.InvestmentTillDate.data.xAxis.axisLabel.rotate = 90
        // }


        charts.InvestmentTillDate.data.series = [
            {

                name: 'Actual Investment',
                type: 'bar',
                // stack: 'benefit',
                itemStyle: {
                    color: 'rgb(0, 186, 255)'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        color: '#fff'
                    }
                },
                data: _.map(totals, 'actualInvestment')
            }, {
                name: 'Target Investment',
                type: 'line',
                // step: 'middle',
                // stack: 'benefit',
                itemStyle: {
                    color: 'rgb(242, 142, 43)'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        // color: '#fff'
                    }
                },
                data: _.map(totals, 'targetInvestment')
            }]
        return charts;
    }

    populatePeroidicInvestmentOverTimeChart(dbData, filters, charts) {
        const filteredData = dbData && dbData[1];
        let totals = []
        let formatterFn = 'currencyFormatter';
        let actualInvestSum = 0;
        let targetInvestSum = 0;

        if (filteredData !== undefined && filteredData && filteredData.length > 0) {

            charts.InvestmentOverTime.data.series = [];
            charts.InvestmentOverTime.data.xAxis.data = [];

            let filterValues = []
            filters.FilterType.value && filters.FilterType.value.map(each => {
                filterValues.push(each.value);
            })

            filteredData.map(eachPeroid => {
                let totalCapex = eachPeroid.periodicCapexActualInv;
                let totalOpex = eachPeroid.periodicOpexActualInv;
                let totalCapexTarget = eachPeroid.periodicCapexTargetInv;
                let totalOpexTarget = eachPeroid.periodicOpexTargetInv;
                if (filters.FilterType.value && filters.FilterType.value.length > 0) {

                    charts.InvestmentOverTime.data.xAxis.data = [...filteredData.map(f => f.frequency)];
                    charts.InvestmentOverTime.data.grid.height = '80%';
                    charts.InvestmentOverTime.data.grid.width = '90%';
                    charts.InvestmentOverTime.data.grid.left = 10;
                    if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {

                        actualInvestSum = totalCapex + totalOpex;
                        targetInvestSum = totalCapexTarget + totalOpexTarget;

                    } else if (filterValues && filterValues.includes('Capex')) {
                        actualInvestSum = totalCapex;
                        targetInvestSum = totalCapexTarget;
                    } else if (filterValues && filterValues.includes('Opex')) {
                        actualInvestSum = totalOpex;
                        targetInvestSum = totalOpexTarget;
                    }
                    totals.push({ 'actualInvestment': actualInvestSum, 'targetInvestment': targetInvestSum })
                } else {

                    charts.InvestmentOverTime.data.grid.height = undefined;
                    charts.InvestmentOverTime.data.grid.width = undefined;
                    charts.InvestmentOverTime.data.grid.left = 40;

                }
            })
        } else {
            charts.InvestmentOverTime.data.xAxis.data = [];
            charts.InvestmentOverTime.data.grid.height = undefined;
            charts.InvestmentOverTime.data.grid.width = undefined;
            charts.InvestmentOverTime.data.grid.left = 40;
            charts.InvestmentOverTime.data.series = [];
        }
        charts.InvestmentOverTime.data.xAxis.data && charts.InvestmentOverTime.data.xAxis.data.map(element => {
            if (element.length > 12) {
                charts.InvestmentTillDate.data.xAxis.axisLabel.rotate = 90
            }
        })

        charts.InvestmentOverTime.data.series = [
            {

                name: 'Actual Investment',
                type: 'bar',
                // stack: 'benefit',
                itemStyle: {
                    color: 'rgb(0, 186, 255)'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        color: '#fff'
                    }
                },
                data: _.map(totals, 'actualInvestment')
            }, {
                name: 'Target Investment',
                type: 'line',
                // step: 'middle',
                //stack: 'benefit',
                itemStyle: {
                    color: 'rgb(242, 142, 43)'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        // color: '#fff'
                    }
                },
                data: _.map(totals, 'targetInvestment')
            }]
        return charts;
    }

    @action
    frequencyChanged(chartData, key) {
        let frequencyTypeLocalTemp = this.frequencyTypeLocalTemp;
        let formatterFn = 'currencyFormatter';
        const frequencyType = this.frequencyType;
        const periodicObj = this.dbData[1];
        let endDate = moment(this.endDate);
        let targetsResult = null;
        let actualsResult = null;
        let filters = this.filters;
        let filterValues = []

        if (periodicObj !== undefined && periodicObj.length > 0) {

            filters.FilterType.value && filters.FilterType.value.map(each => {
                filterValues.push(each.value);
            })
        }

        let graphsOptions = { ...this.charts }
        if (frequencyTypeLocalTemp === "Fortnightly" || frequencyTypeLocalTemp === "Monthly" || frequencyTypeLocalTemp === "Quarterly") {

            let years = periodicObj && periodicObj.map((d) => {
                let actualInvestSum = 0;
                let targetInvestSum = 0;

                if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {

                    actualInvestSum = d.periodicCapexActualInv + d.periodicOpexActualInv;
                    targetInvestSum = d.periodicCapexTargetInv + d.periodicOpexTargetInv;

                } else if (filterValues && filterValues.includes('Capex')) {
                    actualInvestSum = d.periodicCapexActualInv;
                    targetInvestSum = d.periodicCapexTargetInv;
                } else if (filterValues && filterValues.includes('Opex')) {
                    actualInvestSum = d.periodicOpexActualInv;
                    targetInvestSum = d.periodicOpexTargetInv;
                }

                let x = [new Date(moment(d.endDate).format("MMM YYYY")).getFullYear(), targetInvestSum, actualInvestSum];
                return x;
            });

            let targets = years.reduce(function (prev, curr, idx, arr) {
                var sum = prev[curr[0]];
                prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                return prev;

            }, {});

            targetsResult = Object.entries(targets).map((data) => {
                return { year: data[0], targetInvestment: data[1] }
            })

            let actuals = years.reduce(function (prev, curr, idx, arr) {
                var sum = prev[curr[0]];
                prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                return prev;

            }, {});

            actualsResult = Object.entries(actuals).map((data) => {
                return { year: data[0], actualInvestment: data[1] }
            })

            this.frequencyTypeLocalTemp = "Yearly";
            this.frequencyIcon = false;
        }

        /*if(frequencyTypeLocalTemp === "Monthly"){
            
            let years =  periodicObj && periodicObj.map((d)  =>{
             let actualInvestSum = 0;
             let targetInvestSum = 0;
 
             if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {
 
                 actualInvestSum = d.periodicCapexActualInv + d.periodicOpexActualInv;
                 targetInvestSum = d.periodicCapexTargetInv + d.periodicOpexTargetInv;
                
             } else if (filterValues && filterValues.includes('Capex')) {
                 actualInvestSum = d.periodicCapexActualInv;
                 targetInvestSum = d.periodicCapexTargetInv;
             } else if(filterValues && filterValues.includes('Opex')){
                 actualInvestSum = d.periodicOpexActualInv;
                 targetInvestSum = d.periodicOpexTargetInv;
             }
                
             let  x= [new Date(moment(d.endDate).format("MMM YYYY")).getFullYear(),targetInvestSum,actualInvestSum];
                 return x;
              });
              
             let targets = years.reduce(function(prev, curr, idx, arr) {
                 var sum = prev[curr[0]];
                prev[curr[0]] = sum ? sum + curr[1] : curr[1];
                
                 return prev; 
                
              }, {});
 
             targetsResult =  Object.entries(targets).map((data)=>{
                 return {year :data[0],targetInvestment : data[1]}
             })
 
              let actuals = years.reduce(function(prev, curr, idx, arr) {
                 var sum = prev[curr[0]];
                 prev[curr[0]] = sum ? sum + curr[2] : curr[2];
                
                 return prev; 
                 
              }, {});
 
             actualsResult =  Object.entries(actuals).map((data)=>{
                 return {year :data[0],actualInvestment : data[1]}
             })
 
             this.frequencyTypeLocalTemp = "Yearly";
             this.frequencyIcon = false;
         }

         if(frequencyTypeLocalTemp === "Quarterly"){
            
            let years =  periodicObj && periodicObj.map((d)  =>{
             let actualInvestSum = 0;
             let targetInvestSum = 0;
 
             if (filterValues && filterValues.includes('Opex') && filterValues.includes('Capex')) {
 
                 actualInvestSum = d.periodicCapexActualInv + d.periodicOpexActualInv;
                 targetInvestSum = d.periodicCapexTargetInv + d.periodicOpexTargetInv;
                
             } else if (filterValues && filterValues.includes('Capex')) {
                 actualInvestSum = d.periodicCapexActualInv;
                 targetInvestSum = d.periodicCapexTargetInv;
             } else if(filterValues && filterValues.includes('Opex')){
                 actualInvestSum = d.periodicOpexActualInv;
                 targetInvestSum = d.periodicOpexTargetInv;
             }
                
             let  x= [new Date(moment(d.endDate).format("MMM YYYY")).getFullYear(),targetInvestSum,actualInvestSum];
                 return x;
              });
              
             let targets = years.reduce(function(prev, curr, idx, arr) {
                 var sum = prev[curr[0]];
                prev[curr[0]] = sum ? sum + curr[1] : curr[1];
                
                 return prev; 
                
              }, {});
 
             targetsResult =  Object.entries(targets).map((data)=>{
                 return {year :data[0],targetInvestment : data[1]}
             })
 
              let actuals = years.reduce(function(prev, curr, idx, arr) {
                 var sum = prev[curr[0]];
                 prev[curr[0]] = sum ? sum + curr[2] : curr[2];
                
                 return prev; 
                 
              }, {});
 
             actualsResult =  Object.entries(actuals).map((data)=>{
                 return {year :data[0],actualInvestment : data[1]}
             })
 
             this.frequencyTypeLocalTemp = "Yearly";
             this.frequencyIcon = false;
         }
         */
        if (frequencyTypeLocalTemp === "Yearly") {
            this.charts = { ...this.chartsYearly };
            this.charts = this.populatePeroidicInvestmentOverTimeChart(this.dbData, this.filters, this.charts);

            this.frequencyTypeLocalTemp = frequencyType;
            this.frequencyIcon = true;
        }

        if (frequencyTypeLocalTemp !== "Yearly") {
            if (actualsResult !== null) {
                graphsOptions.InvestmentOverTime.data.xAxis.data = _.map(actualsResult, 'year');
            }
            else {
                graphsOptions.InvestmentOverTime.data.xAxis.data = this.charts.InvestmentOverTime.data.xAxis.data
            }

            graphsOptions.InvestmentOverTime.data.series = [
                {

                    name: 'Actual Investment',
                    type: 'bar',
                    // stack: 'benefit',
                    itemStyle: {
                        color: 'rgb(0, 186, 255)'
                    },
                    label: {
                        normal: {
                            show: true,
                            formatterFn,
                            color: '#fff'
                        }
                    },
                    data: _.map(actualsResult, 'actualInvestment')
                }, {
                    name: 'Target Investment',
                    type: 'line',
                    // step: 'middle',
                    //stack: 'benefit',
                    itemStyle: {
                        color: 'rgb(242, 142, 43)'
                    },
                    label: {
                        normal: {
                            show: true,
                            formatterFn,
                            // color: '#fff'
                        }
                    },
                    data: _.map(targetsResult, 'targetInvestment')
                }
            ];

            this.charts = graphsOptions;
        }
    }
}
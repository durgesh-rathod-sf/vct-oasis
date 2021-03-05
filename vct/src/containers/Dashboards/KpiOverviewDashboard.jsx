import React,{Fragment } from 'react';
import DashBoardUtils from './DashboardUtils';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { inject } from 'mobx-react';
import Charts from "./Charts"
import { toJS } from "mobx";
import Card from './Card';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage"
import { toast } from 'react-toastify';
import moment from 'moment';
var SessionStorage = require('store/storages/sessionStorage')

let graphs = {
    KPITillDate: {
        label: 'Actual vs Target Value of KPI till date ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value)
                    return ` ${params.seriesName}: ${x}<br />Month of Year : ${params.name}`;
                }
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


                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                        return x;
                    }
                },
            },
            legend: {
                left: '0%',
                data: [{
                    name: 'Baseline',
                    icon: 'roundRect'
                },
                {
                    name: 'KPI Actual',
                    icon: 'roundRect',

                },
                {
                    name: 'KPI Target',
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
    KPIOverTime: {
        displayTip: {
            position: 'bottom',
            message: 'Drill down the graph and view the values only at cadence equal to the KPI\'s frequency as entered in the tool'
        },
        label: 'Actual vs Target Benefits Over Time ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params && params[0] && params[0].value)
                    let y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params && params[1] && params[1].value)
                    return ` Month of Year : ${params && params[0] && params[0].name}<br/ >${params && params[0] && params[0].seriesName}: ${x}<br/ >${params && params[1] && params[1].seriesName}: ${y}`;
                    // let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value)
                    //return ` ${params.seriesName}: ${x}<br />Month of Year : ${params.name}`;
                }
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 90,
                    fontSize: 10,

                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                        return x;
                    }
                },
            },
            legend: {

                left: '0%',
                data: [{
                    name: 'Actual Benefit',
                    icon: 'roundRect'
                },
                {
                    name: 'Target Benefit',
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
let totalcards = {
    ExpectedBenefitsFinal:
    {
        label: 'EXPECTED BENEFITS',
        value: '',
        subvalue: '',
        icon: 'benefits'
    },
    ExpectedBenefits:
    {
        label: 'EXPECTED BENEFITS',
        value: '',
        subvalue: '',
        icon: 'benefits'
    },
    ActualBenefits: {
        label: 'ACTUAL BENEFITS',
        value: '',
        subvalue: '',
        icon: 'currency_dash'
    },
    BenefitVariance: {
        label: 'BENEFIT VARIANCE',
        value: '',
        subvalue: '',
        icon: 'variance_dash'
    }

};

@inject('kpiDashboardStore', 'publishDashboardStore')
class KpiOverviewDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedInnerPage: "kpiOverview",
            listOfKpi: {},
            selectedKpi: this.props.kpiDashboardStore.kpiListResponse && this.props.kpiDashboardStore.kpiListResponse[0] && this.props.kpiDashboardStore.kpiListResponse[0].kpiName,
            actualVsTargetTotalBenefits: [],
            actualVsTargetTotalKpiTillDates: [],
            expectedTotalBenefitFinalYear: 0,
            expectedTotalBenefitCurrentYear: 0,
            benefitEndDate: '',
            benefitStartDate: '',
            actualTotalBenefit: 0,
            actualVsTargetBenefits: [],
            actualVsTargetKpiTillDates: [],
            expectedBenefitFinalYear: 0,
            expectedBenefitCurrentYear: 0,
            actualBenefit: 0,
            axis: {},
            totalCard: totalcards,
            charts: graphs,
            kpiResponse: "",
            showSpinner: '',
            apiError: false,
            frequencyClicked: false,
            benefitFrequencyTypeLocal: "",
            tillDateFrequencyTypeLocal: "",
            toggleFrequencyIconLHS: true,
            toggleFrequencyIconRHS: true,
            kpiType:""

        }

    }


    getKpiOverview = () => {
        const { kpiDashboardStore } = this.props;
        let kpiListResponse = {}
        kpiDashboardStore.getKpiOverview(SessionStorage.read('mapId'))
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK" && response.data.errorDescription === null) {
                    kpiListResponse = response.data.resultObj.kpiList;
                    kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                        kpiDashboardStore.kpiTypeForAll.push(kpi.kpiType);
                    });
                    this.updateCharts("", "Onload");
                }  else if (response && response.data && (response.data.resultCode === "OK" ||  response.data.resultCode === "KO") && response.data.errorDescription !== null) {
                    this.showNotification(response.data.errorDescription, "Error", "error");
                    this.updateCharts("", "Onload");
                    this.setState({ apiError: !this.state.apiError });
 
                }
                else {
                    this.updateCharts("", "Onload");
                    this.showNotification(response.data.errorDescription, "Error", "error");
                    this.setState({ apiError: !this.state.apiError });

                }
            }).catch((error)=>{
                this.updateCharts("", "Onload");
                this.showNotification("Sorry! Something went wrong", "Error", "error");
            })

        return kpiListResponse;
    }


    componentDidMount() {
        this.setState({ charts: graphs, totalCard: totalcards,kpiType :"" });
        this.getKpiOverview();

    }

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




    updateCharts = (eachKPI, value) => {
        const { kpiDashboardStore } = this.props;

        let charts;
        let totalCards = this.populateTotalCharts(eachKPI, value);
        charts = this.populateKPITillDateChart(eachKPI, value);
        charts = this.populateKPIBenefitOverTimeChart(eachKPI, value);
        const kpiTypeForAll = toJS(kpiDashboardStore.kpiTypeForAll);
        const benefitFrequencyTypeLocal = toJS(kpiDashboardStore.benefitFrequencyType);
        const tillDateFrequencyTypeLocal = toJS(kpiDashboardStore.tillDateFrequencyType);
        const kpiListRes = toJS(kpiDashboardStore.kpiListResponse);
        let kpiFin = "", kpinNon = "";
        if (kpiTypeForAll.indexOf("FINANCIAL") > -1) {
            kpiFin = "Financial"
        }
        if (kpiTypeForAll.indexOf("NON_FINANCIAL") > -1) {
            kpinNon = "Non Financial";
        }
        // let kpitype = value === "All" ? kpiFin + " " + kpinNon : eachKPI && eachKPI.kpiType === "NON_FINANCIAL" ? "Non Financial" : "Financial";
        let kpitype = value === "Onload" ?(kpiListRes && kpiListRes[0] && kpiListRes[0].kpiType === "NON_FINANCIAL" ? "Non Financial" : kpiListRes && kpiListRes[0] && kpiListRes[0].kpiType ==="FINANCIAL" ? "Financial" :"") : (eachKPI && eachKPI.kpiType === "NON_FINANCIAL" ? "Non Financial" : "Financial");
       
        this.setState({ selectedKpi: value, totalCard: totalCards, charts: charts, kpiType: kpitype, benefitFrequencyTypeLocal: benefitFrequencyTypeLocal, tillDateFrequencyTypeLocal: tillDateFrequencyTypeLocal });
    }

    populateTotalCharts = (eachKPI, selectedKPI) => {
        const { totalCard } = this.state;
        const { kpiDashboardStore } = this.props;
        const kpiResponse = toJS(kpiDashboardStore.kpiResponse);
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);

        const kpiListRes = toJS(kpiDashboardStore.kpiListResponse);

        var months = new Array('January', 'February', 'March',
            'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December');
        let todayMonth = months[new Date().getMonth()]
        let todayYear = new Date().getFullYear();
        let currentMonth = "by " + todayMonth + " " + todayYear;

        let totalCards = { ...totalCard };
        if (Object.keys(kpiResponse).length > 0) {
            if (selectedKPI === "Onload") {
                totalCards.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(kpiListRes && kpiListRes[0] && kpiListRes[0].expectedBenefitFinalYear)
                totalCards.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(kpiListRes && kpiListRes[0] && kpiListRes[0].expectedBenefitCurrentYear)
                totalCards.ActualBenefits.value = DashBoardUtils.currencyFormatter(kpiListRes && kpiListRes[0] && kpiListRes[0].actualBenefit)
                totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter((kpiListRes && kpiListRes[0] && kpiListRes[0].actualBenefit) - (kpiListRes && kpiListRes[0] && kpiListRes[0].expectedBenefitCurrentYear));
                totalCards.BenefitVariance.className = ((kpiListRes && kpiListRes[0] && kpiListRes[0].actualTotalBenefit) > (kpiListRes && kpiListRes[0] && kpiListRes[0].expectedTotalBenefitCurrentYear)) ? 'green' : 'red'
                totalCards.ExpectedBenefitsFinal.subvalue = kpiListRes && kpiListRes[0] && kpiListRes[0].benefitEndDate !== null ? DashBoardUtils.monthFormatter(kpiListRes && kpiListRes[0] && kpiListRes[0].benefitEndDate) : "by"
                totalCards.ExpectedBenefits.subvalue = currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
                totalCards.ActualBenefits.subvalue = currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
                totalCards.BenefitVariance.subvalue = currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
            } else {
                totalCards.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(eachKPI.expectedBenefitFinalYear)
                totalCards.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(eachKPI.expectedBenefitCurrentYear)
                totalCards.ActualBenefits.value = DashBoardUtils.currencyFormatter(eachKPI.actualBenefit)
                totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(eachKPI.actualBenefit - eachKPI.expectedBenefitCurrentYear);
                totalCards.BenefitVariance.className = (eachKPI.actualBenefit > eachKPI.expectedBenefitCurrentYear) ? 'green' : 'red'
                totalCards.ExpectedBenefitsFinal.subvalue = eachKPI.benefitEndDate !== null ? DashBoardUtils.monthFormatter(eachKPI.benefitEndDate) : "by"
                totalCards.ExpectedBenefits.subvalue = currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
                totalCards.ActualBenefits.subvalue = currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
                totalCards.BenefitVariance.subvalue = currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)

            }
        } else {
            totalCards.ExpectedBenefitsFinal.value = '$ 0';
            totalCards.ExpectedBenefits.value = '$ 0';
            totalCards.ActualBenefits.value = '$ 0';
            totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(0);
            totalCards.BenefitVariance.className = 'red';
            totalCards.ExpectedBenefitsFinal.subvalue = '';
            totalCards.ExpectedBenefits.subvalue = '';
            totalCards.ActualBenefits.subvalue = '';
            totalCards.BenefitVariance.subvalue = '';

        }

        return totalCards;
    }

    calculateMonthly = (start, end) => {
        let startDate = moment(start);
        let endDate = moment(end);

        let result = [];

        if (endDate.isBefore(startDate)) {
            throw "End date must be greated than start date."
        }

        while (startDate.isBefore(endDate)) {
            result.push(startDate.format("MMM YY"));
            startDate.add(1, 'month');
        }
        return result;

    }

    getQuaterlyData = (start, end) => {
        let startDate = moment(start);
        let endDate = moment(end);

        let result = [];

        if (endDate.isBefore(startDate)) {
            throw "End date must be greated than start date."
        }

        while (startDate.isBefore(endDate)) {
            result.push(startDate.format("MMM YYYY"));
            startDate.add(3, 'month');
        }
        return result;
    }
    getFortnightlyData = (start, end) => {
        let startDate = moment(start);
        let endDate = moment(end);

        let result = [];

        if (endDate.isBefore(startDate)) {
            throw "End date must be greated than start date."
        }
        while (startDate.isBefore(endDate)) {
            result.push(startDate.format("MMM DD, YY"));
            startDate.add(14, 'day');
        }
        return result;
    }

    getYearly = (start, end) => {

        let result = [];
        let startDate = (new Date(start)).getFullYear();
        let endDate = (new Date(end)).getFullYear();

        while (startDate <= endDate) {
            result.push(startDate);
            startDate = startDate + 1;
        };

        return result;
    }

    retainToolTip = (graphsOptions) => {
        graphsOptions.KPITillDate.data.tooltip = {
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
         
                let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value)
                return ` ${params.seriesName}: ${x}<br />Month of Year : ${params.name}`;
            }
        }

        graphsOptions.KPITillDate.data.yAxis = {
            type: 'value',
            axisLabel: {
                formatter: function (value) {
                    let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                    return x;
                }
            },
        }

        graphsOptions.KPIOverTime.data.tooltip = {
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
              
                let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value)
                return ` ${params.seriesName}: ${x}<br />Month of Year : ${params.name}`;
            }
        }

        graphsOptions.KPIOverTime.data.yAxis = {
            type: 'value',
            axisLabel: {
                formatter: function (value) {
                    let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                    return x;
                }
            },
        }
        return graphsOptions;
    }

    frequencyChanged = (chartData, key) => {
        this.setState({ charts: graphs });
        const { benefitFrequencyTypeLocal, tillDateFrequencyTypeLocal } = this.state;
        let benefitFrequencyTypeLocalTemp = benefitFrequencyTypeLocal;
        let tillDateFrequencyTypeLocalTemp = tillDateFrequencyTypeLocal;
        const { kpiDashboardStore } = this.props;
        const tillDateFrequencyType = toJS(kpiDashboardStore.tillDateFrequencyType);
        const benefitFrequencyType = toJS(kpiDashboardStore.benefitFrequencyType);
        const actualVsTargetTotalBenefits = toJS(kpiDashboardStore.actualVsTargetTotalBenefits);
        const actualVsTargetTotalKpiTillDates = toJS(kpiDashboardStore.actualVsTargetTotalKpiTillDates);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        let startDate = moment(benefitStartDate);
        let endDate = moment(benefitEndDate);
        let targetsResult = null;
        let actualsResult = null;
        let baselineResult = null;

        let graphsOptions = JSON.parse(JSON.stringify(this.state.charts))//{ ...this.state.charts };
        if (chartData.legend.data[0].name === "Baseline") {

            if (tillDateFrequencyTypeLocalTemp === "Monthly") {

                let years = actualVsTargetTotalKpiTillDates && actualVsTargetTotalKpiTillDates.map((d) => {

                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.kpiTarget, d.kpiActual, d.baseline];
                    startDate.add(1, 'month');
                    return x;
                });

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});

                targetsResult = Object.entries(targets).map((data) => {
                    return { year: data[0], kpiTarget: data[1] }
                })

                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});

                actualsResult = Object.entries(actuals).map((data) => {
                    return { year: data[0], kpiActual: data[1] }
                })

                let baseline = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[3] : curr[3];

                    return prev;

                }, {});

                baselineResult = Object.entries(baseline).map((data) => {
                    return { year: data[0], baseline: data[1] }
                })

                this.setState({ tillDateFrequencyTypeLocal: "Yearly", toggleFrequencyIconLHS: false })
            }
            if (tillDateFrequencyTypeLocalTemp === "Fortnightly") {

                let years = actualVsTargetTotalKpiTillDates && actualVsTargetTotalKpiTillDates.map((d) => {
                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.kpiTarget, d.kpiActual, d.baseline];
                    startDate.add(14, 'day');
                    return x;
                });

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});

                targetsResult = Object.entries(targets).map((data) => {
                    return { year: data[0], kpiTarget: data[1] }
                })

                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});

                actualsResult = Object.entries(actuals).map((data) => {
                    return { year: data[0], kpiActual: data[1] }
                })

                let baseline = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[3] : curr[3];

                    return prev;

                }, {});

                baselineResult = Object.entries(baseline).map((data) => {
                    return { year: data[0], baseline: data[1] }
                })

                this.setState({ tillDateFrequencyTypeLocal: "Yearly", toggleFrequencyIconLHS: false })
            }

            if (tillDateFrequencyTypeLocalTemp === "Quarterly") {

                let years = actualVsTargetTotalKpiTillDates && actualVsTargetTotalKpiTillDates.map((d) => {
                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.kpiTarget, d.kpiActual, d.baseline];
                    startDate.add(3, 'month');
                    return x;
                });

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});

                targetsResult = Object.entries(targets).map((data) => {
                    return { year: data[0], kpiTarget: data[1] }
                })

                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});

                actualsResult = Object.entries(actuals).map((data) => {
                    return { year: data[0], kpiActual: data[1] }
                })

                let baseline = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[3] : curr[3];

                    return prev;

                }, {});

                baselineResult = Object.entries(baseline).map((data) => {
                    return { year: data[0], baseline: data[1] }
                })

                this.setState({ tillDateFrequencyTypeLocal: "Yearly", toggleFrequencyIconLHS: false })
            }

            if (tillDateFrequencyTypeLocalTemp === "Yearly") {
                this.setState({ tillDateFrequencyTypeLocal: tillDateFrequencyType });
            }
            graphsOptions.KPITillDate.data.xAxis.data = actualsResult !== null ? _.map(actualsResult, 'year') :
                tillDateFrequencyType === "Monthly" ? this.calculateMonthly(startDate, endDate) :
                    tillDateFrequencyType === "Quarterly" ? this.getQuaterlyData(startDate, endDate) :
                        tillDateFrequencyType === "Fortnightly" ? this.getFortnightlyData(startDate, endDate) :
                            this.getYearly(startDate, endDate);
            graphsOptions.KPITillDate.data.series = [
                {
                    name: 'KPI Actual',
                    type: 'bar',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    data: _.map(actualsResult !== null ? actualsResult : actualVsTargetTotalKpiTillDates, 'kpiActual')
                },
                {
                    name: 'KPI Target',
                    type: 'line',
                    itemStyle: {
                        color: '#F28E2B'
                    },
                    data: _.map(targetsResult !== null ? targetsResult : actualVsTargetTotalKpiTillDates, 'kpiTarget')
                },
                {
                    name: 'Baseline',
                    type: 'line',
                    itemStyle: {
                        color: '#99D2FF'
                    },
                    data: _.map(baselineResult !== null ? baselineResult : actualVsTargetTotalKpiTillDates, 'baseline')
                }
            ];

            let tempGraphOption = this.retainToolTip(graphsOptions);
            graphsOptions = tempGraphOption;

            this.setState({ charts: graphsOptions, toggleFrequencyIconLHS: true })

        } else if (chartData.legend.data[0].name === "Actual Benefit") {
            //let result =[];
            if (benefitFrequencyTypeLocalTemp === "Monthly") {

                let years = actualVsTargetTotalBenefits && actualVsTargetTotalBenefits.map((d) => {
                    // result.push(startDate.format("MMM YYYY"));
                    //   let x=[{
                    //        "year" :new Date(startDate.format("MMM YYYY")).getFullYear(),
                    //        "targetBenefit" :d.targetBenefit,
                    //        "actualBenefit": d.actualBenefit,
                    //    }]
                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.targetBenefit, d.actualBenefit];
                    startDate.add(1, 'month');
                    return x;
                });
           

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});

                targetsResult = Object.entries(targets).map((data) => {
                  
                    return { year: data[0], targetBenefit: data[1] }
                })
              
                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});

                actualsResult = Object.entries(actuals).map((data) => {
                  
                    return { year: data[0], actualBenefit: data[1] }
                })

                this.setState({ benefitFrequencyTypeLocal: "Yearly", toggleFrequencyIconRHS: false })
            }
            if (benefitFrequencyTypeLocalTemp === "Fortnightly") {

                let years = actualVsTargetTotalBenefits && actualVsTargetTotalBenefits.map((d) => {
                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.targetBenefit, d.actualBenefit];
                    startDate.add(14, 'day');
                    return x;
                });
             

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});


                targetsResult = Object.entries(targets).map((data) => {
                
                    return { year: data[0], targetBenefit: data[1] }
                })
             
                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});



                actualsResult = Object.entries(actuals).map((data) => {
                   
                    return { year: data[0], actualBenefit: data[1] }
                })

               
                this.setState({ benefitFrequencyTypeLocal: "Yearly", toggleFrequencyIconRHS: false })
            }

            if (benefitFrequencyTypeLocalTemp === "Quarterly") {


                let years = actualVsTargetTotalBenefits && actualVsTargetTotalBenefits.map((d) => {
                    let x = [new Date(startDate.format("MMM YYYY")).getFullYear(), d.targetBenefit, d.actualBenefit];
                    startDate.add(3, 'month');
                    return x;
                });
              

                let targets = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[1] : curr[1];

                    return prev;

                }, {});


                targetsResult = Object.entries(targets).map((data) => {
             
                    return { year: data[0], targetBenefit: data[1] }
                })
            
                let actuals = years.reduce(function (prev, curr, idx, arr) {
                    var sum = prev[curr[0]];
                    prev[curr[0]] = sum ? sum + curr[2] : curr[2];

                    return prev;

                }, {});



                actualsResult = Object.entries(actuals).map((data) => {
                  
                    return { year: data[0], actualBenefit: data[1] }
                })

              
                this.setState({ benefitFrequencyTypeLocal: "Yearly", toggleFrequencyIconRHS: false })

            }

            if (benefitFrequencyTypeLocalTemp === "Yearly") {
                
                this.setState({ benefitFrequencyTypeLocal: benefitFrequencyType, toggleFrequencyIconRHS: true });
               
            }

            graphsOptions.KPIOverTime.data.xAxis.data = actualsResult !== null ? _.map(actualsResult, 'year') :
                benefitFrequencyType === "Monthly" ? this.calculateMonthly(startDate, endDate) :
                    benefitFrequencyType === "Quarterly" ? this.getQuaterlyData(startDate, endDate) :
                        benefitFrequencyType === "Fortnightly" ? this.getFortnightlyData(startDate, endDate) :
                            this.getYearly(startDate, endDate);
            graphsOptions.KPIOverTime.data.series = [
                {
                    name: 'Actual Benefit',
                    type: 'bar',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    data: _.map(actualsResult !== null ? actualsResult : actualVsTargetTotalBenefits, 'actualBenefit')
                },
                {
                    name: 'Target Benefit',
                    type: 'line',
                    itemStyle: {
                        color: '#F28E2B'
                    },

                    data: _.map(targetsResult !== null ? targetsResult : actualVsTargetTotalBenefits, 'targetBenefit')
                }
            ];

            let tempGraphOption = this.retainToolTip(graphsOptions);
            graphsOptions = tempGraphOption;

            this.setState({ charts: graphsOptions })
        }


    }

    populateKPITillDateChart = (kpiDetails, selectedKPI) => {

        let formatterFn = 'currencyFormatter';
        const { kpiDashboardStore } = this.props;
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);
        const actualVsTargetKpiTillDatesArray = toJS(kpiDashboardStore.actualVsTargetTotalKpiTillDates);

        const kpiListRes = toJS(kpiDashboardStore.kpiListResponse);

        //const { charts, selectedKpi, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, benefitStartDate, benefitEndDate } = this.state;
        let selectedData = selectedKPI !== "Onload" ? kpiDetails.actualVsTargetKpiTillDates :  kpiListRes && kpiListRes[0] && kpiListRes[0].actualVsTargetKpiTillDates;
        let startDate = selectedKPI !== "Onload" ? kpiDetails.benefitStartDate : kpiListRes && kpiListRes[0] && kpiListRes[0].benefitStartDate;
        let endDate = selectedKPI !== "Onload" ? kpiDetails.benefitEndDate : kpiListRes && kpiListRes[0] && kpiListRes[0].benefitEndDate;
        let graphsOptions = { ...this.state.charts };
        if (selectedData && selectedData.length > 0) {
            let result = [];

            if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Monthly") {
                graphsOptions.KPITillDate.data.xAxis.data = this.calculateMonthly(startDate, endDate);
            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Yearly") {
                // getYearly();
                graphsOptions.KPITillDate.data.xAxis.data = startDate !== null && endDate !== null && this.getYearly(startDate, endDate)
            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Quarterly") {
                graphsOptions.KPITillDate.data.xAxis.data = this.getQuaterlyData(startDate, endDate);
            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Fortnightly") {
                graphsOptions.KPITillDate.data.xAxis.data = this.getFortnightlyData(startDate, endDate);
            }


            graphsOptions.KPITillDate.data.series = [
                {
                    name: 'KPI Actual',
                    type: 'bar',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         formatterFn,
                    //         // color: '#fff'
                    //     }
                    // },
                    data: _.map(selectedData, 'kpiActual')
                },
                {
                    name: 'KPI Target',
                    type: 'line',
                    itemStyle: {
                        color: '#F28E2B'
                    },
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         formatterFn,
                    //         // color: '#fff'
                    //     }
                    // },
                    data: _.map(selectedData, 'kpiTarget')
                },
                {
                    name: 'Baseline',
                    type: 'line',
                    itemStyle: {
                        color: '#99D2FF'
                    },
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         formatterFn,
                    //         // color: '#fff'
                    //     }
                    // },
                    data: _.map(selectedData, 'baseline')
                }
            ];
        } else {
            graphsOptions.KPITillDate.data.xAxis.data = [];
            graphsOptions.KPITillDate.data.series = [];
        }
        return graphsOptions;
    }



    populateKPIBenefitOverTimeChart = (kpiDetails, selectedKPI) => {

        let formatterFn = 'currencyFormatter';
        const { kpiDashboardStore } = this.props;
        const actualVsTargetTotalBenefitsArray = toJS(kpiDashboardStore.actualVsTargetTotalBenefits);
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);

        const kpiListRes = toJS(kpiDashboardStore.kpiListResponse);
        // const { charts, selectedKpi, actualVsTargetBenefits, actualVsTargetTotalBenefits, benefitStartDate, benefitEndDate } = this.state;
       let selectedData = selectedKPI !== "Onload" ? kpiDetails.actualVsTargetBenefits : kpiListRes && kpiListRes[0] && kpiListRes[0].actualVsTargetBenefits;
        let startDate = selectedKPI !== "Onload" ? kpiDetails.benefitStartDate : kpiListRes && kpiListRes[0] &&  kpiListRes[0].benefitStartDate;
        let endDate = selectedKPI !== "Onload" ? kpiDetails.benefitEndDate : kpiListRes && kpiListRes[0] && kpiListRes[0].benefitEndDate;
        let graphsOptions = { ...this.state.charts };
        if (selectedData && selectedData.length > 0) {

            if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Monthly") {
                graphsOptions.KPIOverTime.data.xAxis.data = this.calculateMonthly(startDate, endDate);
            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Yearly") {
                //  getYearlyData();
                if (startDate !== null && endDate !== null) {
                    graphsOptions.KPIOverTime.data.xAxis.data = this.getYearly(startDate, endDate);
                }

            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Quarterly") {
                graphsOptions.KPIOverTime.data.xAxis.data = this.getQuaterlyData(startDate, endDate);
            } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Fortnightly") {
                graphsOptions.KPIOverTime.data.xAxis.data = this.getFortnightlyData(startDate, endDate);
            }



            graphsOptions.KPIOverTime.data.series = [
                {
                    name: 'Actual Benefit',
                    type: 'bar',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         formatterFn,
                    //         // color: '#fff'
                    //     }
                    // },
                    data: _.map(selectedData, 'actualBenefit')
                },
                {
                    name: 'Target Benefit',
                    type: 'line',
                    itemStyle: {
                        color: '#F28E2B'
                    },
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         formatterFn,
                    //         // color: '#fff'
                    //     }
                    // },
                    data: _.map(selectedData, 'targetBenefit')
                }
            ];
        } else {
            graphsOptions.KPIOverTime.data.xAxis.data = [];
            graphsOptions.KPIOverTime.data.series = [];
        }
        return graphsOptions;
    }


    onKpiValueChange = (event) => {
        const { listOfKpi, kpiType } = this.state;
        const { kpiDashboardStore } = this.props;
        this.setState({ charts: graphs })
        if (event.target.value === "All") {

            kpiDashboardStore.getEachKPI(event.target.value).then((res) => {
                this.updateCharts("", "Onload");
            })

        } else {
            const kpiItems = { ...listOfKpi };

            kpiDashboardStore.getEachKPI(event.target.value).then((res) => {
                const eachKpi = toJS(kpiDashboardStore.eachKpi);
                this.updateCharts(eachKpi, eachKpi.kpiName);
            })
            // this.setState({charts :graphs})
            // const kpiListResponse = toJS(kpiDashboardStore.kpiListResponse);
            // kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
            //     if (event.target.value === kpi.kpiName) {
            //         this.updateCharts(kpi, event.target.value);
            //     }
            // })

        }


    }
    render() {
        const { kpiDashboardStore } = this.props;
        const kpiOptions = toJS(kpiDashboardStore.kpiListResponse);
      
        const { showSpinner, axis, selectedInnerPage, kpiType, listOfKpi, selectedKpi, benefitEndDate, benefitStartDate, actualVsTargetBenefits, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, actualVsTargetTotalBenefits, expectedTotalBenefitFinalYear, expectedTotalBenefitCurrentYear, actualTotalBenefit, expectedBenefitFinalYear, expectedBenefitCurrentYear, actualBenefit } = this.state;
        return (
            <div className="pl-3 pr-3 position-relative w-100">

                <div className="row">
                    <div className="col-lg-3 col-xl-2 mt-3">
                        <div className="row">
                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>Select KPI</h6>
                                    <select
                                        className='selectVDT form-control'
                                        style={{

                                            color: (kpiType === "" ? "#ffffff80" : "#ffffff")
                                        }}
                                        value={selectedKpi}
                                        id='KPI'
                                        tabIndex="1"
                                        disabled={this.loader}
                                        onChange={(e) => this.onKpiValueChange(e)}>
                    
                                        {kpiOptions && kpiOptions.length > 0 && kpiOptions.map((kpi, index) => {
                                            return <option id={kpi.kpiId} key={index} value={kpi.kpiName}>{kpi.kpiName}</option>
                                        })

                                        }

                                    </select>

                                </div>
                            </div>

                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>KPI Type : {kpiType && kpiType.includes(",") ? 
                                        <Fragment><br/>{kpiType}</Fragment>
                                        :
                                        `${kpiType}`}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    {kpiDashboardStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">
                                {
                                    this.state.totalCard && Object.values(this.state.totalCard).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0"><Card key={`card${ix}`} total={total} /></div>)
                                }
                            </div>
                            <div className="form-group row">
                                {
                                    this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                        <div key={`chart${ix}`} className="col-lg-6 pl-lg-0">
                                            <Charts keys={`graph${ix}`}
                                                chart={chart} disableButton={chart.label.includes("KPI till date") ? kpiDashboardStore.tillDateFrequencyType : kpiDashboardStore.benefitFrequencyType}
                                                frequencyType={chart.label.includes("KPI till date") ? this.state.tillDateFrequencyTypeLocal : this.state.benefitFrequencyTypeLocal}
                                                frequencyChanged={this.frequencyChanged} frequencyChangeIcon={true}
                                                toggleFrequencyIcon={chart.label.includes("KPI till date") ? this.state.toggleFrequencyIconLHS : this.state.toggleFrequencyIconRHS} />
                                        </div>)
                                }
                            </div>
                        </div> :
                        <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}
                </div>
            </div>
        );
    }
}

export default KpiOverviewDashboard;
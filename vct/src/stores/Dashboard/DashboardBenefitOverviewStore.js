import { makeObservable, observable, action, extendObservable, makeAutoObservable, flow, toJS, observe } from "mobx";
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
    @observable selectedFilterOption = ''
    // @observable initDashboard 
    // @observable onFilterChanged 

    constructor() {
        makeObservable(this,
          {
            filters: observable,
            totalcharts: observable,
            charts: observable,
            loader :observable,
            selectedFilterOption:observable,
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
                { value: "Low", label: "Sensitivity (Low)" },
                { value: "High", label: "Sensitivity (High)" }
            ]
        },
    };
    charts = {
        GrossBenefits: {

            label: 'Gross Benefit ($)',

            data: {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    position: function (pointer) {
                        return [pointer[0] + 10, pointer[1] - 10]
                    },
                    //formatter: 'Category : {b0}<br />Net Benefit : {c0}'
                    formatter: function (params) {
                        if (!(Array.isArray(params))) {
                            if (params.seriesName !== 'totals') {
                                if (params.seriesName === 'sensitivity') {
                                    let x = DashBoardUtils.currencyFormatter(params.data[2]);
                                    return `Category : ${params.name} <br />
                            Benefit ${x}`;
                                } else {
                                    let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.data);
                                    return `Category : ${params.name} <br />
                            Benefit ${x}`;
                                }
                            }
                        } else {
                            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value).split("$")[1];
                            x = params[1].seriesName === 'Percentage' && x.includes("(") ? `(${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x.split("(")[1].split(")")[0])})` : x;
                            return `Category : ${params[1].name} <br />
                        Benefit ${params[1].seriesName === 'Percentage' ? '% ' : ' '}: 
                         ${params[1].seriesName === 'Percentage' ? `${x} %` : x}`;
                        }
                    }
                },
                series: [{

                    data: [],
                    type: 'bar'
                }],
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
                        rotate: 90,
                        // fontSize: 10,
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
                        // fontSize: 10,
                        formatter: function (value) {
                            let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                            return x;
                        }
                    },
                },
                // legend: {},

            }
        },
        GrossBenefitsOverTime: {
            label: 'Gross Benefit Over Time ($)',
            dataType: 'value',
            data: {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    //formatter: 'Year : {b0}<br />Net Benefit : {c0}'
                    formatter: function (params) {
                        if (!(Array.isArray(params))) {
                            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value).split("$")[1];
                            let value = params.seriesName + ':' + x;
                            return `Year : ${params.name}
                        <br /> ${value}`

                        } else {
                            let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value).split("$")[1];
                            x = params[0].seriesId === 'Percentage' && x.includes("(") ? `(${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x.split("(")[1].split(")")[0])})` : x;
                            return `Year: ${params[0].axisValue}
                        <br />
                        Benefit ${params[0].seriesId === 'Percentage' ? '% ' : ''} : ${params[0].seriesId === 'Percentage' ? `${x} %` : x} `;
                        }
                    }
                },
                xAxis: {
                    type: 'category',
                    data: [],
                    // axisLabel:{  fontSize: 10,}
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
                    type: 'line'

                }],
                grid: {
                    containLabel: true,
                    height: '80%',
                    width: '90%',
                },
            }
        }
    };
    totalcharts = {
        GrossBenefits:
        {
            label: 'TOTAL GROSS BENEFITS',
            value: '',
            icon: 'benefits'
        },
        RevenueUplift: {
            label: 'TOTAL REVENUE UPLIFT',
            value: '',
            icon: 'currency_dash'
        },
        CostReduction: {
            label: 'TOTAL COST REDUCTION',
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

                if (eachObj && eachObj.financialObjectiveList && eachObj.financialObjectiveList.length > 0) {
                    eachObj && eachObj.financialObjectiveList.map((eachFinancialObj) => {
                        eachFinancialObj && eachFinancialObj.benefitOvertimeList.map((eachYearObj) => {
                            newObj = {
                                "objective": dataObj.objectiveType,
                                "objective_detail": eachObj.elementName,
                                "benefit_value": eachYearObj.netBenefit,
                                "year": eachYearObj.year,
                                "totalNetBenefit_Objective": eachFinancialObj.totalNetBenefit,
                                "totalGrossBenefits": dataObj.totalGrossBenefits,
                                "totalRevenueUplift": dataObj.totalRevenueUplift,
                                "totalCostReduction": dataObj.totalCostReduction,
                                "financialObjectiveType": eachFinancialObj.financialObjectiveType
                            }
                            ResultArr.push(newObj);
                        })
                    })
                } else {
                    newObj = {
                        "objective": dataObj.objectiveType,
                        "objective_detail": eachObj.elementName,
                        "benefit_value": 0,
                        "year": 0,
                        "totalNetBenefit_Objective": 0,
                        "totalGrossBenefits": 0,
                        "totalRevenueUplift": 0,
                        "totalCostReduction":0,
                        "financialObjectiveType": ""
                    }
                    ResultArr.push(newObj);

                }

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

        // this.totalcharts.NetBenefits.value = '';
        // this.totalcharts.NetValue.value = '';
        // this.totalcharts.PaybackPeriod.value = '';
        this.totalcharts.GrossBenefits.value = "";
        this.totalcharts.RevenueUplift.value = "";
        this.totalcharts.CostReduction.value = "";


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
        dashboardHelper.getBenefitOverview(SessionStorage.read('mapId'))
            .then(res => {
                if (res && res.data.resultCode === "OK" && res.data.errorDescription === null) {

                    this.dbData = this.createSructure(res.data.resultObj);
                    this.populateViewFilter(this.dbData, this.filters);
                    this.populateFilter(this.dbData, this.filters);
                    this.updateCharts();
                    this.loader = false;
                }
                else {
                    this.showNotification(res.data.errorDescription, "Error", "error");
                    this.loader = false;
                }

            }).catch((e)=>{
                this.loader = false;
                this.showNotification("Sorry! Something went wrong", "Error", "error");
                return e.response;
            });

        // if(res && res.data.resultCode === "OK"){

        //   this.dbData = this.createSructure(res.data.resultObj);
        //   this.populateViewFilter(this.dbData, this.filters);
        //   this.populateFilter(this.dbData, this.filters);
        //   this.updateCharts();
        // }

        //this.dbData = yield DashboardHelper.getNetBenefits(SessionStorage.read('mapId'));


    })


    populateViewFilter(dbData, filters) {
        filters.FilterView.options.replace(_.uniq(dbData.map(a => a.objective)).map(objective => { return { value: objective, label: objective } }))
        filters.FilterView.value = filters.FilterView.options[0];
    }

    populateFilter(dbData, filters) {
        const viewData = _.filter(dbData, { objective: filters.FilterView.value.value });
        filters.FilterYear.options = _.uniq(viewData.map(a => a.year)).map(y => { return { value: y, label: `Year ${y} ` } })
        filters.FilterYear.value = filters.FilterYear.options; //Select all

        filters.FilterVDT.options = _.uniq(viewData.map(a => a.objective_detail)).map(f_obj => { return { value: f_obj, label: f_obj } })
        filters.FilterVDT.value = filters.FilterVDT.options; // Select all

    }

    @action
    onFilterChanged(selectedOption, filter) {

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
        charts.GrossBenefits.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(this.getGrossBenefits(filteredData));
        charts.RevenueUplift.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(this.getRevenueUplift(filteredData));
        charts.CostReduction.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(this.getCostReduction(filteredData));

        charts.GrossBenefits.unroundedValue = DashBoardUtils.currencyFormatterNoRound(this.getGrossBenefits(filteredData));
        charts.RevenueUplift.unroundedValue = DashBoardUtils.currencyFormatterNoRound(this.getRevenueUplift(filteredData));
        charts.CostReduction.unroundedValue = DashBoardUtils.currencyFormatterNoRound(this.getCostReduction(filteredData));

        return charts;
    }

    /**
     *  Calculates the total benefit value
     * @param {*} filteredData Array of filtered records
     * @returns total amount
     */
    getGrossBenefits(filteredData) {
        let res = _.sumBy(filteredData, 'benefit_value');
        return res.toFixed();
    }
    /**
     *  Calculates the total cost reduction value
     * @param {*} filteredData Array of filtered records
     * @returns total amount
     */
    getRevenueUplift(filteredData) {
        let res = 0;
        let elementsList = [];
        // return (filteredData !== undefined && filteredData.length > 0) ? filteredData[0].totalRevenueUplift : 0; //TODO
        if (filteredData !== undefined && filteredData.length > 0) {
            filteredData.map((dataObj) => {
                if (dataObj.financialObjectiveType.includes("Revenue")
                    //  && elementsList.indexOf(dataObj.objective_detail) === -1
                ) {
                    elementsList.push(dataObj.objective_detail);
                    res = res + dataObj.benefit_value;
                }
            })
        }
        return res.toFixed();
    }
    /**
     *  Calculates the total revenue value
     * @param {*} filteredData Array of filtered records
     * @returns total amount
     */
    getCostReduction(filteredData) {
        // return (filteredData !== undefined && filteredData.length > 0) ? filteredData[0].totalCostReduction : ''; //TODO 
        let res = 0;
        let elementsList = [];
        if (filteredData !== undefined && filteredData.length > 0) {
            filteredData.map((dataObj) => {
                if (dataObj.financialObjectiveType.includes("Cost")
                    // && elementsList.indexOf(dataObj.objective_detail) === -1
                ) {
                    elementsList.push(dataObj.objective_detail);
                    res = res + dataObj.benefit_value;
                }
            })
        }
        return res.toFixed();
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
     * Updates Gross Benefit Chart accordingtooltipps to filter values and backend data
     * @param {*} dbData Initial data obtained from backend
     * @param {*} filters Filters object
     * @param {*} charts Chart object
     */
    populateGrossBenefitChart(dbData, filters, charts) {
        const filteredData = this.filterData(dbData, filters);
        let totals = []
        let acc_totals = []
        let formatterFn = 'currencyFormatter';

        if (filteredData !== [] && filteredData.length && filteredData.length > 0) {
            charts.GrossBenefits.data.xAxis.data = (filters.FilterYear.value) ? [...filters.FilterVDT.value.map(f => f.label), 'Grand Total'] : [];
            charts.GrossBenefits.data.series = [];
            charts.GrossBenefits.data.grid.height = '80%';
            charts.GrossBenefits.data.grid.width = '90%';
            charts.GrossBenefits.data.grid.left = 10;
            _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
                let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
                // acc_totals.push(_.sum(totals));
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
        } else {
            charts.GrossBenefits.data.xAxis.data = [];
            charts.GrossBenefits.data.grid.height = undefined;
            charts.GrossBenefits.data.grid.width = undefined;
            charts.GrossBenefits.data.grid.left = 40;
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
                },

            },


            data: acc_totals
        });

        /*charts.GrossBenefits.data.legend = {
            left: '0%',
            data: 
                ['test']
            
        }*/
        charts.GrossBenefits.data.series.push({
            type: 'bar',
            stack: 'benefit',
            itemStyle: {
                color: '#00BAFF'
            },
            name: filters.FilterChartType.value.value,
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
            delete charts.GrossBenefits.data.tooltip.trigger;
            charts.GrossBenefits.data.series.push({
                name: 'sensitivity',
                itemStyle: {
                    color: '#FFFFFF'
                },
                // label: {
                //     normal: {
                //         show: false,
                //     }
                // },
                type: 'custom',
                renderItemFn: 'renderSensitivity',
                z: 100,
                data: _.zip(charts.GrossBenefits.data.xAxis.data, totals, sensitivityData, acc_totals)
            })

        } else {
            charts.GrossBenefits.data.tooltip.trigger = 'axis';
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
        let acc_totals = [];
        let formatterFn = 'currencyFormatter';
        if (filteredData !== [] && filteredData.length && filteredData.length > 0) {
            charts.GrossBenefitsOverTime.data.xAxis.data = (filters.FilterYear.value) ? filters.FilterYear.value.map(f => f.label) : [];
            charts.GrossBenefitsOverTime.data.series = [];
            charts.GrossBenefitsOverTime.data.grid.height = '80%';
            charts.GrossBenefitsOverTime.data.grid.width = '90%';
            charts.GrossBenefitsOverTime.data.grid.left = 10;

            if (showTotals) {
                let totals = _(filteredData).groupBy('year').map(a => _.sumBy(a, 'benefit_value')).value();
                if (filters.FilterChartType.value.value === 'Percentage') {
                    formatterFn = 'percentageFormatter';
                    totals = DashBoardUtils.getPercentage(totals, _.sum(totals));
                }
                charts.GrossBenefitsOverTime.data.legend = {
                    left: '0%',
                    data:
                        ['Estimated Benefit']
                }

                charts.GrossBenefitsOverTime.data.series.push({
                    // name: ((filters.FilterChartType.value.value === 'High' || filters.FilterChartType.value.value === 'Low')?"Estimated Benefit":""),
                    name: 'Estimated Benefit',
                    dataType: filters.FilterChartType.value.value,
                    type: 'line',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    id: filters.FilterChartType.value.value,
                    label: {
                        normal: {
                            show: false,
                            formatterFn,
                            color: '#fff'
                        }
                    },

                    data: totals
                })


                if (filters.FilterChartType.value.value === 'High' || filters.FilterChartType.value.value === 'Low') {
                    const sensitivityData = (filters.FilterChartType.value.value === 'Low') ? DashBoardUtils.getSentivityData(totals, 0.90) : DashBoardUtils.getSentivityData(totals, 1.10)
                    delete charts.GrossBenefitsOverTime.data.tooltip.trigger;
                    charts.GrossBenefitsOverTime.data.legend.data.push(
                        (`Benefit(${filters.FilterChartType.value.value === 'Low' ? "90%" : "110%"})`)

                    )
                    charts.GrossBenefitsOverTime.data.series.push({
                        // name: "Benefits",
                        // `Benefit(${ filters.FilterChartType.value.value === 'Low' ? "90%" : "110%" })`,
                        itemStyle: {
                            color: '#99D2FF'
                        },
                        name: `Benefit(${filters.FilterChartType.value.value === 'Low' ? "90%" : "110%"})`,
                        label: {
                            normal: {
                                show: true,
                                formatterFn,
                                color: '#fff',
                                // position:"top"
                            }
                        },

                        type: 'line',
                        renderItemFn: 'renderSensitivity',
                        z: 100,
                        data: sensitivityData,
                        //  _.zip(charts.GrossBenefitsOverTime.data.xAxis.data, totals, sensitivityData)

                    })

                } else {
                    charts.GrossBenefitsOverTime.data.tooltip.trigger = 'axis';
                }



            } else {
                _.uniqBy(filteredData, 'objective_detail').forEach(vdt => {
                    let filterVDTData = _.filter(filteredData, { objective_detail: vdt.objective_detail });
                    charts.GrossBenefitsOverTime.data.series.push({
                        type: 'line',
                        itemStyle: {
                            color: '#00BAFF'
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

        } else {
            charts.GrossBenefitsOverTime.data.xAxis.data = [];
            charts.GrossBenefitsOverTime.data.series = [];
            charts.GrossBenefitsOverTime.data.grid.height = undefined;
            charts.GrossBenefitsOverTime.data.grid.width = undefined;
            charts.GrossBenefitsOverTime.data.grid.left = 40;
        }
        return charts;

    }


}
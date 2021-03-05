import React from 'react';
import DashBoardUtils from './DashboardUtils';
import "./DashboardFilter/DashboardFilter.css";
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { toast } from 'react-toastify';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage";
import Charts from "./Charts"
import Card from './Card'
import { inject, observer } from 'mobx-react';
import { toJS } from "mobx";
import MultiSelect from "react-multi-select-component";
import Select from 'react-select';
import InvestmentOverviewDashboardStore from '../../stores/Dashboard/InvestmentOverviewDashboardStore';

let graphs = {
    InvestmentTillDate: {
        displayTip: {
            position: 'top',
            message: 'Hover on the bars of the graph to see the data labels'
        },
        label: 'Investment ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                axisPointer: {
                    type: 'shadow'
                },
                position: function (pointer) {
                    return [pointer[0] + 10, pointer[1] - 10]
                },
                formatter: function (params) {
                 
                    if (params.seriesName !== 'total') {
                        let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params.value)
                        return ` Investment Category: ${params.value === 0 ? '' : params.seriesName}<br/ >Investment: ${x}`;
                    }
                }
            },
            grid: {
                containLabel: true,
                height: '80%',
                width: '90%',
            },

            xAxis: {
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
                type: 'category',
                data: []
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                        return `${x}`;
                    }
                },
            },
            legend: {
                data: [{
                    name: 'Capex',
                    icon: 'roundRect'
                },
                {
                    name: 'Opex',
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
        label: 'Investment Over Time ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                 
                    let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value)
                    let y = ''
                    if (params[1] !== null && params[1] !== undefined) {
                        y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value)
                        return ` Year: ${params[0].name}<br/ >${params[0].seriesName}: ${x}<br/ >${params[1].seriesName}: ${y}`;
                    }
                    return ` Year: ${params[0].name}<br/ >${params[0].seriesName}: ${x}<br/ >`;
                }
            },
            grid: {
                containLabel: true,
                height: '80%',
                width: '90%',
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 0,
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
                data: ['Capex', 'Opex']
            },
            series: [{

                data: [],
                type: 'bar'
            },
            ]
        }
    }
};

let totalcharts = {
    TotalInvestment:
    {
        label: 'TOTAL INVESTMENT',
        value: '$ 0',
        icon: 'Currency'
    },
    TotalCapex:
    {
        label: 'TOTAL Capex',
        value: '$ 0',
        icon: 'TotCapex'
    },
    TotalApex: {
        label: 'TOTAL Opex',
        value: '$ 0',
        icon: 'TotOpex'
    }
};

@inject('investmentOverviewDashboardStore')
@observer
class InvestmentOverviewDashboard extends React.Component {
    viewOptions = [{ value: 'Cost Category', label: 'Cost Category' },
    { value: 'Work Stream', label: 'Work Stream' },
    { value: 'Financial Objective', label: 'Financial Objective' },
    { value: 'Business Objective', label: 'Business Objective' },
    { value: 'Value Driver', label: 'Value Driver' },
    { value: 'Operational KPI', label: 'Operational KPI' }];
    defaultView = [{ value: 'Cost Category', label: 'Cost Category' }];
    data = null;
    yearsSelected = [];
    selectedViewElement = [];
    initPos = {};
    constructor(props) {
        super();
        this.state = {
            selectedInnerPage: "investmentOverView",
            axis: {},
            totalChart: totalcharts,
            charts: graphs,
            elementOptions: {},
            selectedObjective: 'Cost Category',
            investmentYears: [],
            selectedElement: [],
            selectedYears: {},
            allUniqueYears: {}

        }
    }
    componentDidMount() {
        this.setState({ charts: {} });
        // const dashBoardHelper = new DashboardHelper();
        this.getInvestmentOverview(this.state.selectedObjective); // service call to fetch response on load
        // this.onElementChange(null);
        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.initPos = document.documentElement.scrollTop;
    }
    showNotification = (type, data) => {
        switch (type) {
            case 'InvOverview':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={data}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
              
                break;
        }
    }


    getInvestmentOverview(objType) {
        const { investmentOverviewDashboardStore } = this.props;
        this.setState({ elementOptions: {}, selectedObjective: {}, charts: {}, selectedElement: [], investmentYears: [] })
        this.selectedViewElement = [{ value: objType, label: objType }];
        investmentOverviewDashboardStore.getInvestmentOverviewResponse(objType)
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK" && response.data.errorDescription === null) {

                    this.data = toJS(investmentOverviewDashboardStore.investmentOverviewResponse);
                    investmentOverviewDashboardStore.getElement(response.data.resultObj[0]);
                    let elementOptions = toJS(investmentOverviewDashboardStore.objectiveTypeList)
                    this.setState({ elementOptions: elementOptions, selectedObjective: this.selectedViewElement, charts: {} });
                    this.onElementChange(elementOptions);


                } else if (response && response.data && (response.data.resultCode === "KO" || response.data.resultCode === "OK") && response.data.errorDescription !== null) {
                    // investmentOverviewDashboardStore.loader = false;
                    this.setState({ allUniqueYears: [], elementOptions: [], }, () => {
                      
                    });
                    this.showNotification('InvOverview', response.data.errorDescription);
                    this.updateCharts([], []);
                } else {
                    this.setState({ apiError: !this.state.apiError, charts: {}, allUniqueYears: [], elementOptions: [], }, () => {
                      
                    });
                    this.updateCharts([], []);
                }
            });
    }

    updateCharts(selectedData, selectedElement) {
        const { investmentOverviewDashboardStore } = this.props;
        let charts;
        let totalCharts = this.populateTotalCharts(this.state.totalChart, selectedElement);
        charts = this.populateInvestmentChart(selectedData, selectedElement);
        charts = this.populateInvestmentOverTimeChart(selectedData, selectedElement);
        this.setState({ totalChart: totalCharts, charts: charts }, () => {
            window.scrollTo(0, this.initPos);
        })
    }

    populateTotalCharts(charts, selectedElement) {
        const { totalChart } = this.state;
        const { investmentOverviewDashboardStore } = this.props;

        let selectedData = toJS(investmentOverviewDashboardStore.elementTotalValue)

        if (selectedElement.length > 0) {
            charts.TotalInvestment.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(selectedData[selectedData.length - 1].totalCapex + selectedData[selectedData.length - 1].totalOpex)
            charts.TotalCapex.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(selectedData[selectedData.length - 1].totalCapex)
            charts.TotalApex.value = DashBoardUtils.currencyFormatterNoRoundOneDecimal(selectedData[selectedData.length - 1].totalOpex)
            
            charts.TotalInvestment.unroundedValue = DashBoardUtils.currencyFormatterNoRound(selectedData[selectedData.length - 1].totalCapex + selectedData[selectedData.length - 1].totalOpex)
            charts.TotalCapex.unroundedValue = DashBoardUtils.currencyFormatterNoRound(selectedData[selectedData.length - 1].totalCapex)
            charts.TotalApex.unroundedValue = DashBoardUtils.currencyFormatterNoRound(selectedData[selectedData.length - 1].totalOpex)
        } else {
            charts.TotalInvestment.value = '$ 0'
            charts.TotalCapex.value = '$ 0'
            charts.TotalApex.value = '$ 0'
            charts.TotalInvestment.unroundedValue = '$ 0'
            charts.TotalCapex.unroundedValue = '$ 0'
            charts.TotalApex.unroundedValue = '$ 0'
        }


        return charts;
    }

    populateInvestmentChart = (selectedValue, selectedElement) => {

        const { investmentOverviewDashboardStore } = this.props;
        let selectedData = [];
        let formatterFn = 'currencyFormatter';
        let graphsOptions = graphs;

        graphsOptions.InvestmentTillDate.data.xAxis.data = [];

        if (selectedElement.length > 0) {
            if (selectedElement === null) {
                selectedElement = this.state.selectedYears;
            }
            let elementSelected = this.state.selectedElement;
            if (elementSelected[0] && elementSelected[0].value === 'All') {
                elementSelected = this.state.elementOptions;
            }
            if (selectedElement[0] && selectedElement[0].value !== 'All') {
                let sortedElement = [];
                elementSelected.map(value => {
                    sortedElement.push(value.value);
                });
                sortedElement = sortedElement.sort();
                elementSelected = [];
                sortedElement.map(ele => {
                    elementSelected.push({ value: ele, label: ele })
                    graphsOptions.InvestmentTillDate.data.xAxis.data.push(ele);
                })

            } else {
                /* toJS(investmentOverviewDashboardStore.investmentOverviewResponse).resultObj[0].objectiveDetailList.map(value => {
                    graphsOptions.InvestmentTillDate.data.xAxis.data.push(value.elementName);
                }); */
                toJS(investmentOverviewDashboardStore.objectiveTypeList).map(value => {
                    graphsOptions.InvestmentTillDate.data.xAxis.data.push(value.value);
                });
            }
            selectedData = toJS(investmentOverviewDashboardStore.elementTotalValue)
            //selectedData = selectedValue;

            let totals = [];
            totals.push(0)
            selectedData.map((data, index) => {
                if (data.element !== 'Grand Total') {
                    totals.push(totals[totals.length - 1] + data.totalCapex + data.totalOpex)
                } else {
                    totals[index] = 0
                }

            })
            graphsOptions.InvestmentTillDate.data.xAxis.data.push('Grand Total');
            graphsOptions.InvestmentTillDate.data.grid.height = '80%';
            graphsOptions.InvestmentTillDate.data.grid.width = '90%';
            graphsOptions.InvestmentTillDate.data.grid.left = 10;

            let rotateXAxis = false;
            graphsOptions.InvestmentTillDate.data.xAxis.data.map(element => {
                if (element.length > 12) {
                    rotateXAxis = true;
                }
            })

            if (selectedData.length > 10 || rotateXAxis) {
                graphsOptions.InvestmentTillDate.data.xAxis.axisLabel.rotate = 90
            }

            graphsOptions.InvestmentTillDate.data.series = [
                {
                    name: 'total',
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
                    data: totals
                }, {

                    name: 'Capex',
                    type: 'bar',
                    stack: 'benefit',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    label: {
                        normal: {
                            show: true,
                            formatterFn,
                            color: '#fff'
                        }
                    },
                    data: _.map(selectedData, 'totalCapex')
                }, {
                    name: 'Opex',
                    type: 'bar',
                    stack: 'benefit',
                    itemStyle: {
                        color: '#99D2FF'
                    },
                    label: {
                        normal: {
                            show: true,
                            formatterFn,
                            // color: '#fff'
                        }
                    },
                    data: _.map(selectedData, 'totalOpex')
                }]
        } else {
            graphsOptions.InvestmentTillDate.data.xAxis.data = [];
            graphsOptions.InvestmentTillDate.data.grid.height = undefined;
            graphsOptions.InvestmentTillDate.data.grid.width = undefined;
            graphsOptions.InvestmentTillDate.data.grid.left = 40;
            graphsOptions.InvestmentTillDate.data.series = [{

                data: [],
                type: 'bar'
            },
            ]
        }

        return graphsOptions;
    }

    populateInvestmentOverTimeChart(selectedValue, selectedElement) {
        const { investmentOverviewDashboardStore } = this.props;
        let selectedData = [];
        let selectedValueArray = [];
        let formatterFn = 'currencyFormatter';
        let graphsOptions = graphs;

        graphsOptions.InvestmentOverTime.data.xAxis.data = [];
        if (selectedElement.length > 0) {
            graphsOptions.InvestmentOverTime.data.grid.height = '80%';
            graphsOptions.InvestmentOverTime.data.grid.width = '90%';
            graphsOptions.InvestmentOverTime.data.grid.left = 10;
            if (this.yearsSelected.length > 0 && this.yearsSelected[0].value !== 'All') {
                this.yearsSelected.map(value => {
                    graphsOptions.InvestmentOverTime.data.xAxis.data.push(value.value);
                });
            } else {
                this.state.allUniqueYears.map(value => {
                    graphsOptions.InvestmentOverTime.data.xAxis.data.push(value.value);
                });
            }

            if (selectedValue !== null) {
                selectedValue.map(data => {
                    let totalOpex = 0;
                    let totalCapex = 0;
                    if (selectedData.hasOwnProperty('Year ' + data.year)) {
                        totalOpex = selectedData['Year ' + data.year].totalOpex + data.opex;
                        totalCapex = selectedData['Year ' + data.year].totalCapex + data.capex;
                        selectedData['Year ' + data.year] = { year: data.year, totalOpex: totalOpex, totalCapex: totalCapex }
                    } else {
                        selectedData['Year ' + data.year] = { year: data.year, totalOpex: totalOpex + data.opex, totalCapex: totalCapex + data.capex }
                    }
                })
            }

            if (selectedData !== null) {
                Object.keys(selectedData).forEach(key => {
                    selectedValueArray.push(selectedData[key])
                })
            }

            let rotateXAxis = false;
            graphsOptions.InvestmentOverTime.data.xAxis.data.map(element => {
                if (element.length > 12) {
                    rotateXAxis = true;
                }
            })

            if (selectedValueArray.length > 10 || rotateXAxis) {
                graphsOptions.InvestmentOverTime.data.xAxis.axisLabel.rotate = 90
            }

            graphsOptions.InvestmentOverTime.data.series = [
                {
                    name: 'Capex',
                    type: 'line',
                    itemStyle: {
                        color: '#00BAFF'
                    },
                    label: {
                        show: true,
                        position: 'bottom',
                        formatter: function (param) {
                            return DashBoardUtils.currencyFormatterNoRoundOneDecimal(param.value).split("$")[1];
                        }
                    },
                    data: _.map(selectedValueArray, 'totalCapex')
                }, {
                    name: 'Opex',
                    type: 'line',
                    itemStyle: {
                        color: '#99D2FF'
                    },
                    label: {
                        show: true,
                        //position: 'bottom',
                        formatter: function (param) {
                            return DashBoardUtils.currencyFormatterNoRoundOneDecimal(param.value).split("$")[1];
                        }
                    },
                    data: _.map(selectedValueArray, 'totalOpex')
                }];

        } else {

            graphsOptions.InvestmentOverTime.data.xAxis.data = [];

            graphsOptions.InvestmentOverTime.data.series = [{

                data: [],
                type: 'bar'
            },
            ]
            graphsOptions.InvestmentOverTime.data.grid.height = undefined;
            graphsOptions.InvestmentOverTime.data.grid.width = undefined;
            graphsOptions.InvestmentOverTime.data.grid.left = 40;
        }

        return graphsOptions;


    }

    onElementChange = (event) => {

        const { investmentOverviewDashboardStore } = this.props;
        const { investmentYears } = this.state;
        this.setState({ charts: {}, investmentYears: [], allUniqueYears: [] })
        if (event !== null) {
            event.map(value => {
                if (value.value === 'All') {
                    event.splice(0, 1)
                }
            })
        }
        let years = [];
        let yearArray = [];
        let mode = (event === null || (event && event.length === 0)) ? 'Cleared' : (toJS(investmentOverviewDashboardStore.investmentOverviewResponse).resultObj[0].objectiveDetailList.length === event.length) ? 'All' : '';


        if (mode !== 'All' && mode !== 'Cleared') {
            event.map(e => {
                toJS(investmentOverviewDashboardStore.investmentOverviewResponse).resultObj.map(object => {
                    if (this.state.selectedObjective === object.objectiveType) {
                        object.objectiveDetailList.map(value => {
                            if (e.value === value.elementName) {
                                investmentOverviewDashboardStore.year = [];
                                investmentOverviewDashboardStore.getYear(value, mode)
                            }
                        })
                    }
                })
            })
            let allUniqueYear = toJS(investmentOverviewDashboardStore.allUniqueYear)
            //yearArray = toJS(investmentOverviewDashboardStore.year);
            investmentOverviewDashboardStore.getInvestmentValues(this.yearsSelected, event, 'element')
            investmentOverviewDashboardStore.getSelectedData(event, '', this.yearsSelected);
            investmentOverviewDashboardStore.getDataByElement(event, '', this.yearsSelected);
            // this.yearsSelected = yearArray
            //this.yearsSelected = this.yearsSelected
            this.setState({ investmentYears: this.yearsSelected, selectedElement: event, allUniqueYears: allUniqueYear },
                () => { this.updateCharts(toJS(investmentOverviewDashboardStore.selectedData), event) })
        } else {

            investmentOverviewDashboardStore.year = [];
            toJS(investmentOverviewDashboardStore.investmentOverviewResponse).resultObj.map(object => {
                object.objectiveDetailList.map(value => {
                    investmentOverviewDashboardStore.getYear(value, event)
                })
            })

            yearArray = toJS(investmentOverviewDashboardStore.allYears);
            var filteredYearArray = DashBoardUtils.removeDuplicate(yearArray)
            filteredYearArray.map(object => {
                years.push({ value: object, label: object })
            })
            let allUniqueYear = toJS(investmentOverviewDashboardStore.allUniqueYear)
            let selectedEvent = event;
            investmentOverviewDashboardStore.getInvestmentValues(years, selectedEvent, 'element')


            if (mode === 'Cleared' || (this.yearsSelected.length !== 0 && this.yearsSelected.length !== investmentOverviewDashboardStore.allUniqueYear)) {
                investmentOverviewDashboardStore.getSelectedData(event, '', this.yearsSelected);
                investmentOverviewDashboardStore.getDataByElement(event, '', this.yearsSelected);
                this.setState({ investmentYears: this.yearsSelected, selectedElement: event, selectedYears: years, allUniqueYears: allUniqueYear },
                    () => { this.updateCharts(toJS(investmentOverviewDashboardStore.selectedData), selectedEvent) })
            } else {
                this.yearsSelected = years;
                investmentOverviewDashboardStore.getSelectedData(event, '', allUniqueYear);
                investmentOverviewDashboardStore.getDataByElement(event, '', allUniqueYear);
                this.setState({ investmentYears: years, selectedElement: event, selectedYears: years, allUniqueYears: allUniqueYear },
                    () => { this.updateCharts(toJS(investmentOverviewDashboardStore.selectedData), selectedEvent) })
            }

        }

    }

    onYearChange = (event) => {
        const { investmentOverviewDashboardStore } = this.props;
        const { selectedElement } = this.state;
        this.setState({ charts: {}, investmentYears: [], allUniqueYears: [] })
        let allUniqueYear = toJS(investmentOverviewDashboardStore.allUniqueYear)
        let sortedYear = [];
        if (event.length === 0) {
            this.setState({ investmentYears: [], allUniqueYears: allUniqueYear }, () => { this.updateCharts(toJS(investmentOverviewDashboardStore.selectedData), event) })
        } else {
            if (event === null) {
                investmentOverviewDashboardStore.getInvestmentValues(event, this.state.elementOptions, 'Years')
                event = this.state.selectedYears;
            } else {
                investmentOverviewDashboardStore.getInvestmentValues(event, this.state.selectedElement, 'Years')
            }
            investmentOverviewDashboardStore.getSelectedData(event, 'Years', this.state.selectedElement);
            // investmentOverviewDashboardStore.getDataByElement(event, 'Years');
            investmentOverviewDashboardStore.getDataByElement(this.state.selectedElement, '', event);
            if (event.length > 0) {
                let yearValue = [];
                event.map(year => {
                    yearValue.push(year.value)
                })
                yearValue = yearValue.sort();
                yearValue.map(years => {
                    sortedYear.push({ value: years, label: years })
                })
            }
            this.yearsSelected = sortedYear;
            this.setState({ investmentYears: sortedYear, allUniqueYears: allUniqueYear }, () => { this.updateCharts(toJS(investmentOverviewDashboardStore.selectedData), event) })
        }
    }
    render() {
        const { axis, selectedInnerPage, kpiType, listOfKpi, selectedKpi, benefitEndDate, benefitStartDate, actualVsTargetBenefits, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, actualVsTargetTotalBenefits, expectedTotalBenefitFinalYear, expectedTotalBenefitCurrentYear, actualTotalBenefit, expectedBenefitFinalYear, expectedBenefitCurrentYear, actualBenefit } = this.state;
        const { elementOptions, investmentYears, allUniqueYears } = this.state;
        const { investmentOverviewDashboardStore } = this.props;
        return (
            <div className="pl-3 pr-3 position-relative w-100">

                <div className="row">
                    <div className="col-lg-3 col-xl-2 mt-3" >
                        <div className="row netBenefitOverview">
                            <div className="dropdown form-group col-lg-12 col-md-6">
                                <div className="field-wrap dash-dd-wrapper">
                                    <h6 className='vdtLabel'>Select View</h6>
                                    <div className="netBenefitOverview dashb-multi-dd dropdown mL40" >
                                        {/* <label className="" >{filter.label}</label> */}
                                        <div className="">

                                            <Select
                                                classNamePrefix="react-select"
                                                options={this.viewOptions}
                                                value={this.selectedViewElement}
                                                onChange={(e) => this.getInvestmentOverview(e.value)}
                                                labelledBy="Select"
                                                disableSearch={true}
                                                components={{
                                                    IndicatorSeparator: () => null
                                                }}
                                                //placeholder={this.state.placeholder}
                                                //valueRenderer={this.customValueRendererIndustry}
                                                ClearSelectedIcon
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap dash-dd-wrapper">
                                    <h6 className='vdtLabel' style={{ color: elementOptions.length > 0 ? '#ffffff' : 'grey' }}>Select Element</h6>
                                    <div className="dashb-multi-dd dropdown mL40" >
                                        {/* <label className="" >{filter.label}</label> */}
                                        <div className="">

                                            <MultiSelect
                                                className={`multi-select ${elementOptions.length > 0 ? "" : "disabledMultiselect"}`}
                                                options={elementOptions}
                                                value={this.state.selectedElement}
                                                onChange={(e) => this.onElementChange(e)}
                                                labelledBy="Select"
                                                disableSearch={true}
                                                disabled={elementOptions.length > 0 ? false : true}
                                                //placeholder={this.state.placeholder}
                                                //valueRenderer={this.customValueRendererIndustry}
                                                ClearSelectedIcon
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap dash-dd-wrapper">
                                    <h6 className='vdtLabel' style={{ color: allUniqueYears.length > 0 ? '#ffffff' : 'grey' }}>Select Year</h6>
                                    <div className="dashb-multi-dd dropdown mL40" >
                                        {/* <label className="" >{filter.label}</label> */}
                                        <div className="">

                                            <MultiSelect
                                                className={`multi-select ${allUniqueYears.length > 0 ? "" : "disabledMultiselect"}`}
                                                options={allUniqueYears}
                                                value={investmentYears}
                                                onChange={(opt) => this.onYearChange(opt)}
                                                labelledBy="Select"
                                                disableSearch={true}
                                                disabled={allUniqueYears.length > 0 ? false : true}
                                                //placeholder={this.state.placeholder}
                                                //valueRenderer={this.customValueRendererIndustry}
                                                ClearSelectedIcon
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    {investmentOverviewDashboardStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">
                                {
                                    this.state.totalChart && Object.values(this.state.totalChart).map((total, ix) => <div key={`total${ix}`} className="col-lg-4 col-md-6 pl-lg-0"><Card total={total} page="valueArchitecting" netBenefitClass="netBenefitClass" /></div>)
                                }

                            </div>
                            <div className="form-group row">
                                {
                                    this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0" key={`chart${ix}`}>
                                            <Charts chart={chart}></Charts>
                                        </div>)
                                }
                            </div>

                        </div> : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>
                    }

                </div>
            </div>
        );
    }
}

export default InvestmentOverviewDashboard;
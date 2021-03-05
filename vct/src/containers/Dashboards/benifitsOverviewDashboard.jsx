import React from 'react';
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
                }
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 90,
                    fontSize: 10,
                    rich :{
                        height: '0'
                    }
                

                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatter(value).split("$")[1];
                        return x;
                    }
                },
            },
            legend: {
              
             
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
        label: 'Actual vs Target Benefits Over Time ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                // trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
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
                        let x = DashBoardUtils.currencyFormatter(value).split("$")[1];
                        return x;
                    }
                },
            },
            legend: {
              
             
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
class BenifitsOverviewDashboard extends React.Component {

    constructor(props) {
        super();
        this.state = {
            selectedInnerPage: "kpiOverview",
            listOfKpi: {},
            selectedKpi: "All",
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
            apiError: false

        }

    }


    getKpiOverview = () => {
        const { kpiDashboardStore } = this.props;
        let kpiListResponse = {}
        kpiDashboardStore.getKpiOverview(SessionStorage.read('mapId'))
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK") {
                    kpiListResponse = response.data.resultObj.kpiList;
                    kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                        kpiDashboardStore.kpiTypeForAll.push(kpi.kpiType);
                    });
                    this.updateCharts("", "All");
                } else {
                    this.setState({ apiError: !this.state.apiError });

                }
            });

        return kpiListResponse;
    }


    componentDidMount() {
        this.setState({ charts: graphs });
        this.getKpiOverview();

    }

    showNotification(type) {
        switch (type) {
            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Failed to publish. Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                console.log("");
                break;
        }
    }


    updateCharts = (eachKPI, value) => {
        const { kpiDashboardStore } = this.props;

        let charts;
        let totalCards = this.populateTotalCharts(eachKPI, value);
        charts = this.populateKPITillDateChart(eachKPI, value);
        charts = this.populateKPIBenefitOverTimeChart(eachKPI, value);
        const kpiTypeForAll = toJS(kpiDashboardStore.kpiTypeForAll);
        let kpiFin = "", kpinNon = "";
        if (kpiTypeForAll.indexOf("FINANCIAL") > -1) {
            kpiFin = "FINANCIAL"
        }
        if (kpiTypeForAll.indexOf("NON_FINANCIAL") > -1) {
            kpinNon = "NON_FINANCIAL";
        }
        let kpitype = value === "All" ? kpiFin + " ," + kpinNon : eachKPI && eachKPI.kpiType;
      
        this.setState({ selectedKpi: value, totalCard: totalCards, charts: charts, kpiType: kpitype });
    }

    populateTotalCharts = (eachKPI, selectedKPI) => {
        const { totalCard } = this.state;
        const { kpiDashboardStore } = this.props;
        const kpiResponse = toJS(kpiDashboardStore.kpiResponse);
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);

        let totalCards = { ...totalCard };

        if (selectedKPI === "All") {
            totalCards.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(kpiResponse.expectedTotalBenefitFinalYear)
            totalCards.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(kpiResponse.expectedTotalBenefitCurrentYear)
            totalCards.ActualBenefits.value = DashBoardUtils.currencyFormatter(kpiResponse.actualTotalBenefit)
            totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(kpiResponse.actualTotalBenefit - kpiResponse.expectedTotalBenefitCurrentYear);
            totalCards.BenefitVariance.className = (kpiResponse.actualTotalBenefit > kpiResponse.expectedTotalBenefitCurrentYear) ? 'green' : 'red'
            totalCards.ExpectedBenefitsFinal.subvalue = DashBoardUtils.monthFormatter(benefitEndDate)
            totalCards.ExpectedBenefits.subvalue = DashBoardUtils.monthFormatter(benefitStartDate)
            totalCards.ActualBenefits.subvalue = DashBoardUtils.monthFormatter(benefitStartDate)
            totalCards.BenefitVariance.subvalue = DashBoardUtils.monthFormatter(benefitStartDate)
        } else {
            totalCards.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(eachKPI.expectedBenefitFinalYear)
            totalCards.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(eachKPI.expectedBenefitCurrentYear)
            totalCards.ActualBenefits.value = DashBoardUtils.currencyFormatter(eachKPI.actualBenefit)
            totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(eachKPI.actualBenefit - eachKPI.expectedBenefitCurrentYear);
            totalCards.BenefitVariance.className = (eachKPI.actualBenefit > eachKPI.expectedBenefitCurrentYear) ? 'green' : 'red'
            totalCards.ExpectedBenefitsFinal.subvalue = DashBoardUtils.monthFormatter(eachKPI.benefitEndDate)
            totalCards.ExpectedBenefits.subvalue = DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
            totalCards.ActualBenefits.subvalue = DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
            totalCards.BenefitVariance.subvalue = DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)

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
    getFortnightlyData =(start,end) =>{
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
    populateKPITillDateChart = (kpiDetails, selectedKPI) => {

        let formatterFn = 'currencyFormatter';
        const { kpiDashboardStore } = this.props;
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);
        const actualVsTargetKpiTillDatesArray = toJS(kpiDashboardStore.actualVsTargetTotalKpiTillDates);
        //const { charts, selectedKpi, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, benefitStartDate, benefitEndDate } = this.state;
        let selectedData = selectedKPI !== "All" ? kpiDetails.actualVsTargetKpiTillDates : actualVsTargetKpiTillDatesArray;
        let startDate = selectedKPI !== "All" ? kpiDetails.benefitStartDate : benefitStartDate;
        let endDate = selectedKPI !== "All" ? kpiDetails.benefitEndDate : benefitEndDate;
        let graphsOptions = { ...this.state.charts };
        if (selectedData !== [] || selectedData !== undefined) {
            let result = [];

            // graphsOptions.KPITillDate.data.xAxis.data = selectedData && selectedData.map(f => {
            //     if(f.frequencyType === "Monthly"){
            //         graphsOptions.KPITillDate.data.xAxis.data = this.calculateMonthly(startDate, endDate);                 
            //     }else if(f.frequencyType === "Yearly"){
            //         return new Date(startDate).getFullYear() + f.frequency
            //     }else if (f.frequencyType  === "Quaterly") {
            //        graphsOptions.KPITillDate.data.xAxis.data = this.getQuaterlyData(startDate, endDate);
            //     } else if (f.frequencyType === "Fortnightly") {
            //         return new Date(startDate).getFullYear() + f.frequency
            //     }
               

            // });
            function getYearly(){
                graphsOptions.KPITillDate.data.xAxis.data = selectedData && selectedData.map(f => {
                    return new Date(startDate).getFullYear() + f.frequency
                })
            }
           

            if(selectedData && selectedData[0] && selectedData[0].frequencyType === "Monthly"){
                graphsOptions.KPITillDate.data.xAxis.data = this.calculateMonthly(startDate, endDate);                 
            }else if(selectedData && selectedData[0] && selectedData[0].frequencyType === "Yearly"){
                getYearly();
            }else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Quaterly") {
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
        }
        return graphsOptions;
    }


   
    populateKPIBenefitOverTimeChart = (kpiDetails, selectedKPI) => {

        let formatterFn = 'currencyFormatter';
        const { kpiDashboardStore } = this.props;
        const actualVsTargetTotalBenefitsArray = toJS(kpiDashboardStore.actualVsTargetTotalBenefits);
        const benefitStartDate = toJS(kpiDashboardStore.benefitStartDate);
        const benefitEndDate = toJS(kpiDashboardStore.benefitEndDate);
        // const { charts, selectedKpi, actualVsTargetBenefits, actualVsTargetTotalBenefits, benefitStartDate, benefitEndDate } = this.state;
        let selectedData = selectedKPI !== "All" ? kpiDetails.actualVsTargetBenefits : actualVsTargetTotalBenefitsArray;
        let startDate = selectedKPI !== "All" ? kpiDetails.benefitStartDate : benefitStartDate;
        let endDate = selectedKPI !== "All" ? kpiDetails.benefitEndDate : benefitEndDate;
        let graphsOptions = { ...this.state.charts };
        if (selectedData !== [] || selectedData !== undefined) {

           function getYearlyData(){
                graphsOptions.KPIOverTime.data.xAxis.data = selectedData && selectedData.map(f => {
                    return new Date(startDate).getFullYear() + f.frequency
                })
            }
           
           

            if(selectedData && selectedData[0] && selectedData[0].frequencyType === "Monthly"){
                graphsOptions.KPIOverTime.data.xAxis.data = this.calculateMonthly(startDate, endDate);                 
            }else if(selectedData && selectedData[0] && selectedData[0].frequencyType === "Yearly"){
                getYearlyData();
            }else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Quaterly") {
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
        }
        return graphsOptions;
    }


    onKpiValueChange = (event) => {
        const { listOfKpi, kpiType } = this.state;
        const { kpiDashboardStore } = this.props;
        this.setState({ charts: graphs })
        if (event.target.value === "All") {

            kpiDashboardStore.getEachKPI(event.target.value).then((res) => {
                this.updateCharts("", "All");
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
                                        <option value="All" selected> All </option>
                                        {kpiOptions && kpiOptions.length > 0 && kpiOptions.map((kpi, index) => {
                                            return <option id={kpi.kpiId} key={index} value={kpi.kpiName}>{kpi.kpiName}</option>
                                        })

                                        }

                                    </select>

                                </div>
                            </div>
                        
                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>Select KPI Type</h6>
                                    <select
                                        className='selectVDT'
                                        style={{

                                            color: (kpiType === "" ? "#ffffff80" : "#ffffff")
                                        }}
                                        value={kpiType}

                                        id='KPI Type'
                                        tabIndex="1"
                                        placeholder="Select kpi type"
                                        disabled={this.loader}
                                        onChange={this.onObjectiveValueChange} >
                                        <option value={kpiType} selected disabled> {kpiType} </option>
                                        <option value="FINANCIAL">FINANCIAL</option>
                                        <option value="NON_FINANCIAL">NON_FINANCIAL</option>
                                    </select>

                                </div>
                            </div>
                        </div>
                    </div>
                    {kpiDashboardStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">

                                {
                                    this.state.totalCard && Object.values(this.state.totalCard).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0"><Card total={total} /></div>)
                                }

                            </div>


                            <div className="form-group row">
                                {
                                    this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0" key={`chart${ix}`}>
                                            <Charts chart={chart} />
                                        </div>)
                                }
                            </div>


                        </div> : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}


                </div>
            </div>
        );
    }
}

export default BenifitsOverviewDashboard;
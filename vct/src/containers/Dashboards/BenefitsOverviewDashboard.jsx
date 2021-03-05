import React from 'react';
import DashBoardUtils from './DashboardUtils';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
// import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { inject ,observer } from 'mobx-react';
import Charts from "./Charts"
import { toJS } from "mobx";
import Card from './Card';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage"
import { toast } from 'react-toastify';
import moment from 'moment';
import DashboardFilter from "../Dashboards/DashboardFilter/DashboardFilter"

let graphs = {
    NetBenefits: {
        label: 'Net Benefits($)',
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
    
            series: [{
                data: [],
                type: 'bar'
            }]
        }
    },
    NETBenefitOverTime: {
        label: 'Net Benefit Over Time ($)',
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
                // axisLabel: {
                //     rotate: 90,
                //     fontSize: 10,

                // },
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
           
            series: [{
                data: [],
                type: 'line'
            }]
        }
    }
};
let totalcards = {
    TotalNetBenefits:
    {
        label: 'TOTAL GROSS BENEFITS',
        value: '',
        subvalue: '',
        icon: 'benefits'
    },
    NetPresentValue:
    {
        label: 'TOTAL REVENUE UPLIFT',
        value: '',
        subvalue: '',
        icon: 'currency_dash'
    },
    PaybackPeriod: {
        label: 'TOTAL COST REDUCTION',
        value: '',
        subvalue: '',
        icon: 'variance_dash'
    },
    /*BenefitVariance: {
        label: 'BENEFIT VARIANCE',
        value: '',
        subvalue: '',
        icon: 'variance_dash'
    }*/

};

@inject( 'netBenefitOverviewStore','dashboardBenefitsOverviewStore')
@observer
class BenefitsOverviewDashboard extends React.Component {

    constructor(props) {
        super();
        this.state = {
            selectedInnerPage: "benefitOverview",
            listOfKpi: {},
            selectedObjective: "Financial Objective",
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


    getNetBenefitOverview = () => {
        const {dashboardBenefitsOverviewStore} = this.props;
        let netBenefitListResponse = []
        //kpiDashboardStore.getKpiOverview(SessionStorage.read('mapId'))
        dashboardBenefitsOverviewStore.initDashboard()
        // netBenefitOverviewStore.getNetBenefitOverview(SessionStorage.read('mapId'), "Financial Objective")
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK" && response.data.errorDescription === null) {
                    netBenefitListResponse = response.data.resultObj;
                    // kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                    //     kpiDashboardStore.kpiTypeForAll.push(kpi.kpiType);
                    // });
                    //this.updateCharts("", "Financial Objective");
                } else {
                    this.setState({ apiError: !this.state.apiError });

                }
            });

        return netBenefitListResponse;
    }


    componentDidMount() {
        const {dashboardBenefitsOverviewStore}=this.props;
        this.setState({ charts: graphs });
        dashboardBenefitsOverviewStore.resetDashboard()
        this.getNetBenefitOverview();

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
                break;
        }
    }


    updateCharts = (eachKPI, value) => {
        // const { kpiDashboardStore, netBenefitOverviewStore } = this.props;

        let charts;
        let totalCards = this.populateTotalCharts(eachKPI, value);
         charts = this.populateNetBenefitsChart(eachKPI, value);
        charts = this.populateNetBenefitsOverTimeChart(eachKPI, value);
        // const kpiTypeForAll = toJS(kpiDashboardStore.kpiTypeForAll);
        // let kpiFin = "", kpinNon = "";
        // if (kpiTypeForAll.indexOf("FINANCIAL") > -1) {
        //     kpiFin = "FINANCIAL"
        // }
        // if (kpiTypeForAll.indexOf("NON_FINANCIAL") > -1) {
        //     kpinNon = "NON_FINANCIAL";
        // }
        // let kpitype = value === "All" ? kpiFin + " ," + kpinNon : eachKPI && eachKPI.kpiType;
        this.setState({ selectedObjective: value,charts :charts, totalCard: totalCards });
    }

    populateTotalCharts = (eachKPI, selectedObjective) => {
        const { totalCard } = this.state;
        const { netBenefitOverviewStore } = this.props;
        const netBenefitResponse = toJS(netBenefitOverviewStore.netBenefitResponse[0]);

        let totalCards = { ...totalCard };
        if (selectedObjective === "Financial Objective") {
            totalCards.TotalNetBenefits.value = DashBoardUtils.currencyFormatter(netBenefitResponse.totalNetBenefits);
            totalCards.NetPresentValue.value = DashBoardUtils.currencyFormatter(netBenefitResponse.netPresentValue);
            totalCards.PaybackPeriod.value = netBenefitResponse.payBackPeriod;

        } else {
            totalCards.TotalNetBenefits.value = netBenefitResponse.totalNetBenefits;
            totalCards.NetPresentValue.value = netBenefitResponse.netPresentValue;
            totalCards.PaybackPeriod.value = netBenefitResponse.payBackPeriod;



        }

        return totalCards;
    }

    // calculateMonthly = (start, end) => {
    //     let startDate = moment(start);
    //     let endDate = moment(end);

    //     let result = [];

    //     if (endDate.isBefore(startDate)) {
    //         throw "End date must be greated than start date."
    //     }

    //     while (startDate.isBefore(endDate)) {
    //         result.push(startDate.format("MMM YY"));
    //         startDate.add(1, 'month');
    //     }
    //     return result;

    // }

    // getQuaterlyData = (start, end) => {
    //     let startDate = moment(start);
    //     let endDate = moment(end);

    //     let result = [];

    //     if (endDate.isBefore(startDate)) {
    //         throw "End date must be greated than start date."
    //     }

    //     while (startDate.isBefore(endDate)) {
    //         result.push(startDate.format("MMM YYYY"));
    //         startDate.add(3, 'month');
    //     }
    //     return result;
    // }
    // getFortnightlyData = (start, end) => {
    //     let startDate = moment(start);
    //     let endDate = moment(end);

    //     let result = [];

    //     if (endDate.isBefore(startDate)) {
    //         throw "End date must be greated than start date."
    //     }
    //     while (startDate.isBefore(endDate)) {
    //         result.push(startDate.format("MMM DD, YY"));
    //         startDate.add(14, 'day');
    //     }
    //     return result;
    // }
    populateNetBenefitsChart = (kpiDetails, selectedObjective) => {

        // let formatterFn = 'currencyFormatter';
        const { netBenefitOverviewStore } = this.props;
        const netBenefitResponse = toJS(netBenefitOverviewStore.netBenefitResponse[0]);
        //const { charts, selectedKpi, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, benefitStartDate, benefitEndDate } = this.state;
        let selectedData = selectedObjective === "Financial Objective" ? netBenefitResponse.objectiveDetailList : "";
       
        let graphsOptions = { ...this.state.charts };
        if (selectedData !== [] || selectedData !== undefined) {
            // let result = [];
            // let axisData =[];
         
            selectedData.map((element,i)=>{
                graphsOptions.NetBenefits.data.series.push({ name : element.elementName,type :'bar', itemStyle: {
                    color: '#00BAFF'
                }, data: [].push(element.totalNetBenefit)});

                graphsOptions.NetBenefits.data.xAxis.data.push({ name : element.elementName});
                return true;
            })
            // graphsOptions.NetBenefits.data.series = result;
            // graphsOptions.NetBenefits.data.xAxis.data = axisData;
            // graphsOptions.KPITillDate.data.series = [
            //     {
            //         name: 'KPI Actual',
            //         type: 'bar',
            //         itemStyle: {
            //             color: '#00BAFF'
            //         },
            //         // label: {
            //         //     normal: {
            //         //         show: true,
            //         //         formatterFn,
            //         //         // color: '#fff'
            //         //     }
            //         // },
            //         data: _.map(selectedData, 'kpiActual')
            //     },
            //     {
            //         name: 'KPI Target',
            //         type: 'line',
            //         itemStyle: {
            //             color: '#F28E2B'
            //         },
            //         // label: {
            //         //     normal: {
            //         //         show: true,
            //         //         formatterFn,
            //         //         // color: '#fff'
            //         //     }
            //         // },
            //         data: _.map(selectedData, 'kpiTarget')
            //     },
            //     {
            //         name: 'Baseline',
            //         type: 'line',
            //         itemStyle: {
            //             color: '#99D2FF'
            //         },
            //         // label: {
            //         //     normal: {
            //         //         show: true,
            //         //         formatterFn,
            //         //         // color: '#fff'
            //         //     }
            //         // },
            //         data: _.map(selectedData, 'baseline')
            //     }
            // ];
        }
        return graphsOptions;
    }



    populateNetBenefitsOverTimeChart = (kpiDetails, selectedObjective) => {

        // let formatterFn = 'currencyFormatter';
      
        const { netBenefitOverviewStore } = this.props;
        const netBenefitResponse = toJS(netBenefitOverviewStore.netBenefitResponse[0]);
        //const { charts, selectedKpi, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, benefitStartDate, benefitEndDate } = this.state;
        let selectedData = selectedObjective === "Financial Objective" ? netBenefitResponse.objectiveDetailList : "";
      
        let graphsOptions = { ...this.state.charts };
        if (selectedData !== [] || selectedData !== undefined) {

            selectedData.map((element,i)=>{
                element.benefitOvertimeList.map((eachBenefitYear, index) =>{
                    graphsOptions.NETBenefitOverTime.data.series.push({ name : eachBenefitYear.netBenefit,type :'line', itemStyle: {
                        color: '#00BAFF'
                    }, data: _.map(selectedData,eachBenefitYear.netBenefit)})
                    return true; 
                })
               return true; 
            })


            // if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Monthly") {
            //     graphsOptions.KPIOverTime.data.xAxis.data = this.calculateMonthly(startDate, endDate);
            // } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Yearly") {
            //     getYearlyData();
            // } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Quaterly") {
            //     graphsOptions.KPIOverTime.data.xAxis.data = this.getQuaterlyData(startDate, endDate);
            // } else if (selectedData && selectedData[0] && selectedData[0].frequencyType === "Fortnightly") {
            //     graphsOptions.KPIOverTime.data.xAxis.data = this.getFortnightlyData(startDate, endDate);
            // }



            // graphsOptions.KPIOverTime.data.series = [
            //     {
            //         name: 'Actual Benefit',
            //         type: 'bar',
            //         itemStyle: {
            //             color: '#00BAFF'
            //         },
            //         // label: {
            //         //     normal: {
            //         //         show: true,
            //         //         formatterFn,
            //         //         // color: '#fff'
            //         //     }
            //         // },
            //         data: _.map(selectedData, 'actualBenefit')
            //     },
            //     {
            //         name: 'Target Benefit',
            //         type: 'line',
            //         itemStyle: {
            //             color: '#F28E2B'
            //         },
            //         // label: {
            //         //     normal: {
            //         //         show: true,
            //         //         formatterFn,
            //         //         // color: '#fff'
            //         //     }
            //         // },
            //         data: _.map(selectedData, 'targetBenefit')
            //     }
            // ];
        }
        return graphsOptions;
    }


    onKpiValueChange = (event) => {
        // const { listOfKpi } = this.state;
        const { kpiDashboardStore } = this.props;
        this.setState({ charts: graphs })
        if (event.target.value === "FinancialObjective") {

            kpiDashboardStore.getEachKPI(event.target.value).then((res) => {
                this.updateCharts("", "FinancialObjective");
            })

        } else {
            // const kpiItems = { ...listOfKpi };

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
        const { dashboardBenefitsOverviewStore} = this.props;
        let lisOfFilters = toJS(dashboardBenefitsOverviewStore.filters);
        // const { showSpinner, axis, selectedInnerPage, kpiType, listOfKpi, selectedObjective, benefitEndDate, benefitStartDate, 
        //     actualVsTargetBenefits, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, actualVsTargetTotalBenefits,
        //      expectedTotalBenefitFinalYear, expectedTotalBenefitCurrentYear, actualTotalBenefit, expectedBenefitFinalYear, expectedBenefitCurrentYear, actualBenefit } = this.state;
        return (
            <div className="pl-3 pr-3 position-relative w-100">

                <div className="row">

                {lisOfFilters && <div className="col-lg-3 col-xl-2 mt-3" >
            <DashboardFilter
              filters={Object.values(lisOfFilters)}
              filterChange={(opt, filter) => { dashboardBenefitsOverviewStore.onFilterChanged(opt, filter) }}></DashboardFilter>
          </div>}
                    {/* <div className="col-3">
                        <div className="row">
                            <div className="field-wrap">
                                <h6 className='vdtLabel'>Select View</h6>
                                <select
                                    className='selectVDT'
                                    style={{

                                        color: (kpiType === "" ? "#ffffff80" : "#ffffff")
                                    }}
                                    value={selectedObjective}
                                    id='KPI'
                                    tabIndex="1"
                                    disabled={this.loader}
                                    onChange={(e) => this.onKpiValueChange(e)}>
                                    <option value="Financial Objective">Financial Objective</option>
                                    <option value="Business Objective">Business Objective</option>
                                    <option value="Value Driver">Value Driver</option>
                                    <option value="Operational KPI">Operational KPI</option>
                                    <option value="Work Stream">Work Stream</option>

                                </select>

                            </div>
                        </div>

                        <div className="row">
                            <div className="field-wrap">
                                <h6 className='vdtLabel'>Select VDT Element</h6>
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

                        <div className="row">
                            <div className="field-wrap">
                                <h6 className='vdtLabel'>Select Year</h6>
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

                        <div className="row">
                            <div className="field-wrap">
                                <h6 className='vdtLabel'>Select Chart Type</h6>
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


                    </div> */}
                    {this.props.dashboardBenefitsOverviewStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">

                                {
                                   dashboardBenefitsOverviewStore.totalcharts && Object.values(dashboardBenefitsOverviewStore.totalcharts).map((total, ix) => <div key={`total${ix}`} className="col-lg-4 col-md-6 pl-lg-0" ><Card total={total} page="valueArchitecting" netBenefitClass= "netBenefitClass" /></div>)
                                }

                            </div>


                            <div className="form-group row">
                                {
                                   dashboardBenefitsOverviewStore.charts && Object.values(dashboardBenefitsOverviewStore.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0" key={`chart${ix}`}>
                                            <Charts chart={chart} />
                                        </div>)
                                }
                            </div>
                        </div>

                        : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div> }


                </div>
            </div>
        );
    }
}

export default BenefitsOverviewDashboard;
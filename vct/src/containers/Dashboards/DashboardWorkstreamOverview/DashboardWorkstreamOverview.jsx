import React,{Fragment }  from 'react';
import Charts from "./../Charts"
import { toJS } from "mobx";
import Card from './../Card';
import DashBoardUtils from './../DashboardUtils';
import { toast } from 'react-toastify';
import NotificationMessage from "../../../components/NotificationMessage/NotificationMessage";
import { inject, observer } from 'mobx-react';
import ProjectPlan from './ProjectPlan';
import WorkstreamBenefits from './WorkstreamBenefits';

import { reset } from 'echarts/lib/visual/seriesColor';

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
@inject('dashboardWorkstreamOverviewStore')
class DashboardWorkstreamOverview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listOfKpi: {},
            selectedKpi: "All",
            totalCard: totalcards,
            charts:{},
            kpiType:""
        }
       
    }

    componentDidMount() {
        // this.setState({ charts: graphs });
        this.setState({totalCard: totalcards,});
        this.getWsOverview();

    }
  
    getWsOverview() {
        const { dashboardWorkstreamOverviewStore } = this.props;
        let kpiListResponse = {}
        dashboardWorkstreamOverviewStore.fetchWsOverview()
        .then((response)=>{
            if (response && response.data && response.data.resultCode === "OK"  && response.data.errorDescription === null) {
                kpiListResponse = response.data.resultObj.kpiList;
                    kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                        dashboardWorkstreamOverviewStore.kpiTypeForAll.push(kpi.kpiType);
                    });
                this.updateCharts("", "All");
                //console.log(response.resultObj)
            }
            else if (response && response.data && (response.data.resultCode === "KO" || response.data.resultCode === "OK") && response.data.errorDescription !== null) {
                this.updateCharts("", "All");
                this.showNotification('fetchErr', response.data.errorDescription)
                          
                //this.setState({ apiError: !this.state.apiError });
            }
            else {
                this.showNotification('fetchErr', response.data.errorDescription);
                //this.setState({ apiError: !this.state.apiError });
            }
        })
        .catch((error)=>{
           
        })  
    }
    showNotification(type,msg) {
        switch (type) {
            case 'fetchErr':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={msg}
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

        const { dashboardWorkstreamOverviewStore } = this.props;

        const kpiTypeForAll = toJS(dashboardWorkstreamOverviewStore.kpiTypeForAll);
        let kpiFin = "", kpinNon = "";
        if (kpiTypeForAll.indexOf("Financial") > -1) {
            kpiFin = "Financial"
        }
        if (kpiTypeForAll.indexOf("Non-Financial") > -1) {
            kpinNon = "Non Financial";
        }
        let kpitype = value === "All" ?((kpiFin || kpinNon)?( kpiFin + ", " + kpinNon ):" - "): (eachKPI && eachKPI.kpiType === "Non-Financial" ? "Non Financial" : "Financial");

        let totalCards = this.populateTotalCharts(eachKPI, value);
        this.setState({
            totalCard: totalCards,
            selectedKpi: value,
            kpiType: kpitype,
            charts : dashboardWorkstreamOverviewStore.charts
         });
    }

    populateTotalCharts = (eachKPI, selectedKPI) => {
        const { totalCard } = this.state;
        const { dashboardWorkstreamOverviewStore } = this.props;
        const wsResponse = toJS(dashboardWorkstreamOverviewStore.wsResponse);
        const expectedBenefitsTargetDate = wsResponse.expectedBenefitsTargetDate;

        var months = new Array('January', 'February', 'March',
            'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December');
        let todayMonth = months[new Date().getMonth()]
        let todayYear = new Date().getFullYear();
        let currentMonth = "by " + todayMonth + " " + todayYear;

        let totalCards = { ...totalCard };
        if(Object.keys(wsResponse).length > 0){
        if (selectedKPI === "All") {
            totalCards.ExpectedBenefitsFinal.value =  DashBoardUtils.currencyFormatter(wsResponse.totalExpectedBenefitOvertime)
            totalCards.ExpectedBenefits.value =  DashBoardUtils.currencyFormatter(wsResponse.totalExpectedBenefitCurrentYear)
            totalCards.ActualBenefits.value =  DashBoardUtils.currencyFormatter(wsResponse.totalActualBenefitCurrentYear)
            totalCards.BenefitVariance.value =  DashBoardUtils.currencyFormatter(wsResponse.totalActualBenefitCurrentYear - wsResponse.totalExpectedBenefitCurrentYear);
            totalCards.BenefitVariance.className = (wsResponse.totalActualBenefitCurrentYear > wsResponse.totalExpectedBenefitCurrentYear) ? 'green' : 'red'
            totalCards.ExpectedBenefitsFinal.subvalue = expectedBenefitsTargetDate !== null ? DashBoardUtils.monthFormatter(expectedBenefitsTargetDate) : "by"
            totalCards.ExpectedBenefits.subvalue =  currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
            totalCards.ActualBenefits.subvalue =  currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
            totalCards.BenefitVariance.subvalue = currentMonth //DashBoardUtils.monthFormatter(benefitStartDate)
        } else {
            totalCards.ExpectedBenefitsFinal.value =  DashBoardUtils.currencyFormatter(eachKPI.kpiExpectedBenefitOvertime)
            totalCards.ExpectedBenefits.value =   DashBoardUtils.currencyFormatter(eachKPI.kpiExpectedBenefitCurrentYear)
            totalCards.ActualBenefits.value =  DashBoardUtils.currencyFormatter(eachKPI.kpiActualBenefitCurrentYear)
            totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(eachKPI.kpiActualBenefitCurrentYear - eachKPI.kpiExpectedBenefitCurrentYear);
            totalCards.BenefitVariance.className = (eachKPI.kpiActualBenefitCurrentYear > eachKPI.kpiExpectedBenefitCurrentYear) ? 'green' : 'red'
            totalCards.ExpectedBenefitsFinal.subvalue =   eachKPI.kpiExpectedBenefitsTargetDate !== null ? DashBoardUtils.monthFormatter(eachKPI.kpiExpectedBenefitsTargetDate) :"by"
            totalCards.ExpectedBenefits.subvalue = currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
            totalCards.ActualBenefits.subvalue =  currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)
            totalCards.BenefitVariance.subvalue = currentMonth //DashBoardUtils.monthFormatter(eachKPI.benefitStartDate)

        }
    }else{
        totalCards.ExpectedBenefitsFinal.value =  '$ 0';
        totalCards.ExpectedBenefits.value =  '$ 0';
        totalCards.ActualBenefits.value =  '$ 0';
        totalCards.BenefitVariance.value = DashBoardUtils.currencyFormatter(0);
        totalCards.BenefitVariance.className = 'red';
        totalCards.ExpectedBenefitsFinal.subvalue =  '';
        totalCards.ExpectedBenefits.subvalue ='';
        totalCards.ActualBenefits.subvalue =  '';
        totalCards.BenefitVariance.subvalue = '';

    }

        return totalCards;
    }

    onKpiValueChange = (event) => {
        const { listOfKpi, kpiType } = this.state;
        const { dashboardWorkstreamOverviewStore } = this.props;
        // this.setState({ charts: graphs })
        if (event.target.value === "All") {

            dashboardWorkstreamOverviewStore.getEachKPI(event.target.value).then((res) => {
                dashboardWorkstreamOverviewStore.createWsCommonArray("All")
                //dashboardWorkstreamOverviewStore.buildProjectPlan()
                this.updateCharts("", "All");
            })

        } else {
            const kpiItems = { ...listOfKpi };

            dashboardWorkstreamOverviewStore.getEachKPI(event.target.value).then((res) => {
                const eachKpi = toJS(dashboardWorkstreamOverviewStore.eachKpi);
                dashboardWorkstreamOverviewStore.createWsCommonArray(eachKpi.kpiName)
                //dashboardWorkstreamOverviewStore.buildProjectPlan()
                this.updateCharts(eachKpi, eachKpi.kpiName);
            })
        }
    }
    fetchWs=(e,wsName,clickedIndex)=>{
    const {dashboardWorkstreamOverviewStore} =this.props;
    dashboardWorkstreamOverviewStore.buildProjectPlan(wsName,clickedIndex);
    
    this.setState({
        charts : dashboardWorkstreamOverviewStore.charts
    })
}


    render(){
        const { dashboardWorkstreamOverviewStore } = this.props;
        const chartWorkstreamBenefits = toJS(dashboardWorkstreamOverviewStore.charts.WorkstreamBenefits)
        const kpiOptions = toJS(dashboardWorkstreamOverviewStore.kpiListResponse);
        const { showSpinner, axis, selectedInnerPage, kpiType, listOfKpi, selectedKpi, benefitEndDate, benefitStartDate, actualVsTargetBenefits, actualVsTargetKpiTillDates, actualVsTargetTotalKpiTillDates, actualVsTargetTotalBenefits, expectedTotalBenefitFinalYear, expectedTotalBenefitCurrentYear, actualTotalBenefit, expectedBenefitFinalYear, expectedBenefitCurrentYear, actualBenefit } = this.state;
        return(
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
                                        onChange={(e) => this.onKpiValueChange(e)}
                                    >
                                        <option value="All" defaultValue> All </option>
                                        {kpiOptions && kpiOptions.length > 0 && kpiOptions.map((kpi, index) => {
                                            return <option id={kpi.kpiName} key={index} value={kpi.kpiName}>{kpi.kpiName}</option>
                                        }
                                        )}



                                    </select>

                                </div>
                            </div>

                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>KPI Type : {kpiType.includes(",") ? 
                                        <Fragment><br/>{kpiType}</Fragment>
                                        :
                                        `${kpiType}`}
                                        </h6>

                                    {/* <div 
                                    
                                        style={{color:"#c1c1c1"}}
                                        // value={kpiType}
                                        tabIndex="1"
                                        // maxLength="100"
                                        id='objective'

                                    >{kpiType}</div> */}

                                </div>
                            </div>
                        </div>
                    </div>
                    {dashboardWorkstreamOverviewStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">
                                {
                                    this.state.totalCard && Object.values(this.state.totalCard).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0"><Card key={`card${ix}`} total={total} /></div>)
                                }
                            </div>
                            <div className="form-group row">

                                 {this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                    chart.label === "Workstream Benefits ($)" ? 
                                        <div key={`Table`} className="col-lg-6 pl-lg-0">
                                            <WorkstreamBenefits chart={chartWorkstreamBenefits} getWs={this.fetchWs}/>
                                        </div>
                                        : ""
                                    
                                )}
                                   
                               
                                {this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                    chart.label === "Project Plan" ? 
                                        <div key={`projectPlan`} className="col-lg-6 pl-lg-0">
                                            <ProjectPlan keys ={`graph${ix}`} chart = {chart} excludeDeliverables = {dashboardWorkstreamOverviewStore.excludeDeliverables}
                                           
                                            >
                                                 {/* (selectedWs) => { dashboardWorkstreamOverviewStore.buildProjectPlan(selectedWs) } */}
                                                
                                            </ProjectPlan>
                                        </div>
                                        : ""
                                    
                                )}
                                {/*
                                    this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                        <div key={`chart${ix}`} className="col-lg-6 pl-lg-0">
                                            <Charts keys ={`graph${ix}`} 
                                                chart={chart} disableButton= {chart.label.includes("KPI till date") ? kpiDashboardStore.tillDateFrequencyType : kpiDashboardStore.benefitFrequencyType}
                                                frequencyType = {chart.label.includes("KPI till date") ? this.state.tillDateFrequencyTypeLocal : this.state.benefitFrequencyTypeLocal} 
                                                frequencyChanged ={this.frequencyChanged} frequencyChangeIcon={true}
                                                toggleFrequencyIcon = {chart.label.includes("KPI till date") ? this.state.toggleFrequencyIconLHS : this.state.toggleFrequencyIconRHS} />
                                        </div>)
                                */}
                            </div>
                        </div> : 
                        <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                            </div>}
                </div>
            </div>
        )
    }
}
export default DashboardWorkstreamOverview;
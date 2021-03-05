import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { toJS } from "mobx";

export default class KpiOverviewDashboardStore {
    @observable kpiResponse = {};
    @observable kpiListResponse = [];
    @observable actualVsTargetTotalKpiTillDates = [];
    @observable expectedTotalBenefitFinalYear = 0;
    @observable expectedTotalBenefitCurrentYear = 0;
    @observable actualVsTargetTotalBenefits = [];
    @observable loader = false;
    @observable eachKpi = {}
    @observable kpiTypeForAll = [];
    @observable benefitEndDate = "";
    @observable benefitStartDate ="";
    @observable tillDateFrequencyType ="";
    @observable benefitFrequencyType ="";
    @observable actualVsTargetBenefits = [];
    @observable actualVsTargetKpiTillDates = [];


    @action
    resetDashboard(){
        this.kpiResponse = {};
        this.kpiListResponse = [];
        this.actualVsTargetTotalBenefits = [];
        this.actualVsTargetTotalKpiTillDates = [];
        this.benefitEndDate = "";
        this.benefitStartDate = "";
        this.tillDateFrequencyType =  "";
        this.benefitFrequencyType =  "";
        this.kpiTypeForAll = [];
     
    }


    @action
     getKpiOverview(mapId) {
        const dashboardHelper = new DashboardHelper();
        this.loader = true;
        return  dashboardHelper.getKpiOverview(mapId)
            .then((response) => {
                if (response.data.resultCode === "OK" &&  response.data.errorDescription === null) {
                    this.kpiResponse = response.data.resultObj;
                    this.kpiListResponse = response.data.resultObj && response.data.resultObj.kpiList;
                    this.actualVsTargetTotalBenefits = response.data.resultObj && response.data.resultObj.actualVsTargetTotalBenefits;
                    this.actualVsTargetTotalKpiTillDates = response.data.resultObj && response.data.resultObj.actualVsTargetTotalKpiTillDates;
                    this.benefitEndDate = response.data.resultObj && response.data.resultObj.benefitEndDate;
                    this.benefitStartDate = response.data.resultObj && response.data.resultObj.benefitStartDate;
                    this.tillDateFrequencyType =  response.data.resultObj && response.data.resultObj.actualVsTargetTotalKpiTillDates.length >0 && response.data.resultObj.actualVsTargetTotalKpiTillDates[0].frequencyType;
                    this.benefitFrequencyType =  response.data.resultObj && response.data.resultObj.actualVsTargetTotalBenefits.length >0  && response.data.resultObj.actualVsTargetTotalBenefits[0].frequencyType;
                    this.loader = false;
                    return response
                }
                 else{
                   this.resetDashboard();
                    this.loader = false;
                    return response;
                }
            }).catch((error) => {
                this.resetDashboard();
                this.loader = false;
                // return {
                //     error: true

                // }
                return error.respone;
            })

    }

    @action
    async getEachKPI(kpiName) {
        this.loader = true;
        console.log("before", this.loader)
        const kpiListResponse = toJS(this.kpiListResponse);
        
        if (kpiName === "All") {
        await kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
            this.kpiTypeForAll.push(kpi.kpiType);
            if (kpiName === "All") {              
                this.loader = false;
                return kpi;
            }
        })

        } else {
            await kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                if (kpiName === kpi.kpiName) {
                    this.tillDateFrequencyType = kpi.actualVsTargetKpiTillDates.length> 0 && kpi.actualVsTargetKpiTillDates[0].frequencyType;
                    this.benefitFrequencyType = kpi.actualVsTargetBenefits.length> 0 && kpi.actualVsTargetBenefits[0].frequencyType;
                    this.actualVsTargetTotalBenefits = kpi.actualVsTargetBenefits;
                    this.actualVsTargetTotalKpiTillDates = kpi.actualVsTargetKpiTillDates;
                    this.benefitEndDate = kpi.benefitEndDate;
                    this.benefitStartDate = kpi.benefitStartDate;
                    this.loader = false;
                    this.eachKpi = kpi;
                    return kpi;
                }
            })
        }

    }

}
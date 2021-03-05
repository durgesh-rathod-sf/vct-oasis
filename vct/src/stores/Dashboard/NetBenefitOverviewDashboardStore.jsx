
import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { toJS } from "mobx";

export default class NetBenefitOverviewDashboardStore {
    @observable netBenefitResponse = [];
    @observable kpiListResponse = [];
    @observable actualVsTargetTotalKpiTillDates = [];
    @observable expectedTotalBenefitFinalYear = 0;
    @observable expectedTotalBenefitCurrentYear = 0;
    @observable actualVsTargetTotalBenefits = [];
    @observable loader = false;
    @observable eachKpi = {}
    @observable kpiTypeForAll = []
   

    @action
     getNetBenefitOverview(mapId, viewType) {
        const dashboardHelper = new DashboardHelper();
        this.loader = true;
        return  dashboardHelper.getNetBenefitOverview(mapId, viewType)
            .then((response) => {
                if (response.data.resultCode === "OK") {
                    this.netBenefitResponse = response.data.resultObj;
                    /*this.kpiListResponse = response.data.resultObj && response.data.resultObj.kpiList;
                    this.actualVsTargetTotalBenefits = response.data.resultObj && response.data.resultObj.actualVsTargetTotalBenefits;
                    this.actualVsTargetTotalKpiTillDates = response.data.resultObj && response.data.resultObj.actualVsTargetTotalKpiTillDates;
                    this.loader = false;*/
                    this.loader = false
                    console.log(response);
                    return response
                }
            }).catch((error) => {
                this.loader = false;
                // return {
                //     error: true

                // }
                return error.respone;
            })

    }

    /*@action
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
                    this.loader = false;
                    this.eachKpi = kpi;
                    return kpi;
                }
            })
        }

    }*/

}
import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';

import Moment from 'moment';
import { toJS } from "mobx";

const SessionStorage = require('store/storages/sessionStorage');

export default class BenefitOverviewVTStore {
    @observable benOverResponse = {};
    
    @observable actualVsTargetBenefitOverTillDates = [];
    @observable periodicBenefits = [];

    @observable expectedTotalBenefitFinalYear = 0;
    @observable expectedTotalBenefitCurrentYear = 0;
    @observable actualTotalBenefitCurrentYear = 0;
    @observable benefitVarianceCurrentYear = 0;

    @observable benefitFinalYear = '';
    @observable benefitCurrentYear = '';
    
    @observable loader = false;
   

    @action
     getBenOverviewVT(objType) {
        const dashboardHelper = new DashboardHelper();
        this.loader = true;
        const mapId = SessionStorage.read('mapId');
        this.resetAllVars();
        return  dashboardHelper.getBenOverviewVT(mapId, objType)
            .then((response) => {
                if (response && response.data && response.data.resultCode === "OK") {
                    this.benOverResponse = response.data.resultObj[0];

                    this.actualVsTargetBenefitOverTillDates = response.data.resultObj[0].objectiveDetailList;
                    this.periodicBenefits = response.data.resultObj[0].periodicOverTimeList;

                    this.expectedTotalBenefitCurrentYear = response.data.resultObj[0].expectedBenefitsTillDate;
                    this.actualTotalBenefitCurrentYear = response.data.resultObj[0].actualBenefitsTillDate;
                    this.expectedTotalBenefitFinalYear = response.data.resultObj[0].targetBenefits;
                    this.benefitVarianceCurrentYear = response.data.resultObj[0].benefitVarianceTillDate;

                    let temp = '';
                    if (response.data.resultObj[0].targetBenefitEndDate && response.data.resultObj[0].targetBenefitEndDate !== '') {
                        let dateformat = Moment(response.data.resultObj[0].targetBenefitEndDate, 'DD-MM-YYYY');
                        temp = Moment(dateformat).format("MMMM yyyy");
                    }
                    

                    this.benefitFinalYear = temp;
                    this.benefitCurrentYear = Moment().format('MMMM yyyy');
            
                    this.loader = false;
                    return response
                }else if(response && response.data && response.data.resultCode === "KO"){
                    this.loader = false;
                    return response;
                }
                 else{
                    this.loader = false;
                    return response;
                }
            }).catch((error) => {
                this.loader = false;
                // return {
                //     error: true

                // }
                return error.response;
            })

    }
        
    resetAllVars = () => {
        this.benOverResponse = {};

        this.actualVsTargetBenefitOverTillDates = [];
        this.periodicBenefits = [];

        this.expectedTotalBenefitCurrentYear = 0;
        this.actualTotalBenefitCurrentYear = 0;
        this.expectedTotalBenefitFinalYear = 0;
        this.benefitVarianceCurrentYear =  0;        

        this.benefitFinalYear = '';
        this.benefitCurrentYear = '';
    }

}
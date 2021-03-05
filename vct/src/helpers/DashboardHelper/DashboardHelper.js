import Api from '../Api/Api'
import { appUrl } from '../../constants/ApiUrls'
import * as benefitOverview from "../../assets/mock/dashboard/benefitOverview.json"



class DashboardHelper extends Api {

  getProjectOverview(mapId) {
    return this.workstreamGet(appUrl.getProjectOverview +'?mapId='+ mapId);
  }

  getBenOverviewVT(mapId, objType) {
    return this.workstreamGet(appUrl.getBenOverviewVT +'?mapId='+ mapId+'&viewType='+objType);
  }

  getKpiOverview(mapId) {
    return this.workstreamGet(appUrl.getKpiOverview + '?mapId=' + mapId)
  }

  // investment overview fetch calls
  getInvOverview(mapId, objType) {
    return this.workstreamGet(appUrl.getInvOverview + '?mapId=' + mapId + '&objectiveType=' + objType)
  }
  getBenefitOverview(mapId) {
    let objType = null;
    return this.workstreamGet(appUrl.getBenefitsOverview  + '?mapId='+ mapId + '&objectiveType=' + objType);
    //return Promise.resolve(benefitOverview.default);
  }

  getNetBenefitOverview(mapId, viewType) {
    return this.workstreamGet(appUrl.getNetBenefitOverview + '?mapId=' + mapId + '&viewType=' + viewType)
  }

  static getNetBenefits(mapId) {

    return Promise.resolve(benefitOverview.default);
  }

  getNetBenefitOver(mapId) {
    let viewType = null;
    let result = [];
    return this.workstreamGet(appUrl.getNetBenefitOverview + '?mapId=' + mapId + '&viewType=' + viewType);
    //  let result = this.createSructure(res);
    // return  result;
  }

  async downloadFiledata(url, type, name){
    return await this.downloadFileExcel(url, type, name)
  }

  downloadPublishTemplate(mapId) {
      return this.workstreamGet(appUrl.exportTableauXLS + '?mapId=' + mapId);
  }


  createSructure(data) {

    let ResultArr = [];
    let newObj = {}
    data && data.map((dataObj) => {
      dataObj && dataObj.objectiveDetailList.map((eachObj) => {
        eachObj && eachObj.benefitOvertimeList.map((eachYearObj) => {
          newObj = {
            "objective": dataObj.objective,
            "objective_detail": eachObj.elementName,
            "benefit_value": eachYearObj.netBenefit,
            "year": eachYearObj.year,
            "totalNetBenefit_Objective": eachObj.totalNetBenefit,
            "totalNetBenefits": dataObj.totalNetBenefits,
            "netPresentValue": dataObj.netPresentValue,
            "payBackPeriod": dataObj.payBackPeriod
            // "financial_objective": "NEW FO 01",
          }
          ResultArr.push(newObj);
        })
      })

    })
    console.log(ResultArr)
    return ResultArr;
    console.log(ResultArr)

  }

  getInvestmentOverviewDelivery(mapId, viewType) {
   return this.workstreamGet(appUrl.getInvestmentOverviewDelivery + '?mapId=' + mapId + '&objectiveType=' + viewType)
   
  }
  getWorkstreamOveview(mapId){
    return this.workstreamGet(appUrl.getWorkstreamOveview + '?mapId=' + mapId )
   }

  getWorkstreamOveview(mapId){
    return this.workstreamGet(appUrl.getWorkstreamOveview + '?mapId=' + mapId )
   }

}

export default DashboardHelper;
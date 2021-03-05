import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class DevelopBusinessCaseHelper extends Api {
    getKPIBenefits(payload) {
        return this.post(appUrl.generatevdt, payload);
    }

    saveKPIBenefits(payload) {
        return this.post(appUrl.savekpibenefits, payload);
    }
    loadCommonParams(payload) {
        return this.get(appUrl.loadcommonparameters + `?mapId=${payload.mapId}&kpiId=${payload.kpiId}`);
    }
    uploadCommonData(payload){
        return this.post(appUrl.vcmlCommondataUpload, payload);
    }
    uploadKpiBenifits(payload){
        return this.setKpiTargetpost(appUrl.vcmlKpibenefitsUpload, payload);
    }
    uploadInv(payload){
        return this.setKpiTargetpost(appUrl.vcmlSaveinvUpload, payload);
    }
    downloadFetchInv(payload) {
        return this.setKpiTargetpost(appUrl.vcmlFetchinvDownload, payload);
    }
    downloadCommonParams(mapId) {
        return this.get(appUrl.downloadCommonParamTemplate + `?mapId=`+mapId);
    }
    downloadKpiBenifits(mapId){
        return this.get(appUrl.downloadKpiBenefits + `?mapId=`+mapId);
    }

}

export default DevelopBusinessCaseHelper;
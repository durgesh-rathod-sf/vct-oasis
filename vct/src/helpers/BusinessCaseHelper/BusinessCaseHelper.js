import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class BusinessCaseHelper extends Api {
    fetchCommonParameters(mapId) {
        return this.get(appUrl.fetchCommonParameters + '?mapId='
            + mapId
        )
    }

    saveCommonParameters(payload,mapId) {
        return this.post(appUrl.saveCommonParameters + '?mapId=' +mapId , payload)
    }

    uploadVDT(payload) {
        return this.pythonpost(appUrl.vcmlUploadvaluedrivers, payload)
    }


    saveBenefitProfileData(mapId, payload) {
        return this.post(appUrl.saveBenefitProfile + `?mapId=${mapId}`, payload)
    }

    fetchBusinessCaseSummary(payload) {
        return this.pythonpost(appUrl.fetchBusinessCaseSummary, payload);
    }

    downloadBusinessCaseTemplate(mapId) {
        return this.post(appUrl.downloadBusinessCaseTemplate + `?mapId=${mapId}`)
    }

    fetchNPV(payload){
        return this.pythonpost(appUrl.fetchNpv, payload);
    }

    saveNPV(payload){
        return this.pythonpost(appUrl.saveNpv, payload);
    }

    downloadTemplate(url, type, name) {
        return this.downloadFile(url, type, name);
    }

    getBenefitParam(mapId){
        return this.get(appUrl.fetchMapParams + `?mapId=${mapId}`);
    }

    saveBenefitRule(payload) {
        return this.post(appUrl.saveKpiBenfitRule, payload);
    }

    getPreviewData(payload) {
        return this.post(appUrl.previewbenefitrule, payload);
    }

    getBenefitRuleData(mapId, kpiId) {
        return this.get(appUrl.getbenefitrule + `?kpiId=${kpiId}&mapId=${mapId}`);
    }

    getParamNames(mapId, kpiId) {
        return this.get(appUrl.fetchmfparams + `?kpiId=${kpiId}&mapId=${mapId}`);
    }

    getParamRulePreview(payload) {
        return this.post(appUrl.previewparamrule, payload);
    }

    saveParamRule(payload, mapId) {
        return this.post(appUrl.saverule + '?mapId=' + mapId, payload);
    }

    deleteCommonParameter(cpId) {
        return this.workstreamDelete('/valuecockpit' + appUrl.deletecommonparam +  '?cpId='
        + cpId);
    }

    deleteExtraYear(payload) {
        return this.workstreamDeletePayload(appUrl.deleteextrayear, payload);
    }

    deleteKPIBenefits(kpiId,paramId,paramType) {
        return this.workstreamDelete('/valuecockpit' + appUrl.deleteKPIBenefits + `?kpiId=${kpiId}&paramId=${paramId}&paramType=${paramType}`);
    }
}

export default BusinessCaseHelper;

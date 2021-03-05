import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class SetKpiTargetHelper extends Api {

    getTemplateDetails(fileName) {
        return this.post(appUrl.downloadTemplate + '?templateType=' + fileName)
    }

    downloadBusinessCaseTemplate(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    uploadKpiBaseLineData(payload) {
        return this.setKpiTargetpost(appUrl.vcmlFile_upload, payload)
    }

    downloadKpiBaselineFile(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    uploadBusinessTemplate(payload, mapId) {
        return this.post(appUrl.uploadUserfilledTemplate + '?mapId=' + mapId, payload);
    }

    getCalculation(payload) {
        return this.setKpiTargetpost(appUrl.vcmlCalculation, payload)
    }

    getFrequencieData(mapId) {
        return this.get(appUrl.vdtGetFrequency + '?mapId=' + mapId);
    }

    saveKpiTargetData(payload) {
        return this.post(appUrl.kpitargetsSaveTargets, payload)
    }

    getKpiInfo(mapId) {
        return this.get(appUrl.kpitargetsGetKpiInfo + '?mapId=' + mapId)
    }

    getOpKpiInfo(kpiId, mapId) {
        return this.get(appUrl.kpitargetsGetKpiInfo + '?mapId=' + mapId + '&kpiId=' + kpiId)
    }

    deleteFile(fileName, mapId) {
        return this.post(appUrl.rvdtDeleteKpiDataTemplateFile + '?mapId=' + mapId + '&fileName=' + fileName)
    }

    getSavedKpiDetails(payload) {
        return this.post(appUrl.kpitargetsViewKpitargets, payload)
    }
}

export default SetKpiTargetHelper;
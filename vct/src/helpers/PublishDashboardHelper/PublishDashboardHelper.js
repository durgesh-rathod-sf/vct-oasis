import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class PublishDashboardHelper extends Api {
    uploadTemplate(payload) {
        return this.setKpiTargetpost(appUrl.vcmlIpk_calculation, payload)
    }

    publishToDashboard(mapId) {
        return this.setKpiTargetpost('/valuecockpit' + appUrl.populateDashboard + '?mapId=' + mapId)
    }

    publishDashboard(mapId){
        return this.post(appUrl.populateDashboard + '?mapId='+mapId)
    }

    getTemplateDetails(mapId) {
        return this.post(appUrl.rvdtDownloadFinalKpiDataTemplate + '?mapId=' + mapId);
    }

    downloadTemplate(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    saveKeyCallouts(payload) {

        return this.post(appUrl.tableauSaveKeycallouts, payload)
    }

    fetchKeyCallouts(mapId) {
        return this.get(appUrl.tableauGetKeycallouts + '?mapId=' + mapId)
    }

    // showPrevFiles(mapId){
    //     return this.get('/rvdt/download-user-templates?mapId='+mapId)
    // }

    downloadFiledata(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    cancelUpload(payload) {
        return this.setKpiTargetpost(appUrl.vcmlCancelupload, payload)
    }

    getTableauToken(payload) {
        return this.tableauPostRequest(appUrl.tableauTrusted, payload)
    }
}

export default PublishDashboardHelper;
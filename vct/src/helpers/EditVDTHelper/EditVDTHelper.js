import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class EditVDTHelper extends Api {
    getSubIndustry(payload) {
        return this.post(appUrl.vdtSubIndustries, payload);
    }

    loadOfferings(payload) {
        return this.get(appUrl.loadofferings);
    }

    getSolutionType(payload) {
        return this.post(appUrl.vdtProjectScenarios, payload);
    }

    generateKPI(payload) {
        return this.post(appUrl.vdtGenerateKpiList, payload);
    }

    saveVDTDetails(payload) {
        return this.post(appUrl.vdtSaveVdt, payload);
    }
    fetchVDTData(payload) {
        return this.pythonpost(appUrl.vcmlFetchvdtdata, payload);

    }

    editKPIRows(payload) {
        return this.pythonpost(appUrl.vcmlEditkpi, payload);
    }

    uploadUpdatedKPI(payload) {
        return this.pythonpost(appUrl.vcmlUpdatevaluedrivers, payload)
    }

    downloadSelectedKPI(url, type, name = 'KpiDetails') {
        return this.downloadFile(url, type, name)
    }

    deleteKPIRows(payload) {
        return this.pythonpost(appUrl.vcmlDeletekpi, payload);
    }

    // generateXls(mapId) {
    //     return this.get('/vdt/generate-xls?mapId='+ mapId)           
    // }

    // generatePPT(mapId) {
    //    return this.get('/vdt/generate-ppt?mapId='+ mapId)            
    // }

    // exportScreen(url, type, name = 'Kpi Details') {
    //     return this.downloadFile(url, type, name)
    // }

    // getSelectedKpis(mapId) {
    //     return this.get('/rvdt/getkpi-valuedriver-list?mapId='+mapId)
    // }

    // generateKPITemplate(mapId) {
    //     return this.post('/rvdt/download-kpi-data-template?mapId='+ mapId)            
    //  }

    //  setFrequency(payload){
    //     return this.post('/vdt/set-frequency', payload);       
    // }

    getDefaultDropdownValue(mapId) {
        return this.get(appUrl.vdtSelectedKpis + '?mapId=' + mapId)
    }
}

export default EditVDTHelper;
import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class ValueDriversDropdownHelper extends Api {
    getSubIndustry(payload) {
        return this.post(appUrl.vdtSubIndustries, payload);
    }

    getFunctionalArea(payload) {
        return this.post(appUrl.vdtFunctionalAreas, payload);
    }

    getScenario(payload) {
        return this.post(appUrl.vdtProjectScenarios, payload);
    }

    generateKPI(payload) {
        return this.post(appUrl.vdtGenerateKpiList, payload);
    }

    saveVDTDetails(payload) {
        return this.post(appUrl.vdtSaveVdt, payload);
    }

    generateXls(mapId) {
        return this.get(appUrl.generateXls + '?mapId=' + mapId)
    }

    generatePPT(mapId) {
        return this.get(appUrl.generateVdtPpt + '?mapId=' + mapId)
    }

    exportScreen(url, type, name = 'Kpi Details') {
        return this.downloadFile(url, type, name)
    }

    // getSelectedKpis(mapId) {
    //     return this.get('/rvdt/getkpi-valuedriver-list?mapId='+mapId)
    // }
    
    getSelectedKpis(payload) {
        return this.post(appUrl.generatevdt, payload)
    }

    getCategorDropDownValues(){
        return this.get(appUrl.fetchFoBoCategories);
    } 

    deleteVDT(mapId) {
        return this.adminDelete(appUrl.deleteprojectinfo + '?mapId=' + mapId)
    }


    generateKPITemplate(mapId) {
        return this.post(appUrl.downloadKpiDataTemplate + '?mapId=' + mapId)
    }



    setFrequency(payload) {
        return this.post(appUrl.vdtSetFrequency, payload);
    }

    getDefaultDropdownValue(mapId) {
        return this.get(appUrl.vdtSelectedKpis + '?mapId=' + mapId)
    }
    getVDTList(mapId) {
        return this.post(appUrl.rvdtGetVdtList + '?mapId=' + mapId)
    }
    saveVDTTableHandler(payload) {
        return this.post(appUrl.vdtUpdateKpiTxns, payload)
    }


    updateVDTDetails(payload) {
        return this.pythonpost(appUrl.vcmlUpdatevdt, payload)
    }
    updateVDTTxns(payload) {
        return this.post(appUrl.vdtUpdateKpiTxns, payload)
    }
    downloadBaseline(mapId, payload) {
        return this.post(appUrl.downloadKpiDataTemplate + '?mapId=' + mapId)
    }
    uploadBaseline(payload) {
        return this.setKpiTargetpost(appUrl.vcmlFile_upload, payload)
    }
    CalculationBaseline(payload) {
        return this.setKpiTargetpost(appUrl.vcmlCalculation, payload)
    }
    getCategoryDropDownValues(){
        return this.get(appUrl.fetchObjectiveCategories);
    }

}

export default ValueDriversDropdownHelper;
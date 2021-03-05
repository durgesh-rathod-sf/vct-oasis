import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class ManuallySearchKpisDropdownHelper extends Api {
    getStrategicObjective(payload) {
       return this.post(appUrl.kpiStrategicObj, payload);       
    }

    getFinancialObjective(payload) {
        return this.post(appUrl.kpiFinancialObj, payload);       
    }

    getBusinessObjective(payload) {
        return this.post(appUrl.kpiBusinessObj, payload);
    }

    getValueDriverObjective(payload) {
        return this.post(appUrl.kpiValueDrivers, payload);
    }

    searchKPI(payload) {
        return this.post(appUrl.kpiManuallySelectKpis, payload);
    }

    saveVDTDetails(payload) {
        return this.post(appUrl.vdtSaveVdt, payload);
    }

    generateXls(payload) {
        return this.get(appUrl.generateXls + '?mapId=' + payload)
    }

    generatePPT(payload) {
        return this.get(appUrl.vdtGeneratePpt + '?mapId=' + payload)
    }

    exportScreen(url, type, name = 'Kpi Details') {
        return this.downloadFile(url, type, name)
    }

    generatedSelectedList(mapId) {
        return this.get(appUrl.rvdtGetVdtList + '?mapId=' + mapId.mapId)
    }

    genrateKpis(payload) {
        return this.post(appUrl.kpiManuallySelectKpis, payload)
    }

    updateVDTDetails(payload) {
        return this.post(appUrl.vdtEditVdt, payload)
    }

    deleteVDTDetails(payload) {
        return this.post(appUrl.kpiDeleteManuallyAddedKpi, payload)
    }


    //new PythonAPI's

    fetchVDTData(payload) {
        return this.pythonpost(appUrl.vcmlFetchvdtdata, payload);

    }
    saveKPIDetails(payload) {
        return this.pythonpost(appUrl.vcmlAddvdtdata, payload);

    }

}

export default ManuallySearchKpisDropdownHelper;
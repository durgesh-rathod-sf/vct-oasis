import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class AddInitiativeHelper extends Api {
    fetchInitiativeList(payload) {
        return this.pythonpost(appUrl.vcmlFetchinitiativelist, payload);       
    }
    saveInitiative(payload) {
        return this.pythonpost(appUrl.vcmlAddinitiative, payload);       
    }
    fetchkpimaster(payload) {
        return this.pythonpost(appUrl.vcmlFetchkpimaster, payload);       
    }
    fetchInitiative(payload) {
        return this.pythonpost(appUrl.vcmlFetchinitiative, payload);       
    }
    updateInitiative(payload) {
        return this.post(appUrl.updateInitiative, payload);       
    }
    initiativesummary(payload) {
        return this.pythonpost(appUrl.vcmlInitiativesummary, payload);       
    }
    showBusinessCaseDocument(payload){        
        return this.post(appUrl.downloadInitiativeTemplate + '?mapId='+ payload);        
    }
    downloadBusinessCaseDocument(url, type, name) {
        return this.downloadFile(url, type, name)
    }
    uploadBusinessTemplate(payload, mapId){
        return this.post(appUrl.uploadInitiativeTemplate + '?mapId='+mapId,payload);    
    }
    deleteFile(fileName, mapId){
        return this.post(appUrl.rvdtDeleteKpiDataTemplateFile + '?mapId='+mapId+'&fileName='+fileName)
    }

}

export default AddInitiativeHelper;
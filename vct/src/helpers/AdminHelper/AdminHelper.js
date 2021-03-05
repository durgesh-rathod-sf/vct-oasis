import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class AdminHelper extends Api {

    addUser(payload) {
        return this.post(appUrl.updateUser, payload)
    }
    getVediosList() {
        return this.get(appUrl.getVediosList)
    }
    saveVedio(payload){
        return this.post(appUrl.saveVedio, payload)
    }
    deleteFileMetaData(id) {
        return this.adminDelete(appUrl.deleteFileMetaData + '?docId='+ id);
    }

    fetchUsers(usersType, selectedUserType) {
        let tempUrl = ''
        if (selectedUserType) { 
            if (usersType !== '') {
                tempUrl = '?userType=' + selectedUserType + '&type=' + usersType;
            }else{
                tempUrl = '?userType=' + selectedUserType;
            }
        } else if (usersType) {
            if (usersType === "AssignOffering") {
                tempUrl = '?userType=Accenture' + '&type=' + usersType;
            }else{
                tempUrl = '?type=' + usersType;
            }
            
        }
        return this.get(appUrl.users + tempUrl)
    }

    uploadVDT(payload) {
        return this.pythonpost(appUrl.uploadValueDrivers, payload)
    }

    downloadDocument(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    // --- START - admin vdt helper functions  ----

    getObjectives(type) {
        return this.get(appUrl.getObjectives + '?objectType=' + type);
    }

    getKPIList(pageNo) {
        return this.get(appUrl.getKpiList+`?page=${pageNo}&size=100`);
        // return this.get(appUrl.getKpiList);
    }

    getIndustriesList() {
        return this.get(appUrl.getIndustries);
    }

    getBusinessList() {
        return this.get(appUrl.getBusinessFunctions);
    }

    getMasterIndustries() {
        return this.get(appUrl.getMasterIndustries);
    }

    getOppRequests() {
        return this.get(appUrl.fetchOppRequests);
    }

    saveOppRequests(payload) {
        return this.post(appUrl.saveOppRequests, payload);
    }

    deleteOppRequest(payload) {
        return this.opportunityDelete(appUrl.deleteOppRequest, payload);
    }

    saveObjectives(type, payload) {
        return this.post(appUrl.saveObjectives + '?type=' + type, payload);
    }

    saveOKPIDetails(payload) {
        return this.post(appUrl.saveOkpiDetails, payload);
    }

    deleteObjective(type, id) {
        return this.adminDelete(appUrl.deleteObjective + '?type=' + type + '&Ids=' + id);
    }

    // ---  END - admin vdt helper functions  ----

    // ---  START - admin Client accounts helper functions  ----

    /* get account names */
    getAccountNames() {
        return this.workstreamGet(appUrl.tenancyMgmtGetAccountnames);
    }

    /* save account name/names */
    saveAccount(payload) {
        return this.workstreamPost(appUrl.tenancyMgmtSaveAccount, payload);
    }

    /* delete account  */
    deleteAccount(id) {
        return this.workstreamDelete(appUrl.tenancyMgmtDeleteAccount + '?tenantId=' + id);
    }

    // ---  END - admin Client accounts helper functions  ----

    /* Bulk upload for Admin panel */
    bulkUploadForKPI(payload) {
        return this.post(appUrl.bulkUploadForKPI, payload);
    }

    bulkUploadForObjectives(payload, type) {
        return this.post(appUrl.bulkUploadForObjectives + '?type=' + type, payload);
    }

    updatePotentialDuplicatesforKPI(payload) {
        return this.post(appUrl.updateKPIUpload, payload);
    }

    updatePotentialDuplicates(payload) {
        return this.post(appUrl.updateObjects, payload);
    }

    fetchFoBoCategories() {
        return this.get(appUrl.fetchFoBoCategories);
    }
    saveSo(payload) {
        return this.post(appUrl.saveSo, payload);
    }
    saveBo(payload) {
        return this.post(appUrl.saveBo, payload);
    }
    saveFo(payload) {
        return this.post(appUrl.saveFo, payload);
    }
    saveVD(payload) {
        return this.post(appUrl.saveVD, payload);
    }
    downloadBulkTemplate(objective) {
        return this.post(`${appUrl.downloadBulkTemplate}?type=${objective}`);
    }
}

export default AdminHelper;
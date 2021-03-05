import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class ProjectHelper extends Api {
    getDemoDeal() {
        return this.get(appUrl.demoProject + '?projectType=demodeal')
    }
    getDemoProject() {
        return this.get(appUrl.demoProject + '?projectType=demoproject')
    }
    getUserProjects(payload) {
        return this.post(appUrl.projectDetails, payload);
    }

    saveProject(payload) {
        return this.post(appUrl.saveProject, payload);
    }

    updateUser(payload) {
        return this.post(appUrl.homeAddUserToProject, payload)
    }

    getUserList(projectId) {
        return this.get(appUrl.fetchUserlistForProject + '?projectId=' + projectId)
    }

    getTemplateDetails(mapId) {
        return this.post(appUrl.downloadUserfilledTemplate + '?mapId=' + mapId)
    }

    downloadBusinessCaseTemplate(url, type, name) {
        return this.downloadFile(url, type, name)
    }

    deleteFile(filename, mapId) {
        return this.post(appUrl.deleteKpiBusinesscaseTemplateFile + `?mapId=${mapId}&fileName=${filename}`);
    }

    deleteProject(payload) {
        return this.post(appUrl.deleteProject, payload);
    }

    convertDealToProject(payload) {
        return this.post(appUrl.dealtoproject, payload);
    }

    copyOfferingOrDeal(payload) {
        return this.post(appUrl.cloneoffering + `?mapId=${payload.mapId}&userId=${payload.userId}`, payload);
    }
    
    

}

export default ProjectHelper;
import {
    observable,
    action
} from "mobx";
import ProjectHelper from '../helpers/ProjectHelper/ProjectHelper';
import DashBoardUtils from '../containers/Dashboards/DashboardUtils';
var SessionStorage = require('store/storages/sessionStorage');

export default class MyProjectStore {

    @observable projectDetails = [];
    @observable projectFetchError = false

    @observable demoDealName = ""
    @observable editProjectId = false
    @observable masterOffering = false
    @observable selectedProjectId = false
    @observable projectCreated = false;
    @observable projectUsersList = [];
    @observable initialUsersList = [];
    /* New Project */
    @observable accountName = false
    @observable projectName = false
    @observable ownerName = false
    @observable startDate = false
    @observable description = false
    @observable emailId = ""
    @observable accessTypeSelected = "Read"
    @observable errormessage = ''
    @observable description = false
    @observable conversionError = ''
    @observable templateArray = []
    @observable userEmailList = []
    @observable projectDealDetails = [];
    @observable projectOfferingDetails = [];
    @observable projectMasterOfferingDetails = [];
    @observable tenantId = "null"
    @observable endDt = ""

    /* Get all projects */
    /* save master offering response */
    @observable masterOfferingObj = {}
    @observable isMaster = ""
    @action
    async getProjectLists() {
        this.projectDetails = [];
        this.projectOfferingDetails = [];
        this.projectMasterOfferingDetails = [];
        this.projectDealDetails = [];
        const projectHelper = new ProjectHelper();
        let convert = SessionStorage.read('convertToProject') === 'true' ? true : false
        let projectType = SessionStorage.read('option_selected') === "sales" ? "Deal" : "Project"
        let projectsArray = []
        if (projectType === 'Deal') {
            projectsArray.push('Offering')
        }
        projectsArray.push(projectType)
        const user = {
            userId: SessionStorage.read('userId'),
            projectTypes: projectsArray
        }
        SessionStorage.write('tenantId', null);
        return await projectHelper.getUserProjects(user)
            .then((response) => {
                if (response && !response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data
                        if (projectType === 'Deal') {
                            this.projectOfferingDetails = [...resultObj['Offering']];
                            this.projectMasterOfferingDetails = [...resultObj['MasterOffering']];
                            this.projectDealDetails = [...resultObj[projectType]];
                            this.projectDetails = [...resultObj['MasterOffering'], ...resultObj['Offering'], ...resultObj[projectType]]
                        }
                        else {
                            this.projectDetails = [...resultObj[projectType]]
                        }
                    } else {
                        console.log("error in project DetailsAPI : " + data.errorDescription)
                    }
                    return data;
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response  && e.response.data;
            })
    }

    @action
    async saveNewProject(projectUsers, action) {
        let usersList = []
        let project = {};
        SessionStorage.write('tenantId', null);
        const projectHelper = new ProjectHelper();
        if (typeof projectUsers === 'object' && Object.keys(projectUsers).length > 0 && action === 'OFFERING') {
            const { projectUsers: users } = projectUsers;
            for (let i = 0; i < users.length; i++) {
                if (users[i]['email_user' + i] !== '' && users[i]['email_user' + i] !== undefined) {
                    usersList.push({
                        userEmail: users[i]['email_user' + i],
                        accessType: users[i]['access_user' + i]
                    });
                }
            }
            project = {
                projectId: (projectUsers.projectId !== '' && projectUsers.projectId !== null) ? projectUsers.projectId : "",
                userId: SessionStorage.read('userId'),
                accountName: null,
                projectName: projectUsers.offeringName.trim(),
                ownerName: projectUsers.ownerName.trim(),
                description: projectUsers.description.trim(),
                usersList: usersList,
                startDate: null,
                projectType: "offering",
                industry: projectUsers.industrySelected['value'],
                isMaster: projectUsers.masterMarked ? "Y" : "N"
            }
        } else {
            for (let i = 0; i < projectUsers.length; i++) {
                if (projectUsers[i]['email_user' + i] !== '' && projectUsers[i]['email_user' + i] !== undefined) {
                    usersList.push({
                        userEmail: projectUsers[i]['email_user' + i],
                        accessType: projectUsers[i]['access_user' + i]
                    });
                }
            }
            let projectType = SessionStorage.read('option_selected') === "sales" ? "Deal" : "Project"
            if (action === 'NEW') {
                project = {
                    userId: SessionStorage.read('userId'),
                    tenantId: (this.accountName !== null && this.accountName !== "") ? this.accountName['value'] : null,
                    // accountName: (this.accountName !== null && this.accountName !== "") ? this.accountName['label'] : null,
                    projectName: this.projectName.trim(),
                    ownerName: this.ownerName.trim(),
                    description: this.description.trim(),
                    usersList: usersList,
                    startDate: this.startDate,
                    projectType: projectType
                }
            }

            if (action === 'EDIT') {
                project = {
                    projectId: this.editProjectId,
                    userId: SessionStorage.read('userId'),
                    tenantId: this.tenantId,
                    accountName: (this.accountName !== null && this.accountName !== "") ? this.accountName['label'] : null,
                    projectName: this.projectName.trim(),
                    ownerName: this.ownerName.trim(),
                    description: this.description.trim(),
                    usersList: usersList,
                    startDate: this.startDate,
                    projectType: projectType
                }
            }
        }
        try {
            return await projectHelper.saveProject(project)
                .then((response) => {
                    this.masterOfferingObj = {}
                    if (!response.error) {
                        const { data } = response;
                        if (data.resultCode === 'OK') {
                            this.masterOfferingObj = data;
                            SessionStorage.write('mapId', data.resultObj.mapId);
                            SessionStorage.write('VDTmode','ALL');
                            SessionStorage.write('tenantId', data.resultObj.tenantId)
                            this.errormessage = data.errorDescription
                            this.projectId = data.resultObj.projectId
                            return data;
                        } else if (data.resultCode === 'KO') {
                            this.masterOfferingObj = data;
                            this.errormessage = data.errorDescription
                            return data;
                        }
                    }
                }).catch((error) => {
                    // return {
                    //     error: true
                    // }
                    this.masterOfferingObj = {};this.errormessage = "";
                    this.masterOfferingObj = error.response.data;
                    this.errormessage = error.response.data.errorDescription;
                    return error.response.data;
                })
        } catch (e) {
            // return {
            //     error: true
            // }
            this.masterOfferingObj = {};this.errormessage = "";
            this.masterOfferingObj = e.response.data;
            this.errormessage = e.response.data.errorDescription
            return e.response.data;
        }
    }

    @action
    async deleteProject(projectDetails) {
        const projectHelper = new ProjectHelper();
        SessionStorage.write('tenantId', null);
        try {
            return await projectHelper.deleteProject(projectDetails)
                .then((response) => {
                    const { data } = response;
                    if (!response.error && data) {
                        // if (data.resultCode === 'OK') {
                            this.errormessage = data.errorDescription;
                            // this.errormessage = data.resultDescri;
                            return data;
                        // } else if (data.resultCode === 'KO') {
                        //     return data;
                        // }
                    }

                }).catch((error) => {
                    // return {
                    //     error: true
                    // }
                    this.errormessage = error.response.data.errorDescription
                    return error.response.data;
                })
        } catch (e) {
            // return {
            //     error: true
            // }
            this.errormessage = e.response.data.errorDescription
            return e.response.data;
        }
    }

    @action
    updateUsers(projectUsers) {
        let usersList = []
        const projectHelper = new ProjectHelper();
        for (let i = 0; i < projectUsers.length; i++) {
            if (projectUsers[i]['email_user' + i] !== '') {
                usersList.push(projectUsers[i]['email_user' + i]);
            }
        }

        const user = {
            usersList: usersList,
            userType: SessionStorage.read('userType'),
            projectId: SessionStorage.read('projectId')
        }

        projectHelper.updateUser(user)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.errormessage = data.errorDescription
                    } else if (response.resultCode === 'KO') {
                        this.errormessage = response.errorDescription
                    }
                }
            })
            .catch((e) => {
                //this.projectFetchError = true;
                // return {
                //     error: true
                // }
                this.errormessage = e.response.data.errorDescription
                // return e.response.data;
            })
    }

    getProjectUsers(projectId) {
        const projectHelper = new ProjectHelper();
        this.projectUsersList = [];
        return projectHelper.getUserList(projectId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    const { resultObj } = data;
                    if (data.resultCode === 'OK') {
                        for (let i = 0; i < resultObj.length; i++) {
                            const userDetail = {
                                ['email_user' + i]: resultObj[i].userEmail,
                                ['endDt_user' + i]: resultObj[i].endDate?new Date(DashBoardUtils.formatDateMMDDYY(resultObj[i].endDate)) : new Date(),
                                //['endDt_user' + i]: resultObj[i].endDate?new Date(resultObj[i].endDate) : new Date(),
                                ['access_user' + i]: resultObj[i].accessType !== "null" ? resultObj[i].accessType : 'Select',
                                'delete_index': i,
                            }
                            this.userEmailList.push(resultObj[i].userEmail)
                            this.projectUsersList.push(userDetail);
                        }
                        this.initialUsersList = [...this.projectUsersList];
                        return data;
                    }else if(data.resultCode === "KO"){
                        return data;
                    }
                }
                return false;
            })
            .catch((e) => {
                //this.projectFetchError = true;
                // return {
                //     error: true
                // }
                return e.response.data;
            })
    }

    @action
    downloadTemplate(url, fileName) {
        const projectHelper = new ProjectHelper();
        return projectHelper.downloadBusinessCaseTemplate(url, 'xlsx', fileName);
    }



    @action
    deleteFile(fileName) {
        const projectHelper = new ProjectHelper();
        const mapId = SessionStorage.read('mapId')
        return projectHelper.deleteFile(fileName, mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    // if (data.resultCode === 'OK') {
                        return data;
                    // }
                }
                // return false;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    getTemplateDetails() {
        const projectHelper = new ProjectHelper();
        this.templateArray = []
        return projectHelper.getTemplateDetails(SessionStorage.read('mapId'))
            .then((response) => {
                const { data } = response;
                if (!response.error) {
                    if (data.resultCode === 'OK') {
                        const resultObj = data.resultObj
                        if (resultObj.length > 0) {
                            for (let i = 0; i < resultObj.length; i++) {
                                this.templateArray.push(resultObj[i])
                            }
                            // return true;
                        }
                        return data;
                    }else{
                        return data;
                    }
                }
                return data;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }
    //DemoDeal
    @action
    async fetchDemoDeal() {
        this.projectDetails = [];
        const projectHelper = new ProjectHelper();

        return await projectHelper.getDemoDeal()
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data
                        this.demoDealName = resultObj.projectName;
                        SessionStorage.write("demoMapId", resultObj.mapId);
                        SessionStorage.write('mapId', SessionStorage.read('demoMapId'));
                        SessionStorage.write('VDTmode','ALL');
                        SessionStorage.write("tenantId", resultObj.tenantId)
                        SessionStorage.write("demoDealName", resultObj.projectName);
                        return data;
                    }
                    return data;
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response.data;
            })
    }
    async fetchDemoProject() {
        this.projectDetails = [];
        const projectHelper = new ProjectHelper();

        return await projectHelper.getDemoProject()
            .then((response) => {
                console.log("in store-->>", response);
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data
                        this.demoProjectName = resultObj.projectName;
                        SessionStorage.write("demoMapId", resultObj.mapId);
                        SessionStorage.write('mapId', SessionStorage.read('demoMapId'));
                        SessionStorage.write('VDTmode','ALL');
                        SessionStorage.write("tenantId", resultObj.tenantId)
                        SessionStorage.write("demoDealName", resultObj.projectName);
                        return data;
                    }
                    return data;
                }

            })
            .catch((e) => {
                    // return {
                    //     error: true
                    // }
                return e.response.data;
            })
    }



    // convert deal to project
    @action
    getProjectId(param) {
        if (this.projectDetails && this.projectDetails.length !== 0) {
            for (let i = 0; i < this.projectDetails.length; i++) {
                if (this.projectDetails[i].mapId === Number(SessionStorage.read('mapId'))) {
                    this.editProjectId = this.projectDetails[i].projectId;
                }
            }
        } else {
            this.getProjectLists()
                .then((res) => {
                    for (let i = 0; i < this.projectDetails.length; i++) {
                        if (this.projectDetails[i].mapId === Number(SessionStorage.read('mapId'))) {
                            this.editProjectId = this.projectDetails[i].projectId;
                        }
                    }
                }).catch((error) => {
                    return {
                        error: true
                    }
                    // return error.response.data;
                });
        }
    }

    @action
    async dealToProject(projectUsers, flag) {
        const projectHelper = new ProjectHelper();

        let usersList = [];
        for (let i = 0; i < projectUsers.length; i++) {
            if (projectUsers[i]['email_user' + i] !== '' && projectUsers[i]['email_user' + i] !== undefined) {
                usersList.push({
                    userEmail: projectUsers[i]['email_user' + i],
                    accessType: projectUsers[i]['access_user' + i]
                });
            }
        }
        const payload = {
            "map_id": SessionStorage.read('mapId'),
            "flag": flag,
            "projectId": 1929,
            "userId": SessionStorage.read('userId'),
            "accountName": this.accountName['value'],
            "projectName": this.projectName,
            "ownerName": this.ownerName,
            "description": this.description,
            "usersList": usersList,
            "startDate": this.startDate,
            "projectType": "Project",
            "tenantId": this.tenantId,
        }
        return await projectHelper.convertDealToProject(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    // this.KpiBaselineFilePath = response.data.file_download_link
                    SessionStorage.write("convertToProject", false)
                    SessionStorage.write("option_selected", "delivery")

                    return response.data;
                } else {
                    // SessionStorage.write("convertToProject",false)
                    this.conversionError = response.data.error;
                    return response.data;
                }


            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    async copyOfferingOrDeal(copyObject) {
        const projectHelper = new ProjectHelper();
        // SessionStorage.write('tenantId', null);
        try {
            return await projectHelper.copyOfferingOrDeal(copyObject)
                .then((response) => {
                    if (!response.error) {
                        const { data } = response;
                        return response;
                    }

                }).catch((error) => {
                    // return {
                    //     error: true
                    // }
                    return error.response;
                })

        } catch (e) {
            return {
                error: true
            }
        }
    }
}
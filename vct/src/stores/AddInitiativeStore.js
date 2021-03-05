import { observable, action } from "mobx";


import AddInitiativeHelper from '../helpers/AddInitiativeHelper/AddInitiativeHelper';
var SessionStorage = require('store/storages/sessionStorage');
export default class AddInitiativeStore {
    @observable initiativeDetails = []
    @observable initiativeSummaryDetails = []
    @observable iniDetails = []
    @observable initiativeName = ''
    @observable description = ''
    @observable completion = ''
    @observable intiativeStatus = ''
    @observable projectManager = ''
    @observable intiativeOwner = ''
    @observable startDate = ''
    @observable endDate = ''
    @observable duration = ''
    @observable activeFlag = ''
    @observable frequency = ''
    @observable risks = []
    @observable actions = []
    @observable deliverables = []
    @observable deliverable = false
    @observable targetCompletionArray = []
    @observable expectedCompletionArray = []
    @observable actualCompletionArray = []
    @observable benInv = []
    @observable benefitTargetPeriod = ''
    @observable benefitActualPeriod = ''
    @observable benefitTargetValue = ''
    @observable benefitActualValue = ''
    @observable invTargetPeriod = ''
    @observable invActualPeriod = ''
    @observable invTargetValue = ''
    @observable invActualValue = ''
    @observable initiativesList = []
    @observable linkedKpis = []
    @observable linkedKpiIds = []
    @observable dailyFrequency = []
    @observable monthlyFrequency = []
    @observable benefitTargetValueArray = []
    @observable invTargetValueArray = []
    @observable invActualValueArray = []
    @observable benefitActualValueArray = []
    @observable benefitTargetPeriodArray = []
    @observable benefitActualPeriodArray = []
    @observable invTargetPeriodArray = []
    @observable invActualPeriodArray = []
    @observable ini_id = ''
    @observable templateArray = []
    @observable frequency = ''
    @observable targetDates = []
    @observable displayTable = ''
    @observable periods = 0

    @action
    async getInitiativeList() {
        const addInitiativeHelper = new AddInitiativeHelper();
        const vdtDetails = {
            map_id: SessionStorage.read('mapId'),

        }
        return await addInitiativeHelper.fetchInitiativeList(vdtDetails)
            .then((response) => {
                if (!response.error && response.data.responseCode === 'OK') {
                    this.initiativesList = response.data.selectedIniNames;
                }
            }).catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            });
    }

    @action
    async saveInitiatives() {
        const addInitiativeHelper = new AddInitiativeHelper();

        return await addInitiativeHelper.saveInitiative(this.initativeDetails)
            .then((response) => {
                if (!response.error && response.data[0].responseCode === 'OK') {
                    return true;
                }
                return false;
            }).catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            });
    }

    @action
    async fetchLinkedKpis() {
        const addInitiativeHelper = new AddInitiativeHelper();
        const vdtDetails = {
            map_id: SessionStorage.read('mapId'),
            // selectedKpis: this.selectedVDT
        }

        return await addInitiativeHelper.fetchkpimaster(vdtDetails)
            .then((response) => {
                if (response !== undefined && !response.error) {
                    this.linkedKpis = response.data.resultObj;
                }
            }).catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            });
    }

    @action
    async fetchInitiativeDetails(iniId) {
        const addInitiativeHelper = new AddInitiativeHelper();
        const vdtDetails = {
            ini_id: iniId.toString(),
            // selectedKpis: this.selectedVDT
        }
        this.ini_id = vdtDetails.ini_id
        return await addInitiativeHelper.fetchInitiative(vdtDetails)
            .then((response) => {
                if (!response.error) {
                    this.iniDetails = response.data;
                    return true
                }
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

    @action
    async updateInitiative(details) {

        const addInitiativeHelper = new AddInitiativeHelper();
        return await addInitiativeHelper.updateInitiative(details)
    }

    @action
    async initiativesummary() {

        const addInitiativeHelper = new AddInitiativeHelper();
        const vdtDetails = {
            map_id: SessionStorage.read('mapId'),
            // selectedKpis: this.selectedVDT
        }
        return await addInitiativeHelper.initiativesummary(vdtDetails)
            .then((response) => {
                if (!response.error) {
                    this.initiativeSummaryDetails = response.data.resultObj;
                }
            }).catch((error) => {
                return {
                    error: true
                }
            })

    }

    @action
    downloadTemplate(url, fileName) {
        const addInitiativeHelper = new AddInitiativeHelper();
        return addInitiativeHelper.downloadBusinessCaseDocument(url, 'xlsx', fileName);
    }

    @action
    showBusinessCaseDocument() {
        const addInitiativeHelper = new AddInitiativeHelper();
        this.templateArray = []
        return addInitiativeHelper.showBusinessCaseDocument(SessionStorage.read('mapId'))
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const resultObj = data.resultObj
                        if (resultObj.length > 0) {
                            for (let i = 0; i < resultObj.length; i++) {
                                this.templateArray.push(resultObj[i])
                            }
                            return this.templateArray;
                        }
                        return false;
                    }
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

    @action
    uploadBusinessCaseTemplate(file) {
        const addInitiativeHelper = new AddInitiativeHelper();
        const payload = new FormData();
        payload.append("file", file)
        return addInitiativeHelper.uploadBusinessTemplate(payload, SessionStorage.read('mapId'))
            .then((response) => {
                if (!response.error && response.data.resultCode === 'OK') {
                    return true;
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }


    @action
    deleteFile(fileName) {
        const addInitiativeHelper = new AddInitiativeHelper();
        const mapId = SessionStorage.read('mapId')
        return addInitiativeHelper.deleteFile(fileName, mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        return true;
                    }
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }
}



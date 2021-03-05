import { observable, action } from "mobx";
import CustomVDTHelper from '../../helpers/CustomVDTHelper/CustomVDTHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class CustomVDTStore {
    @observable branchTree = []
    @observable strategicObjectivesList = []
    @observable businessObjectivesList = []
    @observable financialObjectivesList = []
    @observable valueDriversList = []
    @observable operationalKPIsList = []
    @observable isCustomVDTStarted = false
    @observable operationKpiIds = []
    @observable updatedResponse = []
    @observable getFrequencyMessage = ''
    @observable selectedGrowthPillar = ''
    @observable selectedSolutiontype = ''
    @observable selectedIndustry = ''
    @observable existingTransaction = ''
    @observable oldKPIValues

    @observable kpiDetails = {
        kpiName: '',
        kpiDescription: '',
        kpiUnit: '',
        kpiTrend: '',
        kpiCalculationType: '',
        kpiFormula: '',
        kpiId: '',
    }

    @action
    async fetchDropDownValues(payload) {
        const customVDTHelper = new CustomVDTHelper();
        // const payload = {
        //     "kpi_id": kpiId
        // }
        // SessionStorage.write('tenantId', null);
        if (payload) {
            return await customVDTHelper.fetchDropDownValues(payload)
                .then((response) => {
                    if (!response.error) {
                        this.handleResponse(response.data.resultObj)
                        return response
                    }

                })
                .catch((e) => {
                    // return {
                    //     error: true
                    // }
                    return e.response;
                })
        }
        else {
            return await customVDTHelper.fetchDropDownValues()
                .then((response) => {
                    this.handleResponse(response.data.resultObj)
                    return response
                })
                .catch((e) => {
                    return e.response;
                })
        }
    }

    handleResponse(resultObj,) {
        // if (kpiId === "") {
        this.strategicObjectivesList = resultObj['Strategic Objective']
        this.businessObjectivesList = resultObj['Business Objective']
        this.financialObjectivesList = resultObj['Financial Objective']
        this.valueDriversList = resultObj['Value Driver']
        this.operationalKPIsList = resultObj['Kpi']
        // }
    }
    fetchKPIInfo(kpiId) {
        const customVDTHelper = new CustomVDTHelper();
        const kpiID = kpiId.substr(4);
        // SessionStorage.write('tenantId', null);
        return customVDTHelper.fetchKpiInfo(kpiID)
            .then((response) => {
                // this.handleResponse(response.data.resultObj)
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    saveCustomVDT(payload) {
        const customVDTHelper = new CustomVDTHelper();

        return customVDTHelper.saveCustomVDT(payload)
            .then((response) => {
                console.log(response)
                // if (response && response.data.resultCode === "OK") {
                if (!response.error && response) {
                    return response;
                }
                return false;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }



    @action
    generateCustomVDTTree(payload) {
        const customVDTHelper = new CustomVDTHelper();
        return customVDTHelper.generateCustomVDTTree(payload)
            .then((response) => {
                console.log(response)
                // if (response && response.data.resultCode === "OK") {
                if (!response.error && response) {
                    return response;
                }
                return false;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    createTree(resultObj) {
        let treeObj = {}
        let level2cnt = 0
        let level3cnt = 0
        let level4cnt = 0
        let level5cnt = 0
        let kpiIds = []
        let count = 0
        this.operationalKpIs = []
        this.branchTree = []
        // const editVDTStore = new EditVDTStore()
        for (let so in resultObj) {
            treeObj[so] = []
            level2cnt = 0
            for (let fo in resultObj[so]) {
                treeObj[so].push({ [fo]: [] })
                level3cnt = 0
                for (let bo in resultObj[so][fo]) {
                    treeObj[so][level2cnt][fo].push({ [bo]: [] })
                    level4cnt = 0
                    for (let bkpi in resultObj[so][fo][bo]) {
                        treeObj[so][level2cnt][fo][level3cnt][bo].push({ [bkpi]: [] })
                        level5cnt = 0
                        for (let vd in resultObj[so][fo][bo][bkpi]) {
                            treeObj[so][level2cnt][fo][level3cnt][bo][level4cnt][bkpi].push({ [vd]: [] })
                            for (let okpi in resultObj[so][fo][bo][bkpi][vd]) {
                                treeObj[so][level2cnt][fo][level3cnt][bo][level4cnt][bkpi][level5cnt][vd].push({ [okpi]: [resultObj[so][fo][bo][bkpi][vd][okpi]] })
                                for (let okpi in resultObj[so][fo][bo][bkpi]) {
                                    if (!kpiIds.includes(resultObj[so][fo][bo][bkpi][okpi].kpiId)) {
                                        kpiIds.push(resultObj[so][fo][bo][bkpi][okpi].kpiId)
                                        this.operationKpiIds.push({
                                            kpiId: resultObj[so][fo][bo][bkpi][okpi].kpiId,
                                            frequency: false,
                                        })
                                        this.operationalKpIs.push(resultObj[so][fo][bo][bkpi][okpi])
                                        if (resultObj[so][fo][bo][bkpi][okpi].kpiSource === 'P') {
                                            count++;
                                            if (count === 1) {
                                                this.selectedGrowthPillar = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].cmtGrowthPillar,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].cmtGrowthPillar
                                                }

                                                this.selectedSolutiontype = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].solutionType,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].solutionType
                                                }

                                                this.selectedIndustry = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].cmtSubIndustry,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].cmtSubIndustry
                                                }

                                            }
                                        }
                                    }
                                }
                            }
                            level5cnt++
                        }
                        level4cnt++
                    }
                    level3cnt++
                }
                level2cnt++
            }
        }
        if (this.existingTransaction) {
            if (this.selectedGrowthPillar !== "") {
                this.branchTree.push(treeObj)
            }
        }
        else {
            this.branchTree.push(treeObj)
        }
        return true

    }

}



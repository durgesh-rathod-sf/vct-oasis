import { observable, action } from "mobx";
import DevelopBusinessCaseHelper from '../../helpers/DevelopBusinessCaseHelper/DevelopBusinessCaseHelper';
import BusinessCaseHelper from '../../helpers/BusinessCaseHelper/BusinessCaseHelper';
import CommonStore from '../CommonStore/CommonStore';
import ReviewValueDriverStore from '../ReviewValueDriverStore';
var SessionStorage = require('store/storages/sessionStorage');

export default class KPIBenefitsStore {
    @observable kpiBenefits = []
    @observable color = ''
    @observable kpiId
    @observable branchTree = []
    @observable kpiTab
    @observable focusedKpiId = "";
    @observable kpiBenifitsError = '';
    @observable InvUploadErr = '';
    @observable saveError = '';
    @observable cpUploadErr = '';
    @observable screenSelected = '';
    @observable editParamRuleChange = false;
    @observable editBenefitRuleChange = false;
    @observable isNewlyAdded = false;
    @action
    getKPIBenefits(payload) {
        this.branchTree = [];
        this.kpiBenefits = [];
        this.operationKpiIds = []
        this.existingTransaction = false;
        let prevResTime = "";
        let copyPayload = {};
        copyPayload = {
            "mapId": SessionStorage.read("mapId"),
            "prevResTime":"",
            "isBenefit": "true", // Changed to false for DBC tab fail -- to Be removed once correct API integrated
            "mode": SessionStorage.read('VDTmode'),
        };
        let reqObj = {
            "mapId": SessionStorage.read("mapId"),
            "isBenefit": "true" // Changed to false for DBC tab fail -- to Be removed once correct API integrated
        };
        const commonStore= new CommonStore();
        prevResTime =  commonStore.checkResponseTimeStamp("/rvdt/generateVDT",reqObj)
        copyPayload.prevResTime = (prevResTime !== null && prevResTime !== "")?prevResTime:"";
        const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
        // const editVDTStore = new EditVDTStore()
        return developBusinessCaseHelper.getKPIBenefits(copyPayload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    this.branchTree = []
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data;
                        commonStore.updateResTimeStamp('/rvdt/generateVDT',reqObj,data)
                        this.createTree(resultObj)
                        return response;
                    }return response;
                }
                else {
                    return false;
                }

            })
            .catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
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
        this.kpiBenefits = [];
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
                                        
                                        this.kpiBenefits.push(resultObj[so][fo][bo][bkpi][okpi]);                                        
                                        
                                        
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
        
        const rvdStore= new ReviewValueDriverStore();
        let rtrResp = rvdStore.createTree(resultObj);

        if (this.existingTransaction) {
            if (this.selectedGrowthPillar !== "") {
                this.branchTree.push(treeObj)
            }
        }
        else {
            this.branchTree.push(treeObj)
        }


    }


    @action
    saveKPIBenefits(payload) {
        const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
        return developBusinessCaseHelper.saveKPIBenefits(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        return true;
                    } else {
                        this.kpiBenifitsError = data.errorDescription;
                        return false;
                    }
                }

            }).catch((error) => {
                if(error.response &&  error.response.data.errorDescription) {
                    this.kpiBenifitsError = error.response.data.errorDescription;
                }                
                return {
                    error: true
                }
            });
    }

    @action
    fetchParamsForKpiBenefits(kpiId) {
        const businessCaseHelper = new DevelopBusinessCaseHelper();
        const payload = {
            mapId: SessionStorage.read("mapId"),
            kpiId: kpiId
        };
        return businessCaseHelper.loadCommonParams(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    return response;
                }else {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    resetSelectedKpiId() {
        this.kpiId = null;
    }

    @action
    resetScreenSelected(value) {
        this.screenSelected = value;
    }
	
    @action
    ingestKpiBenifits(file) {
        const businessCaseHelper = new DevelopBusinessCaseHelper();
        const payload = new FormData();
        payload.append("mapId", SessionStorage.read('mapId'))
        payload.append("file", file)
        return businessCaseHelper.uploadKpiBenifits(payload)
            .then((response) => {
                if (!response.error) {
                    if (response.data.resultCode === "OK") {
                        this.KpiBaselineFilePath = response.data.file_download_link
                        return true;
                    }
                    return false;
                }
            }).catch((error) => {
                if(error.response &&  error.response.data.errorDescription) {
                    this.kpiUploadError = error.response.data.errorDescription;
                }  
                return {
                    error: true
                }
            })
    }

    @action
    ingestCommonData(file) {
        const businessCaseHelper = new DevelopBusinessCaseHelper();
        const payload = new FormData();
        const tenantId = SessionStorage.read('tenantId')
        payload.append("mapId", SessionStorage.read('mapId'))
        payload.append("file", file)
        // payload.append("tenantId", tenantId)
        return businessCaseHelper.uploadCommonData(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.KpiBaselineFilePath = response.data.file_download_link
                    return true;
                }
                return false;
            }).catch((error) => {
                if(error.response &&  error.response.data.errorDescription) {
                    this.cpUploadErr = error.response.data.errorDescription;
                }  
                return {
                    error: true
                }
            })
    }

    @action
    uploadInvestments(file) {
        const businessCaseHelper = new DevelopBusinessCaseHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        payload.append("file", file)
        return businessCaseHelper.uploadInv(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.KpiBaselineFilePath = response.data.file_download_link;
                    this.InvUploadErr = ""
                    return true;
                }
                if (!response.error && response.data.errorDescription && response.data.resultCode === "KO") {
                    this.InvUploadErr = response.data.errorDescription;
                }
                else {
                    this.InvUploadErr = ""
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

    @action
    downloadFetchInvestments() {
        const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId')
        let payload = {
            "map_id": mapId
        }
        return developBusinessCaseHelper.downloadFetchInv(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.URL
                        businessCaseHelper.downloadTemplate(url, 'xlsx', 'Investments')
                        return true
                    }
                    else {
                        if (data.message === "No data for this map_id, static template generated") {
                            const url = data.URL
                            businessCaseHelper.downloadTemplate(url, 'xlsx', 'Investments');
                            return true;
                        }
                        else {
                            return false;
                        }

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
    downloadCommonParameters() {
        const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId')
        return developBusinessCaseHelper.downloadCommonParams(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        businessCaseHelper.downloadTemplate(url, 'xlsx', 'CommonParameters')
                        return true
                    }
                }
                else {
                    return false
                }
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }
    // @action
    // downloadKPIBenifits() {
    //     const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
    //     const businessCaseHelper = new BusinessCaseHelper();
    //     const mapId = SessionStorage.read('mapId')
    //     return developBusinessCaseHelper.downloadKpiBenifits(mapId)
    //         .then((response) => {
    //             const { data } = response;
    //             if (data.resultCode === 'OK') {
    //                 const url = data.resultObj
    //                 businessCaseHelper.downloadTemplate(url, 'xlsx', 'KPI Benefits Template')
    //                 return true
    //             }
    //             else {
    //                 return false
    //             }
    //         })
    // }


    @action
    downloadKPIBenifits() {
        const developBusinessCaseHelper = new DevelopBusinessCaseHelper();
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId')
        return developBusinessCaseHelper.downloadKpiBenifits(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        businessCaseHelper.downloadTemplate(url, 'xlsx', 'KPI Benefits Template')
                        return true
                    }
                }

                return false
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

    @action
    getBenefitParam() {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        return businessCaseHelper.getBenefitParam(mapId)
            .then((response) => {
                if (!response.error && response.data.resultCode === 'OK') {
                    return response;
                }
                return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    saveBenefitRule(formula, plainTextRule) {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        const payload = {
            mapId: mapId,
            kpiId: this.kpiId,
            rule: plainTextRule,
            ruleDetail: formula,
        };
        return businessCaseHelper.saveBenefitRule(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        return true;
                    }
                    this.saveError = data.errorDescription;
                    return;
                }
                return false;

            })
            .catch((e) => {
                return {
                    error: true
                };
            });
    }

    @action
    getPreviewData(formula, plainTextRule) {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        const payload = {
            kpiId: this.kpiId,
            mapId: mapId,
            rule: plainTextRule,
            ruleDetail: formula,
        };
        return businessCaseHelper.getPreviewData(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        return data.resultObj;
                    }
                }
                return false;
            })
            .catch((e) => {
                return {
                    error: true
                };
            });
    }

    @action
    getBenefitRuleData() {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        return businessCaseHelper.getBenefitRuleData(mapId, this.kpiId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        return response;
                    } return response;
                }

                return false;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
    }

    @action
    getParamNames() {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        return businessCaseHelper.getParamNames(mapId, this.kpiId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    return data.resultCode === 'OK' ? data.resultObj.mfParams : false;
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    getParamRulePreview(formula, plainTextRule, paramId, paramUnit) {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        const payload = {
            kpiId: this.kpiId,
            mapId: mapId,
            paramId: paramId,
            rule: plainTextRule,
            ruleDetail: formula,
            paramUnit: paramUnit,
        };
        return businessCaseHelper.getParamRulePreview(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    return data.resultCode === 'OK' ? data.resultObj : false;
                }
                return false;
            })
            .catch((e) => {
                return {
                    error: true
                };
            });
    }

    @action
    saveParamRule(formula, plainTextRule, paramId, paramUnit, paramOriName) {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId');
        const payload = {
            mapId: mapId,
            kpiId: this.kpiId,
            paramId: paramId,
            rule: plainTextRule,
            ruleDetail: formula,
            paramUnit: paramUnit,
            paramName: paramOriName,
        };
        return businessCaseHelper.saveParamRule(payload, mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        return true;
                    }
                    this.saveError = data.errorDescription;
                }
                return false;
            })
            .catch((e) => {
                return {
                    error: true
                };
            });
    }

    @action
    async deleteExtraYear(year) {
        try {
            const businessCaseHelper = new BusinessCaseHelper();
            const payload = {
                mapId: SessionStorage.read('mapId'),
                year: year,
                tab: 'benefits',
                kpiId: this.kpiId,
            };
            const response = await businessCaseHelper.deleteExtraYear(payload);
            return response;
        } catch (error) {
            // return {
            //     error: true
            // }
            return error.response;
        }
    }

    @action
    async deleteKPIBenefits(kpiId,paramId,paramType) {
        try {
            const businessCaseHelper = new BusinessCaseHelper();
            const response = await businessCaseHelper.deleteKPIBenefits(kpiId,paramId,paramType);
            return response;
        } catch (error) {
            return error.response;
        }
    }
}
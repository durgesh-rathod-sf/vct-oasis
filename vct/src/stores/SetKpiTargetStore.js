import { observable, action } from "mobx";

import SetKpiTargetHelper from '../helpers/SetKpiTargetHelper/SetKpiTargetHelper';
// import { ConsoleLogger } from "@aws-amplify/core";
var SessionStorage = require('store/storages/sessionStorage');
export default class SetKpiTargetStore {

    @observable KpiBaselineFilePath = ''

    @observable businessKpi = []

    @observable operationalKpi = []

    @observable datePickerValue = []

    @observable targetValues = []

    @observable selectedKpi = ''

    @observable selectedKpiName = ''

    @observable selectedKpiId = ''

    @observable selectedKpiTarget = ''

    @observable selectedKpiStartDate = ''

    @observable selectedKpiFrequency = ''

    @observable selectedKpiPeriod = ''

    @observable dailyFrequency = []

    @observable weeklyFrequency = []

    @observable fortnightFrequency = []

    @observable monthlyFrequency = []

    @observable quarterlyFrequency = []

    @observable halfYearlyFrequency = []

    @observable yearlyFrequency = []

    @observable kpiCalculatedData = false

    @observable selectedKpiType = false

    @observable label = false

    @observable savedKpiTargetList = []

    @observable businessFilledCount = 0

    @observable operationalFilledCount = 0

    @observable selectedPeriodCnt = 0

    @observable opSelectedPeriodCnt = 0

    @observable savedKpiDetails = []

    @observable savedBenchmark = 0

    @observable permittedDeviation = 10

    @observable savedkpiName = ''

    @observable savedBaseline = 0

    @observable alreadySaved = false

    @observable getFrequenciesResponse = [];

    @observable generateTargetBtn = false

    @observable getFrequencyMessage = ''

    @observable selectedKpiDescription = ''

    @observable selectedKpiFormula = ''

    getDateFromString(dateString) {
        return new Date(Number(dateString.split('-')[2]),
            Number(dateString.split('-')[1] - 1), Number(dateString.split('-')[0]));
    }

    @action
    downloadTemplate(fileName) {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        return setKpiTargetHelper.getTemplateDetails(fileName)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const fileData = data.resultObj
                        setKpiTargetHelper.downloadBusinessCaseTemplate(fileData[0], 'xlsx', fileName)
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

    @action
    ingestKpi(file) {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        payload.append("file", file)
        return setKpiTargetHelper.uploadKpiBaseLineData(payload)
            .then((response) => {
                if (!response.error && response.data.message === 'File upload Successful') {
                    this.KpiBaselineFilePath = response.data.file_download_link
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
    downloadKpiBaselineFile() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        return setKpiTargetHelper.downloadBusinessCaseTemplate(this.KpiBaselineFilePath, 'xlsx', 'KPI Baseline Data')
    }

    @action
    uploadBusinessCaseTemplate(file) {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        const payload = new FormData();
        payload.append("file", file)
        return setKpiTargetHelper.uploadBusinessTemplate(payload, SessionStorage.read('mapId'))
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
    getCalculation() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'));
        return setKpiTargetHelper.getCalculation(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.calculation) {
                        this.kpiCalculatedData = data.calculation
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

    @action
    getFrequencies() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        this.businessFilledCount = 0;
        this.operationalFilledCount = 0;
        return setKpiTargetHelper.getFrequencieData(SessionStorage.read('mapId'))
            .then((response) => {
                const { data } = response
                if (!response.error) {
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data
                        this.getFrequenciesResponse = [...resultObj];
                        for (let i = 0; i < resultObj.length; i++) {
                            resultObj[i]['focus'] = false
                            resultObj[i]['reducedFlag'] = false
                            if (resultObj[i].kpiType === 'Business') {
                                if (resultObj[i].startDate === '' || resultObj[i].startDate === null) {
                                    resultObj[i].startDate = new Date();
                                } else {
                                    resultObj[i].startDate = this.getDateFromString(resultObj[i].startDate);
                                    this.alreadySaved = true;
                                }
                                if (resultObj[i].noOfPeriods === '' || resultObj[i].noOfPeriods === null) {
                                    resultObj[i].noOfPeriods = 1;
                                    this.alreadySaved = true;
                                }
                                resultObj[i]['filledCount'] = resultObj[i].noOfPeriods

                                this.businessFilledCount = this.businessFilledCount + Number(resultObj[i].noOfPeriods)
                                this.businessKpi.push(resultObj[i])
                            }
                            if (resultObj[i].kpiType === 'Operational') {
                                if (resultObj[i].startDate === '' || resultObj[i].startDate === null) {
                                    resultObj[i].startDate = new Date();
                                } else {
                                    resultObj[i].startDate = this.getDateFromString(resultObj[i].startDate);
                                    this.alreadySaved = true;
                                }
                                if (resultObj[i].noOfPeriods === '' || resultObj[i].noOfPeriods === null) {
                                    resultObj[i].noOfPeriods = 1;
                                    this.alreadySaved = true;
                                }
                                resultObj[i]['filledCount'] = resultObj[i].noOfPeriods
                                this.operationalFilledCount = this.operationalFilledCount + Number(resultObj[i].noOfPeriods)
                                this.operationalKpi.push(resultObj[i])
                            }
                            if (Number(resultObj[i].noOfPeriods) !== 0) {
                                this.savedKpiTargetList.push(resultObj[i].kpiId)
                            }
                        }
                        return data;
                    }
                    return data;
                } return data;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    saveKpiTarget(kpiData) {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        return setKpiTargetHelper.saveKpiTargetData(kpiData)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        return true;
                    }
                }
                return false
            }).catch(error => {
                return {
                    error: true
                }
            });
    }

    @action
    getKpiInfo() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        return setKpiTargetHelper.getKpiInfo(SessionStorage.read('mapId'))
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        return data.resultObj;
                    }
                }
                return false
            }).catch(error => {
                console.log(error)
                return {
                    error: true
                }
            });
    }

    @action
    getOpKpiInfo() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        return setKpiTargetHelper.getOpKpiInfo(this.selectedKpiId, SessionStorage.read('mapId'))
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        return data.resultObj;
                    }
                }
                return false
            }).catch(error => {
                console.log(error)
                return {
                    error: true
                }
            });
    }

    @action
    deleteFile(fileName) {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        const mapId = SessionStorage.read('mapId')
        return setKpiTargetHelper.deleteFile(fileName, mapId)
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

    @action
    getSavedKpiDetails() {
        const setKpiTargetHelper = new SetKpiTargetHelper();
        const mapId = SessionStorage.read('mapId')
        const requestDetails = {
            upMapId: mapId,
            kpiId: this.selectedKpiId
        }
        this.savedKpiDetails = []
        return setKpiTargetHelper.getSavedKpiDetails(requestDetails)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data
                        for (let i = 0; i < resultObj.length; i++) {
                            this.selectedKpiDescription = resultObj[i].kpiDescription
                            this.selectedKpiFormula = resultObj[i].kpiFormula
                            this.savedBaseline = resultObj[i].baseline
                            this.savedkpiName = resultObj[i].kpiName
                            this.savedBenchmark = resultObj[i].benchmark !== "null" ? resultObj[i].benchmark : ''
                            this.permittedDeviation = resultObj[i].permitteddeviation
                            const formatDate = resultObj[i].target_period.split('-')
                            let kpidetail = {
                                targetPeriod: formatDate[2] + '-' + formatDate[1] + '-' + formatDate[0],
                                targetValue: Number(resultObj[i].target_value).toFixed(2)
                            }
                            this.savedKpiDetails.push(kpidetail)
                        }
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

    @action
    calculatePeriods() {
        this.selectedPeriodCnt = 0
        this.opSelectedPeriodCnt = 0
        for (let i = 0; i < this.businessKpi.length; i++) {
            this.selectedPeriodCnt = this.selectedPeriodCnt + Number(this.businessKpi[i].noOfPeriods)
        }

        for (let j = 0; j < this.operationalKpi.length; j++) {
            this.opSelectedPeriodCnt = this.opSelectedPeriodCnt + Number(this.operationalKpi[j].noOfPeriods)
        }
    }

}
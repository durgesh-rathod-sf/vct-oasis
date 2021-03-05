import { observable, action } from "mobx";
import ValueDriversDropdownHelper from '../helpers/ValueDriversDropdownHelper/ValueDriversDropdownHelper';
import BusinessCaseHelper from '../helpers/BusinessCaseHelper/BusinessCaseHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class ValueDriversStore {

    @observable subIndustry = []
    @observable functionalArea = []
    @observable projectScenario = []
    @observable selectedIndustry = ''
    @observable selectedFunctionalArea = []
    @observable defaultSelectedScenario = ''
    @observable defaultSelectedIndustry = ''
    @observable defaultSelectedFunctionalArea = ''
    @observable growthPillar = ''
    @observable solutionType = ''
    @observable subIndustry = ''
    @observable calBaseline = ''
    @observable upoadBaselineErr = ''
    @observable selectedScenario = []
    @observable highKpiDetails = []
    @observable lowKpiDetails = []
    @observable selectedVDT = []
    @observable selectedVDTForExport = []
    @observable selectedKpiIds = [] /* to maintain checklist as rendering removes selected checkobox */

    /* Get all projects */
    @action
    getValueDriverTreeData() {
        this.getSubIndustries();
        this.getFunctionalArea();
        this.getScenario();
    }

    @action
    getSubIndustries() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const dropdownInitial = {
            subIndustry: this.selectedIndustry,
            functionalArea: this.selectedFunctionalArea,
            projectScenario: this.selectedScenario,
        }

        return valueDriversDropdownHelper.getSubIndustry(dropdownInitial)
            .then((response) => {
                const { data } = response;
                if (data.resultCode === 'OK') {
                    this.subIndustry = [];
                    const { resultObj } = data
                    for (let j = 0; j < resultObj.length; j++) {
                        if (resultObj[j] !== "") {
                            this.subIndustry.push({
                                value: data.resultObj[j],
                                label: data.resultObj[j]
                            })
                        }
                    }

                    return valueDriversDropdownHelper.getFunctionalArea(dropdownInitial)
                        .then((response) => {
                            const { data } = response;
                            if (data.resultCode === 'OK') {
                                const dataLength = data.resultObj.length;
                                this.functionalArea = []
                                for (let i = 0; i < dataLength; i++) {
                                    this.functionalArea.push({
                                        value: data.resultObj[i],
                                        label: data.resultObj[i]
                                    })
                                }
                                return valueDriversDropdownHelper.getScenario(dropdownInitial)
                                    .then((response) => {
                                        const { data } = response;
                                        if (data.resultCode === 'OK') {
                                            const dataLength = data.resultObj.length;
                                            this.projectScenario = []
                                            for (let i = 0; i < dataLength; i++) {
                                                this.projectScenario.push({
                                                    value: data.resultObj[i],
                                                    label: data.resultObj[i]
                                                })
                                            }
                                        }
                                    })
                                    .catch((e) => {
                                        console.log(e)
                                        return {
                                            error: true
                                        }
                                    })
                            }
                        })
                        .catch((e) => {
                            console.log(e)
                            return {
                                error: true
                            }
                        })
                }
            })
            .catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            })
    }

    @action
    getFunctionalArea() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const dropdownInitial = {
            subIndustry: this.selectedIndustry,
            functionalArea: this.selectedFunctionalArea,
            projectScenario: [],
        }

        valueDriversDropdownHelper.getFunctionalArea(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const dataLength = data.resultObj.length;
                        this.functionalArea = []
                        for (let i = 0; i < dataLength; i++) {
                            this.functionalArea.push({
                                value: data.resultObj[i],
                                label: data.resultObj[i]
                            })
                        }
                        return true;
                    }
                }
            })
            .catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            })
    }

    @action
    getScenario() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const dropdownInitial = {
            subIndustry: this.selectedIndustry,
            functionalArea: this.selectedFunctionalArea,
            projectScenario: [],
        }

        valueDriversDropdownHelper.getScenario(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const dataLength = data.resultObj.length;
                        this.projectScenario = []
                        for (let i = 0; i < dataLength; i++) {
                            this.projectScenario.push({
                                value: data.resultObj[i],
                                label: data.resultObj[i]
                            })
                        }
                        return true;
                    }
                }
            })
            .catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            })
    }

    @action
    async generateKPI(priority) {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        if (priority === 'selected') {
            this.selectedVDT = [];
        }
        const kpiRequestParam = {
            userProjectMapId: SessionStorage.read('mapId'),
            subIndustry: this.selectedIndustry,
            functionalArea: this.selectedFunctionalArea,
            projectScenario: this.selectedScenario,
            priority: priority
        }

        return await valueDriversDropdownHelper.generateKPI(kpiRequestParam)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        if (priority === 'selected') {
                            this.highKpiDetails = data.resultObj;
                            this.setSelectedRecords(this.highKpiDetails, priority)
                        }
                        if (priority === 'high') {
                            this.highKpiDetails = data.resultObj;
                            this.setSelectedRecords(this.highKpiDetails, priority)
                        }
                        if (priority === 'low') {
                            this.lowKpiDetails = data.resultObj;
                            this.setSelectedRecords(this.lowKpiDetails, priority)
                        }
                        return data;
                    }
                    return data;
                }
                return false
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response.data;
            })
    }

    @action
    setSelectedRecords(kpis, priority) {
        for (let i = 0; i < kpis.length; i++) {
            if (kpis[i].selected) {
                const selectedKPI = {
                    kpiId: kpis[i].kpiId,
                    subIndustry: this.selectedIndustry,
                    functionalArea: this.selectedFunctionalArea.join(),
                    projectScenario: this.selectedScenario.join(),
                    priority: priority,
                    strategicObjective: kpis[i].strategicObjective,
                    financialLever: kpis[i].financialLever,
                    businessObjective: kpis[i].businessObjective,
                    valueDriver: kpis[i].valueDriver,
                    kpiName: kpis[i].kpiName,
                    kpiUnit: kpis[i].kpiUnit,
                    expectedKpiTrend: kpis[i].expectedKpiTrend,
                    kpiType: kpis[i].kpiType,
                    category: kpis[i].category,
                    kpiDescription: kpis[i].kpiDescription,
                    kpiFormula: kpis[i].kpiFormula,
                    dataInputUnits: kpis[i].dataInputUnit,
                    selected: true,
                }
                this.selectedVDT.push(selectedKPI)
            }
        }
    }

    @action
    saveVDT(kpiDetails) {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const vdtDetails = {
            mapId: SessionStorage.read('mapId'),
            kpiDetails: kpiDetails
        }
        return valueDriversDropdownHelper.saveVDTDetails(vdtDetails)
            .then((response) => {
                return response
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
    }

    @action
    getVDTList(payload) {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const mapId = SessionStorage.read('mapId');
        return valueDriversDropdownHelper.getVDTList(mapId)
            .then((response) => {
                console.log(response)
                if (!response.error) {
                    const VDTList = response.data.resultObj;
                    console.log(VDTList)
                    return response.data;
                }

            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            });
    }


    @action
    generateXls() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const mapId = SessionStorage.read('mapId');

        return valueDriversDropdownHelper.generateXls(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        valueDriversDropdownHelper.exportScreen(url, 'xlsx')
                        return true
                    }
                }
                return false
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    generatePPT() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const mapId = SessionStorage.read('mapId');
        return valueDriversDropdownHelper.generatePPT(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        valueDriversDropdownHelper.exportScreen(url, 'ppt')
                        return true
                    }
                }
                return false
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    async getDefaultDropdownValue() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const mapId = SessionStorage.read('mapId');
        return await valueDriversDropdownHelper.getDefaultDropdownValue(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    const { resultObj } = data
                    if (data.resultCode === 'OK') {
                        for (let i = 0; i < resultObj.length; i++) {
                            if (resultObj[i].priority === 'HIGH') {
                                this.highKpiDetails.push(resultObj[i])
                            }
                            if (resultObj[i].priority === 'LOW') {
                                this.lowKpiDetails.push(resultObj[i]);
                            }
                        }
                        this.selectedVDT = resultObj
                        this.defaultSelectedIndustry = resultObj[0].subIndustry
                        this.defaultSelectedFunctionalArea = resultObj[0].functionalArea
                        this.defaultSelectedScenario = resultObj[0].projectScenario
                        return response;
                    }
                      return response;
                }
                return response;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
    }

    @action resetValueDriver() {
        this.highKpiDetails = [];
        this.lowKpiDetails = [];
        this.selectedIndustry = '';
        this.functionalArea = false;
        this.projectScenario = false
        this.selectedFunctionalArea = []
        this.selectedScenario = []
        this.selectedVDT = []
        this.selectedVDTForExport = []
        this.selectedKpiIds = []
        this.defaultSelectedScenario = ''
        this.defaultSelectedIndustry = ''
        this.defaultSelectedFunctionalArea = ''
    }

    @action
    downloadBaseline() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId')
        let payload = {
            "map_id": mapId
        }
        return valueDriversDropdownHelper.downloadBaseline(mapId, payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        businessCaseHelper.downloadTemplate(url, 'xlsx', 'KPI_BaselineTemplate')
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
    IngestBaseline(file) {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        payload.append("file", file)
        return valueDriversDropdownHelper.uploadBaseline(payload)
            .then((response) => {
                if (!response.error) {
                    if (response.data.resultCode === "OK") {
                        this.KpiBaselineFilePath = response.data.file_download_link
                        return true;
                    }
                    else {
                        this.upoadBaselineErr = response.data.message
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
    CalculationBaseline() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        // payload.append("file", file)
        return valueDriversDropdownHelper.CalculationBaseline(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    // this.KpiBaselineFilePath = response.data.file_download_link
                    this.calBaseline = response.data.calculation;
                    this.calErr = response.data.message;
                    return true;
                }
                return false;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

}

import { observable, action } from "mobx";
import ManuallySearchKpisDropdownHelper from '../helpers/ManuallySearchKpisDropdownHelper/ManuallySearchKpisDropdownHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class ManuallySearchKpisStore {

    @observable strategicObjective = ''
    @observable financialLever = ''
    @observable businessObjective = ''
    @observable valueDriver = ''
    @observable operationalKpi = ''
    @observable selectedKpis = ''
    @observable selectedStrategicObjective = ''
    @observable selectedFinancialObjective = ''
    @observable selectedBusinessObjective = ''
    @observable selectedValueDriverObjective = ''
    @observable selectedOperationalKpi = ''
    @observable kpiId = ''
    @observable selectedVDT = []
    @observable searchKPIArray = []
    /* Get all projects */
    @observable kpiDetails = []
    @observable strategicName = ''
    @observable financialName = ''
    @observable businessName = ''
    @observable valueDriversName = ''
    @observable kpiName = ''
    @observable kpiUnitName = ''
    @observable kpiCategoryName = ''
    @observable kpiDescriptionName = ''
    @observable kpiTrendName = ''
    @observable kpiTypeName = ''
    @observable kpiFormulaName = ''
    @observable projectUsers = []
    @observable selected = ''
    @observable dataInputUnit = ''
    @observable txnID = ''
    @observable navigateToEdit = ''


    @action
    setKpiDetails(kpiDetails) {
        this.subIndustry = kpiDetails.subIndustry;
        this.functionalArea = kpiDetails.functionalArea;
        this.projectScenario = kpiDetails.projectScenario;
        this.strategicName = kpiDetails.strategicName;
        this.financialName = kpiDetails.financialName;
        this.businessName = kpiDetails.businessName;
        this.valueDriversName = kpiDetails.valueDriversName;
        this.kpiName = kpiDetails.kpiName;
        this.kpiUnitName = kpiDetails.kpiUnitName;
        this.kpiCategoryName = kpiDetails.kpiCategoryName;
        this.kpiDescriptionName = kpiDetails.kpiDescriptionName;
        this.kpiTrendName = kpiDetails.kpiTrendName;
        this.kpiTypeName = kpiDetails.kpiTypeName;
        this.kpiFormulaName = kpiDetails.kpiFormulaName;
        this.selected = kpiDetails.selected;
        this.dataInputUnit = kpiDetails.dataInputUnit;
        this.txnId = kpiDetails.txnID
    }
    /* Get all projects */
    @action
    getStrategicObjectives() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const dropdownInitial = {
            strategic_objective: '',
            financial_objective: '',
            business_objective: '',
            value_driver: '',
            operational_kpi: ''
        }

        manuallySearchKpisDropdownHelper.fetchVDTData(dropdownInitial)
            .then((response) => {
                console.log(dropdownInitial);
                console.log(response);
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.strategicObjective = data.resultObj;

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
    getFinancialObjectives() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const dropdownInitial = {
            strategic_objective: this.selectedStrategicObjective,
            financial_objective: '',
            business_objective: '',
            value_driver: '',
            operational_kpi: ''
        }

        manuallySearchKpisDropdownHelper.fetchVDTData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.financialLever = data.resultObj;
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
    getBusinessObjectives() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const dropdownInitial = {
            strategic_objective: this.selectedStrategicObjective,
            financial_objective: this.selectedFinancialObjective,
            business_objective: '',
            value_driver: '',
            operational_kpi: ''
        }

        manuallySearchKpisDropdownHelper.fetchVDTData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.businessObjective = data.resultObj;
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
    getValueDriverObjectives() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const dropdownInitial = {
            strategic_objective: this.selectedStrategicObjective,
            financial_objective: this.selectedFinancialObjective,
            business_objective: this.selectedBusinessObjective,
            value_driver: '',
            operational_kpi: ''
        }

        manuallySearchKpisDropdownHelper.fetchVDTData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.valueDriver = data.resultObj;
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
    getOperationalKpiObjectives() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const dropdownInitial = {
            strategic_objective: this.selectedStrategicObjective,
            financial_objective: this.selectedFinancialObjective,
            business_objective: this.selectedBusinessObjective,
            value_driver: this.selectedValueDriverObjective,
            operational_kpi: ''
        }

        manuallySearchKpisDropdownHelper.fetchVDTData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.operationalKpi = data.resultObj;
                        this.kpiId = data.resultObj.kpi_id
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
    searchKPI() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        /*   if (priority === 'high') {
              this.selectedVDT = [];
          } */
        const kpiRequestParam = {
            strategic_objective: this.selectedStrategicObjective,
            financial_objective: this.selectedFinancialObjective,
            business_objective: this.selectedBusinessObjective,
            value_driver: this.selectedValueDriverObjective,
            operational_kpi: this.selectedOperationalKpi

        }


        return manuallySearchKpisDropdownHelper.fetchVDTData(kpiRequestParam)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    console.log(kpiRequestParam);
                    console.log(response);
                    if (data.resultCode === 'OK') {
                        this.kpiId = data.resultObj[0].kpi_id.toString();
                        //this.setSelectedRecords(this.highKpiDetails)
                        return data.resultObj;
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
    setSelectedRecords(kpis) {
        for (let i = 0; i < kpis.length; i++) {
            //if (kpis[i].selected) {
            const selectedKPI = {
                kpiId: kpis[i].kpiId,
                subIndustry: kpis[i].subIndustry,
                functionalArea: kpis[i].functionalArea,
                projectScenario: kpis[i].projectScenario,
                priority: kpis[i].priority,
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
                dataInputUnit: kpis[i].dataInputUnit,
                selected: kpis[i].selected,
                txnID: kpis[i].txnid
            }
            this.selectedVDT.push(selectedKPI)
            //}
        }
    }


    @action
    async saveVDT() {

        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const kpiDetails = [];
        kpiDetails.push({
            kpiId: this.kpiId,
            subIndustry: "",
            functionalArea: "",
            projectScenario: "",
            priority: "",
            strategicObjective: this.strategicName,
            financialLever: this.financialName,
            businessObjective: this.businessName,
            valueDriver: this.valueDriversName,
            kpiName: this.kpiName,
            kpiUnit: this.kpiUnitName,
            category: this.kpiCategoryName,
            kpiDescription: this.kpiDescriptionName,
            expectedKpiTrend: this.kpiTrendName,
            kpiType: this.kpiTypeName,
            kpiFormula: this.kpiFormulaName,
            dataInputUnit: this.dataInputUnit,
            selected: this.selected,
            txnID: this.txnID
        })

        const vdtDetails = {
            mapId: SessionStorage.read('mapId'),
            selectedKpis: kpiDetails
        }
        // if(!manuallySearchKpisStore.businessObjective==kpiDetails.businessObjective){
        return await manuallySearchKpisDropdownHelper.saveVDTDetails(vdtDetails)
            .then((response) => {

                return response
            }).catch((error) => {
                return {
                    error: true
                }
            });
        // }


    }

    @action
    newAddKpiToVDT(kpiDetails) {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();

        return manuallySearchKpisDropdownHelper.saveKPIDetails(kpiDetails)
            .then((response) => {
                console.log(response)
                return response
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }
    @action
    addKpiToVDT() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        let selectedVDT = []
        let key = 0
        for (let i = 0; i < this.selectedVDT.length; i++) {
            if (this.selectedVDT[i].selected === true) {

                selectedVDT[key] = this.selectedVDT[i]
                key++;
            }
        }
        const vdtDetails = {
            mapId: SessionStorage.read('mapId'),
            selectedKpis: selectedVDT
        }
        return manuallySearchKpisDropdownHelper.saveVDTDetails(vdtDetails)
            .then((response) => {
                return response
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    deleteVDT() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        let txnIdList = []
        for (let i = 0; i < this.selectedVDT.length; i++) {
            if (this.selectedVDT[i].selected === true) {
                txnIdList.push(Number(this.selectedVDT[i].txnID))
            }
        }
        const vdtDetails = {
            txnIdList: txnIdList
        }
        return manuallySearchKpisDropdownHelper.deleteVDTDetails(vdtDetails)
            .then((response) => {
                return response
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    async updateVDT() {

        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const kpiDetails = [];
        kpiDetails.push({
            kpiId: this.kpiId,
            subIndustry: this.subIndustry,
            functionalArea: this.functionalArea,
            projectScenario: this.functionalArea,
            strategicObjective: this.strategicName,
            financialLever: this.financialName,
            businessObjective: this.businessName,
            valueDriver: this.valueDriversName,
            kpiName: this.kpiName,
            kpiUnit: this.kpiUnitName,
            category: this.kpiCategoryName,
            kpiDescription: this.kpiDescriptionName,
            expectedKpiTrend: this.kpiTrendName,
            kpiType: this.kpiTypeName,
            kpiFormula: this.kpiFormulaName,
            dataInputUnit: this.dataInputUnit,
            selected: this.selected
        })

        const vdtDetails = {
            mapId: SessionStorage.read('mapId'),
            selectedKpis: kpiDetails
        }
        // if(!manuallySearchKpisStore.businessObjective==kpiDetails.businessObjective){
        return await manuallySearchKpisDropdownHelper.updateVDTDetails(vdtDetails)
            .then((response) => {

                return response
            }).catch((error) => {
                return {
                    error: true
                }
            });
        // }


    }


    @action
    generateXls() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const mapId = SessionStorage.read('mapId');

        return manuallySearchKpisDropdownHelper.generateXls(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        return manuallySearchKpisDropdownHelper.exportScreen(url, 'xlsx')
                    }
                }
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    generatePPT() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const mapId = SessionStorage.read('mapId');
        return manuallySearchKpisDropdownHelper.generatePPT(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        return manuallySearchKpisDropdownHelper.exportScreen(url, 'ppt')
                    }
                }

            }).catch((error) => {
                return {
                    error: true
                }
            });
    }


    @action
    generateSelectedTable() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        const vdtDetails = {
            mapId: SessionStorage.read('mapId'),
            // selectedKpis: this.selectedVDT
        }
        return manuallySearchKpisDropdownHelper.generatedSelectedList(vdtDetails)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {

                        this.setSelectedRecords(data.resultObj, '')
                        this.selectedKpis = response.data.resultObj;

                    }
                }

            }).catch((error) => {
                return {
                    error: true
                }
            });
    }


    @action
    async searchKpis() {
        const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
        // const kpiRequestParam=[]
        // if(priority === 'high'){
        //     this.selectedVDT = [];
        // }
        const kpiRequestParam = {
            "mapId": SessionStorage.read('mapId'),
            "strategicObjective": this.selectedStrategicObjective,
            "financialLever": this.selectedFinancialObjective,
            "businessObjective": this.selectedBusinessObjective,
            "valueDriver": this.selectedValueDriverObjective,
        }
        return await manuallySearchKpisDropdownHelper.genrateKpis(kpiRequestParam)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    console.log(response)
                    if (data.resultCode === 'OK') {
                        this.kpiDetails = data.resultObj;
                        return data.resultCode;
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
}
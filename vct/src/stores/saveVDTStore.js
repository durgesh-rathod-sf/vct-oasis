import { observable, action } from "mobx";
import ValueDriversDropdownHelper from '../helpers/ValueDriversDropdownHelper/ValueDriversDropdownHelper';
var SessionStorage = require('store/storages/sessionStorage');
export default class SaveVDTStore {

    @observable strategicObjective = ''
    @observable financialObjective = ''
    @observable businessObjective = ''
    @observable cmt_growth_pillar = ''
    @observable solution_type = ''
    @observable cmt_sub_industry = ''
    @observable kpiId = ''
    @observable valueDriver = ''
    @observable OperationalKpi = ''
    @observable OperationalKpiDescription = ''
    @observable operationalKpiFormula = ''
    @observable operationalKpiUnit = ''
    @observable operationalKpitrend = ''
    @observable kpiCalculationType = ""
    @observable isEditCalled = ''

    @observable selectedVDT = []

    /* Get all projects */


    @action
    setKpiDetails(kpiDetails) {
        this.strategicObjective = kpiDetails.strategicObjective
        this.financialObjective = kpiDetails.financialObjective
        this.businessObjective = kpiDetails.businessObjective
        this.cmt_growth_pillar = kpiDetails.cmtGrowthPillar
        this.solution_type = kpiDetails.solutionType
        this.cmt_sub_industry = kpiDetails.cmtSubIndustry
        this.kpiId = kpiDetails.kpiId
        this.valueDriver = kpiDetails.valueDriver
        this.OperationalKpi = kpiDetails.opKpi
        this.OperationalKpiDescription = kpiDetails.opKpiDesc
        this.operationalKpiFormula = kpiDetails.opKpiFormula
        this.operationalKpiUnit = kpiDetails.opKpiUnit
        this.operationalKpitrend = kpiDetails.kpiTrend
        this.kpiCalculationType = kpiDetails.calculationType

    }
    /* Get all projects */

    @action
    setNewKpiDetails(kpiDetails) {
        this.strategicObjective = kpiDetails.strategicObjective
        this.financialObjective = kpiDetails.financialObjective
        this.businessObjective = kpiDetails.businessObjective
        this.cmt_growth_pillar = kpiDetails.cmt_growth_pillar
        this.solution_type = kpiDetails.solution_type
        this.cmt_sub_industry = kpiDetails.cmt_sub_industry
        this.kpiId = kpiDetails.kpiId
        this.valueDriver = kpiDetails.valueDriver
        this.OperationalKpi = kpiDetails.OperationalKpi
        this.OperationalKpiDescription = kpiDetails.OperationalKpiDescription
        this.operationalKpiFormula = kpiDetails.operationalKpiFormula
        this.operationalKpiUnit = kpiDetails.operationalKpiUnit
        this.operationalKpitrend = kpiDetails.operationalKpitrend
        this.kpiCalculationType = kpiDetails.kpiCalculationType
    }

    @action
    async updateVDTTxns(selectedVDT, payload) {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper()
        const vdtDetails = {
            "mapId": Number(SessionStorage.read('mapId')),
            "kpiIdList": selectedVDT,
            // "growthPillar": payload.growthPillar,
            // "solutionType": payload.solutionType,
            // "subIndustry": payload.subIndustry

        }
        return await valueDriversDropdownHelper.updateVDTTxns(vdtDetails)
            .then((response) => {
                return response
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
        // }


    }

    @action
    async updateVDT() {
        const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
        const vdtDetails = {
            "map_id": SessionStorage.read('mapId'),
            "kpi_id": this.kpiId,
            "cmt_growth_pillar": this.cmt_growth_pillar,
            "solution_type": this.solution_type,
            "cmt_sub_industry": this.cmt_sub_industry,
            "strategic_objective": this.strategicObjective,
            "financial_objective": this.financialObjective,
            "business_objective": this.businessObjective,
            "value_driver": this.valueDriver,
            "operational_kpi": this.OperationalKpi,
            "operational_kpi_description": this.OperationalKpiDescription,
            "operational_kpi_formula": this.operationalKpiFormula,
            "operational_kpi_unit": this.operationalKpiUnit,
            "kpi_trend": this.operationalKpitrend,
            "target_calculation_type": this.kpiCalculationType
        }
        // if(!manuallySearchKpisStore.businessObjective==kpiDetails.businessObjective){
        return await valueDriversDropdownHelper.updateVDTDetails(vdtDetails)
            .then((response) => {

                return response
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
        // }


    }

    // @action
    // async saveVDT() {

    //     const manuallySearchKpisDropdownHelper = new ManuallySearchKpisDropdownHelper();
    //     const kpiDetails = [];
    //     kpiDetails.push({
    //         kpiId: this.kpiId,
    //         subIndustry: "",
    //         functionalArea: "",
    //         projectScenario: "",
    //         priority: "",
    //         strategicObjective: this.strategicName,
    //         financialLever: this.financialName,
    //         businessObjective: this.businessName,
    //         valueDriver: this.valueDriversName,
    //         kpiName: this.kpiName,
    //         kpiUnit: this.kpiUnitName,
    //         category: this.kpiCategoryName,
    //         kpiDescription: this.kpiDescriptionName,
    //         expectedKpiTrend: this.kpiTrendName,
    //         kpiType: this.kpiTypeName,
    //         kpiFormula: this.kpiFormulaName,
    //         dataInputUnit: this.dataInputUnit,
    //         selected: this.selected,
    //         txnID: this.txnID
    //     })

    //     const vdtDetails = {
    //         mapId: SessionStorage.read('mapId'),
    //         selectedKpis: kpiDetails
    //     }
    //     // if(!manuallySearchKpisStore.businessObjective==kpiDetails.businessObjective){
    //     return await manuallySearchKpisDropdownHelper.saveVDTDetails(vdtDetails)
    //         .then((response) => {

    //             return response
    //         });
    //     // }


    // }






}
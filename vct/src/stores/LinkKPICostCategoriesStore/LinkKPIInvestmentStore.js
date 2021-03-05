import { observable, action } from "mobx";
import KPICostCategoriesHelper from '../../helpers/KPICostCategoriesHelper/KPICostCategoriesHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class LinkKPIInvestmentStore {
    @observable workstreamkpi = ''
    @observable workstreamcostCategories = ''
    @observable linkKPIInvestmentsSaveRequest = {}
    @observable linkCostCategoriesSaveRequest = {}

    @observable optionClickedForSave = "";
    @observable costRowSum = [];
    @observable kpiRowSum = [];
    @observable kpiTotalSumArray = []
    @observable costCatTotalSumArray = []
    @observable
    @action
    fetchWorkStreamKpiInvestments() {
        const kpiCostCategoriesHelper = new KPICostCategoriesHelper();
        // const mapId = {
        //     map_id: SessionStorage.read('mapId')
        // }
        const mapId = SessionStorage.read('mapId');
        return kpiCostCategoriesHelper.fetchWorkStreamKpiInvestments(mapId)
            .then((response) => {
                if (!response.error && response.status === 200) {
                    this.workstreamkpi = response.data;
                    return response.data;
                }
                return response.data;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    fetchWorkStreamCostCategories() {
        const kpiCostCategoriesHelper = new KPICostCategoriesHelper();
        const mapId =
            // 46878;
            SessionStorage.read('mapId');
        return kpiCostCategoriesHelper.fetchWorkStreamCostCategories(mapId)
            .then((response) => {
                if (!response.error && response.status === 200) {
                    this.workstreamcostCategories = response.data;
                    return response.data;
                }
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    // @action
    // saveInvestments(payload) {
    //     const investmentHelper = new InvestmentHelper();
    //     //SessionStorage.read('mapId')
    //     const selected_option = SessionStorage.read('option_selected');
    //     payload["map_id"] = SessionStorage.read('mapId');
    //     console.log(payload);
    //     if (selected_option === 'delivery') {
    //         return investmentHelper.saveInvestmentsForDelivery(payload)
    //         .then((response) => {
    //             console.log(response)

    @action
    saveWorkStreamKpiInvestments(payload) {
        const kpiCostCategoriesHelper = new KPICostCategoriesHelper();
        // payload["map_id"] = SessionStorage.read('mapId');
        // if (selected_option === 'linkkpi') {
        return kpiCostCategoriesHelper.saveWorkStreamKpiInvestments(payload)
            .then((response) => {
                console.log(response)

                return response;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
        // } 
        // else {
        //     return investmentHelper.saveInvestments(payload)
        //     .then((response) => {
        //         console.log(response)

        //         return response;
        //     });
        // }

    }

    @action
    saveWorkStreamCostCat(payload) {
        const kpiCostCategoriesHelper = new KPICostCategoriesHelper();
        // payload["map_id"] = SessionStorage.read('mapId');
        // if (selected_option === 'linkkpi') {
        return kpiCostCategoriesHelper.saveWorkStreamCostCat(payload)
            .then((response) => {
                console.log(response)

                return response;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
        // } 
        // else {
        //     return investmentHelper.saveInvestments(payload)
        //     .then((response) => {
        //         console.log(response)

        //         return response;
        //     });
        // }

    }
}

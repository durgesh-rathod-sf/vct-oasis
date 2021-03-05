import { observable, action } from "mobx";


import BusinessCaseHelper from '../../helpers/BusinessCaseHelper/BusinessCaseHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class businessCaseSummaryStore {
    @observable businessCaseSummaryObj = []
    @observable errorMsg = ""
    @observable npvSaveValue = false

    /* Fetch Business case Summary */
    @action
    async getNPV() {
        const businesscaseHelper = new BusinessCaseHelper();
        const input = {
            map_id: SessionStorage.read('mapId'),
        }
        return await businesscaseHelper.fetchNPV(input)
            .then((response) => {
                if (!response.error) {
                    if (response.data.errorCode === "OK") {
                        if (response.data.resultObj === "No data for this map_id") {
                            this.npvObj = response.data.resultObj;
                            return this.npvObj
                        }
                        else {
                            this.npvObj = response.data.resultObj[0];
                            return this.npvObj
                        }

                    }
                }
                else {
                    return false;
                }

            }).catch((error) => {
                return {
                    error: true
                }
            })
            ;
    }

    @action
    async saveNpv(npv, cpc, cpcUnit) {
        const businesscaseHelper = new BusinessCaseHelper();
        const payload = {
            map_id: SessionStorage.read('mapId'),
            cost_capital: cpc,
            cost_capital_unit: cpcUnit,
            net_present_value: npv
        }
        return await businesscaseHelper.saveNPV(payload)
            .then((res) => {
                if (!res.error) {
                    if (res.data.errorCode === "OK") {
                        this.errorMsg = res.data.message;
                        this.npvSaveValue = res.data.resultObj.npv
                        return true
                    }
                    else {
                        this.errorMsg = res.data.message;
                        return false;
                    }
                }
                return false;

            }).catch((error) => {
                return {
                    error: true
                }
            });

    }
    @action
    async getBusinessCaseSummary(mode = "FINANCIAL") {
        const businesscaseHelper = new BusinessCaseHelper();
        const requestBody = {
            map_id: SessionStorage.read('mapId'),
            mode
        }
        return await businesscaseHelper.fetchBusinessCaseSummary(requestBody)
            .then((response) => {
                if (!response.error) {
                    this.businessCaseSummaryObj = response.data.resultObj;
                    if (response.data.resultCode === 'OK') {
                        for (let i = 0; i < this.businessCaseSummaryObj.length; i++) {
                            if (this.businessCaseSummaryObj[i].year_1 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_1.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_1 = this.businessCaseSummaryObj[i].year_1.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_1 = (this.businessCaseSummaryObj[i].year_1 !== "" ? (this.businessCaseSummaryObj[i].year_1.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_2 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_2.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_2 = this.businessCaseSummaryObj[i].year_2.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_2 = (this.businessCaseSummaryObj[i].year_2 !== "" ? (this.businessCaseSummaryObj[i].year_2.toLocaleString() + ".0") : "")
                                }

                            } if (this.businessCaseSummaryObj[i].year_3 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_3.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_3 = this.businessCaseSummaryObj[i].year_3.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_3 = (this.businessCaseSummaryObj[i].year_3 !== "" ? (this.businessCaseSummaryObj[i].year_3.toLocaleString() + ".0") : "")
                                }

                            } if (this.businessCaseSummaryObj[i].year_4 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_4.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_4 = this.businessCaseSummaryObj[i].year_4.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_4 = (this.businessCaseSummaryObj[i].year_4 !== "" ? (this.businessCaseSummaryObj[i].year_4.toLocaleString() + ".0") : "")
                                }

                            } if (this.businessCaseSummaryObj[i].year_5 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_5.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_5 = this.businessCaseSummaryObj[i].year_5.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_5 = (this.businessCaseSummaryObj[i].year_5 !== "" ? (this.businessCaseSummaryObj[i].year_5.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_6 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_6.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_6 = this.businessCaseSummaryObj[i].year_6.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_6 = (this.businessCaseSummaryObj[i].year_6 !== "" ? (this.businessCaseSummaryObj[i].year_6.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_7 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_7.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_7 = this.businessCaseSummaryObj[i].year_7.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_7 = (this.businessCaseSummaryObj[i].year_7 !== "" ? (this.businessCaseSummaryObj[i].year_7.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_8 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_8.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_8 = this.businessCaseSummaryObj[i].year_8.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_8 = (this.businessCaseSummaryObj[i].year_8 !== "" ? (this.businessCaseSummaryObj[i].year_8.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_9 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_9.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_9 = this.businessCaseSummaryObj[i].year_9.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_9 = (this.businessCaseSummaryObj[i].year_9 !== "" ? (this.businessCaseSummaryObj[i].year_9.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].year_10 !== undefined) {
                                if (this.businessCaseSummaryObj[i].year_10.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].year_10 = this.businessCaseSummaryObj[i].year_10.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].year_10 = (this.businessCaseSummaryObj[i].year_10 !== "" ? (this.businessCaseSummaryObj[i].year_10.toLocaleString() + ".0") : "")
                                }

                            }
                            if (this.businessCaseSummaryObj[i].total !== undefined) {
                                if (this.businessCaseSummaryObj[i].total.toLocaleString().includes(".")) {
                                    this.businessCaseSummaryObj[i].total = this.businessCaseSummaryObj[i].total.toLocaleString()
                                }
                                else {
                                    this.businessCaseSummaryObj[i].total = (this.businessCaseSummaryObj[i].total !== "" ? (this.businessCaseSummaryObj[i].total.toLocaleString() + ".0") : "")
                                }

                            }

                            if (this.businessCaseSummaryObj[i].paramType !== "") {
                                if (this.businessCaseSummaryObj[i].paramType === 'Finance') {
                                    this.businessCaseSummaryObj[i].name = this.businessCaseSummaryObj[i].name + ' (F)';
                                }
                                else if (this.businessCaseSummaryObj[i].paramType === 'Business') {
                                    this.businessCaseSummaryObj[i].name = this.businessCaseSummaryObj[i].name + ' (B)';

                                }
                                else if (this.businessCaseSummaryObj[i].paramType === 'ValueDriver') {
                                    this.businessCaseSummaryObj[i].name = this.businessCaseSummaryObj[i].name + ' (V)';

                                }
                                else {
                                    this.businessCaseSummaryObj[i].name = this.businessCaseSummaryObj[i].name + ' (K)';

                                }

                            }
                        }


                        return this.businessCaseSummaryObj;
                    }
                }

            }).catch((e) => {
                console.log(e)
                return {
                    error: true
                }

            })
    }

    @action
    downloadBusinessCaseTemplate() {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read('mapId')
        return businessCaseHelper.downloadBusinessCaseTemplate(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        businessCaseHelper.downloadTemplate(url, 'xlsx', 'Business Case Template')
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

}


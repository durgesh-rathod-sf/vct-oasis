import { observable, action } from "mobx";
import InvestmentHelper from '../../helpers/InvestmentHelper/InvestmentHelper';
import BusinessCaseHelper from '../../helpers/BusinessCaseHelper/BusinessCaseHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class InvestmentStore {
    @observable investmentData = '';
    @observable initialInvDataObj = '';

    @action
    fetchInvestments() {
        const investmentHelper = new InvestmentHelper();
        const mapId = {
            map_id: SessionStorage.read('mapId'),
        };
        return investmentHelper.fetchInvestments(mapId)
            .then((response) => {
                if (!response.error && response.status === 200) {
                    this.investmentData = response.data;
                    this.initialInvDataObj = JSON.parse(JSON.stringify(response.data));
                    return this.investmentData;
                }
                // return response;
            }).catch((error) => {
                return {
                    error: true,
                    data: error.response.data
                }
            });
    }

    @action
    saveInvestments(payload) {
        const investmentHelper = new InvestmentHelper();
        const selected_option = SessionStorage.read('option_selected');
        payload['map_id'] = SessionStorage.read('mapId');
        if (selected_option === 'delivery') {
            return investmentHelper.saveInvestmentsForDelivery(payload)
                .then((response) => {
                    return response;
                }).catch((error) => {
                    return {
                        error: true
                    }
                });
        } else {
            return investmentHelper.saveInvestments(payload)
                .then((response) => {
                    return response;
                }).catch((error) => {
                    return {
                        error: true
                    }
                });
        }
    }

    @action
    async deleteExtraYear(year) {
        try {
            const businessCaseHelper = new BusinessCaseHelper();
            const payload = {
                mapId: SessionStorage.read('mapId'),
                year: year,
                tab: 'inv',
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
}

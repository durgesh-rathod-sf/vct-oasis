import { observable, action } from "mobx";
import InvestmentActualsHelper from '../../helpers/InvestmentActualsHelper/InvestmentActualsHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class {
    @observable investmentData = ''
    @observable headers = []
    @observable projectedResult = false
    @observable projectedInitiatives = {}
    @observable startDatesArray = [];
    @observable actualResult
    @observable actualIntiatives
    @observable del_init_id_ls
    @observable invesmentTab
    @action
    fetchActualProjectedInvestments(payload) {
        const investmentActualsHelper = new InvestmentActualsHelper();
        return investmentActualsHelper.fetchActualProjectedInvestments(payload)
            .then((response) => {
                if (!response.error && response.status === 200) {
                    this.investmentData = response.data;
                    // return response.data;
                    return this.investmentData;
                }
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }

    @action
    saveActualProjectedInvestments(payload) {
        const investmentActualsHelper = new InvestmentActualsHelper();
        //SessionStorage.read('mapId')
        payload["map_id"] = SessionStorage.read('mapId');
        console.log(payload);
        return investmentActualsHelper.saveActualProjectedInvestments(payload)
            .then((response) => {
                console.log(response)
                return response;
            }).catch((error) => {
                return {
                    error: true
                }
            });
    }

    @action
    async deleteExtraYear(year) {
        try {
            const investmentActualsHelper = new InvestmentActualsHelper();
            const payload = {
                mapId: SessionStorage.read('mapId'),
                year: year,
                tab: 'invactuals'
            };
            const response = await investmentActualsHelper.deleteExtraYear(payload);
            return response.data.resultCode === 'OK';
        } catch (error) {
            return {
                error: true
            };
        }
    }


}

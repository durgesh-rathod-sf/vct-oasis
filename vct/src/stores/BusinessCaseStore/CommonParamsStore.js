import { observable, action } from "mobx";
import BusinessCaseHelper from "../../helpers/BusinessCaseHelper/BusinessCaseHelper";
var SessionStorage = require('store/storages/sessionStorage');

export default class CommonParamsStore {

    @observable paramList = [];
    @observable initialParamList = [];
    @observable paramListChangeArr = [];

    @observable selectedKpiIds = []; /* to maintain checklist as rendering removes selected checkobox */
    @observable unitMissingErr = "";
    @observable nameMissingErr = "";
    @observable duplicateNameErr = "";
    @observable invalidCharErr = "";
    @observable yearsList = [1, 2, 3, 4, 5,];
    @observable duplicateNameError = "";

    @action
    async getCommonParameters() {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read("mapId");
        this.paramList = [];
        return await businessCaseHelper.fetchCommonParameters(mapId)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.paramList = response.data.resultObj ? response.data.resultObj : [];
                    this.initialParamList = JSON.parse(JSON.stringify(this.paramList));
                    return response;
                }return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    saveBenefitProfileData(payload) {
        const businessCaseHelper = new BusinessCaseHelper();
        const mapId = SessionStorage.read("mapId");
        return businessCaseHelper.saveBenefitProfileData(mapId, payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    return response;
                } return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    saveCommonParams(paramslist) {
        const businessCaseHelper = new BusinessCaseHelper();
        const payload = [...paramslist]
        const mapId= SessionStorage.read("mapId");
        return businessCaseHelper.saveCommonParameters(payload,mapId)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.duplicateNameError = '';
                    return response;
                }
                else {
                    this.duplicateNameError = '';
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // };
                if (e.response.data && e.response.data.errorDescription === 'Parameter  with same name already exists') {
                    this.duplicateNameError = e.response.data.errorDescription;
                }else{
                    this.duplicateNameError = '';
                }
                return e.response;
            });
    }

    @action
    async deletCommonParameter(cpId) {
       /*  const payload = {
            cpId: SessionStorage.read('cpId')
            
        } */
        
        try {
            
            const businessCaseHelper = new BusinessCaseHelper();
            //const cpId = SessionStorage.read("cpId");
            const response = await businessCaseHelper.deleteCommonParameter(cpId);
            return response;
        } catch (error) {
            // return {
            //     error: true
            // };
            return error.response;
        }
    }
    @action
    async deleteExtraYear(year) {
        try {
            const businessCaseHelper = new BusinessCaseHelper();
            const payload = {
                mapId: SessionStorage.read('mapId'),
                year: year,
                tab: 'cp',
            };
            const response = await businessCaseHelper.deleteExtraYear(payload);
            return response;
        } catch (error) {
            // return {
            //     error: true
            // };
            return error.response;
        }
    }
}

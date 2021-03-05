import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import AdminHelper from '../helpers/AdminHelper/AdminHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class HowToUseStore {
    @observable subIndustry = []


    @action
    async getVedioList() {
        const adminHelper = new AdminHelper();
       
        return await adminHelper.getVediosList()
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                   
                    if (data.resultCode === 'OK') {
                        this.subIndustry = [];
                        const { resultObj } = data
                        this.selectedVDT = resultObj
                        return response;
                    }
                    if (data.resultCode === 'KO') {
                        this.subIndustry = [];
                        this.selectedVDT = []
                        return response;
                    }
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
    async uploadVedio(payload) {
        const adminHelper = new AdminHelper();
       
        return await adminHelper.saveVedio(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                   
                    if (data.resultCode === 'OK') {
                        this.subIndustry = [];
                        const { resultObj } = data
                        this.selectedVDT = resultObj
                        return response;
                    }
                    if (data.resultCode === 'KO') {
                        this.subIndustry = [];
                        this.selectedVDT = []
                        return response;
                    }
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
    async deleteFileMetaData(payload) {
        const adminHelper = new AdminHelper();
       
        return await adminHelper.deleteFileMetaData(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                   
                    if (data.resultCode === 'OK') {
                        
                        return response;
                    }
                    if (data.resultCode === 'KO') {
                        
                        return response;
                    }
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }
}
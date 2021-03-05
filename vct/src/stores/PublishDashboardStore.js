import { observable, action } from "mobx";
import DashboardHelper from "../helpers/DashboardHelper/DashboardHelper";
import PublishDashboardHelper from '../helpers/PublishDashboardHelper/PublishDashboardHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class PublishDashboardStore {

    @observable kpiData = []

    @observable kpiDataDaily = []

    @observable kpiDataWeekly = []

    @observable kpiDataFortnightly = []

    @observable kpiDataMonthly = []

    @observable kpiDataQuarterly = []

    @observable kpiDataHalfYearly = []

    @observable kpiDataYearly = []

    @observable activeTab = ''

    @observable keyCallouts = []

    @observable kpiNames = []

    @observable kpiIds = []

    @observable sortedKpiData = ''

    @observable fileName = ''

    @observable tableauToken = ''

    @observable url=''

    @action
    uploadTemplate(file) {
        this.resetData()
        const publishDashboardHelper = new PublishDashboardHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        payload.append("file", file)
        this.fileName = file.name
        return publishDashboardHelper.uploadTemplate(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    if (data.resultCode === 'OK') {
                        const dataLength = data.resultObj.length
                        const { resultObj } = data
                        for (let i = 0; i < dataLength; i++) {
                            resultObj[i]['id'] = i + 1
                            this.kpiData.push(resultObj[i]);
                        }
                        this.filterData();
                        return data;
                    }
                    if (data.resultCode === 'KO') {
                        return data;
                    }
                }

            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    filterData() {
        const dataLength = this.kpiData.length
        for (let i = 0; i < dataLength; i++) {
            if (this.kpiNames.indexOf(this.kpiData[i].kpiName) === -1) {
                this.kpiIds.push(this.kpiData[i].kpiId)
                this.kpiNames.push(this.kpiData[i].kpiName)
            }
        }
    }

    @action
    publishDashboard() {
        const publishDashboardHelper = new PublishDashboardHelper();
        // publishDashboardHelper.saveKeyCallouts(this.keyCallouts)        
        const mapId = SessionStorage.read('mapId')
        const payload = new FormData();
        const dashboardHelper = new DashboardHelper();
        payload.append("map_id", SessionStorage.read('mapId'))
        this.url='';
        return publishDashboardHelper.publishDashboard(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response
                    dashboardHelper.downloadPublishTemplate(mapId).then((res)=>{
                        if (!res.error) {
                            const { data } = res;
                            if (data.resultCode === 'OK') {
                                this.url = data.resultObj
                            }
                        }
                    })
                    // if (data.resultCode === 'OK') {
                        // return publishDashboardHelper.publishDashboard(mapId)
                        //     .then((res) => {
                        //         if (res.data.resultCode === 'OK') {
                        return data;
                        //     }
                        //     return false;
                        // })
                    // }
                }

                return false;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    downloadTemplate() {
        const publishDashboardHelper = new PublishDashboardHelper();
        const mapId = SessionStorage.read('mapId')
        return publishDashboardHelper.getTemplateDetails(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        const url = data.resultObj
                        publishDashboardHelper.downloadTemplate(url, 'xlsx', 'Dashboard Template')
                        return data;
                    }
                    return data;
                }
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            })
    }

    @action
    resetData() {
        this.kpiData = []
        this.kpiDataDaily = []
        this.kpiDataWeekly = []
        this.kpiDataFortnightly = []
        this.kpiDataMonthly = []
        this.kpiDataQuarterly = []
        this.kpiDataHalfYearly = []
        this.kpiDataYearly = []
    }

    @action
    fetchKeyCallouts() {
        const publishDashboardHelper = new PublishDashboardHelper();
        const mapId = SessionStorage.read('mapId')
        return publishDashboardHelper.fetchKeyCallouts(mapId)
            .then((response) => {
                return response
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            })
    }

    // @action
    // showPrevFiles() {
    //     const publishDashboardHelper = new PublishDashboardHelper();
    //     this.templateArray = []
    //     return publishDashboardHelper.showPrevFiles(SessionStorage.read('mapId'))
    //         .then((response) => {
    //             const { data } = response;
    //             if (data.resultCode === 'OK') {
    //                 const resultObj = data.resultObj                    
    //                 if (resultObj.length > 0) {
    //                     for (let i = 0; i < resultObj.length; i++) {
    //                         this.templateArray.push(resultObj[i])
    //                     }
    //                     return this.templateArray;
    //                 }
    //                 return false;
    //             }
    //             return false;
    //         })
    // }

    @action
    downloadFile(url, fileName) {
        const publishDashboardHelper = new PublishDashboardHelper();
        return publishDashboardHelper.downloadFiledata(url, 'xlsx', fileName);
    }

    @action
    cancelUpload() {
        const publishDashboardHelper = new PublishDashboardHelper();
        const payload = new FormData();
        payload.append("map_id", SessionStorage.read('mapId'))
        payload.append("filename", this.fileName)
        return publishDashboardHelper.cancelUpload(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === 'OK') {
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

    @action
    getTableauToken() {
        const publishDashboardHelper = new PublishDashboardHelper();
        const payload = {
            username: 'general.user'
        }

        return publishDashboardHelper.getTableauToken(payload)
            .then((response) => {
                if (!response.error && response.data) {
                    this.tableauToken = response.data
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

}
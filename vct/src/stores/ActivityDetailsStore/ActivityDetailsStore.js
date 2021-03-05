import { observable, action } from "mobx";
import ActivityDetailsHelper from '../../helpers/ActivityDetailsHelper/ActivityDetailsHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class ActivityDetailStore {
    @observable WSActivityDetails = [];

    /* fetch ws related activity Details */
    @action
    async getWSActivity(actId) {
        const activityDetailsHelper = new ActivityDetailsHelper();
        // const mapId = SessionStorage.read('mapId');
        const activityId = actId;
        return await activityDetailsHelper.getWSActivity(activityId)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    console.log("getWSActivityDetails::", response);
                    this.WSActivityDetails = response.data.resultObj
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // };
                return e.response;
            });
    }

    /* delete category for activity */
    @action
    async deleteCategory(deleteCatRequest) {
        const activityDetailsHelper = new ActivityDetailsHelper();
        // const mapId = SessionStorage.read('mapId');
        const payload = {
            "categoryId": deleteCatRequest.id,
            "isGlobalDelete": deleteCatRequest.globalFlag
        }
        return await activityDetailsHelper.deleteCategory(payload)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    console.log("deleteCategory::", response);
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async saveWSActivity(payload) {
        const activityDetailsHelper = new ActivityDetailsHelper();
        return await activityDetailsHelper.saveWSActivity(payload)
            .then((response) => {
                // if (response.data.resultCode === "OK") {
                //     console.log("deleteCategory::",response);
                //     return response;
                // }
                return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }
}

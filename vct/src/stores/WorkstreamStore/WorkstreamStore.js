import { observable, action } from "mobx";
import WorkstreamHelper from '../../helpers/WorstreamHelper/WorkstreamHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class WorkstreamStore {
    @observable allWorkstreamsList = [];
    @observable allWorkstreamsStartDate = '';
    @observable allWorkstreamsEndDate = '';
    @observable allActivitiesList = [];
    @observable allDeliverablesList = [];
    @observable fromWSactuals = false;
    @observable addWorkstreamArray = [];
    @observable WSActivityDetails = [];
    @observable wsGIdetails = "";
    @observable sumOfBoxesWidth = 0;
    @observable firstBoxLeft = 0;
    @observable


    /* Fetch All Ws Details */
    @action
    async getAllWsDetails() {
        const wsHelper = new WorkstreamHelper();
        const mapId = SessionStorage.read('mapId');
        return await wsHelper.getAllWsDetails(mapId, this.fromWSactuals)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.allWorkstreamsList = response.data.resultObj.workStreams;
                    this.allActivitiesList = response.data.resultObj.activities;
                    this.allDeliverablesList = response.data.resultObj.deliverables;
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
    async add_updateDependentDeliverables(payload) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.updateDependentDeliverables(payload)
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response.data;
            });
    }

    // update/save edit deliverable  dates
    @action
    async updateDeliverableDates(payload) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.updateDeliverableDates(payload)
            .then((response) => {
                return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /* Fetch All Ws tree Details */
    @action
    async fetchAllWsTreeDetails(tab) {
        const wsHelper = new WorkstreamHelper();
        const mapId = SessionStorage.read('mapId');
        return await wsHelper.getAllWsTreeDetails(mapId, tab)
            .then((response) => {
                if (response && !response.error && response.data) {
                    this.allWorkstreamsList = response.data.resultObj.allWsDetailsDtoList;
                    this.allWorkstreamsStartDate = response.data.resultObj.overAllStartDate;
                    this.allWorkstreamsEndDate = response.data.resultObj.overAllEndDate;
                    // this.allActivitiesList = response.data.resultObj.activities;
                    // this.allDeliverablesList = response.data.resultObj.deliverables;
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

    /* Fetch Sorted Ws tree Details */
    @action
    async fetchAllWsTreeDetailsSort(sortBy, sortType, tab) {
        const wsHelper = new WorkstreamHelper();
        const mapId = SessionStorage.read('mapId');
        return await wsHelper.getAllWsTreeDetailsSort(mapId, sortBy, sortType, tab)
            .then((response) => {
                if (response && !response.error && response.data) {
                    this.allWorkstreamsList = response.data.resultObj.allWsDetailsDtoList;
                    this.allWorkstreamsStartDate = response.data.resultObj.overAllStartDate;
                    this.allWorkstreamsEndDate = response.data.resultObj.overAllEndDate;
                    // this.allActivitiesList = response.data.resultObj.activities;
                    // this.allDeliverablesList = response.data.resultObj.deliverables;
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
    async fetchWsDeliverableDetails(DelId, tab) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getWsDeliverable(DelId, tab)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.DelInfodetails = response.data.resultObj

                }
                return response;


            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }



    /* Fetch All Ws General Information */
    @action
    async fetchWsGenInfo(wsId, tab) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getWSGeneralInfo(wsId, tab)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.wsGIdetails = response.data.resultObj;
                    this.wsOwner = this.wsGIdetails.owner;
                    this.wsEmail = this.wsGIdetails.ownerEmail;
                    if (tab !== undefined) {
                        this.completionPerc = this.wsGIdetails.complPercent;
                        this.status = this.wsGIdetails.status;
                    }
                    return this.wsGIdetails;
                }
                else {
                    return false
                }

            })
            .catch((e) => {
                console.log(e)
                return {
                    error: true
                }
            });
    }

    /* Fetch All Deliverable details*/
    @action
    async fetchDeliverableDetails(delId) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getWsDeliverable(delId)
            .then((response) => {
                if (response && !response.error && response.data) {
                    this.WSDelDetails = response.data.resultObj;
                    this.delOwner = this.WSDelDetails.owner;
                    this.delEmail = this.WSDelDetails.ownerEmail;
                    this.delStartDate = this.WSDelDetails.startDate;
                    this.delEndDate = this.WSDelDetails.endDate;
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

    /* Fetch Deliverable for Capture Actuals */
    @action
    async fetchDeliverableWsActuals(delId) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getDeliverableWsActuals(delId)
            .then((response) => {
                if (response && !response.error && response.data) {
                    this.WSDelDetails = response.data.resultObj;
                    this.delOwner = this.WSDelDetails.owner;
                    this.delEmail = this.WSDelDetails.ownerEmail;
                    this.delStartDate = this.WSDelDetails.startDate;
                    this.delEndDate = this.WSDelDetails.endDate;
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

    /* Fetch all overview details of a Workstream */
    @action
    async fetchWsOverview(wsId) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getWSOverview(wsId)
            .then((response) => {
                if (response && !response.error && response.data) {
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

    /* Fetch milestone details of a deliverable */
    @action
    async fetchMilestoneDetails(mileId) {
        const wsHelper = new WorkstreamHelper();
        return await wsHelper.getMilestones(mileId)
            .then((response) => {
                if (response && !response.error && response.data) {
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

    /* save/update worstream name and details */

    @action
    async saveWorkstreamDetails(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.saveWorkstreamDetails(payload)
            .then((response) => {
                if (!response.error && response.data) {
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


    /* save/update Activity name and details */

    @action
    async saveActivityDetails(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.saveActivityDetails(payload)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* save/update Deliverable name and details */

    @action
    async saveDeliverableDetails(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.saveDeliverableDetails(payload)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* save/update milestone name and details */

    @action
    async saveMilestoneDetails(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.saveMilestoneDetails(payload)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* save order ids for drag and drop */

    @action
    async saveDragDropOrderIds(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.saveDragDropOrderIds(payload)
            .then((response) => {
                if (!response.error && response.data) {
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



    // Delete a Workstream

    @action
    async deleteWorkstream(wsId,mapId,wsOrderId) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.deleteWorkstream(wsId,mapId,wsOrderId)
            .then((response) => {
                if (!response.error && response.data) {
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


    /* Delete Activity */
    @action
    async deleteActivity(actId,wsId,act_orderId) { 
        const wsHelper = new WorkstreamHelper();
        return wsHelper.deleteActivity(actId,wsId,act_orderId)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* Delete Deliverable */
    @action
    async deleteDeliverable(delId,actId,delOrderId) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.deleteDeliverable(delId,actId,delOrderId)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* Delete Milestone */
    @action
    async deleteMilestone(payload) {
        const wsHelper = new WorkstreamHelper();
        return wsHelper.deleteMilestone(payload)
            .then((response) => {
                if (!response.error && response.data) {
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

    /* fetch ws related activity Details */
    @action
    async getWSActivity(actId, tab) {
        const wsHelper = new WorkstreamHelper();
        // const mapId = SessionStorage.read('mapId');
        const activityId = actId;
        return await wsHelper.getWSActivity(activityId, tab)
            .then((response) => {
                if (!response.error && response.data.resultCode === "OK") {
                    this.WSActivityDetails = response.data.resultObj
                    this.actOwner = this.WSActivityDetails.owner;
                    this.actEmail = this.WSActivityDetails.ownerEmail;
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

    /* delete category for activity */
    @action
    async deleteCategory(deleteCatRequest) {
        const wsHelper = new WorkstreamHelper();
        // const mapId = SessionStorage.read('mapId');
        const payload = {
            "categoryId": deleteCatRequest.id,
            "isGlobalDelete": deleteCatRequest.globalFlag
        }
        return await wsHelper.deleteActivityCategory(payload)
            .then((response) => {
                return response;
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }
    @action
    async fetchGroupByDetails(keyPath, tab) {
        const wsHelper = new WorkstreamHelper();
        const mapId = SessionStorage.read('mapId');
        return await wsHelper.getGroupBDetails(mapId, keyPath, tab)
            .then((response) => {
                if (response && !response.error && response.data) {
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
async saveDragDropOrderIds(payload) {
    const wsHelper = new WorkstreamHelper();
    return await wsHelper.saveReorderWsActDel(payload)
        .then((response) => {
                return response;
        })
        .catch((e) => {
            return e.response;
        });
}

}

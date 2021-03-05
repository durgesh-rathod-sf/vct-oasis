import { observable, action } from "mobx";
import WorkstreamActualsHelper from '../../helpers/WorkstreamActualsHelper/WorkstreamActualsHelper';


export default class WorkstreamActualsStore {
    @observable deliverableTimeline = [];

    @observable mileStoneStatusList = []
    @action
    async getDeliverableRisks(DelId, tab) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getDeliverableRisks(DelId)
            .then((response) => {
                // if (!response.error && response.data.resultCode === "OK") {
                //     return response
                // }
                // else {
                //     return false
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

    @action
    async getWsRisks(wsId, tab) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getWsRisks(wsId)
            .then((response) => {
                // if (!response.error && response.data.resultCode === "OK") {
                //     return response
                // }
                // else {
                //     return false
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

    @action
    async getActivityRisks(actId, tab) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getActivityRisks(actId)
            .then((response) => {
                // if (!response.error && response.data.resultCode === "OK") {
                //     return response
                // }
                // else {
                //     return false
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

    @action
    async deleteRisks(actId) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.deleteRisks(actId)
            .then((response) => {
                // if (!response.error && response.data.resultCode === "OK") {
                //     return response
                // }
                // else {
                //     return false
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

    @action
    async saveDeliverableRisks(payload) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.saveDeliverableRisks(payload)
            .then((response) => {
                // if (!response.error && response.data.resultCode === "OK") {
                //     return response
                // }
                // else {
                //     return false
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
    @action
    async saveDeliverableActuals(payload) {
        const wsHelper = new WorkstreamActualsHelper();

        return await wsHelper.saveDeliverableActuals(payload)
            .then((response) => {
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async saveActivityWrokstreamTimeline(payload, selectedLevel) {
        const wsHelper = new WorkstreamActualsHelper();

        return await wsHelper.saveActivityWorkstreamDetails(payload, selectedLevel)
            .then((response) => {
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async getWorkstreamMilestonesByWSId(wsId) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getWorkstreamMilestonesByWSId(wsId)
            .then((response) => {
                this.mileStoneStatusList = [];
                if (!response.error && response.data.resultCode === "OK" && response.data.resultObj !== null) {
                    let mileStoneDetails = response.data.resultObj;
                    for (let i = 0; i < mileStoneDetails.length; i++) {
                        if (this.mileStoneStatusList.filter(item => item.statusName === mileStoneDetails[i].status).length === 0) {
                            this.mileStoneStatusList.push({ "checked": true, "statusName": mileStoneDetails[i].status })
                        }
                    }
                    this.mileStoneStatusList.unshift({ "checked": true, "statusName": 'select_all' });
                } else if (!response.error && response.data.resultCode === "OK" && response.data.resultObj === null) {
                    this.mileStoneStatusList.push({ "checked": true, "statusName": 'select_all' })
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

    @action
    async getWorkstreamMilestonesByActivityId(actId) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getWorkstreamMilestonesByActivityId(actId)
            .then((response) => {
                this.mileStoneStatusList = [];
                if (!response.error && response.data.resultCode === "OK" && response.data.resultObj !== null) {
                    let mileStoneDetails = response.data.resultObj;
                    for (let i = 0; i < mileStoneDetails.length; i++) {
                        if (this.mileStoneStatusList.filter(item => item.statusName === mileStoneDetails[i].status).length === 0) {
                            this.mileStoneStatusList.push({ "checked": true, "statusName": mileStoneDetails[i].status })
                        }
                    }
                    this.mileStoneStatusList.unshift({ "checked": true, "statusName": 'select_all' });
                }
                else if (!response.error && response.data.resultCode === "OK" && response.data.resultObj === null) {
                    this.mileStoneStatusList.push({ "checked": true, "statusName": 'select_all' })
                }
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async getWorkstreamMilestonesByDeliverableId(delId) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.getWorkstreamMilestonesByDeliverableId(delId)
            .then((response) => {
                this.mileStoneStatusList = [];
                if (!response.error && response.data.resultCode === "OK" && response.data.resultObj !== null && response.data.resultObj.milestones.length !== 0) {
                    let mileStoneDetails = response.data.resultObj.milestones;
                    for (let i = 0; i < mileStoneDetails.length; i++) {
                        if (this.mileStoneStatusList.filter(item => item.statusName === mileStoneDetails[i].status).length === 0) {
                            this.mileStoneStatusList.push({ "checked": true, "statusName": mileStoneDetails[i].status })
                        }
                    }
                    this.mileStoneStatusList.unshift({ "checked": true, "statusName": 'select_all' });
                } else if (!response.error && response.data.resultCode === "OK" && response.data.resultObj.milestones !== null && response.data.resultObj.milestones.length === 0) {
                    this.mileStoneStatusList.push({ "checked": true, "statusName": 'select_all' })
                }
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async saveDeliverableMilestones(payload) {
        const wsHelper = new WorkstreamActualsHelper();
        return await wsHelper.saveDeliverableMilestones(payload)
            .then((response) => {
                return response
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }
}

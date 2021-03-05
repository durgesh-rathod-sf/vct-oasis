import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class WorkstreamHelper extends Api {

    saveWorkstreamDetails(payload) {
        return this.workstreamPost(appUrl.savews, payload);
    }

    saveActivityDetails(payload) {
        return this.workstreamPost(appUrl.savewsactivity, payload);
    }

    saveDeliverableDetails(payload) {
        return this.workstreamPost(appUrl.savewsdeliverable, payload);
    }

    saveMilestoneDetails(payload) {
        return this.workstreamPost(appUrl.addmilestones, payload);
    }

    saveDragDropOrderIds(payload) {
        return this.workstreamPost(appUrl.saveDragDropOrderIds, payload);
    }

    updateDeliverableDates(payload) {
        return this.workstreamPost(appUrl.updateDeliverableDates, payload);
    }

    updateDependentDeliverables(payload) {
        return this.workstreamPost(appUrl.updatedependentdeliverables, payload);
    }

    getWsDeliverable(delId, tab) {
        return this.workstreamGet(appUrl.getwsdeliverable + '?deliverableId='
            // +157
            + delId
            + (tab !== undefined ? '&view=Timeline' : ""))
    }

    getDeliverableWsActuals(delId) {
        return this.workstreamGet(appUrl.getwsdeliverable + '?deliverableId='
            + delId
            + '&include=raid');
    }
    // getWsActivity(actId,tab){
    //     return this.workstreamGet('/workstream/ws/getWSActivity?activityId='
    //     // +157
    //     +actId
    //     +(tab!==undefined ?'&include=time':""))  
    // }
    getWSActivity(activityId, tab) {
        return this.workstreamGet(appUrl.getwsactivity + '?activityId=' + activityId + (tab !== undefined ? '&include=raid' : ""))
    }

    getWSGeneralInfo(wsId, tab) {
        return this.workstreamGet(appUrl.getworkstreaminfo + '?wsId=' + wsId + (tab !== undefined ? "&type=timeline&include=raid" : ""))
    }

    getAllWsDetails(mapId, sortBy) {
        if (sortBy) {
            return this.workstreamGet(appUrl.getallwsdetails + '?mapId=' + mapId + '&sortBy=name');
        } else {
            return this.workstreamGet(appUrl.getallwsdetails + '?mapId=' + mapId);
        }

    }

    getAllWsTreeDetails(mapId, tab) {
        return this.workstreamGet(appUrl.getallwstreamsdetails + '?mapId=' + mapId + (tab !== undefined ? '&include=raid' : ""));
    }

    getAllWsTreeDetailsSort(mapId,sortBy,sortType,tab){
        return this.workstreamGet(appUrl.getallwstreamsdetails + '?mapId='+mapId+'&sortBy='+sortBy+'&sortType='+sortType+(tab!==undefined ?'&include=raid':"") );
    }

    getMilestones(mileId) {
        return this.workstreamGet(appUrl.getmilestones + '?milestoneId=' + mileId);
    }


    getWSOverview(wsId) {
        return this.workstreamGet(appUrl.getwsoverview + '?wsId=' + wsId);
    }

    deleteWorkstream(wsId,mapId,wsOrderId) {
        return this.workstreamDelete(appUrl.deletews + '?wsId='+wsId
        +((wsOrderId !== null) ? `&mapId=${mapId}&orderId=${wsOrderId}` : ""));
    }

    /* workstream activity details-fetch ,save and delete activity category */


    deleteActivityCategory(payload) {
        return this.workstreamDeletePayload(appUrl.deletecategory, payload);
    }
    
    deleteActivity(actId,wsId,act_orderId) {
        return this.workstreamDelete(appUrl.deleteactivity + '?activityId='+actId
        +((act_orderId !== null) ?`&wsId=${wsId}&orderId=${act_orderId}` : ""));
    }

    deleteDeliverable(delId,actId,delOrderId) {
        return this.workstreamDelete(appUrl.deletedeliverble + '?deliverableId='+delId
        +((delOrderId !== null) ? `&activityId=${actId}&orderId=${delOrderId}` : ""));
    }

    deleteMilestone(milId) {
        return this.workstreamDelete(appUrl.deletemilestone + '?milestoneId='+milId);
    }

    getGroupBDetails(mapId,keyPath,tab) {
        return this.workstreamGet(appUrl.getwsgroupby + '?mapId='+mapId+'&groupBy='+keyPath[0]+'&group='+keyPath[1]+(tab!==undefined ?'&include=raid':""));
    }
    saveReorderWsActDel(payload){
        return this.workstreamPost(appUrl.saveDragDropOrderIds, payload);
    }

}

export default WorkstreamHelper;
import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class WorkstreamActualsHelper extends Api {
    getDeliverableRisks(delId) {
        return this.workstreamGet(appUrl.getdeliverablerisks + '?deliverableId=' + delId)
    }
    getWsRisks(wsId) {
        return this.workstreamGet(appUrl.getwsrisks + '?wsId=' + wsId)
    }
    getActivityRisks(actId) {
        return this.workstreamGet(appUrl.getactivityrisks + '?activityId=' + actId)
    }
    saveDeliverableActuals(payload) {
        return this.workstreamPost(appUrl.savedeliverableactuals, payload)
    }
    saveDeliverableRisks(payload) {
        return this.workstreamPost(appUrl.savedeliverablerisks, payload)
    }
    deleteRisks(actId) {
        return this.workstreamDelete(appUrl.deletecategoryactuals + '?catActId=' + actId)
    }
    saveActivityWorkstreamDetails(payload, W_A_D) {
        return this.workstreamPost((W_A_D === "Deliverable" ?
            appUrl.savedeliverabletimeline               //Deliverable Save url
            :
            appUrl.savewsstatus)                          //Workstream and Activity Save url
            , payload);
    }

    getWorkstreamMilestonesByWSId(wsId) {
        return this.workstreamGet(appUrl.getmilestonelist + '?wsId=' + wsId)
    }

    getWorkstreamMilestonesByActivityId(actId) {
        return this.workstreamGet(appUrl.getmilestonelist + '?activityId=' + actId)
    }

    getWorkstreamMilestonesByDeliverableId(delId) {
        return this.workstreamGet(appUrl.getwsdeliverable + '?deliverableId=' + delId + '&view=Milestone')
    }

    saveDeliverableMilestones(payload) {
        return this.workstreamPost(appUrl.savedeliverablemilestones, payload)
    }
}

export default WorkstreamActualsHelper;

import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class ActivityDetailsHelper extends Api {

    saveWSActivity(payload) {
        return this.workstreamPost(appUrl.savewsactivity, payload);
    }
    
    getWSActivity(activityId){
        return this.workstreamGet(appUrl.getwsactivity + '?activityId='+activityId) 
    }

    deleteCategory(payload) {
        return this.workstreamDeletePayload(appUrl.deletecategory, payload);
    }

}

export default ActivityDetailsHelper;
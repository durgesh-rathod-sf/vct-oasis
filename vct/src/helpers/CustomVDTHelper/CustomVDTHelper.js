import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class CustomVDTHelper extends Api {
    fetchDropDownValues(payload) {
        if(payload){
            return this.post(appUrl.fetchallobjectives, payload);
        }
        else{
            return this.post(appUrl.fetchallobjectives)
        }
    }
    fetchKpiInfo(kpiId) {
        return this.get(appUrl.getmasterkpiinfo + '?id='+kpiId);
    }

    saveCustomVDT(payload) {
        return this.post(appUrl.saveCustomVdt, payload)
    }

    generateCustomVDTTree(payload) {
        return this.post(appUrl.generatevdttree, payload)
    }
}

export default CustomVDTHelper;